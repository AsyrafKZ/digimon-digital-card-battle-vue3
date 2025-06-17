<template>
  <div class="flex flex-col justify-center items-center h-screen">
    <div class="bg-sky-400 rounded-3xl p-8 w-1/2">
      <h2 class="text-4xl text-center mb-4">VS CPU Mode</h2>
      <div class="flex flex-col">
        <!-- Player Name input box -->
        <label for="playerName" class="text-3xl text-sky-900 font-bold"
          >Player Name:</label
        >
        <input
          id="playerName"
          placeholder="Trainer A"
          v-model="playerName"
          class="shadow appearance-none border rounded w-full py-2 px-3 text-3xl text-gray-700 mt-1 leading-tight focus:outline-none focus:shadow-outline"
        />
        <!-- Player Deck selection -->
        <div class="flex flex-row justify-around my-2">
          <div class="flex flex-col bg-sky-100/80 w-1/2 h-fit rounded-lg shadow-md p-2 hover:shadow-lg transition-all border-2">
            <p class="text-3xl text-sky-900 font-bold my-1">
              Player Deck:
            </p>
            <DeckCover :deck="playerDeck" :enlarge="true">
            </DeckCover>
            <RouterLink to="/play/cpu/select?who=player">
              <BaseButton class="mt-12"> CHANGE DECK </BaseButton>
            </RouterLink>
          </div>
          <div class="flex flex-col bg-sky-100/80 w-1/2 h-fit rounded-lg shadow-md p-2 hover:shadow-lg transition-all border-2">
            <!-- Opponent Deck Selection -->
            <p class="text-3xl text-sky-900 font-bold my-1">
              Opponent Deck:
            </p>
            <DeckCover :deck="opponentDeck" :enlarge="true">
            </DeckCover>
            <RouterLink to="/play/cpu/select?who=opponent">
              <BaseButton class="mt-12"> CHANGE DECK </BaseButton>
            </RouterLink>
          </div>
        </div>
        <!-- Buttons -->
        <BaseButton @click="startGame"> Start Game </BaseButton>
        <BackButton to="/" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useStateStore } from "../../stores/state";
import { useLocalStateStore } from "../../stores/localState";
import { useGameStateStore } from "../../stores/gameState";
import { useGameDataStore } from "../../stores/gameData";
import { PLAYER_TYPES } from "../../const/const";
import BaseButton from "../common/BaseButton.vue";
import BackButton from "../common/BackButton.vue";
import DeckCover from "../common/DeckCover.vue";

const stateStore = useStateStore();
const localStateStore = useLocalStateStore();
const gameStateStore = useGameStateStore();
const gameDataStore = useGameDataStore();
const router = useRouter();
const playerName = ref("");
const playerDeck = ref(localStateStore.vsCpuPlayerDeck);
const opponentDeck = ref(localStateStore.vsCpuOpponentDeck);

const startGame = async () => {
  try {
    // set Player info to GameStateStore
    const playerDeck = localStateStore.vsCpuPlayerDeck;
    const playerCards = gameDataStore.getGameReadyCards(playerDeck.cardIds, PLAYER_TYPES.HUMAN, localStateStore.player.id);
    gameStateStore.setPlayerDetails(playerName.value || playerDeck.deckOwner, playerDeck, playerCards);
    // set CPU info to GameStateStore
    const opponentId = "CPU"
    const opponentDeck = localStateStore.vsCpuOpponentDeck;
    const opponentCards = gameDataStore.getGameReadyCards(opponentDeck.cardIds, PLAYER_TYPES.CPU_EASY, opponentId);
    gameStateStore.setOpponentDetails(opponentId, opponentDeck.deckOwner, PLAYER_TYPES.CPU_EASY, opponentDeck, opponentCards);
    // set first turn. TODO: randomize this
    gameStateStore.setFirstTurnActor(gameStateStore.player.id);

    // start game
    await router.push("/play/cpu/game")
  } catch (error) {
    console.error("Error starting game:", error);
  }
};
</script>