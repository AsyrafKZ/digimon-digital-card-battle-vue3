import { usePlayerStore } from "../stores/player";
import { useOpponentStore } from "../stores/opponent";
import { animatePow } from "../animations/monster";
import { animateHpPopup, animatePowPopup } from "../animations/field";
import { ATTACK } from "../const/const";

export const addAllPPower = async (val, scene) => {
    // Add power
    await Promise.all([
        addPCPower(val, scene),
        addPTPower(val, scene),
        addPXPower(val, scene),
    ])
}

export const addPCPower = async (val, scene) => {
    const playerStore = usePlayerStore();
    const originalCPow = parseInt(playerStore.pActiveMon.cPow)
    playerStore.pActiveMon.cPow = originalCPow + parseInt(val)
    const pActiveC = document.getElementById("pActiveC");
    
    if (scene) {
        await animatePowPopup(val, scene, true, ATTACK.C);
    }
    await animatePow(pActiveC, playerStore.pActiveMon.cPow, originalCPow);
}

export const addPTPower = async (val, scene) => {
    const playerStore = usePlayerStore();
    const originalTPow = parseInt(playerStore.pActiveMon.tPow)
    playerStore.pActiveMon.tPow = originalTPow + parseInt(val)
    const pActiveT = document.getElementById("pActiveT");

    if (scene) {
        await animatePowPopup(val, scene, true, ATTACK.T);
    }
    await animatePow(pActiveT, playerStore.pActiveMon.tPow, originalTPow);
}

export const addPXPower = async (val, scene) => {
    const playerStore = usePlayerStore();
    const originalXPow = parseInt(playerStore.pActiveMon.xPow)
    playerStore.pActiveMon.xPow = originalXPow + parseInt(val)
    const pActiveX = document.getElementById("pActiveX");

    if (scene) {
        await animatePowPopup(val, scene, true, ATTACK.X);
    }
    await animatePow(pActiveX, playerStore.pActiveMon.xPow, originalXPow);
}

export const addPHp = async (val, scene) => {
    const playerStore = usePlayerStore();
    const originalHp = parseInt(playerStore.pActiveMon.hp)
    let newHp = originalHp + parseInt(val)
    playerStore.pActiveMon.hp = newHp >= 0 ? newHp : 0;
    const pActiveHp = document.getElementById("pActiveHp");
    await animateHpPopup(val, scene, true);
    await animatePow(pActiveHp, playerStore.pActiveMon.hp, originalHp);
}

export const addAllOPower = async (val, scene) => {
    // Add power
    await Promise.all([
        addOCPower(val, scene),
        addOTPower(val, scene),
        addOXPower(val, scene),
    ])
}

export const addOCPower = async (val, scene) => {
    const oppStore = useOpponentStore();
    const originalCPow = parseInt(oppStore.oActiveMon.cPow)
    oppStore.oActiveMon.cPow = originalCPow + parseInt(val)
    const pActiveC = document.getElementById("oActiveC");

    if (scene) {
        await animatePowPopup(val, scene, false, ATTACK.C);
    }
    await animatePow(pActiveC, oppStore.oActiveMon.cPow, originalCPow);
}

export const addOTPower = async (val, scene) => {
    const oppStore = useOpponentStore();
    const originalTPow = parseInt(oppStore.oActiveMon.tPow)
    oppStore.oActiveMon.tPow = originalTPow + parseInt(val)
    const pActiveT = document.getElementById("oActiveT");

    if (scene) {
        await animatePowPopup(val, scene, false, ATTACK.T);
    }
    await animatePow(pActiveT, oppStore.oActiveMon.tPow, originalTPow);
}

export const addOXPower = async (val, scene) => {
    const oppStore = useOpponentStore();
    const originalXPow = parseInt(oppStore.oActiveMon.xPow)
    oppStore.oActiveMon.xPow = originalXPow + parseInt(val)
    const pActiveX = document.getElementById("oActiveX");

    if (scene) {
        await animatePowPopup(val, scene, false, ATTACK.X);
    }
    await animatePow(pActiveX, oppStore.oActiveMon.xPow, originalXPow);
}

export const addOHp = async (val, scene) => {
    const oppStore = useOpponentStore();
    const originalHp = parseInt(oppStore.oActiveMon.hp)
    let newHp = originalHp + parseInt(val)
    oppStore.oActiveMon.hp = newHp >= 0 ? newHp : 0;
    const oActiveHp = document.getElementById("oActiveHp");
    await animateHpPopup(val, scene, false);
    await animatePow(oActiveHp, oppStore.oActiveMon.hp, originalHp);
}