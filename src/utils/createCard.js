import { SPECIALTY_DETAILS } from '../const/const'

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

export const createCard = (card) => {
    const firstOptionCardId = 191;

    if (parseInt(card.number) < firstOptionCardId) {
        return createMonsterCard(card)
    } else {
        return createOptionCard(card)
    }
}

export const createMonsterCard = (targetCard) => {
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
        cAttack: targetCard.c_attack,
        cPow: targetCard.c_pow,
        tAttack: targetCard.t_attack,
        tPow: targetCard.t_pow,
        xAttack: targetCard.x_attack,
        xEffect: renderButton(targetCard.x_effect),
        xEffectSpeed: targetCard.x_effect_speed,
        xPow: targetCard.x_pow,
        support: renderButton(targetCard.support),
        supportSpeed: targetCard.support_speed,
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

export const createOptionCard = (targetCard) => {
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

export const shuffleDeck = (cardIds) => {
    const shuffled = cardIds.toSorted(() => Math.random() - 0.5);
    return shuffled
}