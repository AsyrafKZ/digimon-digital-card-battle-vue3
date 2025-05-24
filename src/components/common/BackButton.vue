<template>
    <RouterLink 
        :to="to"
        @click="playReturnClickSound"
        @mouseover="playHoverSound"
        class="back-button bg-sky-800 text-white text-center font-bold text-xl rounded-md hover:bg-sky-950 p-2 px-4 mt-1 flex items-center gap-2"
    >
        <span class="transform rotate-180">➜</span>
        Back
    </RouterLink>
</template>

<script setup>
import { playHoverSound, playReturnClickSound } from '../../utils/audio';

defineProps({
    to: {
        type: [String, Object],
        default: '/'
    }
})
</script>

<style scoped>
.back-button {
    display: inline-flex;
    transition: all 0.2s ease;
}

.back-button:hover {
    transform: translateX(-4px);
}
</style>
