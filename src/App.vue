<!-- The Root Component -->
<!-- This .vue file is a Single File Component (SFC). It contains the template (HTML structure), script (Javasript logic), and style (CSS) for the root of this application -->
<template>

  <main class="main-menu h-screen content-center overflow-hidden">
    <!-- routes and render components declared in /src/router/index.js -->
    <RouterView />
  </main>
  <!-- <div v-if="stateStore.showMainMenu">
    <MainMenu />
  </div>
  <div v-if="!stateStore.showMainMenu">
    <GameBoard />
  </div> -->
</template>

<script setup>
import { onMounted } from "vue"
import { useGameDataStore } from "./stores/gameData"
import { useLocalStateStore } from "./stores/localState"

// import { useConnectionStore } from "./stores/connection";
// import { socket } from "./socket"

onMounted(async () => {
  const gameDataStore = useGameDataStore()
  await gameDataStore.init()
  const localStateStore = useLocalStateStore()
  await localStateStore.init()
})

// localStateStore
// const connectionStore = useConnectionStore();

// remove any existing listeners (after a HMR)
// socket.off();

// connectionStore.bindEvents();

</script>

<style>
@import '/src/style.css';

.main-menu {
    /* background-color: #183141; */
    background: url("assets/background.png") repeat;
    background-color: rgba(0, 0, 0, 0.25);
    background-blend-mode: darken;
    animation: move-diagonal 30s linear infinite;
}

@keyframes move-diagonal {
    from {
        background-position: 0 0;
    }

    to {
        background-position: -2186px -1156px;
        /* image size */
    }
}
</style>
