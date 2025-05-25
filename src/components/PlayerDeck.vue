<template>
  <Group ref="deckC">
    <MonsterCard v-for="card in monsterCards" :key="card.id" :position="card.position" :sprite="card.sprite" :card="card" />
    <OptionCard v-for="card in optionCards" :key="card.id" :position="card.position" :sprite="card.sprite" :card="card" />
  </Group>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { usePlayerStore } from "../stores/player";
import MonsterCard from "./PlayerMonsterCard.vue"
import OptionCard from "./PlayerOptionCard.vue"
import { DECK_NAME, MODE } from "../const/const"
import { socket } from "../socket";
import { useStateStore } from "../stores/state";

// ref
const deckC = ref();
const dummyUserId1 = "1";
const dummyDeckId1 = "5";
const monsterCards = ref([])
const optionCards = ref([])

// test deck
const testDeck = ref([
  {
    id: 1,
    ref: "test01",
    position: { x: -3, y: -2, z: 0 },
    sprite: "/src/sprites/common/card-back.png",
  },
]);

onMounted(async () => {
  const deck = deckC.value;
  const playerStore = usePlayerStore()

  deck.o3d.name = DECK_NAME.PLAYER;
  
  console.log("player deck", deck);
  
  // Get cards
  await playerStore.initializeDeck(dummyUserId1, dummyDeckId1);

  // Update state to server
  // console.log(playerStore.$state)
  // console.log(JSON.stringify(playerStore.$state))
  if (useStateStore().oppMode == MODE.PROD) {
    socket.emit("state-init", playerStore.$state)
  }

  // Set cards to meshes
  for (let i = 0; i < playerStore.pCards.length; i++) {
    const card = playerStore.pCards[i];
    if (parseInt(card.id) < 191) {
      monsterCards.value.push(card)
    } else {
      optionCards.value.push(card)
    }
  }

  // update html card count
  setTimeout(() => {
    const deckCnt = document.getElementById("pDeckCount");
    const offlineCnt = document.getElementById("pOfflineCount");
    deckCnt.innerHTML = playerStore.pDeckCount;
    offlineCnt.innerHTML = 0;
  }, 1000);
});
</script>

<style></style>