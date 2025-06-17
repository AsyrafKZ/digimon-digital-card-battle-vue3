<template>
    <div class="canvas-container">
        <div class="canvas-frame" ref="canvasFrameC">
            <TresCanvas clear-color="#183141" render-mode="on-demand">
                <Stats />
                <OrbitControls />
                <TresPerspectiveCamera :position="[0, 0, 10]" />
                <TresAmbientLight ref="lightC" :position="[0, 0, 10]" :intensity="1" />

                <Suspense>
                    <GameCanvasBoardUI />
                </Suspense>
                <!-- <GameCanvasTextUI /> -->
                <GameCanvasTextUINew />
                <GameCards :actorId="gameStateStore.player.id" />
                <GameCards :actorId="gameStateStore.opponent.id" />
            </TresCanvas>
        </div>
    </div>
    <GameInfo :actor="currentTurnStr" />
    <GameAction />
</template>

<script setup>
import { TresCanvas, useLoop } from "@tresjs/core"
import { ref, onMounted, watch, computed, shallowRef, provide } from "vue";
import { OrbitControls, Plane, Stats, Outline } from "@tresjs/cientos"
import { TextureLoader } from "three"

import PlayerDeck from "./PlayerDeck.vue";
import OpponentDeck from "./OpponentDeck.vue"
import { useStateStore } from "../stores/state.js";
import { usePlayerStore } from "../stores/player.js";
import { useOpponentStore } from "../stores/opponent.js";
import { useGameStateStore } from "../stores/gameState.js";
import { CSS2DRenderer } from "three/examples/jsm/renderers/CSS2DRenderer.js";
import { ATTACK, PHASE, WHO, MODE } from "../const/const.js";
import { Selection, SelectiveBloomEffect, EffectComposer, RenderPass, EffectPass } from "postprocessing"
import { moveSupportToOffline, moveActiveFieldIn, set1stAttackBanner, setToOriginalValue, moveAttackChoiceBoardIn } from "./fieldManager.js"
import { setAiAction, setOppAiAttack } from "./aiManager.js"
import { changePlayerPhase, gotoNextPhase, showProceedBtn } from "./playerManager.js"
import { createCard } from "../utils/createCard.js";
import { animatePow } from "../animations/monster.js"
import UserButton from "./UserButton.vue"
import { specialtyToClass, specialtyToImg, speedToImg, turnToStr, phaseToName } from "../utils/mapper.js"
import { socket } from "../socket.js"
import { setActionVsPlayer, setActiveCardVsPlayer, setDpCardVsPlayer, setDigivolveCardVsPlayer, setSupportCardVsPlayer } from "./vsPlayerManager.js";
import { briefPause } from "../animations/field.js";
import GameInfo from "./GameInfo.vue";
import GameAction from "./GameAction.vue";
import GamePhaseDevTools from "./GamePhaseDevTools.vue";
import GameCards from "./GameCards.vue";
import { useBoardStore } from "../stores/board.js";
import GameCanvasBoardUI from "./GameCanvasBoardUI.vue"
import GameCanvasTextUINew from "./GameCanvasTextUINew.vue"

const canvasFrameC = ref(); // to append CSS2DRenderer's DOM
const rendererC = ref(); // ref to TroisJS Renderer component
const cameraC = ref(); // ref to TroisJS Camera component
const sceneC = ref(); // ref to TroisJS Scene component

const width = ref(0);
const height = ref(0);

// pinia stores
const stateStore = useStateStore();
const playerStore = usePlayerStore();
const oppStore = useOpponentStore();
const gameStateStore = useGameStateStore();
const boardStore = useBoardStore();

const currentTurnStr = computed(() => {
    return gameStateStore.currentTurnActor == gameStateStore.player.id ? "Player" : "Opponent"
})

onMounted(() => {
    const frameRect = canvasFrameC.value.getBoundingClientRect();
    width.value = frameRect.width;
    height.value = frameRect.height;
    console.log("mounted, width and height set", width.value, height.value)

})

</script>

<style>
@import '/src/style.css';

.canvas-container {
    width: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
}

.canvas-frame {
    position: relative;
    width: 70vw;
    height: 70vh;
}

.card-label {
    background-color: rgba(1, 0, 0, 0.7);
    color: white;
    padding: 5px 10px;
    border-radius: 3px;
    font-size: 14px;
    /* Add any other CSS styling */
}
</style>