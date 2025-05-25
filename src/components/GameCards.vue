<template>
    <Group ref="deckC">
        <GameCard v-for="card in cards" :key="card.uuid" :card="card" />
    </Group>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useGameStateStore } from "../stores/gameState";
import GameCard from "./GameCard.vue"

// props
const { actorId } = defineProps(["actorId"]);
// ref
const deckC = ref();
const gameStateStore = useGameStateStore()
const cards = ref([])

onMounted(() => {
    const deck = deckC.value;
    console.log("field deck", deck);

    if (actorId == gameStateStore.player.id) {
        cards.value = gameStateStore.player.cards
    } else {
        cards.value = gameStateStore.opponent.cards
    }
})





</script>