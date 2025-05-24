import { WHO, CARD_NAME, ATTACK, DECK_NAME, SPECIALTY, SPEED, MODE } from "../const/const";
import { useOpponentStore } from "../stores/opponent";
import { usePlayerStore } from "../stores/player";
import { useStateStore } from "../stores/state";
import { effects } from "../utils/effects"
import { addPHp, addOHp, addPCPower, addPTPower, addPXPower, addOCPower, addOTPower, addOXPower } from "../utils/battleCalculation";
import { animateFlipSupportCard, animateHpPopup, animateAttackChoice, animateAttackPulse, briefPause, animateMisfireFailurePopup } from "../animations/field";
import { setPWinBar, setOWinBar, movePlayerActiveToOffline, moveOppActiveToOffline, moveReturnToMainMenuBtn, addPulseEffect, removePulseEffect } from "./fieldManager";
import { attackChoiceToSymbol } from "../utils/mapper";

export const attackChoiceManager = () => {
    // DO something
}

export const battleManager = async (scene) => {
    const stateStore = useStateStore();
    const playerStore = usePlayerStore();
    const oppStore = useOpponentStore();

    const battleWinCount = 3;
    const pOriginalCpow = playerStore.pActiveMon.cPow;
    const pOriginalTpow = playerStore.pActiveMon.tPow;
    const pOriginalXpow = playerStore.pActiveMon.xPow;
    const oOriginalCpow = oppStore.oActiveMon.cPow;
    const oOriginalTpow = oppStore.oActiveMon.tPow;
    const oOriginalXpow = oppStore.oActiveMon.xPow;

    let firstAttack = stateStore.turn.firstAttack;
    stateStore.setBattleFirstAttack(firstAttack);

    // DEV MODE
    if (stateStore.playerMode == MODE.DEV && stateStore.oppMode == MODE.DEV) {
        // change specialty logically. TODO: remove this.
        playerStore.pActiveMon.specialty = SPECIALTY.NATURE
        // oppStore.oActiveMon.specialty = SPECIALTY.ICE

        // set support cards logically. TODO: remove this
        // const playerSupportId = "023"
        // const oppSupportId = "023"
        // playerStore.setPSupport(playerSupportId, playerStore.pCards.filter(el=>el.id==playerSupportId)[0].supportSpeed, false);
        // oppStore.setOSupport(oppSupportId, oppStore.oCards.filter(el=>el.id==oppSupportId)[0].supportSpeed, false);
    }

    // all possible effects
    let effects = [
        { id: playerStore.pSupport.cardId, speed: playerStore.pSupport.speed, isFirstAttack: firstAttack == WHO.PLAYER, isOption: true, isPlayer: true }, // pSupport
        { id: oppStore.oSupport.cardId, speed: oppStore.oSupport.speed, isFirstAttack: firstAttack == WHO.OPP, isOption: true, isPlayer: false }, // oSupport
        { id: playerStore.pActiveMon.id, speed: playerStore.pActiveMon.xSpeed, isFirstAttack: firstAttack == WHO.PLAYER, isOption: false, isPlayer: true }, // pXeff
        { id: oppStore.oActiveMon.id, speed: oppStore.oActiveMon.xSpeed, isFirstAttack: firstAttack == WHO.OPP, isOption: false, isPlayer: false }, // oXeff
    ];
    let finalEffects = effects.filter((effect) => effect.id);
    console.log("final effects ids", finalEffects.map(el => el.id))

    // sort effects to activation order
    // activation speed > 1st attack effects > option effect
    finalEffects.sort((a, b) => {
        if (a.speed > b.speed) return -1;
        if (a.speed < b.speed) return 1;

        if (a.isFirstAttack && !b.isFirstAttack) return -1;
        if (a.isFirstAttack && b.isFirstAttack) return 0;
        if (!a.isFirstAttack && b.isFirstAttack) return 1;

        if (a.isOption && !b.isOption) return -1;
        if (!a.isOption && b.isOption) return 1;

        return 0;
    });
    console.log("final effects sorted", finalEffects)

    // animate: move in both attack choices
    let moveIn = true;
    const pChoiceHtml = document.getElementById("choiceDisplayP")
    const oChoiceHtml = document.getElementById("choiceDisplayO")
    const pHtml = attackChoiceToSymbol(playerStore.pAttack)
    pChoiceHtml.innerHTML = pHtml.symbol;
    pChoiceHtml.className = `attack-choice-display ${pHtml.class}`;
    const oHtml = attackChoiceToSymbol(oppStore.oAttack);
    oChoiceHtml.innerHTML = oHtml.symbol;
    oChoiceHtml.className = `attack-choice-display ${oHtml.class}`;

    const pChoiceObj = scene.getObjectByName("choiceDisplayP")
    const oChoiceObj = scene.getObjectByName("choiceDisplayO")
    await animateAttackChoice(moveIn, pChoiceObj, oChoiceObj);

    // execute effects in order
    for (let i = 0; i < finalEffects.length; i++) {
        const effect = finalEffects[i];

        // skip if Mist'd
        const mists = ["253", "289"];
        if ((effect.isPlayer && mists.includes(oppStore.oSupport.cardId)) || (!effect.isPlayer && mists.includes(playerStore.pSupport.cardId))) {
            await animateMisfireFailurePopup(scene, effect.isPlayer, isXeff);
            continue;
        }

        if (effect.isOption) {
            const isXeff = false;
            const who = effect.isPlayer ? WHO.PLAYER : WHO.OPP;
            const cardName = effect.isPlayer ? CARD_NAME.PLAYER : CARD_NAME.OPP;
            const obj = scene.getObjectByName(cardName + effect.id);
            const renderer = obj.userData.component.renderer

            await animateFlipSupportCard(scene, who);

            // skip if jammed
            if ((effect.isPlayer && !playerStore.pSupport.isValid) || (!effect.isPlayer && !oppStore.oSupport.isValid)) {
                await animateMisfireFailurePopup(scene, effect.isPlayer, isXeff);
                continue;
            }

            // execute effect
            addPulseEffect(obj, renderer, "pulse-effect-support")
            await executeEffect(who, scene, isXeff, effect.id);
            removePulseEffect();
        }
        else {
            const isXeff = true;
            if (effect.isPlayer && playerStore.pAttack == ATTACK.X) {
                // execute effect
                await executeEffect(WHO.PLAYER, scene, isXeff, effect.id);
            } else if (!effect.isPlayer && oppStore.oAttack == ATTACK.X) {
                // execute effect
                await executeEffect(WHO.OPP, scene, isXeff, effect.id);
            }
        }
    }

    // execute battle
    // update who attacks first
    firstAttack = stateStore.battleFirstAttack;
    let playerWin = false;
    let oppWin = false;

    if (firstAttack == WHO.PLAYER) {
        playerWin = await executePlayerAttack(playerStore, oppStore, scene);
        if (!playerWin) {
            oppWin = await executeOppAttack(oppStore, playerStore, scene);
        }
    } else {
        oppWin = await executeOppAttack(oppStore, playerStore, scene);
        if (!oppWin) {
            playerWin = await executePlayerAttack(playerStore, oppStore, scene);
        }
    }

    // end game when either player wins
    if (playerStore.pWinCount == battleWinCount || oppStore.oWinCount == battleWinCount) {
        const matchResultBanner = document.getElementById("matchResult");
        const result = playerStore.pWinCount == battleWinCount ? "WINS" : "LOSES";
        const resultStr = `${playerStore.pWinCount} Wins, ${oppStore.oWinCount} Losses - ${stateStore.player.name} ${result}!`;
        matchResultBanner.innerHTML = resultStr;
        matchResultBanner.style.visibility = "visible";

        moveReturnToMainMenuBtn();
    }
    // continue game
    else {
        // move attack choice out
        moveIn = false;
        await animateAttackChoice(moveIn, pChoiceObj, oChoiceObj);

        stateStore.setPhase(stateStore.nextPhase);
    }
}

const executeEffect = (who, scene, isXeff, cardId) => {
    console.log(`${who} executes ${cardId} effect`)
    if (isXeff) {
        return effects.filter(eff => eff.id == cardId.substring(0, 3))[0].xEffect(who, scene, isXeff);
    } else {
        return effects.filter(eff => eff.id == cardId.substring(0, 3))[0].effect(who, scene, isXeff);
    }
}

const executePlayerAttack = async (playerStore, oppStore, scene) => {
    const stateStore = useStateStore();
    let attackVal;
    if (playerStore.pAttack == ATTACK.C) {
        attackVal = -playerStore.pActiveMon.cPow
    } else if (playerStore.pAttack == ATTACK.T) {
        attackVal = -playerStore.pActiveMon.tPow
    } else if (playerStore.pAttack == ATTACK.X) {
        attackVal = -playerStore.pActiveMon.xPow
    }

    console.log(`#####\nPlayer use ${playerStore.pAttack} attack: ${attackVal}. Opp last HP: ${oppStore.oActiveMon.hp}`)
    await animateAttackPulse(WHO.PLAYER);
    await addOHp(attackVal, scene);
    console.log(`Opp current HP: ${oppStore.oActiveMon.hp}`)
    await briefPause();

    // Eat up hp
    if (playerStore.isEatUpHp) {
        const addHp = -parseInt(attackVal);
        await addPHp(addHp, scene);
        playerStore.setEatUpHp(false);
        console.log(`Opp used Eat-up HP. Opp current HP: ${oppStore.oActiveMon.hp}`)
    }

    // check if player wins battle
    if (oppStore.oActiveMon.hp === 0) {

        if (oppStore.revive.isRevive) {
            await addOHp(oppStore.revive.newHp, scene);
            oppStore.setRevive(false, 0);
            console.log(`Opp used revive. Opp current HP: ${oppStore.oActiveMon.hp}`)
        } else {
            // detach card from active field, then attach to deck
            if (!(stateStore.playerMode == MODE.DEV && stateStore.oppMode == MODE.DEV)) {
                const activeMonStack = oppStore.oActiveMonStack.slice().reverse();
                for (let i = 0; i < activeMonStack.length; i++) {
                    const cardId = activeMonStack[i].id
                    const card = scene.getObjectByName(CARD_NAME.OPP + cardId);
                    scene.getObjectByName(DECK_NAME.OPP).attach(card)
                    await moveOppActiveToOffline(card);
                }
            }
            oppStore.removeOActiveMon();
        }

        playerStore.addPWinCount();
        setPWinBar(true);
        return true;
    } else {
        return false;
    }
}

const executeOppAttack = async (oppStore, playerStore, scene) => {
    const stateStore = useStateStore();
    let attackVal;
    if (oppStore.oAttack == ATTACK.C) {
        attackVal = -oppStore.oActiveMon.cPow;
    } else if (oppStore.oAttack == ATTACK.T) {
        attackVal = -oppStore.oActiveMon.tPow;
    } else if (oppStore.oAttack == ATTACK.X) {
        attackVal = -oppStore.oActiveMon.xPow;
    }
    console.log(`#####\Opp use ${oppStore.oAttack} attack: ${attackVal}. Player last HP: ${playerStore.pActiveMon.hp}`)
    await animateAttackPulse(WHO.OPP);
    await addPHp(attackVal, scene);
    console.log(`Player current HP: ${playerStore.pActiveMon.hp}`)
    await briefPause();
    
    // Eat up hp
    if (oppStore.isEatUpHp) {
        const addHp = -parseInt(attackVal);
        await addOHp(addHp, scene);
        oppStore.setEatUpHp(false);
        console.log(`Opp used Eat-up HP. Opp current HP: ${oppStore.oActiveMon.hp}`)
    }

    // check if opponent wins battle
    if (playerStore.pActiveMon.hp === 0) {

        if (playerStore.revive.isRevive) {
            await addPHp(playerStore.revive.newHp, scene);
            playerStore.setRevive(false, 0);
            console.log(`Player used revive. Player current HP: ${playerStore.pActiveMon.hp}`)
        } else {
            // detach card from active field, then attach to deck
            if (!(stateStore.playerMode == MODE.DEV && stateStore.oppMode == MODE.DEV)) {
                const activeMonStack = playerStore.pActiveMonStack.slice().reverse();
                for (let i = 0; i < activeMonStack.length; i++) {
                    const cardId = activeMonStack[i].id
                    const card = scene.getObjectByName(CARD_NAME.PLAYER + cardId);
                    scene.getObjectByName(DECK_NAME.PLAYER).attach(card)
                    await movePlayerActiveToOffline(card);
                }
            }
            playerStore.removePActiveMon();
        }

        oppStore.addOWinCount();
        setOWinBar(true);
        return true;
    } else {
        return false;
    }
}