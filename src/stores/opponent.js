import { defineStore } from "pinia";
import { shuffleDeck, createCard } from "../utils/createCard";
import { useStateStore } from "./state";

export const useOpponentStore = defineStore('opponent', {
    state: () => ({
        oDeck: [],
        oCardIds: [],
        oCards: [],
        oHand: [null, null, null, null],
        oOffline: [],
        oDp: [],
        oActiveMon: {
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
        oActiveMonStack: [],
        oAttack: "",
        oSupport: {
            cardId: "",
            speed: 0,
            isFromDeck: false,
            isValid: false,
        },
        oWinCount : 0,
        oSelectedCardId: "",
        isEatUpHp: false,
        revive: {
            isRevive: false,
            newHp: 0,
        },
    }),
    getters: {
        oDeckCount() {
            return this.oDeck.length
        },
        oHandCount() {
            let count = 0;
            for (let i = 0; i < this.oHand.length; i++) {
                const handId = this.oHand[i];
                if (handId) {
                    count += 1;
                }
            }
            return count;
        },
        oHandNextEmptyIndex() {
            let index = 0;
            for (let i = 0; i < this.oHand.length; i++) {
                if (!this.oHand[i]) {
                    index = i;
                    break;
                }
            }
            return index;
        },
        oOfflineCount() {
            return this.oOffline.length
        },
        oDpCount() {
            return this.oDp.length
        },
        oDpTotal() {
            return this.oDp.reduce((total, el) => total += el.val, 0)
        },
        oActiveMonStackCount() {
            return this.oActiveMonStack.length
        },
        oSelectedCard() {
            return this.oCards.filter(card => card.id == this.oSelectedCardId)[0];
        }
    },
    actions: {
        // Initialize cards - fetch cards (IDs) from server
        async initializeDeck(userId, deckId) {
            await this.setDeckCardIds(userId, deckId);
            this.oCardIds = shuffleDeck(this.oCardIds);
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
                    this.oCardIds = deck.cards;
                    break
                }
            }
        },
        async setCardDetails() {
            // set the parameter
            const cardsArray = this.oCardIds;
            let cardsParam = "";
            for (let i = 0; i < cardsArray.length; i++) {
                const card = cardsArray[i]
                const cardComma = card + ","
                cardsParam += cardComma;
            }
            cardsParam = cardsParam.slice(0,-1); // shave off the last comma
            
            // fetch the cards
            // cardsParam = shuffleDeck(useStateStore().opp.cardIds).join(",")
            const res = await fetch(`http://localhost:3005/api/cards/id=${cardsParam}`)
            const resData = await res.json()
            
            // store the cards
            let oCards = [];
            const posX = 4.2;
            const posY = 2;
            const posZ = 0.0;
            const dz = 0.002;
            for (let i = 0; i < resData.length; i++) {
                const z = posZ + i * dz;
                const data = resData[i];
                
                let createdCard = createCard(data);
                let id = oCards.find(card => card.id == createdCard.id) ? `${createdCard.id}.${i}` : createdCard.id
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
                oCards.push(card);
                
                this.addODeck(card.id.padStart(3, 0));
            }
            // set to state
            this.setOCards(oCards);
        },
        // Opponent Deck Card
        addODeck(cardId) {
            this.oDeck.push(cardId);
        },
        removeODeck(cardId) {
            const filtered = this.oDeck.filter(el => el != cardId)
            this.oDeck = filtered
        },
        // Opponent Hand Card
        addOHand(cardId) {
            for (let i = 0; i < this.oHand.length; i++) {
                const handId = this.oHand[i];
                if (!handId) {
                    this.oHand[i] = cardId;
                    break;
                }
            }
        },
        removeOHand(cardId) {
            for (let i = 0; i < this.oHand.length; i++) {
                const handId = this.oHand[i];
                if (handId == cardId) {
                    this.oHand[i] = null;
                    break;
                }
            }
        },
        // Opponent Offline
        addOOffline(cardId) {
            this.oOffline.push(cardId);
        },
        removeOOffline(cardId) {
            const filtered = this.oOffline.filter(el => el != cardId)
            this.oOffline = filtered
        },
        // Opponent Dp
        addODp(cardId, dpVal) {
            const dpObj = {
                id: cardId,
                val: parseInt(dpVal)
            }
            this.oDp.push(dpObj);
        },
        removeODp() {
            // const filtered = this.oDp.filter(el => el != cardId)
            // this.oDp = filtered
            this.oDp.pop();
        },
        removeAllODp() {
            this.oDp = []
        },
        // Set Opponent active digimon
        setOActiveMon(id, name, level, specialty, cPow, tPow, xPow, xSpeed, hp) {
            const mon = {
                id, name, level, specialty, cPow, tPow, xPow, xSpeed, hp
            }
            this.oActiveMon = mon
            this.oActiveMonStack.push(mon)
        },
        removeOActiveMon() {
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
            this.oActiveMon = mon
            this.oActiveMonStack = []
        },
        // Set Opponent attack choice
        setOAttack(choice) {
            this.oAttack = choice
        },
        // Set Support card
        setOSupport(cardId, effectSpeed, isFromDeck) {
            this.oSupport = {
                cardId: cardId,
                speed: effectSpeed,
                isFromDeck: isFromDeck,
                isValid: true,
            };
        },
        removeOSupport() {
            this.oSupport = {
                cardId: "",
                speed: 0,
                isFromDeck: false,
                isValid: false,
            };
        },
        // Set Opponent Cards
        setOCards(cards) {
            this.oCards = cards
        },
        // Add win count
        addOWinCount() {
            this.oWinCount += 1;
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
        // Set selected card ID (mainly used for AI card select)
        setCardId(cardId) {
            this.oSelectedCardId = cardId;
        },
        // Set support card void
        setOSupportVoid() {
            this.oSupport.isValid = false;
        }
    }
})