<template>
</template>

<script setup>
import { watch } from "vue";
import { useTres } from "@tresjs/core";
import { useGameStateStore, PHASE } from "../stores/gameState";
import { useBoardStore } from "../stores/board";
import { CARD_STATE } from "../const/const";

const { scene } = useTres();
const gameStateStore = useGameStateStore();
const boardStore = useBoardStore();

watch(() => gameStateStore.phase, (newPhase) => {
    
    if (newPhase == PHASE.DRAW) {
        handleDrawPhase()
    } else if (newPhase == PHASE.REDRAW) {
        handleRedrawPhase()
    }
})

const handleDrawPhase = async () => {
    let handCount = gameStateStore.isPlayerTurn ? gameStateStore.playerHandCount : gameStateStore.opponentHandCount
    while (handCount < 4) {
        let deckCount = gameStateStore.isPlayerTurn ? gameStateStore.playerDeckCount : gameStateStore.opponentDeckCount
        if (deckCount == 0) break;
        
        console.log("add handCount", handCount)
        const deckCards = gameStateStore.isPlayerTurn ? gameStateStore.playerDeck : gameStateStore.opponentDeck
        const topCard = deckCards[deckCards.length - 1]
        
        gameStateStore.updateCardStatus(gameStateStore.currentTurnActor, topCard.uuid, CARD_STATE.HAND)
        await boardStore.moveCardToHand(topCard.uuid, handCount, scene.value)

        handCount++
    }
}

const removeCardFromHand = async () => {
    let handCount = gameStateStore.isPlayerTurn ? gameStateStore.playerHandCount : gameStateStore.opponentHandCount
    while (handCount > 0) {
        console.log("remove handCount", handCount)
        const handCards = gameStateStore.isPlayerTurn ? gameStateStore.playerHand : gameStateStore.opponentHand
        const card = handCards[handCards.length - 1]
        
        await boardStore.moveCardToOffline(card.uuid, scene.value)
        gameStateStore.updateCardStatus(gameStateStore.currentTurnActor, card.uuid, CARD_STATE.OFFLINE)

        handCount--
    }
}

const handleRedrawPhase = async () => {
    // remove all cards from hand
    await removeCardFromHand()
    // draw 4 cards
    gameStateStore.setPhase(PHASE.DRAW)
}

</script>
