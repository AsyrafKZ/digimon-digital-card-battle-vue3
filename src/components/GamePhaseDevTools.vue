<template>
<div v-if="stateStore.playerMode == MODE.DEV">
        <UserButton id="drawButton" class="game-board-button draw-btn" @click="changePhase(1)">
            DRAW PHASE
        </UserButton>
        <UserButton id="entranceButton" class="game-board-button entrance-btn" @click="changePhase(2)">
            ENTRANCE PHASE
        </UserButton>
        <UserButton id="rackUpDpButton" class="game-board-button rackUpDp-btn" @click="changePhase(3)">
            RACK-UP DP PHASE
        </UserButton>
        <UserButton id="digivolveButton" class="game-board-button digivolve-btn" @click="changePhase(4)">
            DIGIVOLVE PHASE
        </UserButton>
        <UserButton id="chooseAttackButton" class="game-board-button choose-attack-btn" @click="changePhase(5)">
            CHOOSE ATTACK PHASE
        </UserButton>
        <UserButton id="supportButton1" class="game-board-button support-btn1" @click="changePhase(6)">
            SUPPORT PHASE 1
        </UserButton>
        <UserButton id="supportButton2" class="game-board-button support-btn2" @click="changePhase(PHASE.SUPPORT2)">
            SUPPORT PHASE 2
        </UserButton>
        <UserButton id="battleButton" class="game-board-button battle-btn" @click="changePhase(7)">
            BATTLE PHASE
        </UserButton>
        <UserButton id="endButton" class="game-board-button end-btn" @click="changePhase(0)">
            END TURN
        </UserButton>
    </div>
    <div v-if="stateStore.oppMode == MODE.DEV">
        <UserButton class="game-board-button oppBtn oppC" @click="tempSetOppAttackChoice(ATTACK.C)">
            CIRCLE 〇
        </UserButton>
        <UserButton class="game-board-button oppBtn oppT" @click="tempSetOppAttackChoice(ATTACK.T)">
            TRIANGLE △
        </UserButton>
        <UserButton class="game-board-button oppBtn oppX" @click="tempSetOppAttackChoice(ATTACK.X)">
            CROSS ✕
        </UserButton>
    </div>
</template>

<script setup>
import { useStateStore } from "../stores/state"
import { ATTACK, PHASE, MODE, WHO } from "../const/const";
import { usePlayerStore } from "../stores/player";
import { useOpponentStore } from "../stores/opponent";
import { drawDeckCardToHand, discardAllHandCards, moveAttackChoiceBoardIn, moveActiveFieldOut, setOkPopup, removePulseEffect } from "./fieldManager";
import { battleManager } from "./battleManager";
import UserButton from "./UserButton.vue";

const stateStore = useStateStore();
const playerStore = usePlayerStore();
const oppStore = useOpponentStore();

// props from GameBoard.vue
const { sceneC, pChoiceC, oChoiceC, pFieldC, oFieldC, pAFieldC, pSupportC, oSupportC } = defineProps(["sceneC", "pChoiceC", "oChoiceC", "pFieldC", "oFieldC", "pAFieldC", "pSupportC", "oSupportC"]);

/**
 * Change current phase
 */
 const changePhase = async (phase) => {
    stateStore.setPhase(phase);

    // DRAW
    if (phase == PHASE.DRAW) {
        await drawDeckCardToHand(WHO.PLAYER, sceneC.value.scene, 4);
    }
    // REDRAW
    else if (phase == PHASE.REDRAW) {
        console.log("redraw kat gameboard.vue")
        await discardAllHandCards(WHO.PLAYER, sceneC.value.scene);
        if (playerStore.pDeckCount <= 0) {
            // TODO: YOU LOSE!
            return;
        }
        await drawDeckCardToHand(WHO.PLAYER, sceneC.value.scene, 4);
    }
    // CHOOSE ATTACK
    else if (phase == PHASE.CHOOSE_ATTACK) {
        // enable mouse event to html layer
        // htmlRenderer.domElement.style.pointerEvents = "auto";

        // reset attack choices
        playerStore.pAttack = "";
        oppStore.oAttack = "";

        // move choice board in
        const isChoiceBoardMoveIn = true
        moveAttackChoiceBoardIn(isChoiceBoardMoveIn, pChoiceC.value.mesh, oChoiceC.value.mesh);
    }
    // SUPPORT 1
    else if (phase == PHASE.SUPPORT1) {
        moveActiveFieldOut(pAFieldC.value.mesh, pSupportC.value.mesh, oAFieldC.value.mesh, oSupportC.value.mesh); // move active field out
    }
    // SUPPORT 2
    else if (phase == PHASE.SUPPORT2) {
        moveActiveFieldOut(pAFieldC.value.mesh, pSupportC.value.mesh, oAFieldC.value.mesh, oSupportC.value.mesh); // move active field out
    }
    // BATTLE
    else if (phase == PHASE.BATTLE) {
        // apply effects
        await battleManager(sceneC.value.scene);
    }

    // MOVE THINGS OUT OF FOV
    if (phase != PHASE.CHOOSE_ATTACK) {
        // htmlRenderer.domElement.style.pointerEvents = "none";
        const isChoiceBoardMoveIn = false;
        moveAttackChoiceBoardIn(isChoiceBoardMoveIn, pChoiceC.value.mesh, oChoiceC.value.mesh); // move board out
    }

    // set OK popup to visible/hidden
    setOkPopup(phase);

    // Remove glow effect out of FOV in between phases
    removePulseEffect(sceneC.value.scene)
};

/**
 * Set opponent attack choice
 * TODO: debug purpose only. remove this later.
 */
const tempSetOppAttackChoice = (choice) => {
    oppStore.setOAttack(choice)
    setTimeout(() => {
        changePhase(PHASE.SUPPORT1);
    }, 750);
}

</script>