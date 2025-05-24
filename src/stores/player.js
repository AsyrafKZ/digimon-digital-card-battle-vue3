import { defineStore } from "pinia";
import { shuffleDeck, createCard } from "../utils/createCard";
import { useStateStore } from "./state";

export const usePlayerStore = defineStore('player', {
    state: () => ({
        pDeck: [],
        pCardIds: [],
        pCards: [],
        pHand: [null, null, null, null],
        pOffline: [],
        pDp: [],
        pActiveMon: {
            id: "",
            name: "",
            level: "",
            specialty: "",
            cPow: 0,
            tPow: 0,
            xPow: 0,
            xSpeed: 0,
            hp: 0,
        },
        pActiveMonStack: [],
        pAttack: "",
        pSupport: {
            cardId: "",
            speed: 0,
            isFromDeck: false,
            isValid: false,
        },
        pWinCount: 0,
        isEatUpHp: false,
        revive: {
            isRevive: false,
            newHp: 0,
        },
    }),
    getters: {
        pDeckCount() {
            return this.pDeck.length
        },
        pHandCount() {
            let count = 0;
            for (let i = 0; i < this.pHand.length; i++) {
                const handId = this.pHand[i];
                if (handId) {
                    count += 1;
                }
            }
            return count;
        },
        pHandNextEmptyIndex() {
            let index = 0;
            for (let i = 0; i < this.pHand.length; i++) {
                if (!this.pHand[i]) {
                    index = i;
                    break;
                }
            }
            return index;
        },
        pOfflineCount() {
            return this.pOffline.length
        },
        pDpCount() {
            return this.pDp.length
        },
        pDpTotal() {
            return this.pDp.reduce((total, el) => total += el.val, 0)
        },
        pActiveMonStackCount() {
            return this.pActiveMonStack.length
        },
        pDeckTopCardId() {
            return this.pDeck[this.pDeckCount - 1]
        }
    },
    actions: {
        // Initialize cards - fetch cards (IDs) from server
        async initializeDeck(userId, deckId) {
            await this.setDeckCardIds(userId, deckId);
            this.pCardIds = shuffleDeck(this.pCardIds);
            await this.setCardDetails();
        },
        async setDeckCardIds(userId, deckId) {
            const res = await fetch(`http://localhost:3005/api/users/${userId}`)
            const data = await res.json()

            // set deck for play
            const decks = data.decks
            for (let i = 0; i < decks.length; i++) {
                const deck = decks[i];
                if (deck.deckId === deckId) {
                    this.pCardIds = deck.cards;
                    break
                }
            }
        },
        async setCardDetails() {
            // set the parameter
            const cardsArray = this.pCardIds;
            let cardsParam = "";
            for (let i = 0; i < cardsArray.length; i++) {
                const card = cardsArray[i]
                const cardComma = card + ","
                cardsParam += cardComma;
            }
            cardsParam = cardsParam.slice(0, -1); // shave off the last comma

            // fetch the cards
            cardsParam = shuffleDeck(useStateStore().player.cardIds).join(",")
            const res = await fetch(`http://localhost:3005/api/cards/id=${cardsParam}`)
            const resData = await res.json()

            // store the cards
            let pCards = [];
            const posX = -4.25;
            const posY = -3.07;
            const posZ = 0.0;
            const dz = 0.002;
            for (let i = 0; i < resData.length; i++) {
                const z = posZ + i * dz;
                const data = resData[i];
                
                let createdCard = createCard(data);
                let id = pCards.find(card => card.id == createdCard.id) ? `${createdCard.id}.${i}` : createdCard.id
                let ref = `ref${id}`
                const card = {
                    ...createdCard,
                    id: id,
                    ref: ref,
                    position: {
                        x: posX,
                        y: posY,
                        z: z
                    },
                    sprite: createdCard.imgSrc
                }
                pCards.push(card);

                this.addPDeck(card.id.padStart(3, 0));
            }
            // set to state store
            this.setPCards(pCards);
        },
        // Player Deck Card
        addPDeck(cardId) {
            this.pDeck.push(cardId);
        },
        removePDeck(cardId) {
            const filtered = this.pDeck.filter(el => el != cardId)
            this.pDeck = filtered
        },
        // Player Hand Card
        addPHand(cardId) {
            for (let i = 0; i < this.pHand.length; i++) {
                const handId = this.pHand[i];
                if (!handId) {
                    this.pHand[i] = cardId;
                    break;
                }
            }
        },
        removePHand(cardId) {
            for (let i = 0; i < this.pHand.length; i++) {
                const handId = this.pHand[i];
                if (handId == cardId) {
                    this.pHand[i] = null;
                    break;
                }
            }
        },
        // Player Offline
        addPOffline(cardId) {
            this.pOffline.push(cardId);
        },
        removePOffline(cardId) {
            const filtered = this.pOffline.filter(el => el != cardId)
            this.pOffline = filtered
        },
        // Player Dp
        addPDp(cardId, dpVal) {
            const dpObj = {
                id: cardId,
                val: parseInt(dpVal)
            }
            this.pDp.push(dpObj);
        },
        removePDp() {
            // const filtered = this.pDp.filter(el => el != cardId)
            // this.pDp = filtered
            this.pDp.pop();
        },
        removeAllPDp() {
            this.pDp = []
        },
        // Set Player active digimon
        setPActiveMon(id, name, level, specialty, cPow, tPow, xPow, xSpeed, hp) {
            const mon = {
                id, name, level, specialty, cPow, tPow, xPow, xSpeed, hp
            }
            this.pActiveMon = mon
            this.pActiveMonStack.push(mon)
        },
        removePActiveMon() {
            const mon = {
                id: "",
                name: "",
                level: "",
                specialty: "",
                cPow: 0,
                tPow: 0,
                xPow: 0,
                xSpeed: 0,
                hp: 0,
            }
            this.pActiveMon = mon
            this.pActiveMonStack = []
        },
        // Set player attack choice
        setPAttack(choice) {
            this.pAttack = choice
        },
        // Set Support card
        setPSupport(cardId, effectSpeed, isFromDeck) {
            this.pSupport = {
                cardId: cardId,
                speed: effectSpeed,
                isFromDeck: isFromDeck,
                isValid: true,
            };
        },
        removePSupport() {
            this.pSupport = {
                cardId: "",
                speed: 0,
                isFromDeck: false,
                isValid: false,
            };
        },
        // Set Player Cards
        setPCards(cards) {
            this.pCards = cards
        },
        // Add win count
        addPWinCount() {
            this.pWinCount += 1;
        },
        // Set Eat Up Hp flag
        setEatUpHp(newVal) {
            this.isEatUpHp = newVal
        },
        // Set whether can revive
        setRevive(isRevive, newHp) {
            this.revive = {
                isRevive: isRevive,
                newHp: newHp
            }
        },
        // Set support card void
        setPSupportVoid() {
            this.pSupport.isValid = false;
        }
    }
})