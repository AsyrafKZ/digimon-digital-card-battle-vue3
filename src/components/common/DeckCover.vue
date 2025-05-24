<template>
  <h3
    class="text-lg font-bold text-sky-800 mb-2"
    :class="{ 'enlarge-deck-cover': enlarge }"
  >
    {{ deck.deckName || "-- No Name --" }}
  </h3>

  <!-- Deck Info -->
  <div class="flex flex-col" :class="{ 'enlarge-deck-cover': enlarge }">
    <div class="flex flex-row items-center">
      <!-- Deck Cover -->
      <div class="w-18 h-18">
        <img
          :src="coverImage(deck.cardIds[0])"
          alt="Deck Cover"
          class="object-contain border-2 border-sky-800"
        />
      </div>
      <!-- Specialties -->
      <div class="grid grid-rows-2 grid-flow-col gap-1">
        <div
          v-for="specialty in Object.values(SPECIALTY)"
          class="flex flex-row h-[2vh] text-lg items-center my-2 ml-2"
        >
          {{ getSpecialtyCount(deck.types, specialty) }}
          <img
            :src="specialtyToImg(specialty)"
            :class="specialtyToClass(specialty)"
            class="mx-1 h-[2vh]"
          />
        </div>
      </div>
    </div>
    <!-- Buttons -->
    <slot></slot>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import { SPECIALTY } from "../../const/const";
import { specialtyToImg, specialtyToClass } from "../../utils/mapper";
import { playSelectClickSound, playHoverSound } from "../../utils/audio";

// props from parents
const { deck, enlarge } = defineProps(["deck", "enlarge"]);
const firstOptionCardId = 191;

// computed
let coverImage = computed(() => {
  // computed return a function so that we can pass parameter here
  return (id) => {
    let firstCardId = id.toString().padStart(3, "0");
    if (parseInt(id) < firstOptionCardId) {
        return `/src/sprites/monsters/${firstCardId}.jpg`;
    } else {
        return `/src/sprites/options/${firstCardId}.png`;
    }
  };
});

let optionCardCount = computed(() => {
  return deck.cardIds.filter(id => parseInt(id) >= firstOptionCardId).length;
});

// decks view
const getSpecialtyCount = (deckSpecialties, specialty) => {
  if (deckSpecialties.includes(specialty)) {
    const arr = deckSpecialties.split(",").map((e) => e.trim());
    const spCount = arr.find((e) => e.includes(specialty));
    const match = spCount.match(/\d+/);
    return match ? parseInt(match[0]) : 30 - optionCardCount.value;
  } else if (specialty == SPECIALTY.OPTION) {
    return optionCardCount.value;
  } else {
    return 0;
  }
};
</script>

<style scoped>
.enlarge-deck-cover {
  transform: scale(1.5);
  transform-origin: top left;
}
</style>
