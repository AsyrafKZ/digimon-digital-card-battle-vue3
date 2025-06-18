<template>
  <template v-for="planeData in loadedPlanesData" :key="planeData.id">
    <Plane :ref="planeData.ref" :args="[planeData.width, planeData.height]" 
     :position="planeData.position" :rotation="planeData.rotation" :name="planeData.id">
      <TresMeshLambertMaterial :map="planeData.textureMap" :transparent="true" />
    </Plane>
  </template>
</template>

<script setup>
import { onMounted, watch } from "vue";
import { Plane }from "@tresjs/cientos"
import { useTexture } from "@tresjs/core"
import { useTresContext } from "@tresjs/core";
import { useGameStateStore, PHASE } from "../stores/gameState";
import { useBoardStore } from "../stores/board";
import { CARD_STATE } from "../const/const";

const { scene } = useTresContext();
const gameStateStore = useGameStateStore();
const boardStore = useBoardStore();


const planeData = [
    {
        id: "oField",
        ref: "oField",
        width: 12,
        height: 3,
        position: [0, 3, -0.5],
        rotation: [0, 0, 0],
        texturePath: "/src/sprites/opponent-field.png",
    },
    {
        id: "oAField",
        ref: "oAField",
        width: 5.4,
        height: 2.8,
        position: [2.9, 0, -0.1],
        rotation: [0, 0, 0],
        texturePath: "/src/sprites/opponent-active-field.png",
    },
    {
        id: "oSupport",
        ref: "oSupport",
        width: 2.2,
        height: 0.8,
        position: [1.4, -1, -0.502],
        rotation: [0, 0, 0],
        texturePath: "/src/sprites/opponent-support-bracket.png",
    },
    {
        id: "pAField",
        ref: "pAField",
        width: 5.4,
        height: 2.8,
        position: [-2.85, 0, -0.1],
        rotation: [0, 0, 0],
        texturePath: "/src/sprites/player-active-field.png",
    },
    {
        id: "pSupport",
        ref: "pSupport",
        width: 2.2,
        height: 0.8,
        position: [-1.3, 0.5, -0.502],
        rotation: [0, 0, 0],
        texturePath: "/src/sprites/player-support-bracket.png",
    },
    {
        id: "pField",
        ref: "pField",
        width: 12,
        height: 3,
        position: [0, -3, -0.5],
        rotation: [0, 0, 0],
        texturePath: "/src/sprites/player-field.png",
    },
    {
        id: "oChoice",
        ref: "oChoice",
        width: 12,
        height: 3,
        position: [0, 6.3, 0.3],
        rotation: [0, 0, 0],
        texturePath: "/src/sprites/choose-attack-opp.png",
    },
    {
        id: "pChoice",
        ref: "pChoice",
        width: 12,
        height: 3,
        position: [0, -6, 0.3],
        rotation: [0, 0, 0],
        texturePath: "/src/sprites/choose-attack-player.png",
    },
    {
        id: "infoBoard",
        ref: "infoBoard",
        width: 12,
        height: 3,
        position: [-17, 2.8, 0.3],
        rotation: [0, 0, 0],
        texturePath: "/src/sprites/info-board.png",
    },
    {
        id: "infoBoardImg",
        ref: "infoBoardImg",
        width: 3,
        height: 2.7,
        position: [-21.45, 2.65, 0.3],
        rotation: [0, 0, 0],
        texturePath: "/src/sprites/monsters/175.jpg",
    },
    {
        id: "firstAttackBanner",
        ref: "firstAttackBanner",
        width: 1,
        height: 2,
        position: [7, 0, 0.3],
        rotation: [0, 0, 0],
        texturePath: "/src/sprites/1st-attack-banner.png",
    }
]

const loadedPlanesData = await Promise.all(planeData.map(async (config) => {
    const { map: textureMap } = await useTexture({map: config.texturePath})
    return {
        ...config,
        textureMap,
    }
}))

onMounted(() => {
    // attach text labels to board planes
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
