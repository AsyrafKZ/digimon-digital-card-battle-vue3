<template>
    <TresGroup ref="deckC">
        <Suspense>
            <GameCard v-for="card in cards" :key="card.uuid" :card="card" :actorId="actorId" />
        </Suspense>
        <!-- The single interaction plane for click event -->
        <Suspense>
            <TresSprite
                ref="deckInteractionC"
                :position="[-4.25, -3.07, 0]"
                :scale="[4/5, 4/5, 1]"
                @click="handleClick"
                >
                <TresPlaneGeometry :args="[1.1, 1.4]" />
                <TresSpriteMaterial :map="deckTexture" :rotation="Math.PI * 1/2" />
            </TresSprite>
        </Suspense>
    </TresGroup>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, onUnmounted, watch } from "vue";
import { PHASE, useGameStateStore } from "../stores/gameState";
import { useBoardStore } from "../stores/board.js";
import GameCard from "./GameCard.vue"
import { useTexture, useTresContext } from "@tresjs/core";
import { CARD_STATE } from "../const/const.js";

// props
const { actorId } = defineProps(["actorId"]);
// ref
const deckC = ref();
const gameStateStore = useGameStateStore()
const boardStore = useBoardStore();
const cards = ref([])
const deckInteractionC = ref();
const deckTexture = ref();
const { scene } = useTresContext();


onMounted(async () => {
    const deck = deckC.value;

    if (actorId == gameStateStore.player.id) {
        cards.value = gameStateStore.player.cards
    } else {
        cards.value = gameStateStore.opponent.cards
    }

    const { map: backTextureMap } = await useTexture({map: "/src/sprites/common/card-back.png"});
    deckTexture.value = backTextureMap;

    deckInteractionC.value.onPointerMove = null
    deckInteractionC.value.onPointerEnter = null
    deckInteractionC.value.onPointerLeave = null
    deckInteractionC.value.onPointerDown = null
    deckInteractionC.value.onPointerUp = null
})

onUnmounted(() => {
    gameStateStore.$reset();
    boardStore.$reset();
})

const handleClick = async (e) => {
    if (e) {
        e.stopPropagation();
        console.log("GameCards.vue: handleClick", e);
        while (gameStateStore.playerHandCount < 4) {
            console.log("playerHandCount", gameStateStore.playerHandCount)
            const deckCards = gameStateStore.playerDeck
            const topCard = deckCards[deckCards.length - 1]
            
            await boardStore.moveCardToHand(topCard.uuid, gameStateStore.playerHandCount, scene.value)
            gameStateStore.updateCardStatus(actorId, topCard.uuid, CARD_STATE.HAND)
        }
    }
}

const handlePointerOver = (e) => {
    console.count("GameCards.vue: handlePointerOver", e);
}


</script>