// local client states
import { defineStore } from "pinia";
import { useGameDataStore } from "./gameData";

const LOCAL_STORAGE_PLAY_DECK_KEY = "playDeckId";
const LOCAL_STORAGE_OPPONENT_PLAY_DECK_KEY = "opponentPlayDeckId";
const LOCAL_STORAGE_ONLINE_PLAY_DECK_KEY = "onlinePlayDeckId";
const LOCAL_STORAGE_MY_DECKS_KEY = "myDecks";
const DEFAULT_PLAYER_DECK_ID = "137"; // practice deck; refer to all-base-decks.json
const DEFAULT_CPU_DECK_ID = "1"; // tutorial betamon deck; refer to all-base-decks.json

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
    player: {
      id: "",
      name: ""
    },
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
      // load player profile (name, id)
      const player = await this.getPlayerProfile();
      this.player = player;

      // Load my decks from local storage
      if (localStorage.getItem(LOCAL_STORAGE_MY_DECKS_KEY)) {
        const myDecks = JSON.parse(
          localStorage.getItem(LOCAL_STORAGE_MY_DECKS_KEY)
        );
        this.playerDecks = myDecks;
      } else {
        // TODO: in the case of first time player, there shouldnt be any deck saved yet.
        // so either fill in betamon tutorial deck or make it empty and let the player choose their deck.
        // for the latter, i need to add null check to all /play/cpu components to display empty deck.
        const newDeck = await this.createNewDeckForLocalStorage();
        // create new local storage item with user-userA.json deckId=137
        localStorage.setItem(
          LOCAL_STORAGE_MY_DECKS_KEY,
          JSON.stringify([newDeck])
        );
      }

      // Load latest VS CPU Player Deck ID from local storage(TODO: fetch from firebase auth)
      const vsCpuPlayerDeckId =
        localStorage.getItem(LOCAL_STORAGE_PLAY_DECK_KEY) ??
        DEFAULT_PLAYER_DECK_ID;
      await this.updateVsCpuPlayerDeck(vsCpuPlayerDeckId);
      // Load latest VS CPU Opponent Deck ID from local storage(TODO: fetch from firebase auth)
      const vsCpuOpponentDeckId =
        localStorage.getItem(LOCAL_STORAGE_OPPONENT_PLAY_DECK_KEY) ??
        DEFAULT_CPU_DECK_ID;
      await this.updateVsCpuOpponentDeck(vsCpuOpponentDeckId);
      // Load latest VS Player Deck ID from local storage (TODO: fetch from firebase auth)
      const vsPlayerDeckId =
        localStorage.getItem(LOCAL_STORAGE_ONLINE_PLAY_DECK_KEY) ??
        DEFAULT_PLAYER_DECK_ID;
      await this.updateVsPlayerDeck(vsPlayerDeckId);
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

      // if deck is not found in player created decks, search in prebuild decks
      if (!deck) {
        const deckData = useGameDataStore().prebuildDecks;
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
    
    // get player profile
    async getPlayerProfile() {
      // TODO: fetch from firebase when available
      const player = {
        id: "localPlayer",
        name: "User"
      }
      return player;
    },
    
    // create new deck for local storage for new users
    async createNewDeckForLocalStorage() {
      const deck = this.findDeckById(DEFAULT_PLAYER_DECK_ID);
      return deck;
    }
  },
});
