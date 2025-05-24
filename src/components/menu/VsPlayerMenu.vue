<template>
  <div class="flex flex-col justify-center items-center h-screen">
    <div class="bg-sky-400 rounded-3xl p-8 w-1/2">
      <h2 class="text-4xl text-center mb-4">VS Player Mode</h2>
      <div class="flex flex-col">
        <!-- Room Number input box -->
        <label for="room-number" class="text-3xl text-sky-900 font-bold"
          >Room Number</label
        >
        <input
          id="room-number"
          placeholder="Enter 3 digit Room Code"
          v-model="roomNumber"
          class="shadow appearance-none border rounded w-full py-2 px-3 text-3xl text-gray-700 mt-1 leading-tight focus:outline-none focus:shadow-outline"
        />
        <!-- Player Name input box -->
        <label for="playerName" class="text-3xl text-sky-900 font-bold mt-2"
          >Player Name:</label
        >
        <input
          id="playerName"
          placeholder="Trainer A"
          v-model="playerName"
          class="shadow appearance-none border rounded w-full py-2 px-3 text-3xl text-gray-700 mt-1 leading-tight focus:outline-none focus:shadow-outline"
        />
        <!-- Player Deck selection -->
        <div
          class="flex flex-col bg-sky-100/80 w-full h-fit rounded-lg shadow-md p-2 hover:shadow-lg transition-all border-2 mt-2"
        >
          <p class="text-3xl text-sky-900 font-bold my-1">Player Deck:</p>
          <DeckCover :deck="playerDeck" :enlarge="true"> </DeckCover>
          <RouterLink to="/play/online/select?who=player">
            <BaseButton class="mt-12"> CHANGE DECK </BaseButton>
          </RouterLink>
        </div>
        <BaseButton @click="joinRoom"> Join Game </BaseButton>
        <BackButton to="/" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useLocalStateStore } from "../../stores/localState";
import BaseButton from "../common/BaseButton.vue";
import BackButton from "../common/BackButton.vue";
import DeckCover from "../common/DeckCover.vue";
// import { socket } from '@/socket'

const roomNumber = ref("");
const localStateStore = useLocalStateStore();
const playerDeck = ref(localStateStore.vsPlayerDeck);
const playerName = ref("");

const joinRoom = () => {
  // Room joining logic here
};
</script>
