<template>
  <div class="flex flex-col items-center justify-center h-screen main-menu">
    <div class="bg-sky-400 rounded-3xl p-8 w-2/3">
      <h2 class="text-4xl text-center mb-4">Deck Builder</h2>
      <div class="flex flex-wrap gap-4">
        <div v-for="deck in myDecks" 
             :key="deck.deckId"
             class="bg-sky-600 p-4 rounded-md text-white">
          <h3>{{ deck.deckName }}</h3>
          <p>{{ deck.types }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const myDecks = ref([])

onMounted(() => {
  const localDecks = localStorage.getItem('myDecks')
  if (localDecks) {
    myDecks.value = JSON.parse(localDecks)
  }
})
</script>
