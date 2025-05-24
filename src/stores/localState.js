// local client states
import { defineStore } from "pinia";

const LOCAL_STORAGE_PLAY_DECK_KEY = "playDeckId";
const LOCAL_STORAGE_OPPONENT_PLAY_DECK_KEY = "opponentPlayDeckId";
const LOCAL_STORAGE_ONLINE_PLAY_DECK_KEY = "onlinePlayDeckId";
const LOCAL_STORAGE_MY_DECKS_KEY = "myDecks";

const deck = {
  armorDigivolve: {},
  cardIds: [],
  cardNames: [],
  deckId: "",
  deckName: "",
  deckOwner: "",
  types: "",
};

export const useLocalStateStore = defineStore("localState", {
  state: () => ({
    vsCpuPlayerDeck: JSON.parse(JSON.stringify(deck)),
    vsCpuOpponentDeck: JSON.parse(JSON.stringify(deck)),
    vsPlayerDeck: JSON.parse(JSON.stringify(deck)),
    playerDecks: [],
    musicVolume: "",
  }),
  getters: {
    vsCpuPlayerDeckId() {
      return this.vsCpuPlayerDeck.deckId;
    },
    vsCpuOpponentDeckId() {
      return this.vsCpuOpponentDeck.deckId;
    },
    vsPlayerDeckId() {
      return this.vsPlayerDeck.deckId;
    },
  },
  actions: {
    // initialize local state from local storage
    async init() {
      // Load my decks from local storage
      if (localStorage.getItem(LOCAL_STORAGE_MY_DECKS_KEY)) {
        const myDecks = JSON.parse(
          localStorage.getItem(LOCAL_STORAGE_MY_DECKS_KEY)
        );
        this.playerDecks = myDecks;
      } else {
        // create new local storage item if didnt exist
        localStorage.setItem(LOCAL_STORAGE_MY_DECKS_KEY, JSON.stringify([]));
      }

      // Load current VS CPU Player Deck ID from local storage
      const vsCpuPlayerDeckId = localStorage.getItem(
        LOCAL_STORAGE_PLAY_DECK_KEY
      );
      const vsCpuOpponentDeckId = localStorage.getItem(
        LOCAL_STORAGE_OPPONENT_PLAY_DECK_KEY
      );
      const vsPlayerDeckId = localStorage.getItem(
        LOCAL_STORAGE_ONLINE_PLAY_DECK_KEY
      );
      if (vsCpuPlayerDeckId) {
        await this.updateVsCpuPlayerDeck(vsCpuPlayerDeckId);
      }
      if (vsCpuOpponentDeckId) {
        await this.updateVsCpuOpponentDeck(vsCpuOpponentDeckId);
      }
      if (vsPlayerDeckId) {
        await this.updateVsPlayerDeck(vsPlayerDeckId);
      }
    },
    // update current VS CPU Player Deck ID
    async updateVsCpuPlayerDeck(deckId) {
      localStorage.setItem(LOCAL_STORAGE_PLAY_DECK_KEY, deckId);
      this.vsCpuPlayerDeck = await this.findDeckById(deckId);
    },
    // update current VS CPU Opponent Deck ID
    async updateVsCpuOpponentDeck(deckId) {
      localStorage.setItem(LOCAL_STORAGE_OPPONENT_PLAY_DECK_KEY, deckId);
      this.vsCpuOpponentDeck = await this.findDeckById(deckId);
    },
    // update current VS Player Deck ID
    async updateVsPlayerDeck(deckId) {
      localStorage.setItem(LOCAL_STORAGE_ONLINE_PLAY_DECK_KEY, deckId);
      this.vsPlayerDeck = await this.findDeckById(deckId);
    },
    // delete selected deck
    deleteDeck(deckId) {
      this.playerDecks = this.playerDecks.filter(
        (deck) => deck.deckId !== deckId
      );
      localStorage.setItem(
        LOCAL_STORAGE_MY_DECKS_KEY,
        JSON.stringify(this.playerDecks)
      );
    },
    // find deck by Id
    async findDeckById(deckId) {
      let deck = this.playerDecks.find((deck) => deck.deckId == deckId);

      // if deck is not found in player created decks, fetch prebuild decks from the server
      if (!deck) {
        const url = "http://localhost:3005/api/";
        const deckRes = await fetch(`${url}decks`);
        const deckData = await deckRes.json();
        deck = deckData.find((deck) => deck.deckId == deckId);
      }
      return deck;
    },
    // update my decks
    updatePlayerDecks(decks) {
      this.playerDecks = decks;
      localStorage.setItem(
        LOCAL_STORAGE_MY_DECKS_KEY,
        JSON.stringify(this.playerDecks)
      );
    },
  },
});
