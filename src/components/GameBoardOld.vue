<template>
    <div class="canvas-container">
    <div class="canvas-frame" ref="canvasFrameC" >
    <Renderer ref="rendererC" antialias resize=true :orbit-ctrl="true" :pointer="{ intersectRecursive: true }">
        <Camera ref="cameraC" :position="{ z: 10 }" />
        <Scene ref="sceneC" background="#183141">
            <Raycaster @click="onPointerEvent"  />
            <!-- Main Light -->
            <PointLight ref="lightC" :position="{ z: 10 }" />
            <PointLight ref="lightC" :position="{ z: -10 }" />
            <!-- Game BG -->
            <Plane ref="bgC" :width="14" :height="10" :position="{ z: -1 }" >
                <LambertMaterial color="#274579" :transparent="true" />
            </Plane>
            <!-- Opponent Field -->
            <Plane ref="oFieldC" :width="12" :height="3" :position="{ y: 3, z: -0.5 }">
                <LambertMaterial>
                    <Texture src="/src/sprites/opponent-field.png" />
                </LambertMaterial>
            </Plane>
            <!-- Opponent Active Field -->
            <Plane ref="oAFieldC" :width="5.4" :height="2.8" :position="{ x: 2.9, z: -0.1 }">
                <LambertMaterial>
                    <Texture src="/src/sprites/opponent-active-field.png" />
                </LambertMaterial>
            </Plane>
            <!-- Opponent Support Bracket -->
            <Plane ref="oSupportC" :width="2.2" :height="0.8" :position="{ x: 1.4, y: -1, z: -0.502 }">
                <LambertMaterial>
                    <Texture src="/src/sprites/opponent-support-bracket.png" />
                </LambertMaterial>
            </Plane>
            <!-- Player Active Field -->
            <Plane ref="pAFieldC" :width="5.4" :height="2.8" :position="{ x: -2.85, z: -0.1 }">
                <LambertMaterial>
                    <Texture src="/src/sprites/player-active-field.png" />
                </LambertMaterial>
            </Plane>
            <!-- Player Support Bracket -->
            <Plane ref="pSupportC" :width="2.2" :height="0.8" :position="{ x: -1.3, y: 0.5, z: -0.502 }">
                <LambertMaterial>
                    <Texture src="/src/sprites/player-support-bracket.png" />
                </LambertMaterial>
            </Plane>
            <!-- Player Field -->
            <Plane ref="pFieldC" :width="12" :height="3" :position="{ y: -3, z: -0.5 }">
                <LambertMaterial>
                    <Texture src="/src/sprites/player-field.png" />
                </LambertMaterial>
            </Plane>
            <!-- Opponent Attack Choice -->
            <Plane ref="oChoiceC" :width="12" :height="3" :position="{ x: 0, y: 6.3, z: 0.3 }">
                <LambertMaterial>
                    <Texture src="/src/sprites/choose-attack-opp.png" />
                </LambertMaterial>
            </Plane>
            <!-- Player Attack Choice -->
            <Plane ref="pChoiceC" :width="12" :height="3" :position="{ y: -6, z: 0.3 }">
                <LambertMaterial>
                    <Texture src="/src/sprites/choose-attack-player.png" />
                </LambertMaterial>
            </Plane>
            <!-- Info Board on Hover -->
            <Plane ref="infoBoardC" :width="12" :height="3" :position="{ x: -17, y: 2.8, z: 0.3 }">
                <LambertMaterial>
                    <Texture src="/src/sprites/info-board.png" />
                </LambertMaterial>
            </Plane>
            <Plane ref="infoBoardImgC" :width="3" :height="2.7" :position="{ x: -21.45, y: 2.65, z: 0.3 }">
                <LambertMaterial>
                    <Texture src="/src/sprites/monsters/175.jpg" />
                </LambertMaterial>
            </Plane>
            <!-- 1st Attack Banner -->
            <Plane ref="firstAttackBannerC" :width="1" :height="2" :position="{ x: 7, y: 0, z: 0.3 }">
                <LambertMaterial>
                    <Texture src="/src/sprites/1st-attack-banner.png" />
                </LambertMaterial>
            </Plane>
            <!-- Player Deck -->
            <!-- <PlayerDeck /> -->
            <GameCards :actorId="gameStateStore.player.id" />
            <!-- Opponent Deck -->
            <!-- <OpponentDeck /> -->
            <GameCards :actorId="gameStateStore.opponent.id" />

            <!-- <GameCanvasTextUI /> -->

        </Scene>
        <!-- Test change scene with a button click -->
        <!-- <Scene ref="mainMenuSceneC" background="#241E1C">
            <PointLight ref="lightC" :position="{ z: 10 }" />
            <Plane ref="mainMenuC" :width="1" :height="2" :position="{ x: 0, y: 0, z: 20 }" :rotation="{ y: Math.PI }">
                <LambertMaterial>
                    <Texture src="src/sprites/1st-attack-banner.png" />
                </LambertMaterial>
            </Plane>
        </Scene> -->
    </Renderer>

    <!-- Game state debugger -->
    <!-- <GamePhaseDevTools :sceneC="sceneC" :pChoiceC="pChoiceC" :oChoiceC="oChoiceC" :pFieldC="pFieldC" :oFieldC="oFieldC" :pAFieldC="pAFieldC" :pSupportC="pSupportC" :oSupportC="oSupportC" /> -->

    <!-- Chat System -->
    <!-- <textarea class="w-1/12 h-1/4 py-2 px-3" readonly v-model="logMsg"></textarea>
    <div class="flex flex-row justify-center w-full mt-8">
        <input class="w-1/4 h-1/8 text-gray-700 mt-1 leading-tight py-2 px-3 border rounded focus:shadow-outline" v-model="myMsg" @submit="sendMessage">
        <button class=" bg-sky-600 text-white font-bold text-3xl hover:bg-sky-800 ml-1 p-2 h-12"
            @click="sendMessage">
            Send
        </button>
    </div> -->

    <!-- Test Change Scene button -->
    <!-- <UserButton class="game-board-button player-btn" style="bottom: 40vh;" @click="changeScene">
        Change Scene
    </UserButton> -->
</div>
</div>
<GameInfo :actor="currentTurnStr" />
<GameAction @toggle-attack-choice="toggleAttackChoice" />
</template>
  
<script setup>
import { ref, onMounted, onUnmounted, watch, computed, shallowRef, provide } from "vue";
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
// import GameCanvasTextUI from "./GameCanvasTextUIOld.vue"

const canvasFrameC = ref(); // to append CSS2DRenderer's DOM
const rendererC = ref(); // ref to TroisJS Renderer component
const cameraC = ref(); // ref to TroisJS Camera component
const sceneC = ref(); // ref to TroisJS Scene component

// CSS2DRenderer instance
let htmlRenderer = null;

// the scene object doesnt need reactivity, so we can use a shallowRef. just need to pass the reference
const threeScene = shallowRef(null);
provide("threeScene", threeScene);

const pChoiceC = ref();
const oChoiceC = ref();
const pFieldC = ref();
const oFieldC = ref();
const pAFieldC = ref();
const oAFieldC = ref();
const pSupportC = ref();
const oSupportC = ref();
const infoBoardC = ref();
const infoBoardImgC = ref();
const firstAttackBannerC = ref();

const mainMenuSceneC = ref();

// pinia stores
const stateStore = useStateStore();
const playerStore = usePlayerStore();
const oppStore = useOpponentStore();
const gameStateStore = useGameStateStore();
playerStore.$reset();
oppStore.$reset();

const currentTurnStr = ref(``)
const currentPhaseStr = ref(`Initial State`)
const testPActiveCard = ref({}) // TODO: remove this later
const testOActiveCard = ref({}) // TODO: remove this later
const isCameraFacingBoard = ref(true);
const logMsg = ref("");
const myMsg = ref("");

// Init
onMounted(() => {
    // check if refs are initialized
    if (!canvasFrameC.value || !rendererC.value || !cameraC.value || !sceneC.value) {
        console.error("GameBoard: critical refs not available for CSS2DRenderer setup.");
        return;
    }

    // assign the actual THREE.Scene object to the provided ref
    threeScene.value = sceneC.value.scene;

    htmlRenderer = new CSS2DRenderer();
    // set size based on the canvasFrameC element
    const frameRect = canvasFrameC.value.getBoundingClientRect();
    htmlRenderer.setSize(frameRect.width, frameRect.height);
    htmlRenderer.domElement.id = "htmlRenderer";
    htmlRenderer.domElement.style.position = "absolute";
    htmlRenderer.domElement.style.top = "0px";
    htmlRenderer.domElement.style.left = "0px"; // this would not align with our canvas because canvas is in flex layout
    htmlRenderer.domElement.style.pointerEvents = "none"; // crucial
    htmlRenderer.name = "htmlRenderer";

    // append the CSS2DRenderer's DOM to the canvasFrame
    canvasFrameC.value.appendChild(htmlRenderer.domElement);

    // After mounting, the TroisJS component instances are available in rendererC.value, etc.
    // And their underlying THREE.js objects are available on properties like .scene, .camera, .renderer
    const renderer = rendererC.value;
    const camera = cameraC.value;
    const scene = sceneC.value;
    
    const infoBoard = infoBoardC.value.mesh;
    const infoBoardImg = infoBoardImgC.value.mesh;
    const firstAttackBanner = firstAttackBannerC.value.mesh;

    const pChoice = pChoiceC.value.mesh;
    const oChoice = oChoiceC.value.mesh;
    const pField = pFieldC.value.mesh;
    const oField = oFieldC.value.mesh;
    const pAField = pAFieldC.value.mesh;
    const oAField = oAFieldC.value.mesh;
    const pSupport = pSupportC.value.mesh;
    const oSupport = oSupportC.value.mesh;


    // bind socket io listener events
    if (stateStore.playerMode == MODE.PROD && stateStore.oppMode == MODE.PROD) {
        stateStore.bindEvents();
    }

    // set background transparent
    pField.material.transparent = true;
    oField.material.transparent = true;
    pAField.material.transparent = true;
    oAField.material.transparent = true;
    pSupport.material.transparent = true;
    oSupport.material.transparent = true;
    pChoice.material.transparent = true;
    oChoice.material.transparent = true;
    infoBoard.material.transparent = true;

    // Info Board Setup
    infoBoard.attach(infoBoardImg);

    // set name
    pChoice.name = "pChoice";
    oChoice.name = "oChoice";
    pAField.name = "pAField";
    oAField.name = "oAField";
    pSupport.name = "pSupport";
    oSupport.name = "oSupport";
    infoBoard.name = "infoBoard";
    infoBoardImg.name = "infoBoardImg";
    firstAttackBanner.name = "firstAttackBanner";

    // Randomly set who attack first. TODO: decide before starting match
    if (Math.random() > 0.5) {
        stateStore.setTurn(WHO.PLAYER)
        firstAttackBanner.position.set(6.3, -2.5, 0) // player side
    } else {
        stateStore.setTurn(WHO.OPP)
        firstAttackBanner.position.set(6.3, 2.5, 0) // opponent side
    }
    firstAttackBanner.position.set(6.3, -2.5, 0) // player side

    stateStore.setTurn(WHO.PLAYER) // TODO: remove this
    currentTurnStr.value = stateStore.currentTurn;

    /**
     * MAIN RENDER LOOP
     */
    // Render - changes made here will be rendered in the next frame
    renderer.onBeforeRender(() => {
        if (htmlRenderer && sceneC.value && cameraC.value) {
            // render html CSS2DObject using the same scene and camera as the main renderer
            htmlRenderer.render(scene.scene, camera.camera); // <<<< IMPORTANT!!!
        }
    });

    // Effect implementation debug purpose - TODO: remove this later
    // console.log("before setActiveCard")
    // await setActiveCard();
    // console.log("after setActiveCard")

    // handle window resize (if needed)
    // window.addEventListener("resize", handleResize);
    // handleResize();
});

// onUnmounted(() => {
//     stateStore.$reset();
//     stateStore.setOppMode(MODE.AI);
// })

/**
 * Set active card right from the start
 * TODO: debug purpose only. remove this later
 */
const setActiveCard = async () => {
    // target cards
    const cardIds = "25,1"
    // fetch the cards
    const res = await fetch(`http://localhost:3005/api/cards/id=${cardIds}`)
    const resData = await res.json()

    for (let i = 0; i < resData.length; i++) {
        const data = resData[i];

        let createdCard = createCard(data);
        if (i == 0) {
            testPActiveCard.value = {
                ...createdCard,
                sprite: createdCard.imgSrc
            }
        } else {
            testOActiveCard.value = {
                ...createdCard,
                sprite: createdCard.imgSrc
            }
        }
    }

    /**
     * PLAYER
     */
    // set name
    const pActiveNm = document.getElementById("pActiveNm");
    pActiveNm.innerHTML = testPActiveCard.value.name;

    // update state - current active digimon
    playerStore.setPActiveMon(testPActiveCard.value.id, testPActiveCard.value.name, testPActiveCard.value.level, testPActiveCard.value.specialty,
        testPActiveCard.value.cPow, testPActiveCard.value.tPow, testPActiveCard.value.xPow, testPActiveCard.value.xEffectSpeed, testPActiveCard.value.hp);

    // set attack
    const pActiveC = document.getElementById("pActiveC");
    const pActiveT = document.getElementById("pActiveT");
    const pActiveX = document.getElementById("pActiveX");
    const pActiveXEff = document.getElementById("pActiveXEff");
    const pActiveHpLbl = document.getElementById("pActiveHpLbl");
    const pActiveHp = document.getElementById("pActiveHp");

    // X Effect
    pActiveXEff.innerHTML = testPActiveCard.value.xEffect.toUpperCase();
    // HP label
    pActiveHp.style.visibility = "visible";
    pActiveHpLbl.style.visibility = "visible";
    pActiveHpLbl.className = "active-hp-label";
    pActiveHpLbl.innerHTML = "HP";

    // Numbers go up
    animatePow(pActiveC, playerStore.pActiveMon.cPow, 0);
    animatePow(pActiveT, playerStore.pActiveMon.tPow, 0);
    animatePow(pActiveX, playerStore.pActiveMon.xPow, 0);
    animatePow(pActiveHp, playerStore.pActiveMon.hp, 0);

    // Set Numbers to Attack Choice Board
    const pChoiceNm = document.getElementById("pChoiceNm");
    const pChoiceONm = document.getElementById("pChoiceONm");
    const pChoiceTNm = document.getElementById("pChoiceTNm");
    const pChoiceXNm = document.getElementById("pChoiceXNm");
    const pChoiceOVal = document.getElementById("pChoiceOVal");
    const pChoiceTVal = document.getElementById("pChoiceTVal");
    const pChoiceXVal = document.getElementById("pChoiceXVal");
    const pChoiceXEff = document.getElementById("pChoiceXEff");
    const pChoiceXSpd = document.getElementById("pChoiceXSpd");
    const pChoiceHp = document.getElementById("pChoiceHp");
    const pChoiceLevel = document.getElementById("pChoiceLevel");
    const pChoiceTurn = document.getElementById("pChoiceTurn");
    const pChoiceSp = document.getElementById("pChoiceSp");

    pChoiceNm.innerHTML = testPActiveCard.value.name;
    pChoiceONm.innerHTML = testPActiveCard.value.cAttack;
    pChoiceTNm.innerHTML = testPActiveCard.value.tAttack;
    pChoiceXNm.innerHTML = testPActiveCard.value.xAttack;
    pChoiceOVal.innerHTML = playerStore.pActiveMon.cPow;
    pChoiceTVal.innerHTML = playerStore.pActiveMon.tPow;
    pChoiceXVal.innerHTML = playerStore.pActiveMon.xPow;
    pChoiceXEff.innerHTML = testPActiveCard.value.xEffect;
    pChoiceXSpd.src = speedToImg(testPActiveCard.value.xEffectSpeed);
    pChoiceHp.innerHTML = playerStore.pActiveMon.hp;
    pChoiceLevel.innerHTML = testPActiveCard.value.level;
    pChoiceTurn.innerHTML = turnToStr("1");
    pChoiceSp.src = specialtyToImg(testPActiveCard.value.specialty);
    pChoiceSp.className = `choice-img ${specialtyToClass(testPActiveCard.value.specialty)}`

    /**
     * OPPONENT
     */
    // set name
    const oActiveNm = document.getElementById("oActiveNm");
    oActiveNm.innerHTML = testOActiveCard.value.name;

    // uodate state - current active digimon
    oppStore.setOActiveMon(testOActiveCard.value.id, testOActiveCard.value.name, testOActiveCard.value.level, testOActiveCard.value.specialty,
        testOActiveCard.value.cPow, testOActiveCard.value.tPow, testOActiveCard.value.xPow, testOActiveCard.value.xEffectSpeed, testOActiveCard.value.hp);

    // set attack
    const oActiveC = document.getElementById("oActiveC");
    const oActiveT = document.getElementById("oActiveT");
    const oActiveX = document.getElementById("oActiveX");
    const oActiveXEff = document.getElementById("oActiveXEff");
    const oActiveHpLbl = document.getElementById("oActiveHpLbl");
    const oActiveHp = document.getElementById("oActiveHp");

    // X Effect
    oActiveXEff.innerHTML = testOActiveCard.value.xEffect.toUpperCase();
    // HP label
    oActiveHp.style.visibility = "visible";
    oActiveHpLbl.style.visibility = "visible";
    oActiveHpLbl.className = "active-hp-label";
    oActiveHpLbl.innerHTML = "HP";

    // Numbers go up
    animatePow(oActiveC, oppStore.oActiveMon.cPow, 0);
    animatePow(oActiveT, oppStore.oActiveMon.tPow, 0);
    animatePow(oActiveX, oppStore.oActiveMon.xPow, 0);
    animatePow(oActiveHp, oppStore.oActiveMon.hp, 0);

    // Set Numbers to Attack Choice Board
    const oChoiceNm = document.getElementById("oChoiceNm");
    const oChoiceONm = document.getElementById("oChoiceONm");
    const oChoiceTNm = document.getElementById("oChoiceTNm");
    const oChoiceXNm = document.getElementById("oChoiceXNm");
    const oChoiceOVal = document.getElementById("oChoiceOVal");
    const oChoiceTVal = document.getElementById("oChoiceTVal");
    const oChoiceXVal = document.getElementById("oChoiceXVal");
    const oChoiceXEff = document.getElementById("oChoiceXEff");
    const oChoiceXSpd = document.getElementById("oChoiceXSpd");
    const oChoiceHp = document.getElementById("oChoiceHp");
    const oChoiceLevel = document.getElementById("oChoiceLevel");
    const oChoiceTurn = document.getElementById("oChoiceTurn");
    const oChoiceSp = document.getElementById("oChoiceSp");

    oChoiceNm.innerHTML = testOActiveCard.value.name;
    oChoiceONm.innerHTML = testOActiveCard.value.cAttack;
    oChoiceTNm.innerHTML = testOActiveCard.value.tAttack;
    oChoiceXNm.innerHTML = testOActiveCard.value.xAttack;
    oChoiceOVal.innerHTML = oppStore.oActiveMon.cPow;
    oChoiceTVal.innerHTML = oppStore.oActiveMon.tPow;
    oChoiceXVal.innerHTML = oppStore.oActiveMon.xPow;
    oChoiceXEff.innerHTML = testOActiveCard.value.xEffect;
    oChoiceXSpd.src = speedToImg(testOActiveCard.value.xEffectSpeed);
    oChoiceHp.innerHTML = oppStore.oActiveMon.hp;
    oChoiceLevel.innerHTML = testOActiveCard.value.level;
    oChoiceTurn.innerHTML = turnToStr("1");
    oChoiceSp.src = specialtyToImg(testOActiveCard.value.specialty);
    oChoiceSp.className = `choice-img ${specialtyToClass(testOActiveCard.value.specialty)}`
}

/**
 * Watch phase changes
 */
watch(() => stateStore.phase, (currentPhase, lastPhase) => {
    console.log(`currentTurn:${stateStore.currentTurn}, currentPhase:${currentPhase}, lastPhase:${lastPhase}`)
    currentPhaseStr.value = phaseToName(currentPhase);

    if (stateStore.currentTurn == WHO.PLAYER) {
        if (currentPhase == PHASE.END) {
            changeTurn();
        } else if (stateStore.playerMode == MODE.PROD) {
            changePlayerPhase(currentPhase, sceneC.value.scene);
        }
    }

    if (stateStore.currentTurn == WHO.OPP) {
        if (currentPhase == PHASE.END) {
            changeTurn();
        } else if (stateStore.oppMode == MODE.AI) {
            setAiAction(currentPhase, sceneC.value.scene)
        } else if (stateStore.oppMode == MODE.PROD) {
            // call PVP manager
            setActionVsPlayer(currentPhase, sceneC.value.scene)
        }
    }
})

const changeTurn = () => {
    moveSupportToOffline(sceneC.value.scene);

    moveActiveFieldIn(pAFieldC, pSupportC, oAFieldC, oSupportC); // move active field in

    setToOriginalValue();

    // Change turn
    setTimeout(() => {
        set1stAttackBanner(sceneC.value.scene);
        currentTurnStr.value = stateStore.currentTurn;
        stateStore.setPhase(PHASE.DRAW);
    }, 500);
}

// auto-set opponent attack choice (VS AI MODE)
watch(() => playerStore.pAttack, (attackChoice) => {
    if (stateStore.oppMode == MODE.AI && stateStore.phase == PHASE.CHOOSE_ATTACK) {
        setTimeout(() => {
            setOppAiAttack();
            setTimeout(() => {
                stateStore.setPhase(PHASE.SUPPORT1);
                // changePhase(PHASE.SUPPORT1);
            }, 1000);
        }, 500);
    }
})



// Change scene
const changeScene = () => {
    isCameraFacingBoard.value = !isCameraFacingBoard.value

    cameraC.value.camera.rotation.y = isCameraFacingBoard.value ? 0 : Math.PI;
    rendererC.value.three.scene = isCameraFacingBoard.value ? sceneC.value.scene : mainMenuSceneC.value.scene
}



/**
 * Socket test
 */
 const sendMessage = () => {
    socket.emit("message", myMsg.value)
    
    updateLogMsg(myMsg.value, "Me");
    
    // clear input field
    myMsg.value = "";
}

const updateLogMsg = (msg, who) => {    
    const logTime = new Date().toLocaleString();
    logMsg.value += logTime + ` >>> ${who}: ` + msg + "\n----------\n"
}

const toggleAttackChoice = (isChoiceBoardMoveIn) => {
    moveAttackChoiceBoardIn(isChoiceBoardMoveIn, pChoiceC.value.mesh, oChoiceC.value.mesh);
}

/**
 * Sync PvP state
 */
watch(() => stateStore.updateAction, (newUpdate) => {
    console.log(`-------------- updateAction:${newUpdate}, phase:${stateStore.phase}`)
    if (!newUpdate) {
        return;
    }

    if (stateStore.phase == PHASE.ENTRANCE) {
        setActiveCardVsPlayer(sceneC.value.scene)
    } else if (stateStore.phase == PHASE.RACK_UP_DP) {
        setDpCardVsPlayer(sceneC.value.scene)
    } else if (stateStore.phase == PHASE.DIGIVOLVE) {
        setDigivolveCardVsPlayer(sceneC.value.scene)
    } else if (stateStore.phase == PHASE.CHOOSE_ATTACK) {
        setTimeout(() => {
            stateStore.setPhase(PHASE.SUPPORT1);
            useStateStore().$patch({
                updateAction: false
            })
        }, 1000);
    } else if (stateStore.phase == PHASE.SUPPORT1 || stateStore.phase == PHASE.SUPPORT2) {
        const isDeckTopCard = oppStore.oDeck.indexOf(oppStore.oSelectedCardId) > -1 ? true : false;
        setSupportCardVsPlayer(sceneC.value.scene, isDeckTopCard)
    }
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