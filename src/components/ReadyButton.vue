<template>
    <UserButton v-if="stateStore.oppMode == MODE.PROD && stateStore.phase == -1" id="startGameId" class="h-32" style="bottom: 24vh; left: 8vw">
        {{ stateStore.ready.player == READY.LOADING_OK  ? "WAITING FOR OPPONENT..." : "PREPARING..." }}
    </UserButton>
</template>

<script setup>
import UserButton from "./UserButton.vue"
import { useStateStore } from "../stores/state";
import { MODE, READY } from "../const/const";

const stateStore = useStateStore();
</script>

