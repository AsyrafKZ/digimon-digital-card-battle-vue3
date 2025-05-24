import { SPECIALTY, LEVEL, PHASE, COLOR_CODE, ATTACK } from "../const/const"

const baseUrl = "/src/assets/symbols/"

export const specialtyToImg = (specialty) => {
    let imgSrc = "";

    if (specialty == SPECIALTY.FIRE) {
        imgSrc = baseUrl + "fire-solid.svg"
    } else if (specialty == SPECIALTY.ICE) {
        imgSrc = baseUrl + "snowflake-solid.svg"
    } else if (specialty == SPECIALTY.NATURE) {
        imgSrc = baseUrl + "leaf-solid.svg"
    } else if (specialty == SPECIALTY.DARKNESS) {
        imgSrc = baseUrl + "skull-solid.svg"
    } else if (specialty == SPECIALTY.RARE) {
        imgSrc = baseUrl + "puzzle-filled.svg"
    } else if (specialty == SPECIALTY.OPTION) {
        imgSrc = baseUrl + "star-sharp.svg"
    }
    return imgSrc;
}

export const speedToImg = (speed) => {
    const SPEED_1 = "1";
    const SPEED_2 = "2";
    const SPEED_3 = "3";
    let imgSrc = "";

    if (speed == SPEED_1) {
        imgSrc = baseUrl + "speed-red.webp";
    } else if (speed == SPEED_2) {
        imgSrc = baseUrl + "speed-green.webp";
    } else if (speed == SPEED_3) {
        imgSrc = baseUrl + "speed-blue.webp";
    } else {
        imgSrc = "";
    }
    return imgSrc;
}

export const turnToStr = (turn) => {
    const FIRST_ATTACK = "1st\nAttack";
    const SECOND_ATTACK = "2nd\nAttack";

    if (turn == 1) {
        return FIRST_ATTACK;
    } else if (turn == 2) {
        return SECOND_ATTACK;
    }
}

export const specialtyToClass = (specialty) => {
    const FIRE_CLASS = "sp-fire";
    const ICE_CLASS = "sp-ice";
    const NATURE_CLASS = "sp-nature";
    const DARKNESS_CLASS = "sp-darkness";
    const RARE_CLASS = "sp-rare";

    if (specialty == SPECIALTY.FIRE) {
        return FIRE_CLASS;
    } else if (specialty == SPECIALTY.ICE) {
        return ICE_CLASS;
    } else if (specialty == SPECIALTY.NATURE) {
        return NATURE_CLASS;
    } else if (specialty == SPECIALTY.DARKNESS) {
        return DARKNESS_CLASS;
    } else if (specialty == SPECIALTY.RARE) {
        return RARE_CLASS;
    }
}

export const levelToNumber = (level) => {
    if (level == LEVEL.A) {
        return -1
    } else if (level == LEVEL.R) {
        return 0
    } else if (level == LEVEL.C) {
        return 1
    } else if (level == LEVEL.U) {
        return 2
    }
}

export const setPenalty = (lvl, val, count) => {
    const cPen = 2
    const uPen = 4
    if (lvl == LEVEL.C && count == 1) {
        return Math.floor(parseInt(val) / cPen)
    } else if (lvl == LEVEL.U && count == 2) {
        return Math.floor(parseInt(val) / cPen)
    } else if (lvl == LEVEL.U && count == 1) {
        return Math.floor(parseInt(val) / uPen)
    } else {
        return parseInt(val)
    }
}

export const hexToRgb = (hex) =>
    hex
        .replace(
            /^#?([a-f\d])([a-f\d])([a-f\d])$/i,
            (m, r, g, b) => "#" + r + r + g + g + b + b
        )
        .substring(1)
        .match(/.{2}/g)
        .map((x) => Number(parseInt(x, 16) / 256).toFixed(3));

export const phaseToName = (phase) => {
    if (phase == PHASE.DRAW || phase == PHASE.REDRAW) {
        return "DRAW"
    } else if (phase == PHASE.ENTRANCE) {
        return "SELECT DIGIMON"
    } else if (phase == PHASE.RACK_UP_DP) {
        return "RACK-UP DP"
    } else if (phase == PHASE.DIGIVOLVE || phase == PHASE.DIGIVOLVE_SPECIAL) {
        return "DIGIVOLVE"
    } else if (phase == PHASE.CHOOSE_ATTACK) {
        return "CHOOSE ATTACK"
    } else if (phase == PHASE.SUPPORT1) {
        return "SUPPORT 1"
    } else if (phase == PHASE.SUPPORT2) {
        return "SUPPORT 2"
    } else if (phase == PHASE.BATTLE) {
        return "BATTLE"
    } else if (phase == PHASE.END) {
        return "TURN END"
    }
}

export const specialtyToColor = (specialty) => {
    if (specialty == SPECIALTY.FIRE) {
        return [COLOR_CODE.FIRE_TOP, COLOR_CODE.FIRE_BOTTOM];
    } else if (specialty == SPECIALTY.ICE) {
        return [COLOR_CODE.ICE_TOP, COLOR_CODE.ICE_BOTTOM];
    } else if (specialty == SPECIALTY.NATURE) {
        return [COLOR_CODE.NATURE_TOP, COLOR_CODE.NATURE_BOTTOM];
    } else if (specialty == SPECIALTY.DARKNESS) {
        return [COLOR_CODE.DARKNESS_TOP, COLOR_CODE.DARKNESS_BOTTOM];
    } else if (specialty == SPECIALTY.RARE) {
        return [COLOR_CODE.RARE_TOP, COLOR_CODE.RARE_BOTTOM];
    } else if (!specialty) {
        return [COLOR_CODE.SUPPORT_TOP, COLOR_CODE.SUPPORT_BOTTOM]
    }
}

export const attackChoiceToSymbol = (attackChoice) => {
    let res = {
        symbol: "",
        class: "",
    }
    if (attackChoice == ATTACK.C) {
        res.symbol = "〇"
        res.class = "c-attack-display"
        return res;
    } else if (attackChoice == ATTACK.T) {
        res.symbol = "△"
        res.class = "t-attack-display"
        return res
    } else if (attackChoice == ATTACK.X) {
        res.symbol = "✕"
        res.class = "x-attack-display"
        return res
    } 
}

export const buttonToSymbol = (val) => {
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