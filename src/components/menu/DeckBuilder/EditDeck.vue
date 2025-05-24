<template>
    <div class="flex flex-col items-center justify-center h-screen">
        <p class="text-center text-5xl text-sky-400 mb-4 title-text">Edit Deck</p>
        <div
            class="flex flex-col w-[1500px] h-[80vh] bg-gradient-to-br from-sky-300 to-sky-400 rounded-3xl shadow-2xl border-4 border-sky-300/50 p-6">
            <!-- Deck Name Input Row -->
            <div class="flex flex-row w-full justify-between mb-4 gap-4">
                <input type="text" v-model="editDeckName"
                    class="text-sky-800 text-2xl font-bold px-4 py-2 rounded-lg w-2/3 focus:outline-none focus:ring-2 focus:ring-sky-500"
                    placeholder="Deck Name" />
                <div class="flex justify-end">
                    <button
                        class="px-6 py-2 mr-2 bg-sky-600 hover:bg-sky-700 text-white rounded-lg shadow-md transition-all"
                        @mouseenter="playHoverSound" @click="saveAsNewDeck">
                        Save as New Deck
                    </button>
                    <button class="px-6 py-2 rounded-lg transition-all"
                        :class="isNew || !isMyDeck ? 'bg-gray-300' : 'bg-sky-600 hover:bg-sky-700 text-white shadow-md'"
                        @mouseenter="playHoverSound" @click="saveChanges" :disabled="isNew || !isMyDeck">
                        Save Changes
                    </button>
                </div>
            </div>

            <!-- Main Content Area -->
            <div class="flex flex-row gap-4 w-full h-full">
                <!-- Left Column: Deck Building -->
                <div class="w-2/3 bg-sky-100/90 rounded-xl p-4 shadow-inner">
                    <!-- Card Preview -->
                    <div class="bg-sky-700/90 rounded-lg p-4 mb-4 text-white">
                        <!-- Card Details Section -->
                        <div class="flex flex-row w-full justify-start text-3xl">
                            {{ selectedCard.number }}
                            {{ selectedCard.level }}
                            {{ selectedCard.specialty ? "Type" : "" }}
                            <img v-if="selectedCard.specialty" :src="specialtyToImg(selectedCard.specialty)"
                                :class="specialtyToClass(selectedCard.specialty)" class="ml-2 mr-8 w-[1vw]"
                                :alt="selectedCard.name" />
                            {{ buttonToSymbol(selectedCard.name) }}
                            <span>
                            </span>
                        </div>
                        <div class="flex flex-row" v-if="Object.keys(selectedCard).length > 0">
                            <img :src="`/src/sprites/common/${selectedCard.number}.png`" alt="Card Image"
                                class="w-[6vw] h-[6vw] m-1 border-solid border-2 border-white" />
                            <div class="flex flex-col min-w-[10vw] text-2xl ml-4">
                                <div>HP {{ selectedCard.hp || "-" }}</div>
                                <div><span class="text-red-500 font-bold">〇</span> {{ selectedCard.c_pow || "-" }}
                                </div>
                                <div><span class="text-green-500 font-bold">△</span> {{ selectedCard.t_pow || "-" }}
                                </div>
                                <div><span class="text-blue-900 font-bold">Ⓧ</span> {{ selectedCard.x_pow || "-" }}
                                </div>
                                {{ buttonToSymbol(selectedCard.x_effect) }}<br>
                            </div>
                            <div class="flex flex-col text-2xl ml-4">
                                <p>DP {{ selectedCard.dp }} +P {{ selectedCard.pp }}<br>
                                    <span class="text-yellow-200">Support Effect</span><br>
                                    {{ buttonToSymbol(selectedCard.support || selectedCard.effect) }}
                                </p>
                            </div>
                        </div>
                        <hr>
                        <div class="flex-row mt-2 text-xl">
                            <button :disabled="isAddDisabled"
                                :class="{ 'bg-stone-700': isAddDisabled, 'hover:bg-sky-800 bg-sky-600 ': !isAddDisabled }"
                                class="rounded-md min-h-max min-w-max border-solid border-2 border-sky-200 px-[1vw] mx-1"
                                @mouseenter="!isAddDisabled && playHoverSound()" @click="addCard">Add Card</button>
                            <button :disabled="isRemoveDisabled"
                                :class="{ 'bg-stone-700': isRemoveDisabled, 'hover:bg-sky-800 bg-sky-600 ': !isRemoveDisabled }"
                                @mouseenter="!isRemoveDisabled && playHoverSound()"
                                class="rounded-md min-h-max min-w-max border-solid border-2 border-sky-200 px-[1vw] mx-1"
                                @click="removeCard">Remove Card</button>
                            <button :disabled="!isPartner"
                                :class="{ 'bg-stone-700': !isPartner, 'hover:bg-sky-800 bg-sky-600 ': isPartner }"
                                @mouseenter="isPartner && playHoverSound()"
                                class="rounded-md min-h-max min-w-max border-solid border-2 border-sky-200 px-[1vw] mx-1">Set
                                Armor Digivolve (WIP)</button>
                        </div>
                    </div>

                    <!-- Deck Cards Grid -->
                    <div class="grid grid-cols-10 bg-sky-200/50 rounded-lg  overflow-y-auto">
                        <button v-for="card in editDeckCards" :key="card.number" @mouseenter="hoverCard(card)"
                            :style="{ 'border-color': `${borderColor(card.specialty)}` }" :class="[
                                'card rounded-md w-[3vw] h-[3vw] text-white font-semibold bg-sky-600 hover:bg-sky-800 border-solid border-2 border-sky-200 m-1 hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200',
                                { 'animate-pulse ring-4 ring-yellow-400 ring-opacity-50': isCardLocked && lockedCard.number === card.number }
                            ]">
                            <img :src="`/src/sprites/common/${card.number}.png`" class="w-[3vw]"
                                @click="selectCard(card)" />
                            <p class="card-img-lvl">{{ card.level || "" }}</p>
                        </button>
                    </div>
                    <div v-if="editDeckCards && editDeckCards.length > 0"
                        class="text-right text-sky-900 font-bold text-2xl mt-2">
                        {{ editDeckCards.length }}/30 Cards
                    </div>
                    <div v-else class="text-center text-sky-900 font-bold text-2xl mt-2">Select and Add Card From the
                        List >>></div>
                </div>

                <!-- Right Column: Search & Filter -->
                <div class="w-1/3 bg-sky-100/90 rounded-xl p-4 shadow-inner">
                    <!-- Search Bar -->
                    <div class="flex gap-2 mb-4">
                        <input type="text"
                            class="w-full px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                            v-model="searchWord" placeholder="Search cards..." @keyup.enter="searchNearest"
                            @input="searchNearest" />
                        <button
                            class="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-lg shadow-md transition-all"
                            @click="searchNearest">
                            Search
                        </button>
                    </div>

                    <!-- Filter Section -->
                    <div class="flex flex-row w-full">
                        <div class="py-1">
                            <button @click="() => showFilterMenu = !showFilterMenu"
                                class="p-2 cursor-pointer bg-sky-600 hover:bg-sky-800 rounded-lg text-white"
                                :class="{ 'bg-sky-800': showFilterMenu }">Filter</button>
                            <!-- Filter menu -->
                            <div v-if="showFilterMenu"
                                class="absolute z-10 bg-gradient-to-br from-sky-700 to-sky-800 rounded-xl w-[300px] shadow-lg p-4 border-2 border-sky-300/50">
                                <div class="flex flex-row gap-4">
                                    <!-- Radio filters -->
                                    <div class="flex flex-col gap-2 border-r-2 border-sky-300/30 pr-4">
                                        <div
                                            class="flex items-center p-2 rounded-lg hover:bg-sky-600 transition-colors">
                                            <input type="radio" :id="filterMonster.label" name="filter"
                                                v-model="filterMonster.checkOn" :checked="filterMonster.checkOn"
                                                @change="applyMonsterFilter()" class="w-4 h-4 accent-sky-400" />
                                            <label :for="filterMonster.label" class="ml-2 text-white cursor-pointer">
                                                {{ filterMonster.label }}
                                            </label>
                                        </div>
                                        <div
                                            class="flex items-center p-2 rounded-lg hover:bg-sky-600 transition-colors">
                                            <input type="radio" :id="filterOption.label" name="filter"
                                                v-model="filterOption.checkOn" :checked="filterOption.checkOn"
                                                @change="applyOptionFilter()" class="w-4 h-4 accent-sky-400" />
                                            <label :for="filterOption.label" class="ml-2 text-white cursor-pointer">
                                                {{ filterOption.label }}
                                            </label>
                                        </div>
                                        <div
                                            class="flex items-center p-2 rounded-lg hover:bg-sky-600 transition-colors">
                                            <input type="radio" :id="filterPartner.label" name="filter"
                                                v-model="filterPartner.checkOn" :checked="filterPartner.checkOn"
                                                @change="applyPartnerFilter()" class="w-4 h-4 accent-sky-400" />
                                            <label :for="filterPartner.label" class="ml-2 text-white cursor-pointer">
                                                {{ filterPartner.label }}
                                            </label>
                                        </div>
                                    </div>

                                    <!-- Monster Filters -->
                                    <div class="flex flex-row gap-3">
                                        <!-- Specialty Filters -->
                                        <div class="flex flex-col gap-1">
                                            <div v-for="filter in filterSpecialty"
                                                class="flex items-center p-1 rounded hover:bg-sky-600 transition-colors">
                                                <input type="checkbox" :disabled="!filterMonster.checkOn"
                                                    :id="filter.specialty" v-model="filter.checkOn"
                                                    :checked="filter.checkOn" @change="applyMonsterFilter()"
                                                    class="w-4 h-4 accent-sky-400" />
                                                <label :for="filter.specialty"
                                                    class="ml-2 text-white cursor-pointer whitespace-nowrap">
                                                    {{ filter.specialty }}
                                                </label>
                                            </div>
                                        </div>
                                        <!-- Level Filters -->
                                        <div class="flex flex-col gap-1">
                                            <div v-for="filter in filterLevel"
                                                class="flex items-center p-1 rounded hover:bg-sky-600 transition-colors">
                                                <input type="checkbox" :disabled="!filterMonster.checkOn"
                                                    :id="filter.level" v-model="filter.checkOn"
                                                    :checked="filter.checkOn" @change="applyMonsterFilter()"
                                                    class="w-4 h-4 accent-sky-400" />
                                                <label :for="filter.level" class="ml-2 text-white cursor-pointer">
                                                    {{ filter.level }}
                                                </label>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Results List -->
                    <div class="bg-sky-200/50 rounded-lg p-2 h-[50vh] overflow-y-auto">
                        <svg v-if="filteredCards.length == 0" class="animate-spin h-5 w-5 m-3"></svg>
                        <button v-for="card in filteredCards" :key="card.number"
                            class="flex flex-row justify-start w-full text-xl border-white border-solid border-2 hover:bg-sky-800 hover:text-white mt-1 pl-1"
                            @mouseenter="hoverCard(card)" @click="selectCard(card)">
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

            <!-- Back Button -->
            <BackButton class="mt-4" @click="router.back()" />
        </div>
    </div>
    <!-- Confirmation Dialog -->
    <ConfirmDialog :is-open="isDialogOpen" :message="dialogMessage" @confirm="handleConfirm" @cancel="handleCancel" />
    <!-- Message Toast -->
    <MessageToast ref="messageToast" />
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import { onBeforeRouteLeave, useRoute, useRouter } from 'vue-router';
import { specialtyToColor, specialtyToImg, specialtyToClass, buttonToSymbol } from "/src/utils/mapper";
import * as levenshtein from "js-levenshtein"
import BackButton from '../../common/BackButton.vue';
import { playSelectClickSound, playHoverSound } from '../../../utils/audio';
import ConfirmDialog from '../../common/ConfirmDialog.vue';
import { useConfirmDialog } from '../../../composables/useConfirmDialog';
import { useLocalStateStore } from '../../../stores/localState';
import MessageToast from '../../common/MessageToast.vue';

defineProps({
    id: {
        type: String,
        required: true,
    },
    isNewDeck: {
        type: String,
        required: true,
    },
})

const route = useRoute();
const router = useRouter();

const { isDialogOpen, dialogMessage, showDialog, handleConfirm, handleCancel } = useConfirmDialog()

const allCards = ref([])
const filteredCards = ref([]);
const searchWord = ref("");
const deckName = ref("");
const selectedCard = ref({});
const editDeckName = ref("")
const editDeckCards = ref([])
const isCardLocked = ref(false)
const lockedCard = ref({})
const deckId = ref("")
const localStateStore = useLocalStateStore()

const LOCAL_STORAGE_MY_DECKS_KEY = "myDecks"
const SPECIALTIES = ["Fire", "Ice", "Nature", "Darkness", "Rare"]

const isNew = ref(false)
const isMyDeck = ref(true)

// Filtering
const OPTION_NUMBER = 191
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

const url = "http://localhost:3005/api"
const hasUnsavedChange = ref(false);
const messageToast = ref(null);

onMounted(async () => {
    isNew.value = route.query.isNewDeck === "true";
    deckId.value = route.query.id;

    // Set initial filter values
    const allCardsRes = await fetch(`${url}/cards`)
    const allCardsData = await allCardsRes.json()
    allCards.value = allCardsData
    filteredCards.value = allCardsData

    if (isNew.value) {
        return;
    }

    // Get deck from localStorage first
    const localDecks = localStateStore.playerDecks;
    let deck = localDecks?.find(d => d.deckId === parseInt(deckId.value));

    // If not in localStorage, fetch from API
    if (!deck) {
        const prebuildDecksRes = await fetch(`${url}/decks`)
        const prebuildDecksData = await prebuildDecksRes.json();
        // const response = await fetch(`${url}/decks/${deckId.value}`);
        deck = prebuildDecksData.find(d => d.deckId === parseInt(deckId.value));

        isMyDeck.value = false;
    }

    // Fetch card details for the deck
    const cardRes = await fetch(`${url}/cards/id=${deck.cardIds}`);
    const cardData = await cardRes.json();
    editDeckCards.value = cardData.sort((a, b) => parseInt(a.number) - parseInt(b.number));

    // Set initial selected card
    if (editDeckCards.value.length > 0) {
        selectedCard.value = editDeckCards.value[0];
    }

    searchWord.value = ""
    editDeckName.value = deck.deckName
    deckName.value = deck.deckName
});

const hoverCard = (card) => {
    if (isCardLocked.value) {
        return;
    }
    playHoverSound();
    selectedCard.value = card;
}

const selectCard = (card) => {
    playHoverSound();

    // If the previously selected card is the same as the current one, unlock the card
    if (lockedCard.value.number == card.number) {
        isCardLocked.value = false;
        lockedCard.value = {};
        return;
    }
    isCardLocked.value = true;
    lockedCard.value = card;
    selectedCard.value = card;
};

const isAddDisabled = computed(() => {
    if (isNew.value && Object.keys(selectedCard.value).length == 0) {
        return true
    }
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
    playSelectClickSound()
    if (editDeckCards.value.length < 30) {
        hasUnsavedChange.value = true;
        editDeckCards.value.push(selectedCard.value)
        editDeckCards.value.sort((a, b) => parseInt(a.number) - parseInt(b.number))
    }
}

const removeCard = () => {
    playSelectClickSound()
    const index = editDeckCards.value.findIndex(card => card.number == selectedCard.value.number)
    if (index > -1) {
        hasUnsavedChange.value = true;
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

const borderColor = (specialty) => {
    return specialtyToColor(specialty)[0]
}

const searchNearest = () => {
    if (!searchWord.value || searchWord.value.trim() === "") {
        filteredCards.value = allCards.value;
    } else {
        const searchTerm = searchWord.value.toLowerCase().trim();

        // First get prefix/substring matches
        const prefixMatches = allCards.value.filter((card) => card.name.toLowerCase().includes(searchTerm));

        // Then get fuzzy matches for remaining cards
        const remainingCards = allCards.value.filter((card) => !prefixMatches.includes(card));

        const fuzzyMatches = remainingCards.map((card) => ({
            ...card,
            distance: levenshtein(searchTerm, card.name.toLowerCase())
        }))
            .filter(card => card.distance < 5)
            .sort((a, b) => a.distance - b.distance)

        // Combin results with prefix matches first
        filteredCards.value = [...prefixMatches, ...fuzzyMatches].slice(0, 15);
    }
}

const saveChanges = () => {
    playSelectClickSound();

    const saveAsNew = true
    saveDeck(!saveAsNew)
}

const saveDeck = async (isSavedAsNew) => {

    // check if deck has 30 cards
    if (editDeckCards.value.length < 30) {
        messageToast.value.show("Deck must have 30 cards")
        return;
    }

    // save confirmation
    const shouldProceed = await showDialog("Are you sure you want to save this deck?");
    if (!shouldProceed) {
        return;
    }

    // prepare the deck to save
    let myDecks = localStateStore.playerDecks
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
    let oldDeck = myDecks.find(deck => deck.deckId == deckId.value)
    // save changes to current deck
    if (!isSavedAsNew) {
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
        myDecks[myDecks.findIndex(deck => deck.deckId == deckId.value)] = updatedDeck
    } else { // save as new deck
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
    localStateStore.updatePlayerDecks(myDecks)

    // update deck name
    // if (playerDeck.value == deckName.value) {
    //     playerDeck.value = editDeckName.value
    // } else if (oppDeck.value == deckName.value) {
    //     oppDeck.value = editDeckName.value
    // }
    deckName.value = editDeckName.value
    hasUnsavedChange.value = false

    // show success message
    messageToast.value.show("Deck saved successfully!")
}

const saveAsNewDeck = () => {
    playSelectClickSound();

    // check if deck name has been changed
    if (editDeckName.value == deckName.value) {
        messageToast.value.show("Please create a new name deck name to create a new deck")
        return;
    }

    const saveAsNew = true
    saveDeck(saveAsNew)
}

onBeforeRouteLeave(async (to, from, next) => {
    if (hasUnsavedChange.value) {
        const shouldProceed = await showDialog("Are you sure you want to leave this page? Your changes will not be saved.")
        if (!shouldProceed) {
            next(false)
            return;
        }
    }
    next()
})
</script>

<style scoped>
.title-text {
    text-shadow:
        -1px -1px 0 white,
        1px -1px 0 black,
        -1px 1px 0 black,
        1px 1px 0 black;
}

.card {
    position: relative;
    border-style: solid;
    border-width: calc(0.05 * 3vw);
}

/* .card:hover {
    border-width: 0;
} */

.card-img-lvl {
    position: absolute;
    top: 0%;
    left: 3%;
    line-height: 1em;
    color: white;
    font-size: 1vw;
}
</style>
