<template>
  <div class="flex flex-col justify-center items-center p-4">
    <p class="text-center text-5xl text-sky-400 mb-4 title-text">
      {{ isSelect ? "Select" : "Build" }} Deck
    </p>
    <!-- Container -->
    <div
      class="flex flex-col w-3/4 bg-gradient-to-br from-sky-300 to-sky-400 rounded-3xl shadow-2xl border-4 border-sky-300/50 p-6"
    >
      <!-- Deck List Container -->
      <div class="bg-sky-100/80 rounded-xl p-4 shadow-inner">
        <!-- My Decks/Prebuilds -->
        <h2 class="text-2xl font-bold text-sky-900 mb-4">
          {{ isMyDecks ? "My Decks" : "Prebuild Decks" }}
        </h2>
        <!-- Deck List -->
        <div class="grid grid-cols-5 gap-4 h-[400px] overflow-y-scroll">
          <!-- Deck -->
          <div
            v-for="deck in decks"
            :key="deck.deckId"
            :id="deck.deckId"
            :class="[
              'bg-white max-w-md h-fit rounded-lg shadow-md p-2 hover:shadow-lg transition-all border-2 flex flex-col items-center',
              playDeckId == deck.deckId
                ? 'border-sky-500 bg-sky-50'
                : 'border-sky-200',
            ]"
          >
            <DeckCover :deck="deck">
              <!-- Deck Buttons -->
              <div class="flex flex-row justify-evenly">
                <button
                  v-if="isSelect"
                  class="px-2 py-2 mt-2 mr-2 rounded transition-colors"
                  :class="
                    playDeckId == deck.deckId
                      ? 'bg-gray-300 cursor-not-allowed'
                      : 'bg-sky-500 text-white hover:bg-sky-600 '
                  "
                  @mouseover="playHoverSound()"
                  @click.stop="selectAsPlayDeck(deck.deckId)"
                  :disabled="playDeckId == deck.deckId"
                >
                  {{
                    playDeckId == deck.deckId
                      ? "Current Play Deck"
                      : "Select As Play Deck"
                  }}
                </button>
                <button
                  v-if="!isSelect"
                  class="px-2 py-2 mt-2 mr-2 rounded transition-colors bg-sky-500 text-white hover:bg-sky-600 w-24"
                  @mouseover="playHoverSound()"
                  @click="
                    playSelectClickSound();
                    $router.push(
                      `/build/deck?id=${deck.deckId}&isNewDeck=false`
                    );
                  "
                >
                  Edit
                </button>
                <button
                  v-if="playDeckId != deck.deckId && isMyDecks && !isSelect"
                  class="px-2 py-2 mt-2 mr-2 text-red-600 font-bold bg-red-100 hover:bg-red-200 rounded transition-colors"
                  @mouseover="playHoverSound()"
                  @click.stop="confirmDelete(deck.deckId)"
                >
                  Delete ✕
                </button>
              </div>
            </DeckCover>
            <!-- </div> -->
          </div>
        </div>
      </div>

      <!-- Buttons -->
      <div class="flex gap-4 mt-1">
        <BaseButton @click="isMyDecks = !isMyDecks">{{
          isMyDecks ? "Browse Prebuilds" : "Browse My Decks"
        }}</BaseButton>
        <BaseButton
          v-if="!isSelect"
          @click="$router.push('/build/deck?id=0&isNewDeck=true')"
          >Create New Deck</BaseButton
        >
      </div>

      <!-- Back Button -->
      <BackButton @click="goBack" />
    </div>
    <!-- Confirmation Dialog -->
    <ConfirmDialog
      :is-open="isDialogOpen"
      :message="dialogMessage"
      @confirm="handleConfirm"
      @cancel="handleCancel"
    />
  </div>
</template>

<style scoped>
.title-text {
  text-shadow: -1px -1px 0 white, 1px -1px 0 black, -1px 1px 0 black,
    1px 1px 0 black;
}
</style>

<script setup>
import { useRouter, useRoute } from "vue-router";
import BaseButton from "../common/BaseButton.vue";
import BackButton from "../common/BackButton.vue";
import DeckCover from "../common/DeckCover.vue";

import { computed, onMounted, ref, watch } from "vue";
import { playSelectClickSound, playHoverSound } from "../../utils/audio";
import ConfirmDialog from "../common/ConfirmDialog.vue";
import { useConfirmDialog } from "../../composables/useConfirmDialog";
import { SPECIALTY } from "../../const/const";
import { useLocalStateStore } from "../../stores/localState";
import { useGameDataStore } from "../../stores/gameData";

const { isDialogOpen, dialogMessage, showDialog, handleConfirm, handleCancel } =
  useConfirmDialog();

let localStateStore = useLocalStateStore();
let gameDataStore = useGameDataStore();
let decks = ref([]);
let isMyDecks = ref(true);
let playDeckId = ref("");

const router = useRouter();
const route = useRoute();
const isSelect = route.path.includes("select");

onMounted(async () => {
  if (route.path.includes("play/cpu")) {
    if (route.query.who === "player") {
        playDeckId.value = localStateStore.vsCpuPlayerDeckId;
    } else if (route.query.who === "opponent") {
      playDeckId.value = localStateStore.vsCpuOpponentDeckId;
    }
  } else {
    playDeckId.value = localStateStore.vsPlayerDeckId;
  }

  // show my decks by default
  decks.value = localStateStore.playerDecks;
});

watch(isMyDecks, (newVal) => {
  if (newVal) {
    decks.value = localStateStore.playerDecks;
  } else {
    decks.value = gameDataStore.prebuildDecks;
  }
});

// Store selected deck ID in localStorage for game use
const selectAsPlayDeck = (deckId) => {
  if (route.path.includes("play/cpu")) {
    if (route.query.who === "player") {
      playDeckId.value = deckId;
      localStateStore.updateVsCpuPlayerDeck(deckId);
    } else if (route.query.who === "opponent") {
      playDeckId.value = deckId;
      localStateStore.updateVsCpuOpponentDeck(deckId);
    }
  } else {
    playDeckId.value = deckId;
    localStateStore.updateVsPlayerDeck(deckId);
  }
  playSelectClickSound();
};

// delete confirmation
const confirmDelete = async (deckId) => {
  if (await showDialog("Are you sure you want to delete this deck?")) {
    deleteDeck(deckId);
  }
};

const deleteDeck = (deckId) => {
  playSelectClickSound();

  // Remove deck with animation
  const deckElement = document.getElementById(deckId);
  deckElement.style.transition = "all 0.3s ease-out";
  deckElement.style.transform = "scale(0.8)";
  deckElement.style.opacity = "0";

  // Wait for animation then update data and localStorage
  setTimeout(() => {
    localStateStore.deleteDeck(deckId);
    decks = localStateStore.playerDecks
  }, 300);
};

// return to previous page
const goBack = () => {
  if (route.path.includes("/play/cpu/select")) {
    router.push("/play/cpu");
  } else if (route.path.includes("/play/online/select")) {
    router.push("/play/online");
  } else {
    router.push("/");
  }
};
</script>
