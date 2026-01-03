<template>
    <TresGroup ref="deckC">
        <Suspense>
            <GameCard v-for="card in cards" :key="card.uuid" :card="card" :actorId="actorId" />
        </Suspense>
    </TresGroup>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from "vue";
import { useGameStateStore } from "../stores/gameState";
import { useBoardStore } from "../stores/board.js";
import GameCard from "./GameCard.vue"
import { useTexture } from "@tresjs/cientos";

// props
const { actorId } = defineProps(["actorId"]);
// ref
const gameStateStore = useGameStateStore()
const boardStore = useBoardStore();
const cards = ref([])
const deckTexture = ref();

onMounted(async () => {
    if (actorId == gameStateStore.player.id) {
        cards.value = gameStateStore.player.cards
    } else {
        cards.value = gameStateStore.opponent.cards
    }

    const { state: backTextureMap } = await useTexture("/src/sprites/common/card-back.png");
    deckTexture.value = backTextureMap.value;
})

onUnmounted(() => {
    gameStateStore.$reset();
    boardStore.$reset();
})

</script>