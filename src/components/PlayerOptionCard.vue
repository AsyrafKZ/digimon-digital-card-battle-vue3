<template>
  <Plane ref="optionC" :width="1.1" :height="1.4" @click="onClickCard($event)" @pointerOver="onPointerOver">
    <LambertMaterial />
  </Plane>
</template>

<script setup>
import { ref, onMounted } from "vue";
import * as THREE from "three";
import vertexShader from "../shaders/vertex.glsl.js";
import fragmentShader from "../shaders/fragment.glsl.js";
import { animateMoveInfoBoardIn } from "../animations/field"
import { useStateStore } from "../stores/state";
import { usePlayerStore } from "../stores/player";
import { PHASE, CARD_NAME, WHO } from "../const/const.js";
import { hexToRgb } from "../utils/mapper"
import { addPulseEffect, removePulseEffect, setCardToInfoBoard, setPlayerSupport } from "./fieldManager";

// props
const props = defineProps(["position", "sprite", "card"]);

// refs
const optionC = ref();
const stateStore = useStateStore();
const playerStore = usePlayerStore();

// card name
const cardName = CARD_NAME.PLAYER + props.card.id.padStart(3, 0);

// texture
const optionTexture = ref();

onMounted(() => {
  /**
   * set card material
   */
  const card = optionC.value.mesh;
  const textureLoader = new THREE.TextureLoader();
  // set back side texture
  const backTexture = textureLoader.load("/src/sprites/common/card-back.png");
  // set monster image texture
  optionTexture.value = textureLoader.load(props.sprite);
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
  textCtx.fillText("", 0, 45); // set level text

  // get shader material
  const backMat = new THREE.ShaderMaterial({
    uniforms: {
      tBack: { value: backTexture },
      tImg: { value: optionTexture.value },
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
const onClickCard = function (e) {
  // Do nothing during draw phase
  if (stateStore.phase < PHASE.DIGIVOLVE || stateStore.phase > PHASE.SUPPORT2) {
    // Refactored to button click in App.vue. TODO: clean this up
    console.log("CLICK THE BUTTON TO DRAW/REDRAW")
    return;
  }
  // Do nothing if active card
  if (playerStore.pActiveMonStack.map(el => el.name).indexOf(props.card.name) > -1) {
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
  // DIGIVOLVE PHASE
  else if (stateStore.phase == PHASE.DIGIVOLVE) {
    // TODO: enable certain digivolve card to be selectable here
    // list out which cards first and then use indexOf > -1 to determine? should not be too much
  }
  // SUPPORT PHASE 1
  else if (stateStore.phase == PHASE.SUPPORT1 && stateStore.firstSetSupport == WHO.PLAYER) {
    if (isDeckTopCard) {
      const card = scene.getObjectByName(`${CARD_NAME.PLAYER}${playerStore.pDeckTopCardId}`)
      setPlayerSupport(scene, isDeckTopCard, card);
    } else {
      setPlayerSupport(scene, isDeckTopCard, intersects[0].object);
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
    console.log("NO POINTER OVER EVENT DURING:", stateStore.phase)
    return;
  }
  // Dont glow if hover over deck stack
  let isSetSupportNow = (stateStore.phase == PHASE.SUPPORT1 && stateStore.firstSetSupport == WHO.PLAYER) || (stateStore.phase == PHASE.SUPPORT2 && stateStore.firstSetSupport != WHO.PLAYER);
  if (playerStore.pOffline.indexOf(props.card.id) > -1) {
    return;
  } else if (!isSetSupportNow && playerStore.pDeck.indexOf(props.card.id) > -1) {
    return;
  }
  // show Info Board only for top active card
  if (playerStore.pActiveMonStackCount > 0) {
    const activeMonStackTop = playerStore.pActiveMonStack[playerStore.pActiveMonStackCount - 1].name
    if (playerStore.pActiveMonStack.map(el => el.name).indexOf(props.card.name) > -1
      && props.card.name != activeMonStackTop) {
      return;
    }
  }
  // Dont glow when hover over deck stack during phases other than support
  let isHoverOverDeck = false;
  if (stateStore.phase == PHASE.SUPPORT1 || stateStore.phase == PHASE.SUPPORT2) {
    const deckTopCard = playerStore.pDeck[playerStore.pDeck.length - 1]
    // if hover over deck
    if (playerStore.pDeck.indexOf(props.card.id) > -1) {
      if (props.card.id != deckTopCard) {
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

  // move gloom object under card and info board in when hover over
  if (e.over) {
    addPulseEffect(e.intersect.object, renderer, "pulse-effect-hover");

    // dont show Info Board when hover over deck
    if (!isHoverOverDeck) {
      // set card details to Info Board
      setCardToInfoBoard(scene, optionTexture.value, props)
      // animate Info Board
      isMoveIn = true;
      animateMoveInfoBoardIn(isMoveIn, isPlayer, scene)
    }
  }
  // move info board out
  else {
    removePulseEffect();
    isMoveIn = false;
    animateMoveInfoBoardIn(isMoveIn, isPlayer, scene)
  }
}

</script>

<style></style>