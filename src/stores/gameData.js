import { defineStore } from "pinia";
import { SPECIALTY_DETAILS, PLAYER_TYPES, CARD_STATE } from "../const/const";

const OPTION_CARD_FIRST_ID = 191;

export const useGameDataStore = defineStore("gameData", {
  state: () => ({
    prebuildDecks: [],
    cards: [],
  }),
  actions: {
    async init() {
      this.prebuildDecks = await this.fetchPrebuildDecks();
      this.cards = await this.fetchCards();
    },
    async fetchPrebuildDecks() {
      const res = await fetch("/data/prebuildDecks.json");
      return res.json();
    },
    async fetchCards() {
      const res = await fetch("/data/cards.json");
      let cards = await res.json();
      cards = [...cards.monster_cards, ...cards.option_cards];
      const cardsCamelCase = [];
      cards.forEach((card) => {
        cardsCamelCase.push(objectKeySnakeToCamel(card));
      });
      return cardsCamelCase;
    },
    getDeckById(deckId) {
      return this.prebuildDecks.find((deck) => deck.deckId == deckId);
    },
    getCardById(cardId) {
      return this.cards.find((card) => card.number == cardId);
    },
    getMonsterCards() {
      return this.cards.filter((card) => parseInt(card.number) < OPTION_CARD_FIRST_ID);
    },
    getOptionCards() {
      return this.cards.filter((card) => parseInt(card.number) >= OPTION_CARD_FIRST_ID);
    },
    // cardIds: array of string ids eg. 1,2,51,123
    getCardsByIds(cardIds) {
        let cardArr = []
    
        cardIds.forEach(id => {
            let card;
            card = this.getCardById(id)
            cardArr.push(card)
        })
    
        return cardArr
    },
    // cardIds: array of string ids eg. 1,2,51,123
    getGameReadyCards(cardIds, playerType, actorId) {
        let shuffledCardIds = shuffleDeck(cardIds)
        let cards = this.getCardsByIds(shuffledCardIds)
        let gameReadyCards = []

        let position = {
            x: 0,
            y: 0,
            z: 0
        }
        if (playerType == PLAYER_TYPES.HUMAN) {
            position = {
                x: -4.25,
                y: -3.07,
                z: 0.0
            }
        } else { // CPU_EASY, CPU_HARD, REMOTE_PLAYER (these will always be on the other side)
            position = {
                x: 4.2,
                y: 2,
                z: 0.0
            }
        }
        const dz = 0.002;
        cards.forEach((card, i) => {
            const z = position.z + i * dz;
            let gameReadyCard = createCard(card)
            gameReadyCard = {
                ...gameReadyCard,
                uuid: generateUid(),
                owner: actorId,
                position: {
                    x: position.x,
                    y: position.y,
                    z: z
                },
                sprite: gameReadyCard.imgSrc,
                state: CARD_STATE.DECK
            }
            gameReadyCards.push(gameReadyCard)
        })
        return gameReadyCards
    }
  },
});

const objectKeySnakeToCamel = (obj) => {
  const newObj = {};
  Object.keys(obj).forEach((key) => {
    newObj[snakeToCamel(key)] = obj[key];
  });
  return newObj;
};

const snakeToCamel = (str) => {
  if (!str.includes("_")) {
    return str;
  }
  return str
    .toLowerCase()
    .replace(/([-_][a-z])/g, (group) =>
      group.toUpperCase().replace("-", "").replace("_", "")
    );
};

const renderButton = (val) => {
    const cRegex = /\{\{(button)\|[c]\}\}/g
    const tRegex = /\{\{(button)\|[t]\}\}/g
    const xRegex = /\{\{(button)\|[x]\}\}/g
    let newVal = val
    if (cRegex.test(newVal)) {
        newVal = newVal.replaceAll(cRegex, "〇")
    }
    if (tRegex.test(newVal)) {
        newVal = newVal.replaceAll(tRegex, "△")
    }
    if (xRegex.test(newVal)) {
        newVal = newVal.replaceAll(xRegex, "✕")
    }
    return newVal
}

const createCard = (card) => {
    if (parseInt(card.number) < OPTION_CARD_FIRST_ID) {
        return createMonsterCard(card)
    } else {
        return createOptionCard(card)
    }
}

const createMonsterCard = (targetCard) => {
    const card = {
        id: targetCard.number,
        ref: `ref${targetCard.number}`,
        name: targetCard.name,
        level: targetCard.level,
        hp: targetCard.hp,
        pp: targetCard.pp,
        dp: targetCard.dp,
        specialty: targetCard.specialty,
        imgSrc: "/src/sprites/monsters/" + targetCard.number + ".jpg",
        colorTop: "",
        colorBottom: "",
        cAttack: targetCard.cAttack,
        cPow: targetCard.cPow,
        tAttack: targetCard.tAttack,
        tPow: targetCard.tPow,
        xAttack: targetCard.xAttack,
        xEffect: renderButton(targetCard.xEffect),
        xEffectSpeed: targetCard.xEffectSpeed,
        xPow: targetCard.xPow,
        support: renderButton(targetCard.support),
        supportSpeed: targetCard.supportSpeed,
        isPartner: targetCard.isPartner,
    };
    const specialtyList = SPECIALTY_DETAILS
    for (let index = 0; index < specialtyList.length; index++) {
        const specialty = specialtyList[index];
        if (card.specialty == specialty.specialty) {
            card.colorTop = specialty.topColor;
            card.colorBottom = specialty.bottomColor;
            break;
        }
    }
    return card;
}

const createOptionCard = (targetCard) => {
    const greyRgbHex = "#808080"
    const silverRgbHex = "#C0C0C0"
    const card = {
        id: targetCard.number,
        ref: `ref${targetCard.number}`,
        name: renderButton(targetCard.name),
        imgSrc: "/src/sprites/options/" + targetCard.number + ".png",
        effect: renderButton(targetCard.effect),
        colorTop: greyRgbHex,
        colorBottom: silverRgbHex,
        speed: targetCard.speed,
    };
    return card;
}

const shuffleDeck = (cardIds) => {
    const shuffled = cardIds.toSorted(() => Math.random() - 0.5);
    return shuffled
}

const generateUid = function () {
    return Math.random().toString(36).substring(2,15)
}