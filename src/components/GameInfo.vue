<template>
    <div class=" bg-sky-600 rounded-lg shadow-md p-2 hover:shadow-lg border-2 game-info">
        <div class="phase-banner text-white text-4xl font-bold active-penalty">
            {{ actor }} TURN
            <hr>
        </div>
        <div v-for="(phase, index) in phases" class="phase-banner text-3xl font-bold"
         :class="gameStateStore.phase == phase  ? 'text-white active-penalty' : 'text-white'"
         :style="`top: ${8 * (index + 1)}vh;`">
            {{ phaseToName(phase) }}
            <br>
            {{ phase != PHASE.END ? '↓' : '' }}
        </div>
    </div>
</template>

<script setup>
import { ref, computed } from "vue";
import { PHASE } from "../const/const";
import { phaseToName } from "../utils/mapper";
import { useStateStore } from "../stores/state";
import { useGameStateStore } from "../stores/gameState";

// props from GameBoard.vue
const { actor } = defineProps(["actor"]);

const stateStore = useStateStore();
const gameStateStore = useGameStateStore();
const phases = computed(() => {
    let phases = []
    for (const phase in PHASE) {
        if (Object.hasOwnProperty.call(PHASE, phase)) {
            const phaseValue = PHASE[phase];
            if (phaseValue != PHASE.REDRAW && phaseValue != PHASE.DIGIVOLVE_SPECIAL) {
                phases.push(phaseValue)
            }
        }
    }
    return phases
})

</script>

<style scoped>


.game-info {
    position: absolute;
    top: 0;
    left: 0;
    width: 15vw;
    height: 100vh;
}

</style>