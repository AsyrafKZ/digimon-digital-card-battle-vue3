<template>
    <TresMesh :ref="(el) => cardC = el" @click="handleClick"
      @pointerenter="handlePointerEnter"
      @pointerleave="handlePointerLeave" 
      >
      <TresPlaneGeometry :args="[1.1, 1.4]" />
      <TresShaderMaterial :vertex-shader="vertexShader" :fragment-shader="fShader" :uniforms="uniforms" :side="THREE.DoubleSide" />
    </TresMesh>
    <!-- when we attach a 3D object to another, "position" would be its position relative to the parent. so 0,0,0 would overlap the parent object -->
    <TresMesh :ref="(el) => childCardC = el" :position="[0, 0, 0]" :visible="false">
      <TresPlaneGeometry :args="[1.1, 1.4]" />
      <TresMeshBasicMaterial :color="'yellow'" :transparent="true" :opacity="0.8" :side="THREE.DoubleSide" :depth-write="false" />
    </TresMesh>
  </template>
  
  <script setup>
  import { ref, onMounted, computed, watch, shallowRef } from "vue";
  import * as THREE from "three";
  import { useTexture } from "@tresjs/cientos";
  import vertexShader from "../shaders/vertex.glsl.js";
  import fragmentShader from "../shaders/fragment.glsl.js";
  import { useStateStore } from "../stores/state.js";
  import { usePlayerStore } from "../stores/player.js";
  import { useGameStateStore } from "../stores/gameState.js";
  import { useBoardStore } from "../stores/board.js";
  import { PHASE, CARD_NAME, WHO, LEVEL, MODE, CARD_STATE } from "../const/const.js";
  import { hexToRgb } from "../utils/mapper.js"
  import { useTres } from "@tresjs/core";
  
  // props
  const { card, actorId } = defineProps(["card", "actorId"]);
  const { scene, invalidate } = useTres();
  // emit to GameBoard.vue
  // const emit = defineEmits(["click", "pointerOver"]);

  // here shallowRef is used because of changes in TresJs v5 for performance optimization (also Vue would snap the object back to its original position after animated)
  const cardC = shallowRef();
  const childCardC = shallowRef();
  const stateStore = useStateStore();
  const playerStore = usePlayerStore();
  const gameStateStore = useGameStateStore();
  const boardStore = useBoardStore();
  const FIRST_OPTION_CARD_ID = 191;

  // card name
  const cardName = card.uuid;
  
  // texture
  const colorTopRgb = `vec3(${hexToRgb(card.colorTop).join(",")})`;
  const colorBottomRgb = `vec3(${hexToRgb(card.colorBottom).join(",")})`;
  const fShader = fragmentShader
      .replace("##COLOR_TOP", colorTopRgb)
      .replace("##COLOR_BOTTOM", colorBottomRgb);
  const { state: backTextureMap } = await useTexture("/src/sprites/common/card-back.png");
  const { state: monsterTextureMap } = await useTexture(card.sprite);
  const maps = await Promise.all([backTextureMap.value, monsterTextureMap.value]);

  // level texture
  const lvlCanvas = document.createElement("canvas");

  let textCtx = lvlCanvas.getContext("2d");
  if (parseInt(card.id) < FIRST_OPTION_CARD_ID) {
      textCtx.font = "850 60px helvetica";
      textCtx.strokeStyle = "black";
      textCtx.strokeText(card.level, 0, 45);
      textCtx.fillStyle = "white";
      textCtx.fillText(card.level, 0, 45); // set level text
  } else {
      textCtx.fillText("", 0, 45); // set level text
  }
  const lvlTexture = new THREE.CanvasTexture(lvlCanvas);

  const uniforms = {
    tBack: { value: maps[0] },
    tImg: { value: maps[1] },
    tLvl: { value: lvlTexture }
  }

  // watch(() => card.state, (newState) => {
  //   if (newState != CARD_STATE.DECK) {
  //     console.log("card state changed to", newState)
  //     cardC.value.onClick = handleClick
  //     cardC.value.onPointerEnter = handlePointerEnter
  //     cardC.value.onPointerLeave = handlePointerLeave
  //     cardC.value.attach(outlineC.value)
  //     // cardC.value.addEventListener("click", handleClick)
  //     // cardC.value.addEventListener("pointerover", handlePointerOver)
  //     // cardC.value.addEventListener("pointerout", handlePointerOut)
  //     console.log("cardC.value", cardC.value)
  //   }
  // })
  
  onMounted(async () => {
    cardC.value.name = cardName

    // attach child card to the card
    cardC.value.add(childCardC.value);
    
    // set position and flip the card to show the back side
    boardStore.setInitCard(cardName, actorId, scene.value)

    // if top card of a deck, add click event
    if (gameStateStore.userDeckTopCard.uuid == card.uuid) {
      console.log("top card:", cardName, card.id)
      cardC.value.onClick = handleClick
    }
  });

  function handleClick(event) {
    console.count("card click handler called")
    if (event) {
      event.stopPropagation();
      console.log(`${cardName} clicked. sprite: ${card.sprite}`)
      gameStateStore.updateCardStatus(actorId, card.uuid, CARD_STATE.OFFLINE)
    }
  }

  function handlePointerOver(event) {
    console.count(`pointer over`)
    event.stopPropagation()
    console.count(`### top card ${cardName} pointer over`)
  }

  function handlePointerEnter(event) {
    event.stopPropagation()
    console.log(`pointer enter. apply outline effect`)
    console.log(`### hovered card ${cardName} pointer enter`)
    childCardC.value.visible = !childCardC.value.visible;
    invalidate(); // Force TresJS to redraw
    document.body.style.cursor = "pointer";
  }
  
  function handlePointerLeave(event) {
    childCardC.value.visible = !childCardC.value.visible;
    invalidate(); // Force TresJS to redraw
    document.body.style.cursor = "auto";
  }

  function handlePointerOut(event) {
    if (event) {
      event.stopPropagation()
      console.log(`${cardName} pointer out`)
    }
  }

  function handlePointerDown(event) {
    if (event) {
      event.stopPropagation()
      console.log(`${cardName} pointer down`)
    }
  }
  
  function handlePointerUp(event) {
    if (event) {
      event.stopPropagation()
      console.log(`${cardName} pointer up`)
    }
  }
  
</script>