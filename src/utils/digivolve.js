import { usePlayerDpStore } from "@/stores/playerDp";
import { usePlayerActiveCardsStore } from "@/stores/playerActiveCards";
import { CONST } from "../const/const";
import { useOppDpStore } from "@/stores/oppDp";
import { useOppActiveCardsStore } from "@/stores/oppActiveCards";

const getLevel = (lvl) => {
    if (lvl == CONST.R) {
        return 0
    } else if (lvl == CONST.A) {
        return -1
    } else if (lvl == CONST.C) {
        return 1
    } else if (lvl == CONST.U) {
        return 2
    }
}

export const isValid = (dp, specialty, lvl, who) => {
    let dpStore;
    let activeStore;
    if (who ==  'player') {
        dpStore = usePlayerDpStore()
        activeStore = usePlayerActiveCardsStore()
    } else {
        dpStore = useOppDpStore()
        activeStore = useOppActiveCardsStore()
    }
    if (dpStore.dp < dp) {
        return { isValid: false, msg: "Need more DP!" }
    }
    if (activeStore.battleCard.specialty != specialty) {
        return { isValid: false, msg: "Must Choose same specialty Digimon!" }
    }
    const activeLvl = getLevel(activeStore.battleCard.level)
    const handLvl = getLevel(lvl)
    if (handLvl - activeLvl != 1) {
        return { isValid: false, msg: "Must be one level above!" }
    }
    return { isValid: true, msg: "Digivolve!" }
}