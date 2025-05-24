import {
    CSS2DObject,
} from "/node_modules/three/examples/jsm/renderers/CSS2DRenderer.js";
import { usePlayerStore } from "../stores/player";
import { ATTACK, MODE } from "../const/const";
import { socket } from "../socket";
import { useStateStore } from "../stores/state";

export const createHandComponents = () => {    
    // Player Deck Count
    const pDeckCount = document.createElement("div");
    pDeckCount.id = "pDeckCount"
    pDeckCount.className = "card-count";
    pDeckCount.innerHTML = "";
    const pDeckCountContainer = new CSS2DObject(pDeckCount);
    pDeckCountContainer.position.set(-5.25, -3.05, 0);

    // Player Offline Count
    const pOfflineCount = document.createElement("div");
    pOfflineCount.id = "pOfflineCount"
    pOfflineCount.className = "card-count";
    pOfflineCount.innerHTML = "";
    const pOfflineCountContainer = new CSS2DObject(pOfflineCount);
    pOfflineCountContainer.position.set(-5.25, -1.95, 0);

    // Opponent Deck Count
    const oDeckCount = document.createElement("div");
    oDeckCount.id = "oDeckCount"
    oDeckCount.className = "card-count";
    oDeckCount.innerHTML = "";
    const oDeckCountContainer = new CSS2DObject(oDeckCount);
    oDeckCountContainer.position.set(5.35, 2.05, 0);

    // Opponent Offline Count
    const oOfflineCount = document.createElement("div");
    oOfflineCount.id = "oOfflineCount"
    oOfflineCount.className = "card-count";
    oOfflineCount.innerHTML = "";
    const oOfflineCountContainer = new CSS2DObject(oOfflineCount);
    oOfflineCountContainer.position.set(5.35, 3.1, 0);

    return [
        pDeckCountContainer,
        pOfflineCountContainer,
        oDeckCountContainer,
        oOfflineCountContainer,
    ]
}

export const createActiveFieldComponents = () => {
    // Player Dp Count
    const pDpCount = document.createElement("div");
    pDpCount.id = "pDpCount"
    pDpCount.className = "card-count";
    pDpCount.innerHTML = "0";
    const pDpCountContainer = new CSS2DObject(pDpCount);
    pDpCountContainer.position.set(-4.95, 0.7, 0);
    pDpCountContainer.name = "pDpCount";

    // Player Active Monster - Name
    const pActiveNm = document.createElement("div");
    pActiveNm.id = "pActiveNm"
    pActiveNm.className = "active-nm";
    pActiveNm.innerHTML = "";
    const pActiveNmContainer = new CSS2DObject(pActiveNm);
    pActiveNmContainer.position.set(-2.8, 1.18, 0);
    pActiveNmContainer.name = "pActiveNm";

    // Player Active Monster - 〇
    const pActiveC = document.createElement("div");
    pActiveC.id = "pActiveC"
    pActiveC.className = "active-pow";
    pActiveC.innerHTML = "";
    const pActiveCContainer = new CSS2DObject(pActiveC);
    pActiveCContainer.position.set(-3.13, 0.58, 0);
    pActiveCContainer.name = "pActiveC";

    // Player Active Monster - △
    const pActiveT = document.createElement("div");
    pActiveT.id = "pActiveT"
    pActiveT.className = "active-pow";
    pActiveT.innerHTML = "";
    const pActiveTContainer = new CSS2DObject(pActiveT);
    pActiveTContainer.position.set(-3.13, 0, 0);
    pActiveTContainer.name = "pActiveT";

    // Player Active Monster - ✕
    const pActiveX = document.createElement("div");
    pActiveX.id = "pActiveX"
    pActiveX.className = "active-pow";
    pActiveX.innerHTML = "";
    const pActiveXContainer = new CSS2DObject(pActiveX);
    pActiveXContainer.position.set(-3.13, -0.6, 0);
    pActiveXContainer.name = "pActiveX";

    // Player Active Monster - ✕ Effect
    const pActiveXEff = document.createElement("div");
    pActiveXEff.id = "pActiveXEff"
    pActiveXEff.className = "active-eff";
    pActiveXEff.innerHTML = "";
    const pActiveXEffContainer = new CSS2DObject(pActiveXEff);
    pActiveXEffContainer.position.set(-3.29, -1.12, 0);
    pActiveXEffContainer.name = "pActiveXEff";

    // Player Active Monster - HP label
    const pActiveHpLbl = document.createElement("div");
    pActiveHpLbl.id = "pActiveHpLbl"
    pActiveHpLbl.className = "";
    pActiveHpLbl.innerHTML = "";
    const pActiveHpLblContainer = new CSS2DObject(pActiveHpLbl);
    pActiveHpLblContainer.position.set(-1.26, -0.795, 0);
    pActiveHpLblContainer.name = "pActiveHpLbl";

    // Player Active Monster - HP
    const pActiveHp = document.createElement("div");
    pActiveHp.id = "pActiveHp"
    pActiveHp.className = "active-hp";
    pActiveHp.innerHTML = "";
    const pActiveHpContainer = new CSS2DObject(pActiveHp);
    pActiveHpContainer.position.set(-1.25, -0.77, 0.002);
    pActiveHpContainer.name = "pActiveHp";

    // Opponent Dp Count
    const oDpCount = document.createElement("div");
    oDpCount.id = "oDpCount"
    oDpCount.className = "card-count";
    oDpCount.innerHTML = "";
    const oDpCountContainer = new CSS2DObject(oDpCount);
    oDpCountContainer.position.set(5.03, 0.7, 0);
    oDpCountContainer.name = "oDpCount";

    // Opponent Active Monster - Name
    const oActiveNm = document.createElement("div");
    oActiveNm.id = "oActiveNm"
    oActiveNm.className = "active-nm";
    const oActiveNmContainer = new CSS2DObject(oActiveNm);
    oActiveNmContainer.position.set(2.3, 1.18, 0);
    oActiveNmContainer.name = "oActiveNm";

    // Opponent Active Monster - 〇
    const oActiveC = document.createElement("div");
    oActiveC.id = "oActiveC"
    oActiveC.className = "active-pow";
    const oActiveCContainer = new CSS2DObject(oActiveC);
    oActiveCContainer.position.set(3.65, 0.58, 0);
    oActiveCContainer.name = "oActiveC";

    // Opponent Active Monster - △
    const oActiveT = document.createElement("div");
    oActiveT.id = "oActiveT"
    oActiveT.className = "active-pow";
    const oActiveTContainer = new CSS2DObject(oActiveT);
    oActiveTContainer.position.set(3.65, 0, 0);
    oActiveTContainer.name = "oActiveT";

    // Opponent Active Monster - ✕
    const oActiveX = document.createElement("div");
    oActiveX.id = "oActiveX"
    oActiveX.className = "active-pow";
    const oActiveXContainer = new CSS2DObject(oActiveX);
    oActiveXContainer.position.set(3.65, -0.6, 0);
    oActiveXContainer.name = "oActiveX";

    // Opponent Active Monster - ✕ Effect
    const oActiveXEff = document.createElement("div");
    oActiveXEff.id = "oActiveXEff"
    oActiveXEff.className = "active-eff";
    const oActiveXEffContainer = new CSS2DObject(oActiveXEff);
    oActiveXEffContainer.position.set(3.55, -1.12, 0);
    oActiveXEffContainer.name = "oActiveXEff";
    
    // Opponent Active Monster - HP label
    const oActiveHpLbl = document.createElement("div");
    oActiveHpLbl.id = "oActiveHpLbl"
    oActiveHpLbl.className = "active-hp-label";
    const oActiveHpLblContainer = new CSS2DObject(oActiveHpLbl);
    oActiveHpLblContainer.position.set(1.351, -0.795, 0);
    oActiveHpLblContainer.name = "oActiveHpLbl";
    
    // Opponent Active Monster - HP
    const oActiveHp = document.createElement("div");
    oActiveHp.id = "oActiveHp"
    oActiveHp.className = "active-hp";
    const oActiveHpContainer = new CSS2DObject(oActiveHp);
    oActiveHpContainer.position.set(1.35, -0.77, 0.002);
    oActiveHpContainer.name = "oActiveHp";

    return [
        pDpCountContainer,
        pActiveNmContainer,
        pActiveCContainer,
        pActiveTContainer,
        pActiveXContainer,
        pActiveXEffContainer,
        pActiveHpLblContainer,
        pActiveHpContainer,
        oDpCountContainer,
        oActiveNmContainer,
        oActiveCContainer,
        oActiveTContainer,
        oActiveXContainer,
        oActiveXEffContainer,
        oActiveHpLblContainer,
        oActiveHpContainer,
    ];
}

export const createChoiceComponents = () => {
    // Player Attack Choice - Name
    const pChoiceNm = document.createElement("div");
    pChoiceNm.id = "pChoiceNm"
    pChoiceNm.className = "choice choice-name";
    const pChoiceNmContainer = new CSS2DObject(pChoiceNm);
    pChoiceNmContainer.position.set(-2.15, -4.95, 0);
    pChoiceNmContainer.name = "pChoiceNm";
    
    // Player Attack Choice - HP
    const pChoiceHp = document.createElement("div");
    pChoiceHp.id = "pChoiceHp"
    pChoiceHp.className = "choice";
    const pChoiceHpContainer = new CSS2DObject(pChoiceHp);
    pChoiceHpContainer.position.set(5.75, -4.95, 0);
    pChoiceHpContainer.name = "pChoiceHp";

    // Player Attack Choice - Level
    const pChoiceLevel = document.createElement("div");
    pChoiceLevel.id = "pChoiceLevel"
    pChoiceLevel.className = "choice";
    const pChoiceLevelContainer = new CSS2DObject(pChoiceLevel);
    pChoiceLevelContainer.position.set(7.6, -4.95, 0);
    pChoiceLevelContainer.name = "pChoiceLevel";
    
    // Player Attack Choice - Specialty
    const pChoiceSp = document.createElement("img");
    pChoiceSp.id = "pChoiceSp"
    pChoiceSp.className = "choice-img";
    const pChoiceSpContainer = new CSS2DObject(pChoiceSp);
    pChoiceSpContainer.position.set(5, -4.95, 0);
    pChoiceSpContainer.name = "pChoiceSp";

    // Player Attack Choice - 〇 Name
    const pChoiceONm = document.createElement("div");
    pChoiceONm.id = "pChoiceONm"
    pChoiceONm.className = "choice";
    const pChoiceONmContainer = new CSS2DObject(pChoiceONm);
    pChoiceONmContainer.position.set(-0.2, -5.5, 0);
    pChoiceONmContainer.name = "pChoiceONm";

    // Player Attack Choice - △ Name
    const pChoiceTNm = document.createElement("div");
    pChoiceTNm.id = "pChoiceTNm"
    pChoiceTNm.className = "choice";
    const pChoiceTNmContainer = new CSS2DObject(pChoiceTNm);
    pChoiceTNmContainer.position.set(-0.2, -6.1, -0.1);
    pChoiceTNmContainer.name = "pChoiceTNm";

    // Player Attack Choice - ✕ Name
    const pChoiceXNm = document.createElement("div");
    pChoiceXNm.id = "pChoiceXNm"
    pChoiceXNm.className = "choice";
    const pChoiceXNmContainer = new CSS2DObject(pChoiceXNm);
    pChoiceXNmContainer.position.set(-0.2, -6.7, -0.1);
    pChoiceXNmContainer.name = "pChoiceXNm";

    // Player Attack Choice - ✕ Effect
    const pChoiceXEff = document.createElement("div");
    pChoiceXEff.id = "pChoiceXEff"
    pChoiceXEff.className = "choice choice-x-eff";
    const pChoiceXEffContainer = new CSS2DObject(pChoiceXEff);
    pChoiceXEffContainer.position.set(1.9, -7.3, 0);
    pChoiceXEffContainer.name = "pChoiceXEff";

    // Player Attack Choice - 〇 Value
    const pChoiceOVal = document.createElement("div");
    pChoiceOVal.id = "pChoiceOVal"
    pChoiceOVal.className = "choice choice-val";
    const pChoiceOValContainer = new CSS2DObject(pChoiceOVal);
    pChoiceOValContainer.position.set(4.3, -5.5, 0);
    pChoiceOValContainer.name = "pChoiceOVal";

    // Player Attack Choice - △ Value
    const pChoiceTVal = document.createElement("div");
    pChoiceTVal.id = "pChoiceTVal"
    pChoiceTVal.className = "choice choice-val";
    const pChoiceTValContainer = new CSS2DObject(pChoiceTVal);
    pChoiceTValContainer.position.set(4.3, -6.1, 0);
    pChoiceTValContainer.name = "pChoiceTVal";

    // Player Attack Choice - ✕ Value
    const pChoiceXVal = document.createElement("div");
    pChoiceXVal.id = "pChoiceXVal"
    pChoiceXVal.className = "choice choice-val";
    const pChoiceXValContainer = new CSS2DObject(pChoiceXVal);
    pChoiceXValContainer.position.set(4.3, -6.7, 0);
    pChoiceXValContainer.name = "pChoiceXVal";

    // Player Attack Choice - ✕ Effect Speed
    const pChoiceXSpd = document.createElement("img");
    pChoiceXSpd.id = "pChoiceXSpd"
    pChoiceXSpd.className = "choice-img";
    const pChoiceXSpdContainer = new CSS2DObject(pChoiceXSpd);
    pChoiceXSpdContainer.position.set(3.1, -7.25, 0);
    pChoiceXSpdContainer.name = "pChoiceXSpd";

    // Player Attack Choice - Turn
    const pChoiceTurn = document.createElement("div");
    pChoiceTurn.id = "pChoiceTurn"
    pChoiceTurn.className = "choice choice-turn";
    const pChoiceTurnContainer = new CSS2DObject(pChoiceTurn);
    pChoiceTurnContainer.position.set(4.3, -7.3, 0);
    pChoiceTurnContainer.name = "pChoiceTurn";
    
    // Opponent Attack Choice - Name
    const oChoiceNm = document.createElement("div");
    oChoiceNm.id = "oChoiceNm"
    oChoiceNm.className = "choice choice-name";
    const oChoiceNmContainer = new CSS2DObject(oChoiceNm);
    oChoiceNmContainer.position.set(-2.15, 7.55, 0);
    oChoiceNmContainer.name = "oChoiceNm";
    
    // Opponent Attack Choice - HP
    const oChoiceHp = document.createElement("div");
    oChoiceHp.id = "oChoiceHp"
    oChoiceHp.className = "choice";
    const oChoiceHpContainer = new CSS2DObject(oChoiceHp);
    oChoiceHpContainer.position.set(5.65, 7.55, 0);
    oChoiceHpContainer.name = "oChoiceHp";

    // Opponent Attack Choice - Level
    const oChoiceLevel = document.createElement("div");
    oChoiceLevel.id = "oChoiceLevel"
    oChoiceLevel.className = "choice";
    const oChoiceLevelContainer = new CSS2DObject(oChoiceLevel);
    oChoiceLevelContainer.position.set(7.6, 7.55, 0);
    oChoiceLevelContainer.name = "oChoiceLevel";
    
    // Opponent Attack Choice - Specialty
    const oChoiceSp = document.createElement("img");
    oChoiceSp.id = "oChoiceSp"
    oChoiceSp.className = "choice-img";
    const oChoiceSpContainer = new CSS2DObject(oChoiceSp);
    oChoiceSpContainer.position.set(5, 7.55, 0);
    oChoiceSpContainer.name = "oChoiceSp";

    // Opponent Attack Choice - 〇 Name
    const oChoiceONm = document.createElement("div");
    oChoiceONm.id = "oChoiceONm"
    oChoiceONm.className = "choice";
    const oChoiceONmContainer = new CSS2DObject(oChoiceONm);
    oChoiceONmContainer.position.set(-0.2, 6.97, 0);
    oChoiceONmContainer.name = "oChoiceONm";

    // Opponent Attack Choice - △ Name
    const oChoiceTNm = document.createElement("div");
    oChoiceTNm.id = "oChoiceTNm"
    oChoiceTNm.className = "choice";
    const oChoiceTNmContainer = new CSS2DObject(oChoiceTNm);
    oChoiceTNmContainer.position.set(-0.2, 6.42, -0.1);
    oChoiceTNmContainer.name = "oChoiceTNm";

    // Opponent Attack Choice - ✕ Name
    const oChoiceXNm = document.createElement("div");
    oChoiceXNm.id = "oChoiceXNm"
    oChoiceXNm.className = "choice";
    const oChoiceXNmContainer = new CSS2DObject(oChoiceXNm);
    oChoiceXNmContainer.position.set(-0.2, 5.83, -0.1);
    oChoiceXNmContainer.name = "oChoiceXNm";

    // Opponent Attack Choice - ✕ Effect
    const oChoiceXEff = document.createElement("div");
    oChoiceXEff.id = "oChoiceXEff"
    oChoiceXEff.className = "choice choice-x-eff";
    const oChoiceXEffContainer = new CSS2DObject(oChoiceXEff);
    oChoiceXEffContainer.position.set(1.95, 5.25, 0);
    oChoiceXEffContainer.name = "oChoiceXEff";

    // Opponent Attack Choice - 〇 Value
    const oChoiceOVal = document.createElement("div");
    oChoiceOVal.id = "oChoiceOVal"
    oChoiceOVal.className = "choice choice-val";
    const oChoiceOValContainer = new CSS2DObject(oChoiceOVal);
    oChoiceOValContainer.position.set(4.3, 6.97, 0);
    oChoiceOValContainer.name = "oChoiceOVal";

    // Opponent Attack Choice - △ Value
    const oChoiceTVal = document.createElement("div");
    oChoiceTVal.id = "oChoiceTVal"
    oChoiceTVal.className = "choice choice-val";
    const oChoiceTValContainer = new CSS2DObject(oChoiceTVal);
    oChoiceTValContainer.position.set(4.3, 6.42, 0);
    oChoiceTValContainer.name = "oChoiceTVal";

    // Opponent Attack Choice - ✕ Value
    const oChoiceXVal = document.createElement("div");
    oChoiceXVal.id = "oChoiceXVal"
    oChoiceXVal.className = "choice choice-val";
    const oChoiceXValContainer = new CSS2DObject(oChoiceXVal);
    oChoiceXValContainer.position.set(4.3, 5.83, 0);
    oChoiceXValContainer.name = "oChoiceXVal";

    // Opponent Attack Choice - ✕ Effect Speed
    const oChoiceXSpd = document.createElement("img");
    oChoiceXSpd.id = "oChoiceXSpd"
    oChoiceXSpd.className = "choice-img";
    const oChoiceXSpdContainer = new CSS2DObject(oChoiceXSpd);
    oChoiceXSpdContainer.position.set(3.1, 5.2, 0);
    oChoiceXSpdContainer.name = "oChoiceXSpd";

    // Opponent Attack Choice - Turn
    const oChoiceTurn = document.createElement("div");
    oChoiceTurn.id = "oChoiceTurn"
    oChoiceTurn.className = "choice choice-turn";
    const oChoiceTurnContainer = new CSS2DObject(oChoiceTurn);
    oChoiceTurnContainer.position.set(4.3, 5.25, 0);
    oChoiceTurnContainer.name = "oChoiceTurn";

    return [
        pChoiceNmContainer,
        pChoiceHpContainer,
        pChoiceLevelContainer,
        pChoiceSpContainer,
        pChoiceONmContainer,
        pChoiceTNmContainer,
        pChoiceXNmContainer,
        pChoiceXEffContainer,
        pChoiceOValContainer,
        pChoiceTValContainer,
        pChoiceXValContainer,
        pChoiceXSpdContainer,
        pChoiceTurnContainer,
        oChoiceNmContainer,
        oChoiceHpContainer,
        oChoiceLevelContainer,
        oChoiceSpContainer,
        oChoiceONmContainer,
        oChoiceTNmContainer,
        oChoiceXNmContainer,
        oChoiceXEffContainer,
        oChoiceOValContainer,
        oChoiceTValContainer,
        oChoiceXValContainer,
        oChoiceXSpdContainer,
        oChoiceTurnContainer,
    ];
}

export const createChoiceHoverComponents = () => {
    // Player Attack Choice - 〇 Name Hover
    const choiceOHover = document.createElement("div");
    choiceOHover.id = "choiceOHover"
    choiceOHover.className = "attack-choice-invisible"
    choiceOHover.addEventListener("pointerover", () => {
        choiceOHover.className = "attack-choice-bloom";
    })
    choiceOHover.addEventListener("pointerleave", () => {
        choiceOHover.className = "attack-choice-invisible";
    })
    choiceOHover.addEventListener("pointerdown", () => {
        usePlayerStore().setPAttack(ATTACK.C)
        if (useStateStore().oppMode == MODE.PROD) {
            socket.emit("set-attack-choice", ATTACK.C)
        }
    })
    const choiceOHoverContainer = new CSS2DObject(choiceOHover);
    choiceOHoverContainer.position.set(0, -5.5, 0);
    choiceOHoverContainer.name = "choiceOHover";

    // Player Attack Choice - △ Name Hover
    const choiceTHover = document.createElement("div");
    choiceTHover.id = "choiceTHover"
    choiceTHover.className = "attack-choice-invisible"
    choiceTHover.addEventListener("pointerover", () => {
        choiceTHover.className = "attack-choice-bloom";
    })
    choiceTHover.addEventListener("pointerleave", () => {
        choiceTHover.className = "attack-choice-invisible";
    })
    choiceTHover.addEventListener("pointerdown", () => {
        usePlayerStore().setPAttack(ATTACK.T)
        if (useStateStore().oppMode == MODE.PROD) {
            socket.emit("set-attack-choice", ATTACK.T)
        }
    })
    const choiceTHoverContainer = new CSS2DObject(choiceTHover);
    choiceTHoverContainer.position.set(0, -6.05, 0);
    choiceTHoverContainer.name = "choiceTHover";

    // Player Attack Choice - ✕ Name Hover
    const choiceXHover = document.createElement("div");
    choiceXHover.id = "choiceXHover"
    choiceXHover.className = "attack-choice-invisible"
    choiceXHover.addEventListener("pointerover", () => {
        choiceXHover.className = "attack-choice-bloom";
    })
    choiceXHover.addEventListener("pointerleave", () => {
        choiceXHover.className = "attack-choice-invisible";
    })
    choiceXHover.addEventListener("pointerdown", () => {
        usePlayerStore().setPAttack(ATTACK.X)
        if (useStateStore().oppMode == MODE.PROD) {
            socket.emit("set-attack-choice", ATTACK.X)
        }
    })
    const choiceXHoverContainer = new CSS2DObject(choiceXHover);
    choiceXHoverContainer.position.set(0, -6.65, 0);
    choiceXHoverContainer.name = "choiceXHover";

    return [
        choiceOHoverContainer,
        choiceTHoverContainer,
        choiceXHoverContainer,
    ]
}

export const createInfoComponents = () => {
    // Info Board - Name
    const infoNm = document.createElement("div");
    infoNm.id = "infoNm"
    infoNm.className = "info info-name";
    const infoNmContainer = new CSS2DObject(infoNm);
    infoNmContainer.position.set(-16.75, 4.13, 0);
    infoNmContainer.name = "infoNm";
    
    // Info Board - HP
    const infoHp = document.createElement("div");
    infoHp.id = "infoHp"
    infoHp.className = "info info-val";
    const infoHpContainer = new CSS2DObject(infoHp);
    infoHpContainer.position.set(-18.4, 3.55, 0);
    infoHpContainer.name = "infoHp";

    // Info Board - 〇 Value
    const infoOVal = document.createElement("div");
    infoOVal.id = "infoOVal"
    infoOVal.className = "info info-val";
    const infoOValContainer = new CSS2DObject(infoOVal);
    infoOValContainer.position.set(-18.4, 3, 0);
    infoOValContainer.name = "infoOVal";

    // Info Board - △ Value
    const infoTVal = document.createElement("div");
    infoTVal.id = "infoTVal"
    infoTVal.className = "info info-val";
    const infoTValContainer = new CSS2DObject(infoTVal);
    infoTValContainer.position.set(-18.4, 2.46, 0);
    infoTValContainer.name = "infoTVal";

    // Info Board - ✕ Value
    const infoXVal = document.createElement("div");
    infoXVal.id = "infoXVal"
    infoXVal.className = "info info-val";
    const infoXValContainer = new CSS2DObject(infoXVal);
    infoXValContainer.position.set(-18.4, 1.95, 0);
    infoXValContainer.name = "infoXVal";
    
    // Info Board - ✕ Effect
    const infoXEff = document.createElement("div");
    infoXEff.id = "infoXEff"
    infoXEff.className = "info info-x-eff";
    const infoXEffContainer = new CSS2DObject(infoXEff);
    infoXEffContainer.position.set(-18.8, 1.5, 0);
    infoXEffContainer.name = "infoXEff";

    // Info Board - ✕ Effect Speed
    const infoXSpd = document.createElement("img");
    infoXSpd.id = "infoXSpd"
    infoXSpd.className = "info-img";
    const infoXSpdContainer = new CSS2DObject(infoXSpd);
    infoXSpdContainer.position.set(-17.25, 1.55, 0);
    infoXSpdContainer.name = "infoXSpd";

    // Info Board - Level
    const infoLevel = document.createElement("div");
    infoLevel.id = "infoLevel"
    infoLevel.className = "info";
    const infoLevelContainer = new CSS2DObject(infoLevel);
    infoLevelContainer.position.set(-12.65, 4.13, 0);
    infoLevelContainer.name = "infoLevel";

    // Info Board - Specialty
    const infoSp = document.createElement("img");
    infoSp.id = "infoSp"
    infoSp.className = "info-img";
    const infoSpContainer = new CSS2DObject(infoSp);
    infoSpContainer.position.set(-13.42, 4.13, 0);
    infoSpContainer.name = "infoSp";

    // Info Board - DP
    const infoDp = document.createElement("div");
    infoDp.id = "infoDp"
    infoDp.className = "info info-dp";
    const infoDpContainer = new CSS2DObject(infoDp);
    infoDpContainer.position.set(-16.9, 3.15, 0);
    infoDpContainer.name = "infoDp";
    
    // Info Board - PP
    const infoPp = document.createElement("div");
    infoPp.id = "infoPp"
    infoPp.className = "info info-dp";
    const infoPpContainer = new CSS2DObject(infoPp);
    infoPpContainer.position.set(-16.9, 2.2, 0);
    infoPpContainer.name = "infoPp";
    
    // Info Board - Support
    const infoSupport = document.createElement("div");
    infoSupport.id = "infoSupport"
    infoSupport.className = "info info-eff";
    const infoSupportContainer = new CSS2DObject(infoSupport);
    infoSupportContainer.position.set(-13.5, 2.55, 0);
    infoSupportContainer.name = "infoSupport";
    
    // Info Board - Support Speed
    const infoSupportSpd = document.createElement("img");
    infoSupportSpd.id = "infoSupportSpd"
    infoSupportSpd.className = "info-img";
    const infoSupportSpdContainer = new CSS2DObject(infoSupportSpd);
    infoSupportSpdContainer.position.set(-11.9, 4.11, 0);
    infoSupportSpdContainer.name = "infoSupportSpd";

    return [
        infoNmContainer,
        infoHpContainer,
        infoOValContainer,
        infoTValContainer,
        infoXValContainer,
        infoXEffContainer,
        infoXSpdContainer,
        infoLevelContainer,
        infoSpContainer,
        infoDpContainer,
        infoPpContainer,
        infoSupportContainer,
        infoSupportSpdContainer
    ];
}

export const createCommonUiComponents = () => {
    // Number Popup
    const numberPopupUi = document.createElement("div");
    numberPopupUi.id = "numberPopupUi"
    numberPopupUi.className = "number-popup"
    numberPopupUi.style.visibility = "hidden"
    const numberPopupUiContainer = new CSS2DObject(numberPopupUi);
    numberPopupUiContainer.name = "numberPopupUi";

    // 〇 Popup
    const cPopup = document.createElement("div");
    cPopup.id = "cPopup"
    cPopup.className = "number-popup"
    cPopup.style.visibility = "hidden"
    const cPopupContainer = new CSS2DObject(cPopup);
    cPopupContainer.name = "cPopup";

    // △ Popup
    const tPopup = document.createElement("div");
    tPopup.id = "tPopup"
    tPopup.className = "number-popup"
    tPopup.style.visibility = "hidden"
    const tPopupContainer = new CSS2DObject(tPopup);
    tPopupContainer.name = "tPopup";

    // ✕ Popup
    const xPopup = document.createElement("div");
    xPopup.id = "xPopup"
    xPopup.className = "number-popup"
    xPopup.style.visibility = "hidden"
    const xPopupContainer = new CSS2DObject(xPopup);
    xPopupContainer.name = "xPopup";
    
    // OK! Popup Hand 0 - Leftmost
    const okUi0 = document.createElement("img");
    okUi0.id = "okUi0"
    okUi0.className = "ok-popup svg-white"
    okUi0.src = "src/assets/symbols/square-check-regular.svg"
    okUi0.style.visibility = "hidden"
    const okUi0Container = new CSS2DObject(okUi0);
    okUi0Container.position.set(-2, -1.5, 0);
    okUi0Container.name = "okUi0";
    
    // OK! Popup Hand 1
    const okUi1 = document.createElement("img");
    okUi1.id = "okUi1"
    okUi1.className = "ok-popup svg-white"
    okUi1.src = "src/assets/symbols/square-check-regular.svg"
    okUi1.style.visibility = "hidden"
    const okUi1Container = new CSS2DObject(okUi1);
    okUi1Container.position.set(-0.1, -1.5, 0)
    okUi1Container.name = "okUi1";
    
    // OK! Popup Hand 2
    const okUi2 = document.createElement("img");
    okUi2.id = "okUi2"
    okUi2.className = "ok-popup svg-white"
    okUi2.src = "src/assets/symbols/square-check-regular.svg"
    okUi2.style.visibility = "hidden"
    const okUi2Container = new CSS2DObject(okUi2);
    okUi2Container.position.set(1.8, -1.5, 0)
    okUi2Container.name = "okUi2";
    
    // OK! Popup Hand 3 - Rightmost
    const okUi3 = document.createElement("img");
    okUi3.id = "okUi3"
    okUi3.className = "ok-popup svg-white"
    okUi3.src = "src/assets/symbols/square-check-regular.svg"
    okUi3.style.visibility = "hidden"
    const okUi3Container = new CSS2DObject(okUi3);
    okUi3Container.position.set(3.7, -1.5, 0)
    okUi3Container.name = "okUi3";

    // OK! Popup Deck
    const okUiDeck = document.createElement("img");
    okUiDeck.id = "okUiDeck"
    okUiDeck.className = "ok-popup svg-white"
    okUiDeck.src = "src/assets/symbols/square-check-regular.svg"
    okUiDeck.style.visibility = "hidden"
    const okUiDeckContainer = new CSS2DObject(okUiDeck);
    okUiDeckContainer.position.set(-3.8, -2.6, 0)
    okUiDeckContainer.name = "okUiDeck";

    // Player Win bar 1
    const pWinBar1 = document.createElement("img");
    pWinBar1.id = "pWinBar1"
    pWinBar1.src = "src/sprites/win-bar.png"
    pWinBar1.style.visibility = "hidden"
    pWinBar1.style.height = "3vw"
    pWinBar1.style.width = "7vw"
    const pWinBarContainer1 = new CSS2DObject(pWinBar1);
    pWinBarContainer1.position.set(4.97, -1.86, 0)
    pWinBarContainer1.name = "pWinBar1";

    // Player Win bar 2
    const pWinBar2 = document.createElement("img");
    pWinBar2.id = "pWinBar2"
    pWinBar2.src = "src/sprites/win-bar.png"
    pWinBar2.style.visibility = "hidden"
    pWinBar2.style.height = "3vw"
    pWinBar2.style.width = "7vw"
    const pWinBarContainer2 = new CSS2DObject(pWinBar2);
    pWinBarContainer2.position.set(4.97, -2.55, 0)
    pWinBarContainer2.name = "pWinBar2";
    
    // Player Win bar 3
    const pWinBar3 = document.createElement("img");
    pWinBar3.id = "pWinBar3"
    pWinBar3.src = "src/sprites/win-bar.png"
    pWinBar3.style.visibility = "hidden"
    pWinBar3.style.height = "3vw"
    pWinBar3.style.width = "7vw"
    const pWinBarContainer3 = new CSS2DObject(pWinBar3);
    pWinBarContainer3.position.set(4.97, -3.2, 0)
    pWinBarContainer3.name = "pWinBar3";
    
    // Opponent Win bar 1
    const oWinBar1 = document.createElement("img");
    oWinBar1.id = "oWinBar1"
    oWinBar1.src = "src/sprites/win-bar.png"
    oWinBar1.style.visibility = "hidden"
    oWinBar1.style.height = "3vw"
    oWinBar1.style.width = "7vw"
    const oWinBarContainer1 = new CSS2DObject(oWinBar1);
    oWinBarContainer1.position.set(-4.97, 3.25, 0);
    oWinBarContainer1.name = "oWinBar1";
    
    // Opponent Win bar 2
    const oWinBar2 = document.createElement("img");
    oWinBar2.id = "oWinBar2"
    oWinBar2.src = "src/sprites/win-bar.png"
    oWinBar2.style.visibility = "hidden"
    oWinBar2.style.height = "3vw"
    oWinBar2.style.width = "7vw"
    const oWinBarContainer2 = new CSS2DObject(oWinBar2);
    oWinBarContainer2.position.set(-4.97, 2.6, 0);
    oWinBarContainer2.name = "oWinBar2";
    
    // Opponent Win bar 3
    const oWinBar3 = document.createElement("img");
    oWinBar3.id = "oWinBar3"
    oWinBar3.src = "src/sprites/win-bar.png"
    oWinBar3.style.visibility = "hidden"
    oWinBar3.style.height = "3vw"
    oWinBar3.style.width = "7vw"
    const oWinBarContainer3 = new CSS2DObject(oWinBar3);
    oWinBarContainer3.position.set(-4.97, 1.93, 0);
    oWinBarContainer3.name = "oWinBar3";

    // Misfire Failure
    const misfireFailurePopup = document.createElement("div");
    misfireFailurePopup.id = "misfireFailurePopup"
    misfireFailurePopup.className = "misfire-failure-popup"
    misfireFailurePopup.innerHTML = "Misfire Failure"
    misfireFailurePopup.style.visibility = "hidden"
    const misfireFailurePopupContainer = new CSS2DObject(misfireFailurePopup);
    misfireFailurePopupContainer.name = "misfireFailurePopup";
    
    // Battle Status Popup
    const battleStatusPopup = document.createElement("div");
    battleStatusPopup.id = "battleStatusPopup"
    battleStatusPopup.className = "eatup-hp-popup"
    battleStatusPopup.innerHTML = "Eat-Up HP"
    battleStatusPopup.style.visibility = "hidden"
    const battleStatusPopupContainer = new CSS2DObject(battleStatusPopup);
    battleStatusPopupContainer.name = "battleStatusPopup";
    
    // Player Name
    const playerName = document.createElement("div");
    playerName.id = "playerName"
    playerName.className = "user-label"
    playerName.innerHTML = "Trainer A"
    const playerNameContainer = new CSS2DObject(playerName);
    playerNameContainer.position.set(-2.7, -4, 0);
    playerNameContainer.name = "playerName";

    // Player Deck Name
    const playerDeckName = document.createElement("div");
    playerDeckName.id = "playerDeckName"
    playerDeckName.className = "user-label"
    playerDeckName.innerHTML = "Tricolor Deck"
    const playerDeckNameContainer = new CSS2DObject(playerDeckName);
    playerDeckNameContainer.position.set(3, -4, 0);
    playerDeckNameContainer.name = "playerDeckName";
    
    // Opponent Name
    const oppName = document.createElement("div");
    oppName.id = "oppName"
    oppName.className = "user-label"
    oppName.innerHTML = ""
    const oppNameContainer = new CSS2DObject(oppName);
    oppNameContainer.position.set(3, 4, 0);
    oppNameContainer.name = "oppName";
    
    // Opponent Deck Name
    const oppDeckName = document.createElement("div");
    oppDeckName.id = "oppDeckName"
    oppDeckName.className = "user-label"
    oppDeckName.innerHTML = "Super Long Deck Name"
    const oppDeckNameContainer = new CSS2DObject(oppDeckName);
    oppDeckNameContainer.position.set(-2.7, 4, 0);
    oppDeckNameContainer.name = "oppDeckName";

    // Match result banner
    const matchResult = document.createElement("div");
    matchResult.id = "matchResult"
    matchResult.className = "match-result-banner"
    matchResult.innerHTML = "3 Wins, 0 Losses - Trainer A WINS!"
    matchResult.style.visibility = "hidden"
    const matchResultContainer = new CSS2DObject(matchResult);
    matchResultContainer.position.set(0, 0, 1);
    matchResultContainer.name = "matchResult";

    // Player Attack choice
    const choiceDisplayP = document.createElement("div");
    choiceDisplayP.id = "choiceDisplayP"
    choiceDisplayP.className = "attack-choice-display"
    choiceDisplayP.innerHTML = ""
    const choiceDisplayPContainer = new CSS2DObject(choiceDisplayP);
    choiceDisplayPContainer.position.set(0, -7, 1);
    choiceDisplayPContainer.name = "choiceDisplayP";

    // Opponent Attack choice
    const choiceDisplayO = document.createElement("div");
    choiceDisplayO.id = "choiceDisplayO"
    choiceDisplayO.className = "attack-choice-display"
    choiceDisplayO.innerHTML = ""
    const choiceDisplayOContainer = new CSS2DObject(choiceDisplayO);
    choiceDisplayOContainer.position.set(0, 7, 1);
    choiceDisplayOContainer.name = "choiceDisplayO";

    // Field Pulse
    const fieldPulse = document.createElement("div");
    fieldPulse.id = "fieldPulse"
    const fieldPulseContainer = new CSS2DObject(fieldPulse);
    fieldPulseContainer.name = "fieldPulse";

    // Player Attack Pulse
    const pulseP = document.createElement("div");
    pulseP.id = "pulseP"
    const pulsePContainer = new CSS2DObject(pulseP);
    pulsePContainer.name = "pulseP";

    // Opponent Attack Pulse
    const pulseO = document.createElement("div");
    pulseO.id = "pulseO"
    const pulseOContainer = new CSS2DObject(pulseO);
    pulseOContainer.name = "pulseO";

    return [
        numberPopupUiContainer,
        cPopupContainer,
        tPopupContainer,
        xPopupContainer,
        okUi0Container,
        okUi1Container,
        okUi2Container,
        okUi3Container,
        okUiDeckContainer,
        pWinBarContainer1,
        pWinBarContainer2,
        pWinBarContainer3,
        oWinBarContainer1,
        oWinBarContainer2,
        oWinBarContainer3,
        misfireFailurePopupContainer,
        battleStatusPopupContainer,
        playerNameContainer,
        playerDeckNameContainer,
        oppNameContainer,
        oppDeckNameContainer,
        matchResultContainer,
        choiceDisplayPContainer,
        choiceDisplayOContainer,
        fieldPulseContainer,
        pulsePContainer,
        pulseOContainer,
    ]
}