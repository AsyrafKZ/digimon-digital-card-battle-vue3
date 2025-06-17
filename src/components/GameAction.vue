<template>
    <!-- <UserButton v-if="showProceedBtn()" id="proceedButtonId" @click="gotoNextPhase(true)" -->
    <div style="bottom: 10vh; left: 1vw; z-index: 999;" id="returnButtonId">
        <input type="text" v-model="cardUuid" placeholder="Card UUID">
        <UserButton v-if="showProceedBtn()" id="testButtonId" @click="temp()">
            TEST BUTTON
        </UserButton>
    </div>
    <UserButton v-if="showProceedBtn()"  @click="returnCard()"
    style="bottom: 20vh; left: 1vw; z-index: 999;">
        RETURN TO DECK
    </UserButton>

    <ReadyButton />
    <UserButton
        v-if="stateStore.currentTurn == WHO.PLAYER && (stateStore.phase == PHASE.DRAW || stateStore.phase == PHASE.REDRAW)"
     id="redrawButton" @click="gameStateStore.gotoNextPhase()">
        REDRAW
    </UserButton>
    <UserButton v-if="stateStore.phase == PHASE.CHOOSE_ATTACK" id="attackChoiceBoardId" 
    class="w-36 h-28"
        style="bottom: 16vh; left: 4vw; z-index: 999;" @click="toggleAttackChoice()">
        {{ attackChoiceBtnStr }} ATTACK CHOICES
    </UserButton>

    <UserButton v-if="!returnBtnConfirm" id="returnBtnId" class="w-60" style="left: 1vw; bottom: 1vh; z-index: 999;" @click="returnBtnConfirm = true">
        Return to Main Menu
    </UserButton>
    <div v-if="returnBtnConfirm">
        <UserButton class="w-20" style="left: 1vw; bottom: 1vh; color: red; z-index: 999;" @click="returnToMainMenu(true)">
            YES
        </UserButton>
        <UserButton class="w-20" style="left: 8vw; bottom: 1vh; z-index: 999;" @click="returnToMainMenu(false)">
            NO
        </UserButton>
    </div>

    <UserButton v-if="showProceedBtn()" id="proceedButtonId" @click="gameStateStore.gotoNextPhase()">
            NEXT PHASE
    </UserButton>
    <UserButton v-if="drawBtnActive" id="proceedButtonId" style="bottom: 10vh;" @click="gameStateStore.setPhase(PHASE.REDRAW)">
            {{ drawBtnStr }}
    </UserButton>
</template>

<script setup>
import { useStateStore } from "../stores/state";
import { usePlayerStore } from "../stores/player";
import { useOpponentStore } from "../stores/opponent";
import { useGameStateStore } from "../stores/gameState";
import { showProceedBtn } from "./playerManager"
import { WHO, PHASE } from "../const/const";
import { ref, onMounted, computed } from "vue";
import { useRouter } from "vue-router";
import UserButton from "./UserButton.vue"
import ReadyButton from "./ReadyButton.vue"
import { useBoardStore } from "../stores/board";
import { animate } from "animejs";

const emit = defineEmits(['toggleAttackChoice'])

const stateStore = useStateStore();
const playerStore = usePlayerStore();
const oppStore = useOpponentStore();
const boardStore = useBoardStore();
const gameStateStore = useGameStateStore();
const router = useRouter();

const showAttackChoiceBln = ref(true);
const attackChoiceBtnStr = ref("HIDE");
const returnBtnConfirm = ref(false);
const cardUuid = ref("");

const drawBtnActive = computed(() => gameStateStore.phase == PHASE.DRAW || gameStateStore.phase == PHASE.REDRAW);
const drawBtnStr = computed(() => {
    if (gameStateStore.phase == PHASE.DRAW) {
        return "REDRAW"
    } else if (gameStateStore.phase == PHASE.REDRAW) {
        return "REDRAW"
    } else {
        return ""
    }
});

// set main HTML container
// const htmlRenderer = new CSS2DRenderer();
// htmlRenderer.setSize(window.innerWidth, window.innerHeight);
// htmlRenderer.domElement.id = "htmlRenderer";
// htmlRenderer.domElement.style.position = "absolute";
// htmlRenderer.domElement.style.top = "0px";
// htmlRenderer.domElement.style.pointerEvents = "none";
// htmlRenderer.name = "htmlRenderer";

// Move in/out attack choice board (DEV MODE)
const toggleAttackChoice = () => {
    showAttackChoiceBln.value = !showAttackChoiceBln.value

    // enable mouse event to html layer
    // htmlRenderer.domElement.style.pointerEvents = showAttackChoiceBln.value ? "auto" : "none";
    attackChoiceBtnStr.value = showAttackChoiceBln.value ? "HIDE" : "SHOW"

    // move choice board in
    const isChoiceBoardMoveIn = showAttackChoiceBln.value ? true : false;
    emit('toggleAttackChoice', isChoiceBoardMoveIn);
    // moveAttackChoiceBoardIn(isChoiceBoardMoveIn, providedPChoice.value, providedOChoice.value);
}

// Unmount this component and mount main menu
const returnToMainMenu = (confirmReturn) => {

    if (confirmReturn) {
        // stateStore.setShowMainMenu();
        router.push("/")
    } else {
        returnBtnConfirm.value = false
    }
    
}

onMounted(() => {
    // set HTML renderer to root container
    // const appC = document.getElementById("app");
    // appC.appendChild(htmlRenderer.domElement);

    // render once to load all html components
    // htmlRenderer.render(providedScene.value, providedCamera.value);
    // document.getElementById("playerName").innerHTML = stateStore.player.name;
    // document.getElementById("playerDeckName").innerHTML = stateStore.player.deckName;
    // document.getElementById("oppName").innerHTML = stateStore.opp.name;
    // document.getElementById("oppDeckName").innerHTML = stateStore.opp.deckName;

})

const temp = () => {
    boardStore.moveCardToHand(cardUuid.value, "one");
    // get card
}

const returnCard = () => {
    boardStore.moveCardToDeck(cardUuid.value)
}

</script>


<style scoped>
#testButtonId, #returnButtonId {
    position: absolute;
    bottom: 28vh;
    left: 8vw;
}

#proceedButtonId {
    position: absolute;
    width: fit-content;
    bottom: 28vh;
    left: unset !important;
    right: 8vw !important;
}

#redrawButton {
    position: absolute;
    bottom: 16vh;
    left: 8vw;
}

</style>