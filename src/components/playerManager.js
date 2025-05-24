import { MODE, PHASE, WHO } from "../const/const";
import { useOpponentStore } from "../stores/opponent";
import { usePlayerStore } from "../stores/player";
import { useStateStore } from "../stores/state"
import { battleManager } from "./battleManager";
import { setSupportCardVsAi } from "./aiManager"
import { socket } from "../socket";
import { drawDeckCardToHand, moveActiveFieldOut, moveAttackChoiceBoardIn, removePulseEffect, setOkPopup, discardAllHandCards } from "./fieldManager";

export const changePlayerPhase = (phase, scene) => {
    changePhase(phase, scene)
}

const changePhase = async (phase, scene) => {
    const stateStore = useStateStore();
    const playerStore = usePlayerStore();
    const oppStore = useOpponentStore();
    const htmlRenderer = document.getElementById("htmlRenderer");

    // DRAW
    if (phase == PHASE.DRAW) {
        await drawDeckCardToHand(WHO.PLAYER, scene, 4);
    } else if (phase == PHASE.REDRAW) {
        if (stateStore.oppMode == MODE.PROD) {
            socket.emit("update-phase", phase)
        }
        await discardAllHandCards(WHO.PLAYER, scene);
        stateStore.setPhase(PHASE.DRAW);
    } else if (phase == PHASE.ENTRANCE) {
        if (playerStore.pActiveMonStackCount > 0) {
            stateStore.setPhase(PHASE.RACK_UP_DP)
        }
    } else if (phase == PHASE.RACK_UP_DP) {
        for (let i = 0; i < playerStore.pHand.length; i++) {
            const handCardId = playerStore.pHand[i];
            const monsterCardMaxId = 190;
            if (parseInt(handCardId) <= monsterCardMaxId) {
                document.getElementById(`okUi${i}`).style.visibility = "visible"
            }
        }
    } else if (phase == PHASE.DIGIVOLVE_SPECIAL) {
        // TODO WIP
        // move active field out
        const pAField = scene.getObjectByName("pAField");
        const pSupport = scene.getObjectByName("pSupport");
        moveActiveFieldOut(pAField, pSupport, null, null);
    } else if (phase == PHASE.CHOOSE_ATTACK) {
        if (oppStore.oActiveMonStackCount > 0) {
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

        if (stateStore.oppMode == MODE.AI) {
            await setSupportCardVsAi(scene);
            stateStore.setPhase(PHASE.SUPPORT2)
        }
    } else if (phase == PHASE.SUPPORT2) {
        const pAField = scene.getObjectByName("pAField")
        const pSupport = scene.getObjectByName("pSupport")
        const oAField = scene.getObjectByName("oAField")
        const oSupport = scene.getObjectByName("oSupport")
        moveActiveFieldOut(pAField, pSupport, oAField, oSupport); // move active field out
    } else if (phase == PHASE.BATTLE) {
        // apply effects
        await battleManager(scene);
    }

    // set OK popup to visible/hidden
    setOkPopup(phase);
    // Remove glow effect out of FOV in between phases
    removePulseEffect();
    return;
}

export const gotoNextPhase = (isProceed) => {
    const stateStore = useStateStore();
    if (isProceed) {
        stateStore.setPhase(stateStore.nextPhase);
    } else {
        stateStore.setPhase(PHASE.REDRAW);
    }

    // sync state
    if (stateStore.oppMode == MODE.PROD) {
        socket.emit("update-phase", nextPhase)
    }
}

export const showProceedBtn = () => {
    const stateStore = useStateStore();
    const playerStore = usePlayerStore();

    if (playerStore.pWinCount == 3 || useOpponentStore().oWinCount == 3) {
        return false;
    }

    if (stateStore.phase == PHASE.CHOOSE_ATTACK || stateStore.phase == PHASE.BATTLE
        || (stateStore.phase == PHASE.ENTRANCE && playerStore.pActiveMonStackCount <= 0)
        || (stateStore.currentTurn == WHO.OPP && stateStore.phase != PHASE.SUPPORT1)) {
        return false;
    } else {
        return true;
    }
}