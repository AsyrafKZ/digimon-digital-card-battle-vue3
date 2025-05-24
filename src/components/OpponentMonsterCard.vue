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
import { animatePpPopup, animateMoveInfoBoardIn } from "../animations/field"
import { useStateStore } from "../stores/state";
import { useOpponentStore } from "../stores/opponent";
import { PHASE, CARD_NAME, WHO, LEVEL } from "../const/const.js";
import { specialtyToClass, specialtyToImg, speedToImg, turnToStr, levelToNumber, hexToRgb, setPenalty } from "../utils/mapper"
import { removePulseEffect, setOppDpToOffline, setCardToInfoBoard, setOppSupport, addPulseEffect, setOppActiveMon } from "./fieldManager";

// props
const props = defineProps(["position", "sprite", "card"]);

// refs
const cardC = ref();
const stateStore = useStateStore();
const oppStore = useOpponentStore();

// card name
const cardName = CARD_NAME.OPP + props.card.id.padStart(3, 0);

// texture
const monsterTexture = ref();

onMounted(() => {
  /**
   * set card material
   */
  const card = cardC.value.mesh;
  const textureLoader = new THREE.TextureLoader();
  // set back side texture
  const backTexture = textureLoader.load("src/sprites/common/card-back.png");
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
  if (stateStore.oppMode != MODE.DEV) {
    return;
  }
  
  // Do nothing during draw phase
  if (stateStore.phase < PHASE.ENTRANCE || stateStore.phase > PHASE.SUPPORT2) {
    // Refactored to button click in App.vue. TODO: clean this up
    console.log("CLICK THE BUTTON TO DRAW/REDRAW")
    return;
  }
  // Do nothing if active card
  if (oppStore.oActiveMonStack.map(el => el.name).indexOf(props.card.name) > -1) {
    return;
  }
  // Do nothing if not deck top card
  let isDeckTopCard = false;
  if (oppStore.oDeck.indexOf(props.card.id) > -1 && oppStore.oSupport.cardId) {
    return;
  } else {
    isDeckTopCard = true;
  }

  const renderer = e.component.renderer;
  const name = e.component.mesh.name;
  const cardId = name.replace(CARD_NAME.OPP, "");
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
    if (oppStore.oActiveMonStackCount > 0) {
      return;
    }
    // remove glow effect
    removePulseEffect();
    // remove OK popup
    const cardIndex = oppStore.oHand.indexOf(cardId);
    document.getElementById(`okUi${cardIndex}`).style.visibility = "hidden";
    
    // animate
    const isDigivolving = false;
    await setOppActiveMon(intersects[0].object, props.card, isDigivolving);

    // remove all OK popup
    for (let i = 0; i < oppStore.oHand.length; i++) {
      document.getElementById(`okUi${i}`).style.visibility = "hidden"
    }
    // attach card to active field
    scene.getObjectByName("oAField").attach(intersects[0].object)
  }
  // RACK-UP DP PHASE
  else if (stateStore.phase == PHASE.RACK_UP_DP) {
    // remove glow effect
    removePulseEffect();

    // remove OK popup
    const cardIndex = oppStore.oHand.indexOf(cardId)
    document.getElementById(`okUi${cardIndex}`).style.visibility = "hidden"

    // update hand
    oppStore.removeOHand(cardId);

    // animate
    animatePpPopup(props.card.pp, scene, false);
    await animateHandToDp(intersects[0].object);

    // update DP rack
    oppStore.addODp(cardId, props.card.pp);

    const dpCnt = document.getElementById("oDpCount");
    dpCnt.innerHTML = oppStore.oDpTotal;

    // attach card to active field
    scene.getObjectByName("oAField").attach(intersects[0].object)
  }
  // DIGIVOLVE PHASE
  else if (stateStore.phase == PHASE.DIGIVOLVE) {
    const myLevel = levelToNumber(props.card.level)
    const mySpecialty = props.card.specialty
    const myDp = props.card.dp
    const activeDigimonLevel = levelToNumber(oppStore.oActiveMon.level)
    const activeDigimonSpecialty = oppStore.oActiveMon.specialty
    const totalDp = oppStore.oDpTotal

    // check if valid digivolution
    if (myLevel - activeDigimonLevel != 1) {
      console.log(`Incompatible digivolution. My level: ${myLevel}, active level: ${activeDigimonLevel}`)
      return
    } else if (mySpecialty != activeDigimonSpecialty) {
      console.log(`Incompatible digivolution. My specialty: ${mySpecialty}, active specialty: ${activeDigimonSpecialty}`)
      return
    } else if (myDp > totalDp) {
      console.log(`Incompatible digivolution. My DP: ${myDp}, total DP: ${totalDp}}`)
      return
    }
    // remove glow effect
    removePulseEffect();
    // remove OK popup
    const cardIndex = oppStore.oHand.indexOf(cardId);
    document.getElementById(`okUi${cardIndex}`).style.visibility = "hidden";

    // animate selected card to move on top of current active card
    const isDigivolving = true;
    await setOppActiveMon(intersects[0].object, props.card, isDigivolving);

    // move DP cards to offline stack
    await setOppDpToOffline(scene, oppStore.oDpCount);

    // remove all OK popup
    for (let i = 0; i < oppStore.oHand.length; i++) {
      document.getElementById(`okUi${i}`).style.visibility = "hidden"
    }

    // attach card to active field
    scene.getObjectByName("oAField").attach(intersects[0].object)
  }
  // SUPPORT PHASE 1
  else if (stateStore.phase == PHASE.SUPPORT1 && stateStore.firstSetSupport == WHO.OPP) {
    setOppSupport(scene, isDeckTopCard, intersects[0].object);
  }
  // SUPPORT PHASE 2
  else if (stateStore.phase == PHASE.SUPPORT2 && stateStore.firstSetSupport != WHO.OPP) {
    setOppSupport(scene, isDeckTopCard, intersects[0].object);
  }
};

/**
 * Handle hover event
 * @param {event} e 
 */
const onPointerOver = (e) => {
  // Do nothing during draw phase
  if (stateStore.phase > PHASE.SUPPORT2) {
    // TODO: clean this up
    console.log("NO POINTER OVER EVENT")
    return;
  }
  // No pulse effect on offline stack
  let isSetSupportNow = (stateStore.phase == PHASE.SUPPORT1 && stateStore.firstSetSupport == WHO.OPP) || (stateStore.phase == PHASE.SUPPORT2 && stateStore.firstSetSupport != WHO.OPP);
  if (oppStore.oOffline.indexOf(props.card.id) > -1) {
    return;
  } else if (!isSetSupportNow && oppStore.oDeck.indexOf(props.card.id) > -1) {
    return;
  }
  // Show Info Board for top active card only
  if (oppStore.oActiveMonStackCount > 0) {
    const activeMonStackTop = oppStore.oActiveMonStack[oppStore.oActiveMonStackCount - 1].id
    if (oppStore.oActiveMonStack.map(el => el.id).indexOf(props.card.id) > -1
      && props.card.id != activeMonStackTop) {
      return;
    }
  }
  // No pulse effect on deck except during support phase
  let isHoverOverDeck = false;
  let isDeckTopCard = false;
  if (stateStore.phase == PHASE.SUPPORT1 || stateStore.phase == PHASE.SUPPORT2) {
    const deckTopCard = oppStore.oDeck[oppStore.oDeck.length - 1]
    // if hover over deck
    if (oppStore.oDeck.indexOf(props.card.id) > -1) {
      isDeckTopCard = props.card.id == deckTopCard
      if (!isDeckTopCard || oppStore.oSupport.cardId) {
        return;
      } else {
        isHoverOverDeck = true;
      }
    }
  }
  
  const renderer = e.component.renderer;
  const scene = renderer.three.scene;
  const isPlayer = false;
  let isMoveIn = false;
  
  // add pulse effect
  if (e.over) {
    addPulseEffect(e.intersect.object, renderer, "pulse-effect-hover");
  }
  
  // no info board when set as support
  if (oppStore.oSupport.cardId == props.card.id && isSetSupportNow && oppStore.oSupport.isFromDeck) {
    return;
  }
  
  // move info board in/out when hover not deck cards
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
    removePulseEffect();
  }
}
</script>

<style></style>