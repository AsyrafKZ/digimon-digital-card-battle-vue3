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
import { useStateStore } from "../../stores/state";
import { useLocalStateStore } from "../../stores/localState";
import BaseButton from "../common/BaseButton.vue";
import BackButton from "../common/BackButton.vue";
import DeckCover from "../common/DeckCover.vue";

const stateStore = useStateStore();
const localStateStore = useLocalStateStore();
const playerName = ref("");
const playerDeck = ref(localStateStore.vsCpuPlayerDeck);
const opponentName = ref("");
const opponentDeck = ref(localStateStore.vsCpuOpponentDeck);

const startGame = () => {
  // Game initialization logic here
  playerName.value = stateStore.player.name;
  opponentName.value = stateStore.opponent.name;
  playerDeck.value = stateStore.player.deckName;
  opponentDeck.value = stateStore.opponent.deckName;
};
</script>