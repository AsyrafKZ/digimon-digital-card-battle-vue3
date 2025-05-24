import { defineStore } from "pinia";
import { MODE, PHASE, READY, WHO } from "../const/const";
import { socket } from "../socket";
import { useOpponentStore } from "./opponent";
import { usePlayerStore } from "./player";

const phases = [
    PHASE.DRAW,
    PHASE.ENTRANCE,
    PHASE.RACK_UP_DP,
    // PHASE.DIGIVOLVE_SPECIAL,
    PHASE.DIGIVOLVE,
    PHASE.CHOOSE_ATTACK,
    PHASE.SUPPORT1,
    PHASE.SUPPORT2,
    PHASE.BATTLE,
    PHASE.END
]

export const useStateStore = defineStore('state', {
    state: () => ({
        playerMode: "",
        oppMode: "",
        phase: -1,
        turn: {
            firstAttack: "",
            secondAttack: "",
        },
        battleFirstAttack: "",
        showMainMenu: true,
        name: {
            player: "",
            opp: "",
        },
        ready: {
            player: 0,
            opp: 0,
        },
        player: {
            mode: "",
            name: "",
            deckName: "",
            cardIds: [],
            ready: 0,
        },
        opp: {
            mode: "",
            name: "",
            deckName: "",
            cardIds: [],
            ready: 0,
        },
        updateAction: false,
    }),
    getters: {
        currentTurn() {
            return this.turn.firstAttack;
        },
        firstSetSupport() {
            return this.turn.secondAttack;
        },
        currentMode() {
            return `${this.playerMode} VS ${this.oppMode}`.replaceAll("_MODE", "")
        },
        nextPhase() {
            return phases[phases.indexOf(this.phase) + 1];
        }
    },
    actions: {
        bindEvents() {
            // Same room join event
            socket.on("join-room-res", (msg, userNames) => {
                updateLogMsg(msg, "Server")

                // update name display 
                for (let i = 0; i < userNames.length; i++) {
                    const user = userNames[i];
                    if (user.socketId == socket.id) {
                        this.player.name = user.name;
                        document.getElementById("playerName").innerHTML = user.name;
                    } else {
                        this.opp.name = user.name;
                        document.getElementById("oppName").innerHTML = user.name;
                    }
                }
            })
            // Update ready state server-side
            socket.on("state-init-res", (users) => {
                for (let i = 0; i < users.length; i++) {
                    const user = users[i];
                    if (!this.ready.player && user.socketId == socket.id) {
                        this.ready.player = user.ready

                        // set first attack
                        if (users.length == 1) {
                            this.setTurn(WHO.PLAYER)
                            console.log("I created the room")
                        } else {
                            this.setTurn(WHO.OPP)
                        }
                    } else {
                        useOpponentStore().$patch((state) => {
                            state.oCardIds = user.cardIds
                        })
                        this.ready.opp = user.ready
                    }
                }
            })
            socket.on("finish-loading-res", (users) => {
                for (let i = 0; i < users.length; i++) {
                    const user = users[i];
                    if (user.socketId == socket.id) {
                        this.ready.player = user.ready
                    } else {
                        this.ready.opp = user.ready
                    }
                }
                // if both are ready, start game (PHASE = DRAW)
                if (this.ready.player == READY.LOADING_OK && this.ready.opp == READY.LOADING_OK) {
                    this.setPhase(PHASE.DRAW)
                }
            })
            socket.on("update-phase-res", (phase) => {
                this.setPhase(phase)
            })
            socket.on("set-active-card-res", (cardId) => {
                useOpponentStore().setCardId(cardId);
                this.updateAction = true;
            })
            socket.on("set-dp-res", (cardId) => {
                useOpponentStore().setCardId(cardId);
                this.updateAction = true;
            })
            socket.on("set-attack-choice-res", (socketId, choice) => {
                if (socketId != socket.id) {
                    useOpponentStore().setOAttack(choice)
                }
                if (usePlayerStore().pAttack && useOpponentStore().oAttack) {
                    this.updateAction = true;
                }
            })
            socket.on("set-support-card-res", (cardId) => {
                useOpponentStore().setCardId(cardId);
                this.updateAction = true;
            })
            socket.on("new-message", ({username, msg}) => {
                updateLogMsg(msg, username)
            })
            socket.on("user-disconnect", (msg) => {
                updateLogMsg(msg, "Server")
            })
        },
        // update phase
        setPhase(newPhase) {
            this.phase = newPhase;
        },
        // update current turn
        setTurn(currentTurn) {
            if (currentTurn == WHO.PLAYER) {
                this.turn = {
                    firstAttack: WHO.PLAYER,
                    secondAttack: WHO.OPP,
                }
            } else {
                this.turn = {
                    firstAttack: WHO.OPP,
                    secondAttack: WHO.PLAYER,
                }
            }
        },
        // set first attack during battle
        setBattleFirstAttack(newVal) {
            this.battleFirstAttack = newVal;
        },
        // set Player Mode
        setPlayerMode(mode) {
            this.playerMode = mode;
        },
        // set Opponent Mode
        setOppMode(mode) {
            this.oppMode = mode;
        },
        // toggle main menu display
        setShowMainMenu() {
            this.showMainMenu = !this.showMainMenu
        },
    }
})

let logMsg = "";
const updateLogMsg = (msg, who) => {    
    const logTime = new Date().toLocaleString();
    logMsg += logTime + ` >>> ${who}: ` + msg + "\n----------\n"
    console.log("LOG:", logMsg)
}