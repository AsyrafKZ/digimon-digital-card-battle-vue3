import { animatePpPopup } from "../animations/field";
import { animateHandToDp } from "../animations/monster";
import { CARD_NAME, PHASE, WHO } from "../const/const";
import { useOpponentStore } from "../stores/opponent";
import { usePlayerStore } from "../stores/player";
import { useStateStore } from "../stores/state";
import { discardAllHandCards, drawDeckCardToHand, moveActiveFieldOut, moveAttackChoiceBoardIn, removePulseEffect, setOkPopup, setOppActiveMon, setOppDpToOffline, setOppSupport } from "./fieldManager";
import { battleManager } from "./battleManager";

export const setActionVsPlayer = (phase, scene) => {
    changePhase(phase, scene);
}

const changePhase = async (phase, scene) => {
    const oppStore = useOpponentStore();
    const playerStore = usePlayerStore();
    const stateStore = useStateStore();

    // DRAW
    if (phase == PHASE.DRAW) {
        // remove glow effect
        removePulseEffect();

        await drawDeckCardToHand(WHO.OPP, scene, 4);
    }
    // REDRAW
    else if (phase == PHASE.REDRAW) {
        await discardAllHandCards(WHO.OPP, scene);
        stateStore.setPhase(PHASE.DRAW);
    }
    // CHOOSE ATTACK
    else if (phase == PHASE.CHOOSE_ATTACK) {        
        if (playerStore.pActiveMonStackCount > 0) {
            const htmlRenderer = document.getElementById("htmlRenderer");
            const pChoice = scene.getObjectByName("pChoice");
            const oChoice = scene.getObjectByName("oChoice");

            // enable mouse event to html layer
            htmlRenderer.style.pointerEvents = "auto";

            // move choice board in
            const isChoiceBoardMoveIn = true
            moveAttackChoiceBoardIn(isChoiceBoardMoveIn, pChoice, oChoice);
        } else {
            stateStore.setPhase(PHASE.END);
        }
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
    } else if (phase == PHASE.SUPPORT2) {
        const pAField = scene.getObjectByName("pAField")
        const pSupport = scene.getObjectByName("pSupport")
        const oAField = scene.getObjectByName("oAField")
        const oSupport = scene.getObjectByName("oSupport")
        moveActiveFieldOut(pAField, pSupport, oAField, oSupport); // move active field out
        
        // set OK popup to visible/hidden
        setOkPopup(phase);
    } else if (phase == PHASE.BATTLE) {
        // apply effects
        await battleManager(scene);
    }
}

export const setActiveCardVsPlayer = async (scene) => {
    const oppStore = useOpponentStore();
    const cardObj = scene.getObjectByName(`${CARD_NAME.OPP}${oppStore.oSelectedCardId}`)
    const cardInfo = oppStore.oSelectedCard;

    // animate
    const isDigivolving = false;
    await setOppActiveMon(cardObj, cardInfo, isDigivolving);

    // attach card to active field
    scene.getObjectByName("oAField").attach(cardObj)
    useStateStore().$patch({
        updateAction: false
    })
}

export const setDpCardVsPlayer = async (scene) => {
    const oppStore = useOpponentStore();

    // select monster card to set to DP
    const cardIdToDp = oppStore.oSelectedCardId;
    const cardObj = oppStore.oCards.filter(card => card.id == cardIdToDp)[0];
    const card = scene.getObjectByName(`${CARD_NAME.OPP}${cardIdToDp}`);

    // update hand
    oppStore.removeOHand(cardIdToDp);

    // animate
    animatePpPopup(cardObj.pp, scene, false);
    await animateHandToDp(card);

    // update DP rack
    oppStore.addODp(cardIdToDp, cardObj.pp);

    const dpCnt = document.getElementById("oDpCount");
    dpCnt.innerHTML = oppStore.oDpTotal;
    
    // attach card to active field
    scene.getObjectByName("oAField").attach(card)
    useStateStore().$patch({
        updateAction: false
    })
}

export const setDigivolveCardVsPlayer = async (scene) => {
    const oppStore = useOpponentStore();

    const cardObj = scene.getObjectByName(`${CARD_NAME.OPP}${oppStore.oSelectedCardId}`)
    const cardInfo = oppStore.oSelectedCard;

    // animate selected card to move on top of current active card
    const isDigivolving = true;
    await setOppActiveMon(cardObj, cardInfo, isDigivolving);

    // move DP cards to offline stack
    await setOppDpToOffline(scene, oppStore.oDpCount);

    // attach card to active field
    scene.getObjectByName("oAField").attach(cardObj)
    useStateStore().$patch({
        updateAction: false
    })
}

export const setSupportCardVsPlayer = (scene, isDeckTopCard) => {
    const oppStore = useOpponentStore();

    const cardId = oppStore.oSelectedCardId
    console.log("manager cardId", cardId)
    const cardObj = scene.getObjectByName(`${CARD_NAME.OPP}${cardId}`)
    setOppSupport(scene, isDeckTopCard, cardObj);

    useStateStore().$patch({
        updateAction: false
    })
}