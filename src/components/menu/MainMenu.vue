<template>
  <div class="flex flex-col items-center justify-center h-screen">
    <p class="text-center text-7xl text-sky-400 my-4 title-text">
      <a href="#" class="underline">Digimon Digital Card Battle</a>
    </p>
    <div class="flex flex-col justify-center mx-2 my-2 px-8 w-1/2 
        bg-gradient-to-br from-sky-300 to-sky-400 
        rounded-3xl shadow-2xl border-4 border-sky-300/50 
        backdrop-blur-sm 
        transform transition-all duration-300 hover:shadow-sky-400/50">
      <RouterLink v-for="route in routes" :key="route.path" :to="route.path">
        <BaseButton>
          {{ route.name }}
        </BaseButton>
      </RouterLink>
    </div>
  </div>
</template>

<script setup>
import BaseButton from '../common/BaseButton.vue'

const routes = [
  { path: '/play/cpu', name: 'VS CPU' },
  { path: '/play/online', name: 'VS Player' },
  { path: '/build', name: 'Build Deck' },
  { path: '/settings', name: 'Settings' }
]
</script>

<style scoped>
.title-text {
    text-shadow:
        -1px -1px 0 white,
        1px -1px 0 black,
        -1px 1px 0 black,
        1px 1px 0 black;
}
</style>