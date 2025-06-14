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

const PHASE_SEQUENCE = [
  PHASE.DRAW,
  PHASE.REDRAW,
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

export const GAME_PHASES = {
  PRE_GAME: "PRE_GAME", // Or 'MAIN_MENU' if showMainMenu is tied to this
  SETUP: "SETUP", // Players choosing decks, etc.
  PLAYER_TURN_PLANNING: "PLAYER_TURN_PLANNING",
  OPPONENT_TURN_PLANNING: "OPPONENT_TURN_PLANNING",
  BATTLE_RESOLUTION: "BATTLE_RESOLUTION",
  GAME_OVER: "GAME_OVER",
};

export const useGameStateStore = defineStore("gameState", {
  state: () => ({
    // --- Core Game State ---
    gameId: "",
    turnNumber: 0, // tracks the overall turn number in the game
    phase: GAME_PHASES.PRE_GAME, // current phase of the game
    currentTurnActor: null, // ID or reference to who's turn it is ('player' or 'opponentId')
    // --- Player and Opponent Information ---
    player: {
      id: "localPlayer", // get from firebase auth when available
      name: "",
      type: PLAYER_TYPES.HUMAN,
      deck: null, // same deck object structure as in DeckBuilder
      cards: [],
      hand: [],
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
    playerDeck() {
      return this.player.cards.filter(card => card.state === CARD_STATE.DECK);
    },
    playerDeckCount() {
        return this.playerDeck.length;
    },
    opponentDeckCount() {
        return this.opponent.cards.filter(card => card.state === CARD_STATE.DECK).length;
    },
    playerOfflineCount() {
        return this.player.cards.filter(card => card.state === CARD_STATE.OFFLINE).length;
    },
    opponentOfflineCount() {
        return this.opponent.cards.filter(card => card.state === CARD_STATE.OFFLINE).length;
    },
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
    topMostClickedCard() {
      return this.clickedBuffer.length > 0 ? this.clickedBuffer[0] : null;
    },
    playerAttackChoice() {
        return placeholderAttackChoice;
    },
    opponentAttackChoice() {
        return placeholderAttackChoice;
    },
    playerHandCount() {
      return this.player.hand.length;
    },    
    opponentHandCount() {
      return this.opponent.hand.length;
    },
    nextPhase() {
      return PHASE_SEQUENCE[PHASE_SEQUENCE.indexOf(this.phase) + 1];
    }
  },
  actions: {
    resetGame() {
      this.phase = GAME_PHASES.PRE_GAME;
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
    // game flow
    setPhase(newPhase) { // PERLU?
      this.phase = newPhase;
    },
    async setNextPhase() {
      if (this.isProcessingPhaseChange) return;
      this.isProcessingPhaseChange = true;
      
      const currentPhaseIndex = PHASE_SEQUENCE.indexOf(this.phase);
      let nextPhaseIndex = currentPhaseIndex + 1;
      if (nextPhaseIndex >= PHASE_SEQUENCE.length) {
        this.endTurn();
      }
      const nextPhase = PHASE_SEQUENCE[nextPhaseIndex];
      this.phase = nextPhase;
      await this.handlePhaseEntryLogic(nextPhase);
    },

    async handlePhaseEntryLogic(phase) {
      switch (phase) {
        case PHASE.DRAW:
          // await boardStore.drawCards(currentTurnActorId)
          break;
        case PHASE.REDRAW:
          break;
        case PHASE.ENTRANCE:
          break;
        case PHASE.RACK_UP_DP:
          break;
        case PHASE.DIGIVOLVE_SPECIAL:
          break;
        case PHASE.DIGIVOLVE:
          break;
        case PHASE.CHOOSE_ATTACK:
          break;
        case PHASE.SUPPORT1:
          break;
        case PHASE.SUPPORT2:
          break;
        case PHASE.BATTLE:
          break;
        case PHASE.END:
          break;
        default:
          break;
      }
    },

    endTurn() {
      // TODO: determine next player, reset phase to start, increment turn number
    },
    updateCardStatus(actorId, cardUuid, newState) {
      if (actorId == this.player.id) {
        this.player.hand.push(cardUuid)
        const index = this.player.cards.findIndex(card => card.uuid == cardUuid)
        this.player.cards[index].state = newState;
      } else {
        const index = this.opponent.cards.findIndex(card => card.uuid == cardUuid)
        this.opponent.cards[index].state = newState;
      }
    }
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