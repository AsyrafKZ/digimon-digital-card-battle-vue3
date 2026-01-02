<template>
  <template v-for="planeData in loadedPlanesData" :key="planeData.id">
    <Plane :ref="planeData.ref" :args="[planeData.width, planeData.height]" 
     :position="planeData.position" :rotation="planeData.rotation" :name="planeData.id">
      <TresMeshLambertMaterial :map="planeData.textureMap" :transparent="true" />
    </Plane>
  </template>
</template>

<script setup>
import { onMounted } from "vue";
import { Plane }from "@tresjs/cientos"
import { useTexture } from "@tresjs/cientos"
import { useTres } from "@tresjs/core";

const { scene } = useTres();

// game board parts
const planeData = [
    {
        // opponent hand part (top part of the board: life, 4 hand cards, offline and deck cards)
        id: "oField",
        ref: "oField",
        width: 12,
        height: 3,
        position: [0, 3, -0.5],
        rotation: [0, 0, 0],
        texturePath: "/src/sprites/opponent-field.png",
    },
    {
        // opponent active digimon part (orange colored center-right part of the board)
        id: "oAField",
        ref: "oAField",
        width: 5.4,
        height: 2.8,
        position: [2.9, 0, -0.1],
        rotation: [0, 0, 0],
        texturePath: "/src/sprites/opponent-active-field.png",
    },
    {
        // opponent support bracket part
        id: "oSupport",
        ref: "oSupport",
        width: 2.2,
        height: 0.8,
        position: [1.4, -1, -0.502],
        rotation: [0, 0, 0],
        texturePath: "/src/sprites/opponent-support-bracket.png",
    },
    {
        // user-player active digimon part (blue colored center-left part of the board)
        id: "pAField",
        ref: "pAField",
        width: 5.4,
        height: 2.8,
        position: [-2.85, 0, -0.1],
        rotation: [0, 0, 0],
        texturePath: "/src/sprites/player-active-field.png",
    },
    {
        // user-player support bracket part
        id: "pSupport",
        ref: "pSupport",
        width: 2.2,
        height: 0.8,
        position: [-1.3, 0.5, -0.502],
        rotation: [0, 0, 0],
        texturePath: "/src/sprites/player-support-bracket.png",
    },
    {
        // user-player hand part (bottom part of the board: offline and deck cards, life, 4 hand cards)
        id: "pField",
        ref: "pField",
        width: 12,
        height: 3,
        position: [0, -3, -0.5],
        rotation: [0, 0, 0],
        texturePath: "/src/sprites/player-field.png",
    },
    {
        // opponent attack choice part (displayed from top of the screen during attack choice phase)
        id: "oChoice",
        ref: "oChoice",
        width: 12,
        height: 3,
        position: [0, 6.3, 0.3],
        rotation: [0, 0, 0],
        texturePath: "/src/sprites/choose-attack-opp.png",
    },
    {
        // user-player attack choice part (displayed from top of the screen during attack choice phase)
        id: "pChoice",
        ref: "pChoice",
        width: 12,
        height: 3,
        position: [0, -6, 0.3],
        rotation: [0, 0, 0],
        texturePath: "/src/sprites/choose-attack-player.png",
    },
    {
        // card details display part (showed up from left side of the screen)
        id: "infoBoard",
        ref: "infoBoard",
        width: 12,
        height: 3,
        position: [-17, 2.8, 0.3],
        rotation: [0, 0, 0],
        texturePath: "/src/sprites/info-board.png",
    },
    {
        // default image on the card details display part?
        id: "infoBoardImg",
        ref: "infoBoardImg",
        width: 3,
        height: 2.7,
        position: [-21.45, 2.65, 0.3],
        rotation: [0, 0, 0],
        texturePath: "/src/sprites/monsters/175.jpg", // veemon
    },
    {
        // yellow colored banner that shows current turn player
        id: "firstAttackBanner",
        ref: "firstAttackBanner",
        width: 1,
        height: 2,
        position: [7, 0, 0.3],
        rotation: [0, 0, 0],
        texturePath: "/src/sprites/1st-attack-banner.png",
    }
]

// the Promise here is why the <Suspense> tag in GameBoard.vue is added
const loadedPlanesData = await Promise.all(planeData.map(async (config) => {
    const { state: textureMap } = await useTexture(config.texturePath)
    return {
        ...config,
        textureMap: textureMap.value,
    }
}))

onMounted(() => {
    // attach text labels to each board parts
    // these labels are defined in GameCanvasTextUI.vue
    const playerActiveFieldLabels = ["pDpCount", "pActiveNm", "pActiveC", "pActiveT", "pActiveX", "pActiveXEff", "pActiveHpLbl", "pActiveHp"]
    const opponentActiveFieldLabels = ["oDpCount", "oActiveNm", "oActiveC", "oActiveT", "oActiveX", "oActiveXEff", "oActiveHpLbl", "oActiveHp"]
    const playerChoiceLabels = ["pChoiceNm", "pChoiceHp", "pChoiceLevel", "pChoiceSp", "pChoiceONm", "pChoiceTNm", "pChoiceXNm", "pChoiceXEff", "pChoiceOVal", "pChoiceTVal", "pChoiceXVal", "pChoiceXSpd", "pChoiceTurn"]
    const opponentChoiceLabels = ["oChoiceNm", "oChoiceHp", "oChoiceLevel", "oChoiceSp", "oChoiceONm", "oChoiceTNm", "oChoiceXNm", "oChoiceXEff", "oChoiceOVal", "oChoiceTVal", "oChoiceXVal", "oChoiceXSpd", "oChoiceTurn"]
    const playerChoiceHoverLabels = ["choiceOHover", "choiceTHover", "choiceXHover"]
    const infoBoardLabels = ["infoNm", "infoHp", "infoOVal", "infoTVal", "infoXVal", "infoXEff", "infoXSpd", "infoLevel", "infoSp", "infoDp", "infoPp", "infoSupport", "infoSupportSpd"]
    
    playerActiveFieldLabels.forEach(label => {
        const mesh = scene.value.getObjectByName(label);
        scene.value.getObjectByName("pAField").attach(mesh)
    })
    opponentActiveFieldLabels.forEach(label => {
        const mesh = scene.value.getObjectByName(label);
        scene.value.getObjectByName("oAField").attach(mesh)
    })
    playerChoiceLabels.forEach(label => {
        const mesh = scene.value.getObjectByName(label);
        scene.value.getObjectByName("pChoice").attach(mesh)
    })
    playerChoiceHoverLabels.forEach(label => {
        const mesh = scene.value.getObjectByName(label);
        scene.value.getObjectByName("pChoice").attach(mesh)
    })
    opponentChoiceLabels.forEach(label => {
        const mesh = scene.value.getObjectByName(label);
        scene.value.getObjectByName("oChoice").attach(mesh)
    })
    infoBoardLabels.forEach(label => {
        const mesh = scene.value.getObjectByName(label);
        scene.value.getObjectByName("infoBoard").attach(mesh)
    })
})

</script>
