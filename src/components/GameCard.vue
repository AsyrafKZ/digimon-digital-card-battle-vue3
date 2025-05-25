<template>
    <Plane ref="cardC" :width="1.1" :height="1.4" >
      <LambertMaterial />
    </Plane>
  </template>
  
  <script setup>
  import { ref, onMounted } from "vue";
  import * as THREE from "three";
  import vertexShader from "../shaders/vertex.glsl.js";
  import fragmentShader from "../shaders/fragment.glsl.js";
  import { useStateStore } from "../stores/state";
  import { usePlayerStore } from "../stores/player";
  import { PHASE, CARD_NAME, WHO, LEVEL, MODE } from "../const/const.js";
  import { hexToRgb } from "../utils/mapper"
  import { socket } from "../socket";
  
  // props
  const { card } = defineProps(["card"]);
  console.log("card.owner", card.owner);
  // emit to GameBoard.vue
  const emit = defineEmits(["click", "pointerOver"]);
  // refs
  const cardC = ref();
  const stateStore = useStateStore();
  const playerStore = usePlayerStore();
  const position = ref(card.position);
  const FIRST_OPTION_CARD_ID = 191;

  // card name
  const cardName = CARD_NAME.PLAYER + card.id.padStart(3, 0);
  
  // texture
  const monsterTexture = ref();
  
  onMounted(() => {
    /**
     * set card material
     */
    const cardMesh = cardC.value.mesh;
    const textureLoader = new THREE.TextureLoader();
    // set back side texture
    const backTexture = textureLoader.load("/src/sprites/common/card-back.png");
    // set monster image texture
    monsterTexture.value = textureLoader.load(card.sprite);
    // set gradient color
    const colorTopRgb = `vec3(${hexToRgb(card.colorTop).join(",")})`;
    const colorBottomRgb = `vec3(${hexToRgb(card.colorBottom).join(",")})`;
    const fShader = fragmentShader
      .replace("##COLOR_TOP", colorTopRgb)
      .replace("##COLOR_BOTTOM", colorBottomRgb);
  
    // set monster image and level mesh
    const lvlCanvas = document.createElement("canvas");
    const lvlTexture = new THREE.CanvasTexture(lvlCanvas);
  
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
    cardMesh.material = backMat;
    cardMesh.position.set(position.value.x, position.value.y, position.value.z);
    cardMesh.name = cardName;
  
    // flip the card to show the back side
    cardMesh.rotation.y = Math.PI;
    cardMesh.rotation.z = (Math.PI * 3) / 2;
    cardMesh.scale.set(4 / 5, 4 / 5, 1);
  });

</script>