<template>
    <button @click="playSelectClickSound(); $emit('click')"
    @mouseenter="playHoverSound"
    class="select-button bg-gradient-to-br from-sky-500 to-sky-600 text-white text-center content-center 
        font-bold text-3xl rounded-lg hover:from-sky-600 hover:to-sky-700 p-4 my-2 h-24
        shadow-lg hover:shadow-xl transform hover:-translate-y-0.5
        transition-all duration-200 border-2 border-sky-400 w-full">

        <slot></slot>
    </button>
</template>

<script setup>
import { playHoverSound, playSelectClickSound } from '../../utils/audio';
defineEmits(['click'])


</script>

<style scoped>
.select-button {
    position: relative;
    display: inline-block;
}

.select-button:hover::after {
    position: absolute;
    top: 50%;
    right: 1%;
    content: "";
    width: 3rem;
    height: 3rem;
    transform: translate(-50%, -50%);
    background-image: url("../../sprites/agumon.gif");
    background-repeat: no-repeat;
    background-size: cover;
}
</style>
