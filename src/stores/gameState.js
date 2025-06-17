import { defineStore } from "pinia";
import { PLAYER_TYPES, CARD_STATE } from "../const/const";
import { ref, reactive, computed, shallowRef } from "vue"; // reactive for nested objects if preferred

// Define constants for game phases (enhances readability)
export const PHASE = {
  PRE_GAME: -1,
  DRAW: 1,
  REDRAW: 1.5,
  ENTRANCE: 2,
  RACK_UP_DP: 3,
  DIGIVOLVE_SPECIAL: 3.5,
  DIGIVOLVE: 4,
  CHOOSE_ATTACK: 5,
  SUPPORT1: 6,
  SUPPORT2: 6.5,
  BATTLE: 7,
  END: 0,
};

// phases we go through by "Next Phase" button click
// REDRAW is only triggered by "Redraw" button click
const PHASE_SEQUENCE = [
  PHASE.PRE_GAME,
  PHASE.DRAW,
  PHASE.ENTRANCE,
  PHASE.RACK_UP_DP,
  PHASE.DIGIVOLVE_SPECIAL,
  PHASE.DIGIVOLVE,
  PHASE.CHOOSE_ATTACK,
  PHASE.SUPPORT1,
  PHASE.SUPPORT2,
  PHASE.BATTLE,
  PHASE.END,
];

export const useGameStateStore = defineStore("gameState", {
  state: () => ({
    // --- Core Game State ---
    gameId: "",
    turnNumber: 0, // tracks the overall turn number in the game
    phase: PHASE.PRE_GAME, // current phase of the game
    currentTurnActor: null, // ID or reference to who's turn it is ('player' or 'opponentId')
    // --- Player and Opponent Information ---
    player: {
      id: "localPlayer", // get from firebase auth when available
      name: "",
      type: PLAYER_TYPES.HUMAN,
      deck: null, // same deck object structure as in DeckBuilder
      cards: [],
      hand: [],
      offline: [],
      isReady: false,
      loseCount: 0,
    },
    opponent: {
      id: "", // get from firebase auth when available
      name: "",
      type: PLAYER_TYPES.CPU_EASY,
      deck: null,
      cards: [],
      hand: [],
      offline: [],
      isReady: false,
      loseCount: 0,
    },
    // --- Turn/Battle Specifics ---
    turnActions: {
      currentTurnFirstAttacker: null,
      // Could expand this to include chosen cards, targets, etc. for the current turn's actions
      // may or may not be needed depending on game mechanics
      playerAction: null, // e.g., { cardId: 'xyz', targetId: 'abc' }
      opponentAction: null,
    },
  }),
  // remember: this is basically computed properties
  getters: {
    currentTurnFirstAttacker: (state) =>
      state.turnActions.currentTurnFirstAttacker,
    // deck
    playerDeck() {
      return this.player.cards.filter(card => card.state === CARD_STATE.DECK);
    },
    opponentDeck() {
      return this.opponent.cards.filter(card => card.state === CARD_STATE.DECK);
    },
    playerDeckCount() {
        return this.playerDeck.length;
    },
    opponentDeckCount() {
        return this.opponentDeck.length;
    },
    // hand
    playerHand() {
      return this.player.cards.filter(card => card.state === CARD_STATE.HAND);
    },
    opponentHand() {
      return this.opponent.cards.filter(card => card.state === CARD_STATE.HAND);
    },
    playerHandCount() {
      return this.playerHand.length;
    },    
    opponentHandCount() {
      return this.opponentHand.length;
    },
    // offline
    playerOffline() {
        return this.player.cards.filter(card => card.state === CARD_STATE.OFFLINE);
    },
    opponentOffline() {
        return this.opponent.cards.filter(card => card.state === CARD_STATE.OFFLINE);
    },
    playerOfflineCount() {
        return this.playerOffline.length;
    },
    opponentOfflineCount() {
        return this.opponentOffline.length;
    },
    // DP
    playerDpCount() {
        return this.player.cards.filter(card => card.state === CARD_STATE.DP).length;
    },
    opponentDpCount() {
        return this.opponent.cards.filter(card => card.state === CARD_STATE.DP).length;
    },
    playerActiveMonster() {
        const activeMonster = this.player.cards.filter(card => card.state === CARD_STATE.ACTIVE);
        return activeMonster.length > 0 ? activeMonster[0] : placeholderActiveMonster;
    },
    opponentActiveMonster() {
        const activeMonster = this.opponent.cards.filter(card => card.state === CARD_STATE.ACTIVE);
        return activeMonster.length > 0 ? activeMonster[0] : placeholderActiveMonster;
    },
    playerAttackChoice() {
        return placeholderAttackChoice;
    },
    opponentAttackChoice() {
        return placeholderAttackChoice;
    },
    nextPhase() {
      return PHASE_SEQUENCE[PHASE_SEQUENCE.indexOf(this.phase) + 1];
    },
    isPlayerTurn() {
      return this.currentTurnActor === this.player.id;
    }
  },
  actions: {
    resetGame() {
      this.phase = PHASE.PRE_GAME;
      this.currentTurnActor = null;
      this.turnNumber = 0;

      // Reset player
      this.player.name = ""; // Or to a default if logged in
      this.player.deck = null;
      this.player.isReady = false;
      this.player.loseCount = 0;

      // Reset opponent
      this.opponent.name = "CPU";
      this.opponent.type = PLAYER_TYPES.CPU_EASY;
      this.opponent.deck = null;
      this.opponent.isReady = false;
      this.opponent.loseCount = 0;

      // Reset turn actions
      this.turnActions.currentTurnFirstAttacker = null;
      this.turnActions.playerAction = null;
      this.turnActions.opponentAction = null;
    },

    setPlayerDetails(name, deck, cards) {
      this.player.name = name;
      this.player.deck = deck;
      this.player.cards = cards;
    },

    setOpponentDetails(id, name, type, deck, cards) {
      this.opponent.id = id;
      this.opponent.name = name;
      this.opponent.type = type;
      this.opponent.deck = deck;
      this.opponent.cards = cards;
      this.opponent.loseCount = 0;
    },
    setFirstTurnActor(actorId) {
      console.log("actorId", actorId)
      this.currentTurnActor = actorId;
    },
    // game flow
    setPhase(newPhase) { // PERLU?
      this.phase = newPhase;
    },
    gotoNextPhase() {
      const currentPhaseIndex = PHASE_SEQUENCE.indexOf(this.phase);
      let nextPhaseIndex = currentPhaseIndex + 1;
      if (nextPhaseIndex >= PHASE_SEQUENCE.length) {
        this.gotoNextTurn();
        return;
      }
      const nextPhase = PHASE_SEQUENCE[nextPhaseIndex];
      this.phase = nextPhase;
    },
    gotoNextTurn() {
      this.currentTurnActor = this.currentTurnActor === this.player.id ? this.opponent.id : this.player.id;
      this.turnNumber++;
      this.phase = PHASE.DRAW;
    },
    updateCardStatus(actorId, cardUuid, newState) {
      if (actorId == this.player.id) {
        const index = this.player.cards.findIndex(card => card.uuid == cardUuid)
        this.player.cards[index].state = newState;
      } else {
        const index = this.opponent.cards.findIndex(card => card.uuid == cardUuid)
        this.opponent.cards[index].state = newState;
      }
    },
  },
});

const placeholderActiveMonster = {
    name: "",
    cAttack: "",
    tAttack: "",
    xAttack: "",
    xEffect: "",
    hp: "",
}

const placeholderAttackChoice = {
  name: "",
  hp: "",
  level: "",
  specialty: "",
  cAttack: "",
  tAttack: "",
  xAttack: "",
  xEffect: "",
  cPow: "",
  tPow: "",
  xPow: "",
  xEffectSpeed: "",
}