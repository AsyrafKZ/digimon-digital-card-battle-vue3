import { animatePpPopup, animateDigivolveEffect, briefPause } from "../animations/field";
import { animateHandToDp } from "../animations/monster";
import { ATTACK, CARD_NAME, LEVEL, PHASE, WHO } from "../const/const";
import { useOpponentStore } from "../stores/opponent";
import { usePlayerStore } from "../stores/player";
import { useStateStore } from "../stores/state";
import { discardAllHandCards, drawDeckCardToHand, moveActiveFieldOut, moveAttackChoiceBoardIn, setOkPopup, setOppActiveMon, setOppDpToOffline, setOppSupport } from "./fieldManager";
import { DIGIVOLUTION_CARDS, GENERAL_SUPPORT_MONSTER_CARDS, SUPPORT_NONE_CARDS, X_EFF_1ST_ATTACK_CARDS, isAttackChoiceCounter } from "../const/cardEffects";
import { battleManager } from "./battleManager";

const MONSTER_CARD_MAX_ID = 190;
let cardIdToDp;
let digivolveTo;
let digivolveFrom;

export const setAiAction = (phase, scene) => {
    changePhase(phase, scene);
}

const changePhase = async (phase, scene) => {
    const oppStore = useOpponentStore();
    const playerStore = usePlayerStore();
    const stateStore = useStateStore();

    // DRAW
    if (phase == PHASE.DRAW) {
        cardIdToDp = null;
        digivolveTo = null;
        digivolveFrom = null;

        await drawDeckCardToHand(WHO.OPP, scene, 4);

        const redraw = await evaluateToRedraw(scene);
        if (redraw) {
            stateStore.setPhase(PHASE.REDRAW);
        } else {
            stateStore.setPhase(PHASE.ENTRANCE);
        }
    }
    // REDRAW
    else if (phase == PHASE.REDRAW) {
        stateStore.setPhase(PHASE.DRAW);
    }
    // ENTER
    else if (phase == PHASE.ENTRANCE) {
        await setActiveCard(scene);
        await briefPause();
        stateStore.setPhase(PHASE.RACK_UP_DP)
    }
    // RACK-UP DP
    else if (phase == PHASE.RACK_UP_DP) {
        // skip if all hand cards are option cards
        await setDpCard(scene);
        await briefPause();
        stateStore.setPhase(PHASE.DIGIVOLVE);
    }
    // DIGIVOLVE
    else if (phase == PHASE.DIGIVOLVE) {
        await setDigivolveCard(scene);
        await briefPause();
        if (playerStore.pActiveMonStackCount > 0) {
            stateStore.setPhase(PHASE.CHOOSE_ATTACK);
        } else {
            stateStore.setPhase(PHASE.END);
        }
    }
    // CHOOSE ATTACK
    else if (phase == PHASE.CHOOSE_ATTACK) {
        const htmlRenderer = document.getElementById("htmlRenderer");
        const pChoice = scene.getObjectByName("pChoice");
        const oChoice = scene.getObjectByName("oChoice");

        // enable mouse event to html layer
        htmlRenderer.style.pointerEvents = "auto";

        // move choice board in
        const isChoiceBoardMoveIn = true
        moveAttackChoiceBoardIn(isChoiceBoardMoveIn, pChoice, oChoice);
    } else if (phase == PHASE.SUPPORT1) {
        htmlRenderer.style.pointerEvents = "none";
        const pChoice = scene.getObjectByName("pChoice");
        const oChoice = scene.getObjectByName("oChoice");
        const isChoiceBoardMoveIn = false;
        moveAttackChoiceBoardIn(isChoiceBoardMoveIn, pChoice, oChoice); // move board out

        const pAField = scene.getObjectByName("pAField")
        const pSupport = scene.getObjectByName("pSupport")
        const oAField = scene.getObjectByName("oAField")
        const oSupport = scene.getObjectByName("oSupport")
        moveActiveFieldOut(pAField, pSupport, oAField, oSupport); // move active field out

        // set OK popup to visible/hidden
        setOkPopup(phase);
        
        // For this phase, AI support card is set at playerManager.js
    } else if (phase == PHASE.SUPPORT2) {
        const pAField = scene.getObjectByName("pAField")
        const pSupport = scene.getObjectByName("pSupport")
        const oAField = scene.getObjectByName("oAField")
        const oSupport = scene.getObjectByName("oSupport")
        moveActiveFieldOut(pAField, pSupport, oAField, oSupport); // move active field out

        // set OK popup to visible/hidden
        setOkPopup(phase);

        await setSupportCardVsAi(scene);
        
        stateStore.setPhase(PHASE.BATTLE);
    } else if (phase == PHASE.BATTLE) {
        // apply effects
        await battleManager(scene);
    }
}

const evaluateToRedraw = async (scene) => {
    const oppStore = useOpponentStore();
    let hasR = false;

    if (oppStore.oActiveMonStackCount > 0) {
        return false;
    }

    for (let i = 0; i < oppStore.oHand.length; i++) {
        const cardId = oppStore.oHand[i];
        const card = oppStore.oCards.filter(card => card.id == cardId)[0];
        if (cardId <= MONSTER_CARD_MAX_ID && card.level == LEVEL.R) {
            hasR = true;
            break;
        }
    }

    if (!hasR) {
        await discardAllHandCards(WHO.OPP, scene);
        if (oppStore.oDeckCount <= 0) {
            console.log("TODO: OPPONENT LOSE")
            return false;
        } else {
            return true
        }
    } else {
        return false;
    }
}

const setActiveCard = async (scene) => {
    const oppStore = useOpponentStore();

    evaluateDigivolve();

    if (oppStore.oActiveMonStackCount > 0) {
        return;
    }

    let cardId = digivolveFrom.id;
    oppStore.setCardId(cardId);
    const cardObj = scene.getObjectByName(`${CARD_NAME.OPP}${cardId}`)
    const cardInfo = oppStore.oSelectedCard;

    // animate
    const isDigivolving = false;
    await setOppActiveMon(cardObj, cardInfo, isDigivolving);
    scene.getObjectByName("oAField").attach(cardObj)
}

// evaluate each action from highest priority
const evaluateDigivolve = () => {
    const oppStore = useOpponentStore();

    if (oppStore.oActiveMon.level == LEVEL.U) {
        return;
    }

    let digivolveCandidates = [];
    let card;
    // digivolve directly from active monster
    if (oppStore.oActiveMon.id) {
        card = oppStore.oActiveMon;

        // get cards one level above
        if (card.level == LEVEL.R) {
            digivolveCandidates = oppStore.oCards.filter(oCard => {
                if (oppStore.oHand.includes(oCard.id) && oCard.level == LEVEL.C && oCard.specialty == card.specialty) {
                    return oCard
                }
            })
        } else if (card.level == LEVEL.C) {
            digivolveCandidates = oppStore.oCards.filter(oCard => {
                if (oppStore.oHand.includes(oCard.id) && oCard.level == LEVEL.U && oCard.specialty == card.specialty) {
                    return oCard
                }
            })
        }
        // Choose which to digivolve to
        // Choose one with no support ability
        digivolveTo = digivolveCandidates.find(card => !SUPPORT_NONE_CARDS.includes(card.id)) || null;
        cardIdToDp = null;
        if (digivolveTo) {
            // stack enough DP to digivolve
            if (oppStore.oDpTotal < digivolveTo.dp) {
                const handCards = oppStore.oHand.filter(cardId => cardId != digivolveTo.id);
                for (let i = 0; i < handCards.length; i++) {
                    const cardId = handCards[i];
                    const cardPp = oppStore.oCards.filter(card => card.id == cardId)[0].pp;
                    const totalPp = oppStore.oDpTotal + parseInt(cardPp);
                    if (totalPp >= digivolveTo.dp) {
                        cardIdToDp = cardId;
                        break;
                    }
                }
                if (!cardIdToDp) {
                    digivolveTo = null;
                }
            }
        }
        // choose another candidate
        if (!digivolveTo) {
            for (let i = 0; i < digivolveCandidates.length; i++) {
                const candidate = digivolveCandidates[i];
                digivolveTo = candidate;
                // stack enough DP to digivolve
                if (oppStore.oDpTotal < candidate.dp) {
                    const handCards = oppStore.oHand.filter(cardId => cardId != digivolveTo.id);
                    for (let i = 0; i < handCards.length; i++) {
                        const cardId = handCards[i];
                        const cardPp = oppStore.oCards.filter(card => card.id == cardId)[0].pp;
                        const totalPp = oppStore.oDpTotal + parseInt(cardPp);
                        if (totalPp >= digivolveTo.dp) {
                            cardIdToDp = cardId;
                            break;
                        }
                    }
                    if (cardIdToDp) {
                        break;
                    } else {
                        digivolveTo = null;
                    }
                }
            }
        }
    }
    // digivolve from hand card
    else {
        const rCards = oppStore.oCards.filter(card => {
            if (oppStore.oHand.includes(card.id) && card.level == LEVEL.R) {
                return card
            }
        })
        digivolveCandidates = oppStore.oCards.filter(card => {
            if (oppStore.oHand.includes(card.id) && card.level == LEVEL.C) {
                return card
            }
        })
        // Choose which to digivolve to
        // Choose one with no support ability
        digivolveTo = digivolveCandidates.find(card => !SUPPORT_NONE_CARDS.includes(card.id)) || null;
        // check each R Card -> C card pair digivolve compatibility
        for (let i = 0; i < rCards.length; i++) {
            const rCard = rCards[i];
            digivolveFrom = rCard;
            cardIdToDp = null;

            if (digivolveTo) {
                // stack enough DP to digivolve
                if (oppStore.oDpTotal < digivolveTo.dp) {
                    const handCards = oppStore.oHand.filter(cardId => cardId != digivolveFrom.id && cardId != digivolveTo.id);
                    for (let i = 0; i < handCards.length; i++) {
                        const cardId = handCards[i];
                        const cardPp = oppStore.oCards.filter(card => card.id == cardId)[0].pp;
                        const totalPp = oppStore.oDpTotal + parseInt(cardPp);
                        if (totalPp >= digivolveTo.dp) {
                            cardIdToDp = cardId;
                            break;
                        }
                    }
                    if (!cardIdToDp) {
                        digivolveTo = null;
                    } else {
                        break;
                    }
                } else {
                    break;
                }
            }
            // choose another candidate
            if (!digivolveTo) {
                for (let i = 0; i < digivolveCandidates.length; i++) {
                    const candidate = digivolveCandidates[i];
                    digivolveTo = candidate;
                    cardIdToDp = null;
                    // stack enough DP to digivolve
                    if (oppStore.oDpTotal < candidate.dp) {
                        const handCards = oppStore.oHand.filter(cardId => cardId != digivolveFrom.id && cardId != digivolveTo.id);
                        for (let i = 0; i < handCards.length; i++) {
                            const cardId = handCards[i];
                            const cardPp = oppStore.oCards.filter(card => card.id == cardId)[0].pp;
                            const totalPp = oppStore.oDpTotal + parseInt(cardPp);
                            if (totalPp >= digivolveTo.dp) {
                                cardIdToDp = cardId;
                                break;
                            }
                        }
                        if (cardIdToDp) {
                            break;
                        } else {
                            digivolveTo = null;
                        }
                    } else {
                        break;
                    }
                }
                if (digivolveFrom && digivolveTo) {
                    break;
                }
            }
        }
    }

    // set one hand card with biggest PP value to DP when no digivolve
    if (!digivolveTo) {
        digivolveFrom = digivolveFrom || "";
        const handCards = oppStore.oHand.filter(cardId => cardId != digivolveFrom.id);
        let biggestPp = 0;
        for (let i = 0; i < handCards.length; i++) {
            const cardId = handCards[i];
            const card = oppStore.oCards.filter(card => card.id == cardId)[0]
            if (card && card.pp > biggestPp) {
                biggestPp = card.pp;
                cardIdToDp = cardId;
            }
        }
    }
    console.log("digivolveTo", digivolveTo)
    console.log("digivolveFrom", digivolveFrom)
    console.log(`cardIdToDp:${cardIdToDp}`)
}

const setDpCard = async (scene) => {
    const oppStore = useOpponentStore();

    if (oppStore.oHand.every(id => id > MONSTER_CARD_MAX_ID || !cardIdToDp)) {
        return;
    }

    // select monster card to set to DP
    const cardObj = oppStore.oCards.filter(card => card.id == cardIdToDp)[0];
    const card = scene.getObjectByName(`${CARD_NAME.OPP}${cardIdToDp}`)

    // update hand
    oppStore.removeOHand(cardIdToDp);

    // animate
    animatePpPopup(cardObj.pp, scene, false);
    await animateHandToDp(card);

    // update DP rack
    oppStore.addODp(cardIdToDp, cardObj.pp);

    const dpCnt = document.getElementById("oDpCount");
    dpCnt.innerHTML = oppStore.oDpTotal;

    scene.getObjectByName("oAField").attach(card)
    cardIdToDp = null;
    return;
}

const setDigivolveCard = async (scene) => {
    if (!digivolveTo) {
        return;
    }

    const cardId = digivolveTo.id;
    const cardObj = scene.getObjectByName(`${CARD_NAME.OPP}${cardId}`)

    // animate selected card to move on top of current active card
    const isDigivolving = true;
    await animateDigivolveEffect(WHO.OPP, scene);
    await setOppActiveMon(cardObj, digivolveTo, isDigivolving);

    // move DP cards to offline stack
    await setOppDpToOffline(scene, useOpponentStore().oDpCount);
    scene.getObjectByName("oAField").attach(cardObj)
}

export const setSupportCardVsAi = async (scene) => {
    // TODO: set better algorithm
    const oppStore = useOpponentStore();
    let isDeckTopCard;

    const usable = oppStore.oHand.filter(cardId => {
        if (GENERAL_SUPPORT_MONSTER_CARDS.includes(cardId) || (parseInt(cardId) > MONSTER_CARD_MAX_ID && !DIGIVOLUTION_CARDS.includes(cardId))) {
            return true;
        } else {
            return false;
        }
    })
    if (usable.length > 0) {
        isDeckTopCard = false;
        const cardObj = scene.getObjectByName(`${CARD_NAME.OPP}${usable[Math.floor(Math.random() * usable.length)]}`)
        await setOppSupport(scene, isDeckTopCard, cardObj);
    } else {
        const chance = 0.7;
        if (Math.PI < chance) {
            isDeckTopCard = true;
            const cardObj = scene.getObjectByName(`${CARD_NAME.OPP}${useOpponentStore().oDeck[useOpponentStore().oDeckCount - 1]}`)
            await setOppSupport(scene, isDeckTopCard, cardObj);
        }
    }
}

export const setOppAiAttack = () => {
    const stateStore = useStateStore();
    const playerStore = usePlayerStore();
    const oppStore = useOpponentStore();

    setTimeout(() => {
        // determine strongest and 2nd strongest attack
        let attack = {
            choice: ATTACK.C,
            value: oppStore.oActiveMon.cPow,
            secondChoice: ATTACK.T,
            secondValue: oppStore.oActiveMon.tPow
        };
        if (parseInt(oppStore.oActiveMon.tPow) >= attack.value) {
            attack.secondChoice = attack.choice;
            attack.secondValue = attack.value;
            attack.choice = ATTACK.T;
            attack.value = oppStore.oActiveMon.tPow;
        } else if (parseInt(oppStore.oActiveMon.xPow) >= attack.value) {
            attack.secondChoice = attack.choice;
            attack.secondValue = attack.value;
            attack.choice = ATTACK.X;
            attack.value = oppStore.oActiveMon.xPow;
        }

        // opponent first attack, use strongest attack
        if (stateStore.currentTurn == WHO.OPP) {

            // if player x effect counters the strongest attack and fatal, roll the second strongest attack
            const isCounter = isAttackChoiceCounter(attack.choice, playerStore.pActiveMon.id);
            if (isCounter) {
                let sameChoiceChance = 0.4;
                if (attack.value >= playerStore.pActiveMon.hp) {
                    sameChoiceChance = 0.1;
                }
                if (attack.secondValue >= playerStore.pActiveMon.hp) {
                    sameChoiceChance = 0;
                }
                attack.choice = Math.random() >= sameChoiceChance ? attack.secondChoice : attack.choice;
            }
            oppStore.setOAttack(attack.choice)
        }
        // player first attack, watch out for the strongest attack
        else {
            let pAttack = {
                choice: ATTACK.C,
                value: playerStore.pActiveMon.cPow,
                secondChoice: ATTACK.T,
                secondValue: playerStore.pActiveMon.tPow
            };
            if (parseInt(playerStore.pActiveMon.tPow) >= pAttack.value) {
                pAttack.secondChoice = pAttack.choice;
                pAttack.secondValue = pAttack.value;
                pAttack.choice = ATTACK.T;
                pAttack.value = playerStore.pActiveMon.tPow;
            } else if (parseInt(playerStore.pActiveMon.xPow) >= pAttack.value) {
                pAttack.secondChoice = pAttack.choice;
                pAttack.secondValue = pAttack.value;
                pAttack.choice = ATTACK.X;
                pAttack.value = playerStore.pActiveMon.xPow;
            }

            // if opponent x effect counters the strongest attack
            const isCounter = isAttackChoiceCounter(ATTACK.X, oppStore.oActiveMon.id);
            if (isCounter) {
                if (pAttack.value >= oppStore.oActiveMon.hp) {
                    oppStore.setOAttack(ATTACK.X)
                } else {
                    oppStore.setOAttack(Math.random() > 0.5 ? attack.choice : ATTACK.X)
                }
            } else {
                let sameChoiceChance = 0.5;
                const isPlayerCounter = isAttackChoiceCounter(attack.choice, playerStore.pActiveMon.id);
                if (isPlayerCounter && attack.value * 2 >= playerStore.pActiveMon.hp) {
                    sameChoiceChance = 0.8
                }
                attack.choice = Math.random() >= sameChoiceChance ? attack.secondChoice : attack.choice;
                oppStore.setOAttack(attack.choice);

                if (pAttack.value >= oppStore.oActiveMon.hp && X_EFF_1ST_ATTACK_CARDS.includes(oppStore.oActiveMon.id)) {
                    oppStore.setOAttack(ATTACK.X);
                }
            }
        }
    }, 500);
}