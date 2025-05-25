<template>
  <Plane ref="cardC" :width="1.1" :height="1.4" @click="onClickCard($event)" @pointerOver="onPointerOver">
    <LambertMaterial />
  </Plane>
</template>

<script setup>
import { ref, onMounted } from "vue";
import * as THREE from "three";
import vertexShader from "../shaders/vertex.glsl.js";
import fragmentShader from "../shaders/fragment.glsl.js";
import {
  animateHandToActive,
  animateHandToDp,
  animatePow,
} from "../animations/monster.js";
import { animatePpPopup, animateMoveInfoBoardIn, animateDigivolveEffect } from "../animations/field"
import { useStateStore } from "../stores/state";
import { usePlayerStore } from "../stores/player";
import { PHASE, CARD_NAME, WHO, LEVEL, MODE } from "../const/const.js";
import { specialtyToClass, specialtyToImg, speedToImg, turnToStr, levelToNumber, hexToRgb, setPenalty } from "../utils/mapper"
import { removePulseEffect, setPlayerDpToOffline, setCardToInfoBoard, setPlayerSupport, addPulseEffect } from "./fieldManager";
import { socket } from "../socket";

// props
const props = defineProps(["position", "sprite", "card"]);

// refs
const cardC = ref();
const stateStore = useStateStore();
const playerStore = usePlayerStore();

// card name
const cardName = CARD_NAME.PLAYER + props.card.id.padStart(3, 0);

// texture
const monsterTexture = ref();

onMounted(() => {
  /**
   * set card material
   */
  const card = cardC.value.mesh;
  const textureLoader = new THREE.TextureLoader();
  // set back side texture
  const backTexture = textureLoader.load("/src/sprites/common/card-back.png");
  // set monster image texture
  monsterTexture.value = textureLoader.load(props.sprite);
  // set gradient color
  const colorTopRgb = `vec3(${hexToRgb(props.card.colorTop).join(",")})`;
  const colorBottomRgb = `vec3(${hexToRgb(props.card.colorBottom).join(",")})`;
  const fShader = fragmentShader
    .replace("##COLOR_TOP", colorTopRgb)
    .replace("##COLOR_BOTTOM", colorBottomRgb);

  // set monster image and level mesh
  const lvlCanvas = document.createElement("canvas");
  const lvlTexture = new THREE.CanvasTexture(lvlCanvas);

  let textCtx = lvlCanvas.getContext("2d");
  textCtx.font = "850 60px helvetica";
  textCtx.strokeStyle = "black";
  textCtx.strokeText(props.card.level, 0, 45);
  textCtx.fillStyle = "white";
  textCtx.fillText(props.card.level, 0, 45); // set level text

  // get shader material
  const backMat = new THREE.ShaderMaterial({
    uniforms: {
      tBack: { value: backTexture },
      tImg: { value: monsterTexture.value },
      tLvl: { value: lvlTexture },
    },
    vertexShader: vertexShader,
    fragmentShader: fShader,
    side: THREE.DoubleSide,
  });

  // set mesh
  card.material = backMat;
  card.position.set(props.position.x, props.position.y, props.position.z);
  card.name = cardName;

  // flip the card to show the back side
  card.rotation.y = Math.PI;
  card.rotation.z = (Math.PI * 3) / 2;
  card.scale.set(4 / 5, 4 / 5, 1);
});

/**
 * handle click event
 */
const onClickCard = async function (e) {
  // Do nothing during draw phase
  if (stateStore.phase < PHASE.ENTRANCE || stateStore.phase > PHASE.SUPPORT2) {
    // Refactored to button click in App.vue. TODO: clean this up
    console.log("CLICK THE BUTTON TO DRAW/REDRAW")
    return;
  }
  // Do nothing if active card
  if (playerStore.pActiveMonStack.map(el => el.id).indexOf(props.card.id) > -1) {
    return;
  }
  // Do nothing if not deck top card
  let isDeckTopCard = false;
  const isInDeck = playerStore.pDeck.indexOf(props.card.id) > -1;
  
  if ((stateStore.phase == PHASE.SUPPORT1 || stateStore.phase == PHASE.SUPPORT2) && playerStore.pSupport.cardId) {
    return;
  } else if (isInDeck && playerStore.pDeckTopCardId != props.card.id) {
    return;
  } else if (isInDeck) {
    isDeckTopCard = true;
  }

  const renderer = e.component.renderer;
  const name = e.component.mesh.name;
  const cardId = name.replace(CARD_NAME.PLAYER, "");
  let raycaster = new THREE.Raycaster();

  // get mouse position
  let mouseEventPosition = renderer.three.pointer.position;
  let mouse = new THREE.Vector2();
  mouse.x = (mouseEventPosition.x / window.innerWidth) * 2 - 1;
  mouse.y = -(mouseEventPosition.y / window.innerHeight) * 2 + 1;

  // get intersect objects
  const scene = renderer.three.scene;
  const camera = renderer.three.camera;
  raycaster.setFromCamera(mouse, camera);

  let intersects = raycaster.intersectObjects(scene.children);

  /**
   * handle click event according to current phase
   */
  // DRAW PHASE
  if (stateStore.phase == PHASE.DRAW) {
    // Refactored to button click in App.vue. TODO: clean this up
    console.log("CLICK THE BUTTON TO DRAW/REDRAW")
  }
  // DIGIMON ENTER PHASE
  else if (stateStore.phase == PHASE.ENTRANCE) {
    // dont set if there is already an active card
    if (playerStore.pActiveMonStackCount > 0) {
      return;
    }
    
    // update state to server
    if (stateStore.oppMode == MODE.PROD) {
      socket.emit("set-active-card", cardId)
    }

    // remove glow effect
    removePulseEffect();

    // animate
    const isDigivolving = false;
    await setActiveMon(cardId, intersects[0].object, scene, isDigivolving);

    // remove all OK popup
    for (let i = 0; i < playerStore.pHand.length; i++) {
      document.getElementById(`okUi${i}`).style.visibility = "hidden"
    }
    // attach card to active field
    scene.getObjectByName("pAField").attach(intersects[0].object)
  }
  // RACK-UP DP PHASE
  else if (stateStore.phase == PHASE.RACK_UP_DP) {
    // remove glow effect
    removePulseEffect();

    const cardIndex = playerStore.pHand.indexOf(cardId);
    if (document.getElementById(`okUi${cardIndex}`).style.visibility == "hidden") {
      return;
    }

    // update state to server
    if (stateStore.oppMode == MODE.PROD) {
      socket.emit("set-dp", cardId)
    }

    // remove OK popup
    for (let i = 0; i < 4; i++) {
      document.getElementById(`okUi${i}`).style.visibility = "hidden"
    }

    // update hand
    playerStore.removePHand(cardId);

    // animate
    animatePpPopup(props.card.pp, scene, true);
    await animateHandToDp(intersects[0].object);

    // update DP rack
    playerStore.addPDp(cardId, props.card.pp);
    const dpCnt = document.getElementById("pDpCount");
    dpCnt.innerHTML = playerStore.pDpTotal;
    // attach card to active field
    scene.getObjectByName("pAField").attach(intersects[0].object)
  }
  // DIGIVOLVE SPECIAL PHASE
  else if (stateStore.phase == PHASE.DIGIVOLVE_SPECIAL) {
    // TODO WIP
  }
  // DIGIVOLVE PHASE
  else if (stateStore.phase == PHASE.DIGIVOLVE) {
    const myLevel = levelToNumber(props.card.level)
    const mySpecialty = props.card.specialty
    const myDp = props.card.dp
    const activeDigimonLevel = levelToNumber(playerStore.pActiveMon.level)
    const activeDigimonSpecialty = playerStore.pActiveMon.specialty
    const totalDp = playerStore.pDpTotal

    // check if valid digivolution
    if (myLevel - activeDigimonLevel != 1) {
      console.log(`Incompatible digivolution. My level: ${myLevel}, active level: ${activeDigimonLevel}`)
      return
    } else if (mySpecialty != activeDigimonSpecialty) {
      console.log(`Incompatible digivolution. My specialty: ${mySpecialty}, active specialty: ${activeDigimonSpecialty}`)
      return
    } else if (myDp > totalDp) {
      console.log(`Incompatible digivolution. My DP: ${myDp}, total DP: ${totalDp}`)
      return
    }

    // update state to server
    if (stateStore.oppMode == MODE.PROD) {
      socket.emit("set-active-card", cardId)
    }

    // remove glow effect
    removePulseEffect();

    // animate selected card to move on top of current active card
    const isDigivolving = true;
    
    await animateDigivolveEffect(WHO.PLAYER, scene);
    await setActiveMon(cardId, intersects[0].object, scene, isDigivolving);

    // move DP cards to offline stack
    await setPlayerDpToOffline(scene, playerStore.pDpCount);

    // remove all OK popup
    for (let i = 0; i < playerStore.pHand.length; i++) {
      document.getElementById(`okUi${i}`).style.visibility = "hidden"
    }
    // attach card to active field
    scene.getObjectByName("pAField").attach(intersects[0].object)
  }
  // SUPPORT PHASE 1
  else if (stateStore.phase == PHASE.SUPPORT1 && stateStore.firstSetSupport == WHO.PLAYER) {
    if (isDeckTopCard) {
      const card = scene.getObjectByName(`${CARD_NAME.PLAYER}${playerStore.pDeckTopCardId}`)
      setPlayerSupport(scene, isDeckTopCard, card);
    } else {
      setPlayerSupport(scene, isDeckTopCard, intersects[0].object);
    }

    // update state to server
    if (stateStore.oppMode == MODE.PROD) {
      socket.emit("set-support-card", cardId)
    }
  }
  // SUPPORT PHASE 2
  else if (stateStore.phase == PHASE.SUPPORT2 && stateStore.firstSetSupport != WHO.PLAYER) {
    if (isDeckTopCard) {
      const card = scene.getObjectByName(`${CARD_NAME.PLAYER}${playerStore.pDeckTopCardId}`)
      setPlayerSupport(scene, isDeckTopCard, card);
    } else {
      setPlayerSupport(scene, isDeckTopCard, intersects[0].object);
    }

    // update state to server
    if (stateStore.oppMode == MODE.PROD) {
      socket.emit("set-support-card", cardId)
    }
  }
};

const setActiveMon = async (cardId, obj, scene, isDigivolving) => {
  // remove OK popup
  const cardIndex = playerStore.pHand.indexOf(cardId);
  document.getElementById(`okUi${cardIndex}`).style.visibility = "hidden";

  // remove HP label temporarily
  document.getElementById("pActiveHp").style.visibility = "hidden";
  document.getElementById("pActiveHpLbl").style.visibility = "hidden";

  // update hand
  playerStore.removePHand(cardId);
  // update state - current active digimon
  playerStore.setPActiveMon(cardId, props.card.name, props.card.level, props.card.specialty,
    props.card.cPow, props.card.tPow, props.card.xPow, props.card.xEffectSpeed, props.card.hp);

  // move selected card to active field
  await animateHandToActive(obj, isDigivolving);

  // set name
  const pActiveNm = document.getElementById("pActiveNm");
  pActiveNm.innerHTML = props.card.name;

  // set attack
  const pActiveC = document.getElementById("pActiveC");
  const pActiveT = document.getElementById("pActiveT");
  const pActiveX = document.getElementById("pActiveX");
  const pActiveXEff = document.getElementById("pActiveXEff");
  const pActiveHpLbl = document.getElementById("pActiveHpLbl");
  const pActiveHp = document.getElementById("pActiveHp");
  if (props.card.level != LEVEL.R && !isDigivolving) {
    pActiveC.classList.add("active-penalty");
    pActiveT.classList.add("active-penalty");
    pActiveX.classList.add("active-penalty");
    pActiveHp.classList.add("active-penalty");
    playerStore.pActiveMon.cPow = setPenalty(props.card.level, playerStore.pActiveMon.cPow, playerStore.pActiveMonStackCount)
    playerStore.pActiveMon.tPow = setPenalty(props.card.level, playerStore.pActiveMon.tPow, playerStore.pActiveMonStackCount)
    playerStore.pActiveMon.xPow = setPenalty(props.card.level, playerStore.pActiveMon.xPow, playerStore.pActiveMonStackCount)
    playerStore.pActiveMon.hp = setPenalty(props.card.level, playerStore.pActiveMon.hp, playerStore.pActiveMonStackCount)
  } else if (props.card.level == LEVEL.U && isDigivolving && playerStore.pActiveMonStackCount == 2) {
    pActiveC.classList.add("active-penalty");
    pActiveT.classList.add("active-penalty");
    pActiveX.classList.add("active-penalty");
    pActiveHp.classList.add("active-penalty");
    playerStore.pActiveMon.cPow = setPenalty(props.card.level, playerStore.pActiveMon.cPow, playerStore.pActiveMonStackCount)
    playerStore.pActiveMon.tPow = setPenalty(props.card.level, playerStore.pActiveMon.tPow, playerStore.pActiveMonStackCount)
    playerStore.pActiveMon.xPow = setPenalty(props.card.level, playerStore.pActiveMon.xPow, playerStore.pActiveMonStackCount)
    playerStore.pActiveMon.hp = setPenalty(props.card.level, playerStore.pActiveMon.hp, playerStore.pActiveMonStackCount)
  } else {
    pActiveC.classList.remove("active-penalty");
    pActiveT.classList.remove("active-penalty");
    pActiveX.classList.remove("active-penalty");
    pActiveHp.classList.remove("active-penalty");
  }

  // X Effect
  pActiveXEff.innerHTML = props.card.xEffect.toUpperCase();
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
  const pChoiceSp = document.getElementById("pChoiceSp");

  pChoiceNm.innerHTML = props.card.name;
  pChoiceONm.innerHTML = props.card.cAttack;
  pChoiceTNm.innerHTML = props.card.tAttack;
  pChoiceXNm.innerHTML = props.card.xAttack;
  pChoiceOVal.innerHTML = playerStore.pActiveMon.cPow;
  pChoiceTVal.innerHTML = playerStore.pActiveMon.tPow;
  pChoiceXVal.innerHTML = playerStore.pActiveMon.xPow;
  pChoiceXEff.innerHTML = props.card.xEffect;
  pChoiceHp.innerHTML = playerStore.pActiveMon.hp;
  pChoiceLevel.innerHTML = props.card.level;
  pChoiceSp.src = specialtyToImg(props.card.specialty) || "";
  pChoiceSp.className = `choice-img ${specialtyToClass(props.card.specialty)}`

  const speedImg = speedToImg(props.card.xEffectSpeed);
  if (speedImg) {
    pChoiceXSpd.src = speedImg;
    pChoiceXSpd.style.visibility = "visible"
  } else {
    pChoiceXSpd.style.visibility = "hidden"
  }
};

/**
 * Handle hover event
 * @param {event} e 
 */
const onPointerOver = async (e) => {
  // Do nothing during draw phase
  if (stateStore.phase > PHASE.SUPPORT2) {
    // TODO: clean this up
    console.log("NO POINTER OVER EVENT DURING:", stateStore.phase)
    return;
  }
  // No pulse effect on offline stack
  let isSetSupportNow = (stateStore.phase == PHASE.SUPPORT1 && stateStore.firstSetSupport == WHO.PLAYER) || (stateStore.phase == PHASE.SUPPORT2 && stateStore.firstSetSupport != WHO.PLAYER);
  if (playerStore.pOffline.indexOf(props.card.id) > -1) {
    return;
  } else if (!isSetSupportNow && playerStore.pDeck.indexOf(props.card.id) > -1) {
    return;
  }

  // Show Info Board for top active card only
  if (playerStore.pActiveMonStackCount > 0) {
    const activeMonStackTop = playerStore.pActiveMonStack[playerStore.pActiveMonStackCount - 1].id
    if (playerStore.pActiveMonStack.map(el => el.id).indexOf(props.card.id) > -1
      && props.card.id != activeMonStackTop) {
      return;
    }
  }
  // No pulse effect on deck except during support phase
  let isHoverOverDeck = false;
  let isDeckTopCard = false;
  if (stateStore.phase == PHASE.SUPPORT1 || stateStore.phase == PHASE.SUPPORT2) {
    const deckTopCardId = playerStore.pDeck[playerStore.pDeck.length - 1]
    // if hover over deck
    if (playerStore.pDeck.indexOf(props.card.id) > -1) {
      isDeckTopCard = props.card.id == deckTopCardId
      if (!isDeckTopCard || playerStore.pSupport.cardId) {
        return;
      } else {
        isHoverOverDeck = true;
      }
    }
  }

  const renderer = e.component.renderer;
  const scene = renderer.three.scene;
  const isPlayer = true;
  let isMoveIn = false;

  // add pulse effect
  if (e.over) {
    addPulseEffect(e.intersect.object, renderer, "pulse-effect-hover");
  } else {
    removePulseEffect();
  }

  // no info board when set as support
  if (playerStore.pSupport.cardId == props.card.id && isSetSupportNow && playerStore.pSupport.isFromDeck) {
    return;
  }

  // move info board in when hover not deck cards
  if (!isHoverOverDeck && e.over) {
    // set card details to Info Board
    setCardToInfoBoard(scene, monsterTexture.value, props)
    // animate Info Board
    isMoveIn = true;
    animateMoveInfoBoardIn(isMoveIn, isPlayer, scene)
  }
  // move info board out when hover over cards other than deck
  else if (!isHoverOverDeck && !e.over && !isDeckTopCard) {
    isMoveIn = false;
    animateMoveInfoBoardIn(isMoveIn, isPlayer, scene)
  }
}
</script>

<style></style>