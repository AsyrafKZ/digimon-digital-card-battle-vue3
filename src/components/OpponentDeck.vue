<template>
  <Group ref="deckC">
    <MonsterCard v-for="card in monsterCards" :key="card.id" :position="card.position" :sprite="card.sprite" :card="card" />
    <OptionCard v-for="card in optionCards" :key="card.id" :position="card.position" :sprite="card.sprite" :card="card" />
  </Group>
</template>

<script setup>
import { ref, watch, onMounted } from "vue";
import { useOpponentStore } from "../stores/opponent";
import MonsterCard from "./OpponentMonsterCard.vue"
import OptionCard from "./OpponentOptionCard.vue"
import { DECK_NAME, MODE, READY } from "../const/const"
import { useStateStore } from "../stores/state";
import { socket } from "../socket";

const stateStore = useStateStore();

// ref
const deckC = ref();
const dummyUserId2 = "2";
const dummyDeckId2 = "2";
const monsterCards = ref([])
const optionCards = ref([])

// test deck
const testDeck = ref([
  {
    id: 1,
    ref: "test01",
    position: { x: -3, y: -2, z: 0 },
    sprite: "src/sprites/common/card-back.png",
  },
]);

onMounted(async () => {
  if (stateStore.oppMode == MODE.PROD) {
    return;
  }

  await setDeck();
});

watch(() => stateStore.ready.opp, async (currentVal, lastVal) => {
    if (stateStore.oppMode != MODE.PROD) {
      return;
    }

    if (currentVal == READY.INIT_OK) {
      await setDeck();
    }
})

const setDeck = async () => {
  const deck = deckC.value;
  const oppStore = useOpponentStore()

  deck.o3d.name = DECK_NAME.OPP;
  
  console.log("opp deck", deck);
  
  // Get cards
  if (stateStore.oppMode == MODE.AI) {
    await oppStore.initializeDeck(dummyUserId2, dummyDeckId2);
  } else if (stateStore.oppMode == MODE.PROD) {
    await oppStore.setCardDetails();
    console.log("set deck finished!")
    socket.emit("finish-loading")
  }

  // Set cards to meshes
  for (let i = 0; i < oppStore.oCards.length; i++) {
    const card = oppStore.oCards[i];
    if (parseInt(card.id) < 191) {
      monsterCards.value.push(card)
    } else {
      optionCards.value.push(card)
    }
  }

  // update html card count
  const deckCnt = document.getElementById("oDeckCount");
  const offlineCnt = document.getElementById("oOfflineCount");
  deckCnt.innerHTML = oppStore.oDeckCount;
  offlineCnt.innerHTML = 0;
}
</script>

<style></style>