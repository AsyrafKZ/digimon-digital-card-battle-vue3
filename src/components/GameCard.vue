<template>
    <TresMesh :ref="(el) => cardC = el" :position="[position.x, position.y, position.z]"
      >
      <TresPlaneGeometry :args="[1.1, 1.4]" />
      <TresShaderMaterial :vertex-shader="vertexShader" :fragment-shader="fShader" :uniforms="uniforms" :side="THREE.DoubleSide" />
    </TresMesh>
  </template>
  
  <script setup>
  import { ref, onMounted, computed, watch } from "vue";
  import * as THREE from "three";
  import { useTexture } from "@tresjs/core";
  import vertexShader from "../shaders/vertex.glsl.js";
  import fragmentShader from "../shaders/fragment.glsl.js";
  import { useStateStore } from "../stores/state.js";
  import { usePlayerStore } from "../stores/player.js";
  import { useGameStateStore } from "../stores/gameState.js";
  import { useBoardStore } from "../stores/board.js";
  import { PHASE, CARD_NAME, WHO, LEVEL, MODE, CARD_STATE } from "../const/const.js";
  import { hexToRgb } from "../utils/mapper.js"
  import { useTresContext } from "@tresjs/core";
  
  // props
  const { card, actorId } = defineProps(["card", "actorId"]);
  const { scene } = useTresContext();
  // emit to GameBoard.vue
  // const emit = defineEmits(["click", "pointerOver"]);
  // refs
  const cardC = ref();
  const stateStore = useStateStore();
  const playerStore = usePlayerStore();
  const gameStateStore = useGameStateStore();
  const boardStore = useBoardStore();
  const position = ref(card.position);
  const FIRST_OPTION_CARD_ID = 191;

  // card name
  const cardName = card.uuid;
  
  // texture
  const colorTopRgb = `vec3(${hexToRgb(card.colorTop).join(",")})`;
  const colorBottomRgb = `vec3(${hexToRgb(card.colorBottom).join(",")})`;
  const fShader = fragmentShader
      .replace("##COLOR_TOP", colorTopRgb)
      .replace("##COLOR_BOTTOM", colorBottomRgb);
  const { map: backTextureMap } = await useTexture({map: "/src/sprites/common/card-back.png"});
  const { map: monsterTextureMap } = await useTexture({map: card.sprite});

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

  const maps = await Promise.all([backTextureMap, monsterTextureMap]);
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
    
    // set position and flip the card to show the back side
    boardStore.setInitCard(cardName, actorId, scene.value)
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
    console.count(`pointer enter. apply outline effect`)
    console.count(`### hovered card ${cardName} pointer enter`)
  }
  
  function handlePointerLeave(event) {
    event.stopPropagation()
    console.count(`pointer leave. remove outline effect`)
    console.count(`### left card ${cardName} pointer leave`)
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