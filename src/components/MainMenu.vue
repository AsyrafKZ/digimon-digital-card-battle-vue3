<template>
    <main class="main-menu">

        <div class="flex flex-col items-center justify-center h-screen">

            <p class="text-center text-7xl text-sky-400 my-4 title-text"><a href="#" class="underline">{{ title }}</a></p>
            <!-- MAIN MENU -->
            <div v-if="currentMenu == FREE_PLAY || currentMenu == OPTIONS || currentMenu == CREDITS"
                class="flex flex-row items-center justify-center w-2/3 bg-stone-700">
                <!-- Select Game Mode -->
                <div class="flex flex-col justify-center mx-2 my-2 px-8 w-1/2  bg-sky-400 rounded-3xl ">
                    <div class="flex flex-col py-3 items-center">
                        <!-- <p class="text-center text-3xl text-sky-900 font-bold">SELECT GAME MODE</p> -->
                        <button
                            class="select-button bg-sky-600 text-white font-bold text-3xl rounded-md hover:bg-sky-800 p-2 m-2 w-1/2 h-24"
                            @click="selectMenu(FREE_PLAY)" @mouseleave="setAgumonWhenLeave"
                            @mouseenter="setAgumonWhenHover">
                            Free Play
                        </button>
                        <button
                            class="select-button bg-sky-600 text-white font-bold text-3xl rounded-md hover:bg-sky-800 p-2 m-2 w-1/2 h-24"
                            @click="selectMenu(DECK_MENU)" @mouseleave="setAgumonWhenLeave"
                            @mouseenter="setAgumonWhenHover">
                            Deck Menu
                        </button>
                        <button disabled
                            class="bg-stone-700 text-white font-bold text-3xl rounded-md  p-2 m-2 w-1/2 h-24 focus:outline-none">
                            Adventure Mode (WIP)
                        </button>
                        <button
                            class="select-button bg-sky-600 text-white font-bold text-3xl rounded-md hover:bg-sky-800 p-2 m-2 w-1/2 h-24"
                            @click="selectMenu(OPTIONS)" @mouseleave="setAgumonWhenLeave" @mouseenter="setAgumonWhenHover">
                            Options
                        </button>
                        <button
                            class="select-button bg-sky-600 text-white font-bold text-3xl rounded-md hover:bg-sky-800 p-2 m-2 w-1/2 h-24"
                            @click="selectMenu(CREDITS)" @mouseleave="setAgumonWhenLeave" @mouseenter="setAgumonWhenHover">
                            Credits
                        </button>
                        <!-- <img src="../sprites/agumon.gif" class="w-12 h-12"> -->
                        <div class="flex flex-row min-w-max">
                        </div>
                    </div>
                </div>
                <!-- HOME SUBMENU -->
                <div class="flex flex-col justify-center mx-2 my-2 px-8 w-1/2 bg-sky-400 rounded-3xl">
                    <!-- Free Play Details -->
                    <div v-if="currentMenu == FREE_PLAY" class="flex flex-col py-3">
                        <p class="text-center text-3xl text-sky-900 font-bold">GAME MODE: {{ gameMode }}</p>
                        <div class="flex flex-row">
                            <button
                                class="select-button bg-sky-600 text-white font-bold text-3xl rounded-md hover:bg-sky-800 p-2 m-2 w-1/2 h-24"
                                :class="{ 'selected': selected == VS_CPU }" @click="selectGameMode(VS_CPU)"
                                @mouseleave="setAgumonWhenLeave" @mouseenter="setAgumonWhenHover">
                                VS CPU
                            </button>
                            <!-- <button class="flex flex-row items-center justify-center bg-sky-600 text-white font-bold text-3xl hover:bg-sky-800 p-2 m-2 w-1/2 h-24" -->
                            <button
                                class="select-button bg-sky-600 text-white font-bold text-3xl rounded-md hover:bg-sky-800 p-2 m-2 w-1/2 h-24"
                                :class="{ 'selected': selected == VS_PLAYER }" @click="selectGameMode(VS_PLAYER)"
                                @mouseleave="setAgumonWhenLeave" @mouseenter="setAgumonWhenHover">
                                VS PLAYER
                            </button>
                        </div>
                        <div class="flex flex-col pt-4">
                            <label for="playerName" class="text-2xl text-white">Player Name:</label>
                            <input id="playerName" placeholder="Trainer A" v-model="playerName"
                                class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mt-1 leading-tight focus:outline-none focus:shadow-outline">
                        </div>
                        <p class="text-2xl text-white my-1">
                            Player Deck: <span class="text-sky-900">{{ playerDeck }} Deck</span>
                            <button
                                class="text-lg w-[6vw] bg-sky-600 hover:bg-sky-800 border-white border-solid border-2 ml-4"
                                @click="jumpToDeck(playerDeck)">CHANGE DECK</button>
                        </p>
                        <div v-if="gameMode == VS_PLAYER">
                            <hr>
                            <label for="room-number" class="text-2xl text-white">Room Number</label>
                            <input id="room-number" :placeholder="roomNumberPlaceholder" v-model="roomNumber"
                                :disabled="gameMode == VS_CPU"
                                class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mt-1 leading-tight focus:outline-none focus:shadow-outline">
                        </div>
                        <div v-else>
                            <p class="text-2xl text-white">
                                Opponent Deck: <span class="text-sky-900">{{ oppDeck }} Deck</span>
                                <button
                                class="text-lg w-[6vw] bg-sky-600 hover:bg-sky-800 border-white border-solid border-2 ml-4"
                                    @click="jumpToDeck(oppDeck)">CHANGE DECK</button>
                            </p>
                        </div>
                        <button
                            class="select-button bg-sky-600 text-white font-bold text-3xl rounded-md hover:bg-sky-800 p-2 mt-8 h-24"
                            @click="startGame">
                            Start Game
                        </button>
                    </div>
                    <!-- Options -->
                    <div v-if="currentMenu == OPTIONS" class="flex flex-col py-3">
                        <p class="text-center text-3xl text-sky-900 font-bold">OPTIONS</p>
                    </div>
                    <!-- Credits -->
                    <div v-if="currentMenu == CREDITS" class="flex flex-col py-3">
                        <p class="text-center text-3xl text-sky-900 font-bold">CREDITS</p>
                    </div>
                </div>
            </div>
            <!-- DECK OVERVIEW SUBMENU -->
            <div v-if="currentMenu == DECK_MENU"
                class="flex flex-row items-center justify-center w-[75vw] h-5/6 bg-stone-700 rounded-3xl">
                <div class="flex flex-col justify-center items-center m-2 px-4 w-full h-full bg-sky-400 rounded-3xl">
                    <p class="text-center text-5xl text-sky-900 font-bold">{{ subMenu == MY_DECKS ? MY_DECKS : EXAMPLE_DECKS
                    }}</p>
                    <!-- All decks -->
                    <div class="flex flex-col h-4/5 flex-wrap w-full p-4">
                        <div class="flex flex-row w-5/6 flex-wrap overflow-y-auto scroll- pr-2">
                            <button v-for="deck in currentDecks" :key="deck.deckId" :id="deck.deckId"
                                class="rounded-md w-[18vw] max-h-[12vh] flex flex-col text-white bg-sky-600 hover:bg-sky-800 border-solid border-2 border-sky-200 m-1 text-left"
                                :class="{ 'bg-sky-800': selectedDeck && selectedDeck.deckName == deck.deckName }"
                                @click="() => selectedDeck = deck">
                                <p class="ml-2 font-medium black-text-shadow text-3xl">{{ deck.deckName || "-- No Name --" }}</p>
                                <div class="flex flex-wrap">
                                    <div v-for="specialty in SPECIALTIES"
                                        class="flex flex-row min-w-[2.5vw] h-[2vh] text-3xl items-center my-2 ml-2">
                                        {{ getSpecialtyCount(deck.types, specialty) }}
                                        <img :src="specialtyToImg(specialty)" :class="specialtyToClass(specialty)"
                                            class="mx-1 h-[2vh]" />
                                    </div>
                                </div>
                            </button>
                        </div>
                        <!-- Player and Opponent Decks -->
                        <div class="flex flex-col w-1/6 h-full border-l-white border-l-2 ml-1 pl-2">
                            <p class="text-2xl text-sky-900 font-bold">Player Deck:</p>
                            <button
                                class="text-xl text-left border-transparent border-2 hover:bg-sky-200 hover:border-white hover:border-solid mb-4"
                                @click="jumpToDeck(playerDeck)">{{ playerDeck }}</button>
                            <p class="text-2xl text-sky-900 font-bold">AI Opponent Deck:</p>
                            <button
                                class="text-xl text-left border-transparent border-2 hover:bg-sky-200 hover:border-white hover:border-solid mb-4"
                                @click="jumpToDeck(oppDeck)">{{ oppDeck }}</button>
                            <hr>
                            <!-- Action buttons -->
                            <div class="flex flex-row flex-wrap max-h-full mt-4">
                                <button
                                    class="rounded-md w-18 h-24 bg-sky-600 hover:bg-sky-800 w-24 border-solid border-2 border-sky-200 m-1 text-xl text-white">
                                    Create New Deck
                                </button>
                                <button
                                    class="rounded-md w-18 h-24 w-24 border-solid border-2 border-sky-200 m-1 text-2xl text-white"
                                    :class="!selectedDeck ? 'bg-stone-700' : 'hover:bg-sky-800 bg-sky-600'"
                                    :disabled="!selectedDeck" @click="editDeck(selectedDeck)">
                                    Edit Deck
                                </button>
                                <button
                                    class="rounded-md w-18 h-24 w-24 border-solid border-2 border-sky-200 m-1 text-xl text-white"
                                    :class="!selectedDeck ? 'bg-stone-700' : 'hover:bg-sky-800 bg-sky-600'"
                                    :disabled="!selectedDeck"
                                    @click="() => { playerDeck = selectedDeck.deckName; stateStore.player.cardIds = selectedDeck.cardIds }">
                                    Set as Play Deck
                                </button>
                                <button
                                    class="rounded-md w-18 h-24 w-24 border-solid border-2 border-sky-200 m-1 text-xl text-white"
                                    :class="!selectedDeck ? 'bg-stone-700' : 'hover:bg-sky-800 bg-sky-600'"
                                    :disabled="!selectedDeck"
                                    @click="() => { oppDeck = selectedDeck.deckName; stateStore.opp.cardIds = selectedDeck.cardIds }">
                                    Set as Opponent Deck
                                </button>
                                <button v-if="subMenu == MY_DECKS"
                                    class="bg-sky-600 text-white font-bold text-3xl rounded-md hover:bg-sky-800 p-2 mt-8 h-24 border-solid border-2 border-sky-200"
                                    @click="subMenu = EXAMPLE_DECKS">
                                    View/Copy Example Decks
                                </button>
                                <button v-else
                                    class=" bg-sky-600 text-white font-bold text-3xl rounded-md hover:bg-sky-800 p-2 mt-8 h-24 border-solid border-2 border-sky-200"
                                    @click="subMenu = MY_DECKS">
                                    View My Decks
                                </button>
                            </div>
                        </div>
                    </div>
                    <div class="flex flex-row self-start">
                        <button class="rounded-md bg-sky-600 hover:bg-sky-800 border-gray-700 m-2"
                            @click="selectMenu(FREE_PLAY)"><img class="w-[4vw]"
                                src="src/assets/symbols/return.svg" /></button>
                    </div>
                </div>
            </div>
            <!-- EDIT DECK SUBMENU -->
            <div v-if="currentMenu == EDIT_DECK"
                class="flex flex-row items-center justify-center h-5/6 w-[75vw] max-w-screen-xl bg-stone-700 text-white rounded-3xl">
                <div class="flex flex-col justify-center m-2 px-4 w-full h-full bg-sky-400 rounded-3xl">
                    <p class="text-center text-5xl text-sky-900 font-bold">EDIT DECK</p>
                    <div class="flex flex-row justify-between px-1">
                        <input type="text" v-model="editDeckName" class="text-sky-800 text-4xl font-bold px-2 mx-1 w-full" />
                        <button
                            class="rounded-md w-24 h-10 bg-sky-600 hover:bg-sky-800 border-solid border-2 border-sky-200 text-white mx-1"
                            @click="saveDeck">
                            Save
                        </button>
                    </div>
                    <div class="flex flex-row pb-1 h-3/4">
                        <!-- Editing Deck Column -->
                        <div class="flex-col w-2/3 h-full">
                            <!-- Card Detail Row -->
                            <div class="flex flex-row p-2">
                                <div
                                    class="flex flex-col w-full h-5/6 border-double border-4 border-gray-700 bg-sky-700 p-3">
                                    <div class="flex flex-row w-full justify-start text-3xl">
                                        {{ selectedCard.number }}
                                        {{ selectedCard.level }}
                                        {{ selectedCard.specialty ? "Type" : "" }}
                                        <img v-if="selectedCard.specialty" :src="specialtyToImg(selectedCard.specialty)"
                                            :class="specialtyToClass(selectedCard.specialty)" class="ml-2 mr-8 w-[1vw]"
                                            :alt="selectedCard.name" />
                                        {{ selectedCard.name }}
                                        <span>
                                        </span>
                                    </div>
                                    <div class="flex flex-row">
                                        <img :src="`src/sprites/common/${selectedCard.number}.png`"
                                            class="w-[10vw] h-[10vw] m-1 border-solid border-2 border-white" />
                                        <div class="flex flex-col min-w-[10vw] text-2xl ml-4">
                                            <div>HP {{ selectedCard.hp || "-" }}</div>
                                            <div><span class="text-red-500 font-bold">〇</span> {{ selectedCard.c_pow || "-" }}</div>
                                            <div><span class="text-green-500 font-bold">△</span> {{ selectedCard.t_pow || "-" }}</div>
                                            <div><span class="text-blue-900 font-bold">Ⓧ</span> {{ selectedCard.x_pow || "-" }}</div>
                                            {{ buttonToSymbol(selectedCard.x_effect) }}<br>
                                        </div>
                                        <div class="flex flex-col text-2xl ml-4">
                                            <p>DP {{ selectedCard.dp }} +P {{ selectedCard.pp }}<br>
                                                <span class="text-yellow-200">Support Effect</span><br>
                                                {{ selectedCard.support || selectedCard.effect }}
                                            </p>
                                        </div>
                                    </div>
                                    <hr>
                                    <div class="flex-row mt-2 text-xl">
                                        <button :disabled="isAddDisabled"
                                            :class="{ 'bg-stone-700': isAddDisabled, 'hover:bg-sky-800 bg-sky-600 ': !isAddDisabled }"
                                            class="rounded-md min-h-max min-w-max border-solid border-2 border-sky-200 px-[1vw] mx-1"
                                            @click="addCard">Add Card</button>
                                        <button :disabled="isRemoveDisabled"
                                            :class="{ 'bg-stone-700': isRemoveDisabled, 'hover:bg-sky-800 bg-sky-600 ': !isRemoveDisabled }"
                                            class="rounded-md min-h-max min-w-max border-solid border-2 border-sky-200 px-[1vw] mx-1"
                                            @click="removeCard">Remove Card</button>
                                        <button :disabled="!isPartner"
                                            :class="{ 'bg-stone-700': !isPartner, 'hover:bg-sky-800 bg-sky-600 ': isPartner }"
                                            class="rounded-md min-h-max min-w-max border-solid border-2 border-sky-200 px-[1vw] mx-1">Set
                                            Armor Digivolve (WIP)</button>
                                    </div>
                                </div>
                            </div>
                            <!-- Deck Cards Row -->
                            <div class="flex flex-row flex-wrap p-2">
                                <button v-for="card in editDeckCards" :key="card.number"
                                    :style="{ 'border-color': `${borderColor(card.specialty)}` }"
                                    class="card rounded-md w-[4vw] h-[4vw] text-white font-semibold bg-sky-600 hover:bg-sky-800 border-solid border-2 border-sky-200 m-1">
                                    <img style="width: 4vw;" :src="`src/sprites/common/${card.number}.png`"
                                        @click="selectCard(card)" />
                                    <p class="card-img-lvl">{{ card.level || "" }}</p>
                                </button>
                            </div>
                            <div class="flex flex-row justify-end align-bottom text-2xl px-2">
                                {{ editDeckCards.length }}/30 Cards
                            </div>
                        </div>
                        <!-- Search column -->
                        <div class="flex-col h-full w-1/3 m-2 p-2  border-solid border-2 border-red-200">
                            <!-- Search -->
                            <div class="flex flex-row justify-between h-10">
                                <input type="text" class="w-5/6 text-black text-xl pl-2 h-10" v-model="searchWord"
                                    @keyup.enter="searchNearest" />
                                <button
                                    class="w-1/6 h-10 bg-sky-600 hover:bg-sky-800 border-solid border-2 border-sky-200 text-white"
                                    @click="searchNearest">Search</button>
                            </div>
                            <!-- Filter -->
                            <div class="flex flex-row w-full">
                                <div class="py-1">
                                    <button @click="() => showFilterMenu = !showFilterMenu"
                                        class="w-min p-2 cursor-pointer bg-sky-500 hover:bg-sky-800"
                                        :class="{ 'bg-sky-800': showFilterMenu }">Filter</button>
                                    <!-- Filter menu -->
                                    <div v-if="showFilterMenu" class="absolute z-10 bg-sky-800 w-1/6 h-min shadow-sm p-1">
                                        <div class="flex flex-row">
                                            <!-- Radio filters -->
                                            <div class="flex flex-col border-solid border-r-2 border-r-gray-50">
                                                <div class="hover:bg-sky-500">
                                                    <input type="radio" :id="filterMonster.label" name="filter"
                                                        v-model="filterMonster.checkOn" :checked="filterMonster.checkOn"
                                                        @change="applyMonsterFilter()" />
                                                    <label :for="filterMonster.label"
                                                        class="content-center cursor-pointer text-lg m-1">{{
                                                            filterMonster.label }}</label>
                                                </div>
                                                <div class="hover:bg-sky-500">
                                                    <input type="radio" :id="filterOption.label" name="filter"
                                                        v-model="filterOption.checkOn" :checked="filterOption.checkOn"
                                                        @change="applyOptionFilter()" />
                                                    <label :for="filterOption.label"
                                                        class=" content-center cursor-pointer text-lg m-1">{{
                                                            filterOption.label }}</label>
                                                </div>
                                                <div class="hover:bg-sky-500">
                                                    <input type="radio" :id="filterPartner.label" name="filter"
                                                        v-model="filterPartner.checkOn" :checked="filterPartner.checkOn"
                                                        @change="applyPartnerFilter()" />
                                                    <label :for="filterPartner.label"
                                                        class=" content-center cursor-pointer text-lg m-1">{{
                                                            filterPartner.label }}</label>
                                                </div>
                                            </div>
                                            <!-- Monster Only Filters -->
                                            <div class="flex flex-row ml-1">
                                                <div class="flex-flex-col mr-2">
                                                    <div v-for="filter in filterSpecialty"
                                                        class="flex hover:bg-sky-500 w-fit h-fit px-1">
                                                        <input type="checkbox" :disabled="!filterMonster.checkOn"
                                                            :id="filter.specialty" v-model="filter.checkOn"
                                                            :checked="filter.checkOn" @change="applyMonsterFilter()" />
                                                        <label :for="filter.specialty"
                                                            class="content-center cursor-pointer text-lg m-1 w-[3vw]">{{
                                                                filter.specialty }}</label>
                                                    </div>
                                                </div>
                                                <div class="flex flex-col">
                                                    <div v-for="filter in filterLevel"
                                                        class="flex hover:bg-sky-500 w-fit h-fit px-1">
                                                        <input type="checkbox" :disabled="!filterMonster.checkOn"
                                                            :id="filter.level" v-model="filter.checkOn"
                                                            :checked="filter.checkOn" @change="applyMonsterFilter()" />
                                                        <label :for="filter.level"
                                                            class="content-center cursor-pointer text-lg m-1 w-[3vw]">{{
                                                                filter.level }}</label>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <!-- Result -->
                            <div class="h-5/6 w-full overflow-y-scroll pr-1">
                                <svg v-if="filteredCards.length == 0" class="animate-spin h-5 w-5 m-3"></svg>
                                <button v-for="card in filteredCards" :key="card.number"
                                    class="flex flex-row justify-start w-full text-xl border-white border-solid border-2 hover:bg-sky-800 mt-1 pl-1"
                                    @click="selectCard(card)">
                                    {{ card.number }}
                                    {{ card.level }}
                                    {{ card.specialty ? "Type" : "" }}
                                    <img width="16" height="16" :src="specialtyToImg(card.specialty)"
                                        :class="specialtyToClass(card.specialty)" class="m-1" />
                                    {{ buttonToSymbol(card.name) }}
                                </button>
                            </div>
                        </div>
                    </div>
                    <div class="flex flex-row self-start">
                        <button class="rounded-md bg-sky-600 hover:bg-sky-800 border-gray-700 m-2" @click="exitEditDeck"><img
                                class="w-[4vw]" src="src/assets/symbols/return.svg" /></button>
                    </div>
                </div>
            </div>

            <!-- Chat System -->
            <!-- <textarea class="w-1/12 h-1/4 py-2 px-3" readonly v-model="logMsg"></textarea>
            <div class="flex flex-row justify-center w-full mt-8">
                <input class="w-1/4 h-1/8 text-gray-700 mt-1 leading-tight py-2 px-3 border rounded focus:shadow-outline" v-model="myMsg" @submit="sendMessage">
                <button class=" bg-sky-600 text-white font-bold text-3xl hover:bg-sky-800 ml-1 p-2 h-12"
                    @click="sendMessage">
                    Send
                </button>
            </div> -->

        </div>

    </main>
</template>

<script setup>
import { ref, onMounted, watch, computed, onBeforeUnmount } from "vue";
import { useStateStore } from "../stores/state"
import { useConnectionStore } from "../stores/connection";
import { socket } from "../socket"
import { MODE, SPECIALTY, WHO } from "../const/const";
import { specialtyToColor, specialtyToImg, specialtyToClass, buttonToSymbol } from "../utils/mapper";
import * as levenshtein from "js-levenshtein"

const stateStore = useStateStore();
const connectionStore = useConnectionStore();

const VS_CPU = "VS CPU"
const VS_PLAYER = "VS PLAYER"
const FREE_PLAY = "FREE PLAY"
const DECK_MENU = "DECK MENU"
const OPTIONS = "OPTIONS"
const CREDITS = "CREDITS"
const EDIT_DECK = "EDIT DECK"
const MY_DECKS = "MY DECKS"
const EXAMPLE_DECKS = "EXAMPLE DECKS"
const OPTION_NUMBER = 191
const LOCAL_STORAGE_MY_DECKS_KEY = "myDecks"

const title = ref("Main Menu");
const playerName = ref("")
const playerDeck = ref("Practice")
const oppDeck = ref("Black Storm Again")
const roomNumber = ref()
const roomNumberPlaceholder = "Enter 4-digit room number or leave blank to create a new room"
const newRoomNumberStr = ref("")
const newRoomNumber = ref();
const logMsg = ref("");
const myMsg = ref("");

const gameMode = ref(VS_CPU)
const selected = ref(VS_CPU)
const currentMenu = ref(FREE_PLAY)
const subMenu = ref(MY_DECKS)

// deck viewer
const SPECIALTIES = ["Fire", "Ice", "Nature", "Darkness", "Rare"]
const myDecks = ref([]);

// edit deck
const allExampleDecks = ref([]);
const allCards = ref([]);
const filteredCards = ref([]);
const searchWord = ref("");
const deckName = ref("");
const selectedDeck = ref(null)
const selectedDeckCards = ref([])
const selectedCard = ref({})
const editDeckName = ref("")
const editDeckCards = ref([])
const showFilterMenu = ref(false)
const filterMonster = ref({
    label: "Monster Only",
    checkOn: true
})
const filterSpecialty = ref([
    {
        specialty: "Fire",
        checkOn: true,
    },
    {
        specialty: "Ice",
        checkOn: true,
    },
    {
        specialty: "Nature",
        checkOn: true,
    },
    {
        specialty: "Darkness",
        checkOn: true,
    },
    {
        specialty: "Rare",
        checkOn: true,
    }])
const filterLevel = ref([
    {
        level: "R",
        checkOn: true,
    },
    {
        level: "A",
        checkOn: true,
    },
    {
        level: "C",
        checkOn: true,
    },
    {
        level: "U",
        checkOn: true,
    }
])
const filterOption = ref({
    label: "Option Only",
    checkOn: false
})
const filterPartner = ref({
    label: "Partner Only",
    checkOn: false
})
const url = "http://localhost:3005/api/"

onMounted(() => {
    title.value = "Digimon Digital Card Battle";

    newRoomNumber.value = new Uint32Array(1)
    window.crypto.getRandomValues(newRoomNumber.value);
    newRoomNumberStr.value = newRoomNumber.value[0].toString().substring(0, 4)
    console.log(`newRoomNumberStr:${newRoomNumberStr.value}. newRoomNumber:${newRoomNumber.value[0]}`)

    // set default mode
    stateStore.setOppMode(MODE.AI)
    // socket.value.on("welcome-message", (message) => {
    //     console.log(message);
    // });

    // socket.value.on("join-room", (msg) => {
    //     updateLogMsg(msg, "Server")
    // })
    // socket.value.on("new-message", ({username, msg}) => {
    //     updateLogMsg(msg, username)
    // })
    // socket.value.on("user-disconnect", (msg) => {
    //     updateLogMsg(msg, "Server")
    // })
})

const startGame = async () => {
    stateStore.player.name = playerName.value || "Trainer A";
    stateStore.player.deckName = playerDeck.value || "Dev Deck"
    stateStore.opp.name = "Trainer B";
    stateStore.opp.deckName = oppDeck.value || "His Tricolor Deck";

    let name;
    let room;
    // VS PLAYER MODE
    if (stateStore.oppMode == MODE.PROD) {
        if (roomNumber.value) { // existing room
            name = stateStore.player.name;
            room = roomNumber.value;
            socket.emit("join-room", { name, room })

            // updateLogMsg(`You(${name}) joined room ${roomNumber.value}`, "Server")
        } else { // new room
            name = stateStore.player.name;
            room = newRoomNumberStr.value;
            socket.emit("create-room", { name, room })

            // updateLogMsg(`You(${name}) created and joined room ${newRoomNumberStr.value}`, "Server")
        }
    }

    // SET PLAYER MODE
    if (stateStore.player.name == "dev99") {
        stateStore.setPlayerMode(MODE.DEV);
    } else {
        stateStore.setPlayerMode(MODE.PROD);
    }

    // get cards
    await getCardToPlay(playerDeck.value, WHO.PLAYER);
    await getCardToPlay(oppDeck.value, WHO.OPP);

    stateStore.setShowMainMenu();
}

const selectMenu = (menu) => {
    currentMenu.value = menu

    if (menu == FREE_PLAY) {
        selectGameMode(VS_CPU)
    }
}

const selectGameMode = (mode) => {
    gameMode.value = mode == VS_CPU ? VS_CPU : VS_PLAYER
    stateStore.setOppMode(mode == VS_CPU ? MODE.AI : MODE.PROD);
}

const setAgumonWhenHover = () => {
    selected.value = ""
}

const setAgumonWhenLeave = () => {
    if (gameMode.value == VS_CPU) {
        selected.value = VS_CPU
    } else {
        selected.value = VS_PLAYER
    }
}

const getCardToPlay = async (deckName, who) => {
    let deck;
    // check deck on local storage first
    const localStorageDecks = localStorage.getItem(LOCAL_STORAGE_MY_DECKS_KEY)
    if (localStorageDecks) {
        const localDecks = JSON.parse(localStorageDecks)
        deck = localDecks.find(deck => deck.deckName == deckName)
    }
    // check on db then
    if (!deck) {
        const deckRes = await fetch(`${url}decks`)
        const deckData = await deckRes.json()
        deck = deckData.find(deck => deck.deckName == deckName)
    }

    if (deck) {
        if (who == WHO.PLAYER) {
            stateStore.player.cardIds = deck.cardIds
        } else {
            stateStore.opp.cardIds = deck.cardIds
        }
    } else {
        alert(`${who} Deck data not in any database! Set another deck!`);
        return;
    }
}

const sendMessage = () => {
    socket.emit("message", myMsg.value)

    updateLogMsg(myMsg.value, "Me");

    // clear input field
    myMsg.value = "";
}

const updateLogMsg = (msg, who) => {
    const logTime = new Date().toLocaleString();
    logMsg.value += logTime + ` >>> ${who}: ` + msg + "\n----------\n"
}

watch(() => currentMenu.value, async (newVal, oldVal) => {
    console.log("currentMenu", currentMenu.value)
    if (newVal == DECK_MENU) {
        if (allExampleDecks.value.length == 0) {
            const deckRes = await fetch(`${url}decks`)
            const deckData = await deckRes.json()
            allExampleDecks.value = deckData
            deckName.value = allExampleDecks.value[0].deckName

            const allCardsRes = await fetch(`${url}cards`)
            const allCardsData = await allCardsRes.json()
            allCards.value = allCardsData
            filteredCards.value = allCardsData

            filterSpecialty.value.forEach((specialty) => {
                specialty.checkOn = true
            })
            filterLevel.value.forEach((level) => {
                level.checkOn = true
            })
            filterOption.value.checkOn = false
            filterPartner.value.checkOn = false
        }
        // My deck
        myDecks.value = JSON.parse(localStorage.getItem(LOCAL_STORAGE_MY_DECKS_KEY))
    }
})

const editDeck = async (deck) => {
    console.log("deck", deck)
    if (!deck) {
        return;
    }

    selectedDeck.value = deck
    const cardRes = await fetch(`${url}cards/id=${selectedDeck.value.cardIds}`)
    const cardData = await cardRes.json()
    selectedDeckCards.value = cardData.sort()

    // init
    selectCard(selectedDeckCards.value[0])
    searchWord.value = ""
    filteredCards.value = allCards.value
    editDeckCards.value = selectedDeckCards.value
    editDeckName.value = deck.deckName
    deckName.value = deck.deckName

    // show
    selectMenu(EDIT_DECK)
}

const borderColor = (specialty) => {
    return specialtyToColor(specialty)[0]
}

const selectCard = (card) => {
    selectedCard.value = card
}

const searchNearest = () => {
    if (!searchWord.value) {
        filteredCards.value = allCards.value;
    } else {
        const suggestions = allCards.value.map((card) => ({
            ...card,
            distance: levenshtein(searchWord.value, card.name)
        }))
        suggestions.sort((a, b) => a.distance - b.distance);

        filteredCards.value = suggestions.slice(0, 15)
    }
}

const isAddDisabled = computed(() => {
    if (editDeckCards.value.length > 0) {
        return editDeckCards.value.filter(card => card.number == selectedCard.value.number).length >= 4 || editDeckCards.value.length >= 30
    } else {
        return false
    }
})

const isRemoveDisabled = computed(() => {
    return editDeckCards.value.filter(card => card.number == selectedCard.value.number).length == 0
})

const isPartner = computed(() => {
    return selectedCard.value.isPartner
})

const addCard = () => {
    if (editDeckCards.value.length < 30) {
        editDeckCards.value.push(selectedCard.value)
        editDeckCards.value.sort((a, b) => parseInt(a.number) - parseInt(b.number))
    }
}

const removeCard = () => {
    const index = editDeckCards.value.findIndex(card => card.number == selectedCard.value.number)
    if (index > -1) {
        editDeckCards.value.splice(index, 1)
    }
}

const applyMonsterFilter = () => {
    filterOption.value.checkOn = false
    filterPartner.value.checkOn = false
    filteredCards.value = allCards.value.filter((card) => {
        let specialty = false
        let level = false

        for (let i = 0; i < filterSpecialty.value.length; i++) {
            const filter = filterSpecialty.value[i];
            if (filter.checkOn && card.specialty == filter.specialty) {
                specialty = true
                break
            }
        }
        for (let i = 0; i < filterLevel.value.length; i++) {
            const filter = filterLevel.value[i];
            if (filter.checkOn && card.level == filter.level) {
                level = true
                break
            }
        }

        if (specialty && level) {
            return true
        } else {
            return false
        }
    })
}

const applyOptionFilter = () => {
    filterMonster.value.checkOn = false
    filterPartner.value.checkOn = false
    filteredCards.value = allCards.value.filter((card) => {
        if (filterOption.value.checkOn && parseInt(card.number) >= OPTION_NUMBER) {
            return true
        } else {
            return false
        }
    })
}

const applyPartnerFilter = () => {
    filterMonster.value.checkOn = false
    filterOption.value.checkOn = false
    filteredCards.value = allCards.value.filter((card) => {
        if (filterPartner.value.checkOn && card.isPartner) {
            return true
        } else {
            return false
        }
    })
}

const saveDeck = () => {
    // create new local storage item if didnt exist
    if (!localStorage.getItem(LOCAL_STORAGE_MY_DECKS_KEY)) {
        localStorage.setItem(LOCAL_STORAGE_MY_DECKS_KEY, JSON.stringify([]))
    }
    let myDecks = JSON.parse(localStorage.getItem(LOCAL_STORAGE_MY_DECKS_KEY))

    // deck to be saved
    let cardIds = [];
    let cardNamesArr = [];
    let specialtyArr = [...SPECIALTIES.map(e => ({ specialty: e, count: 0 }))];
    let armorDigivolve = {
        isAvailable: false,
        name: null,
    };
    for (let i = 0; i < editDeckCards.value.length; i++) {
        const card = editDeckCards.value[i];
        const id = parseInt(card.number)

        cardIds.push(id)

        const idCount = cardIds.filter(e => e == id).length
        if (idCount == 1) {
            cardNamesArr.push({
                name: card.name,
                count: idCount
            })
        } else if (idCount > 1) {
            cardNamesArr[cardNamesArr.findIndex(e => e.name == card.name)] = {
                name: card.name,
                count: idCount
            }
        }
        if (card.specialty) {
            let spIndex = specialtyArr.findIndex(e => e.specialty == card.specialty)
            specialtyArr[spIndex] = {
                specialty: card.specialty,
                count: specialtyArr[spIndex].count + 1
            }
        }
        if (card.isPartner) {
            armorDigivolve = {
                isAvailable: true,
                name: card.name
            }
        }
    }
    const cardNamesStr = cardNamesArr.map(e => `${e.count} ${e.name}`)
    const specialtyStr = specialtyArr.filter(e => e.count > 0).map(e => `${e.count} ${e.specialty}`).join(", ")

    // save to local storage
    let oldDeck = myDecks.find(deck => deck.deckName == editDeckName.value)
    if (oldDeck) {
        let updatedDeck = {
            ...oldDeck,
            armorDigivolve: {
                isAvailable: armorDigivolve.isAvailable,
                name: armorDigivolve.name,
            },
            cardIds: cardIds,
            cardNames: cardNamesStr,
            deckName: editDeckName.value,
            types: specialtyStr
        }
        myDecks[myDecks.findIndex(deck => deck.deckName == editDeckName.value)] = updatedDeck
    } else {
        const deckId = myDecks.length > 0 ? myDecks[myDecks.length - 1].deckId + 1 : 1000
        const newDeck = {
            armorDigivolve: {
                isAvailable: armorDigivolve.isAvailable,
                name: armorDigivolve.name,
            },
            cardIds: cardIds,
            cardNames: cardNamesStr,
            deckId: deckId,
            deckName: editDeckName.value,
            deckOwner: "User",
            types: specialtyStr
        }
        myDecks.push(newDeck)
    }
    localStorage.setItem(LOCAL_STORAGE_MY_DECKS_KEY, JSON.stringify(myDecks))

    // update deck name
    if (playerDeck.value == deckName.value) {
        playerDeck.value = editDeckName.value
    } else if (oppDeck.value == deckName.value) {
        oppDeck.value = editDeckName.value
    }
    deckName.value = editDeckName.value
}

const exitEditDeck = () => {
    selectMenu(DECK_MENU);
    jumpToDeck(deckName.value);
}

// decks view
const getSpecialtyCount = (deckSpecialty, specialty) => {
    if (deckSpecialty.includes(specialty)) {
        const arr = deckSpecialty.split(",").map(e => e.trim())
        if (arr.length == 1) {
            return 30
        } else if (arr.length > 1) {
            const spCount = arr.find(e => e.includes(specialty)).split(" ")[0]
            return spCount
        }
    } else {
        return 0
    }
}

const currentDecks = computed(() => {
    if (subMenu.value == MY_DECKS) {
        return myDecks.value
    } else {
        return allExampleDecks.value
    }
})

const jumpToDeck = (deckName) => {
    // change to deck menu if from home menu
    if (currentMenu.value == FREE_PLAY) {
        selectMenu(DECK_MENU)
    }

    // change deck submenu
    setTimeout(() => {
        if (myDecks.value.find(e => e.deckName == deckName)) {
            subMenu.value = MY_DECKS
        } else {
            subMenu.value = EXAMPLE_DECKS
        }
        // scroll to the deck
        setTimeout(() => {
            const deckBtn = document.getElementById(currentDecks.value.filter(e => e.deckName == deckName)[0].deckId)
            deckBtn.scrollIntoView({ behavior: "smooth", block: "start", inline: "nearest" })
            deckBtn.click()
        }, 100);
    }, 100);

}

</script>

<style scoped>
.main-menu {
    /* background-color: #183141; */
    background: url("../assets/background.png") repeat;
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

.title-text {
    text-shadow:
        -1px -1px 0 white,
        1px -1px 0 black,
        -1px 1px 0 black,
        1px 1px 0 black;
}

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
    background-image: url("../sprites/agumon.gif");
    background-repeat: no-repeat;
    background-size: cover;
}

.selected::after {
    position: absolute;
    top: 50%;
    right: 1%;
    content: "";
    width: 3rem;
    height: 3rem;
    transform: translate(-50%, -50%);
    background-image: url("../sprites/agumon.gif");
    background-repeat: no-repeat;
    background-size: cover;
}

.card {
    position: relative;
    border-style: solid;
    border-width: 0.5vh;
}

.card:hover {
    border-width: 0;
}

.card-img-lvl {
    position: absolute;
    top: 0%;
    left: 3%;
    line-height: 1em;
    color: white;
    font-size: 1.5vw;
}

.home-deck:hover::after {
    width: min-content;
    height: min-content;
    content: " ⇒ CHANGE";
    color: red
}

.black-text-shadow {
    text-shadow: -1px -1px 0 #000000, 0 -1px 0 #000000, 1px -1px 0 #000000,
        1px 0 0 #000000, 1px 1px 0 #000000, 0 1px 0 #000000, -1px 1px 0 #000000,
        -1px 0 0 #000000;
}
</style>