import { ref } from 'vue'
import * as THREE from 'three'
import vertexShader from "../shaders/vertex.glsl.js"
import fragmentShader from "../shaders/fragment.glsl.js"
import { hexToRgb } from "../utils/mapper"

export function useCardMaterial(sprite, card) {
  const monsterTexture = ref()
  
  const setupCardMaterial = (cardMesh) => {
    const textureLoader = new THREE.TextureLoader()
    const backTexture = textureLoader.load("src/sprites/common/card-back.png")
    monsterTexture.value = textureLoader.load(sprite)
    
    // Set gradient color
    const colorTopRgb = `vec3(${hexToRgb(card.colorTop).join(",")})`
    const colorBottomRgb = `vec3(${hexToRgb(card.colorBottom).join(",")})`
    const fShader = fragmentShader
      .replace("##COLOR_TOP", colorTopRgb)
      .replace("##COLOR_BOTTOM", colorBottomRgb)

    // Level texture setup
    const lvlCanvas = document.createElement("canvas")
    const lvlTexture = new THREE.CanvasTexture(lvlCanvas)
    let textCtx = lvlCanvas.getContext("2d")
    textCtx.font = "850 60px helvetica"
    textCtx.strokeStyle = "black" 
    textCtx.strokeText(card.level, 0, 45)
    textCtx.fillStyle = "white"
    textCtx.fillText(card.level, 0, 45)

    // Create shader material
    const backMat = new THREE.ShaderMaterial({
      uniforms: {
        tBack: { value: backTexture },
        tImg: { value: monsterTexture.value },
        tLvl: { value: lvlTexture },
      },
      vertexShader,
      fragmentShader: fShader,
      side: THREE.DoubleSide,
    })

    return backMat
  }

  return {
    monsterTexture,
    setupCardMaterial
  }
}
