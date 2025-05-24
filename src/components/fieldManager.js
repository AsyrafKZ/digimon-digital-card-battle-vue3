import { PHASE, DECK_NAME, WHO, CARD_NAME, MODE, LEVEL } from "../const/const";
import { useStateStore } from "../stores/state";
import { usePlayerStore } from "../stores/player";
import { useOpponentStore } from "../stores/opponent";
import { levelToNumber, speedToImg, specialtyToImg, specialtyToClass, setPenalty, turnToStr } from "../utils/mapper";
import { animateSupportToOffline, animateDpToOffline, animateHandToOffline, animateCardToHand, animateCardToSupport, animateActiveToOffline, animateDeckCardToOffline, animateOfflineCardToDeck, animatePow, animateHandToActive } from "../animations/monster";
import { animateMoveActiveField, animateMoveChoiceBoardIn } from "../animations/field"
import { addOCPower, addOTPower, addOXPower, addPCPower, addPTPower, addPXPower } from "../utils/battleCalculation";
import * as THREE from "three";

export const setOkPopup = (phase) => {
    const playerStore = usePlayerStore();
    const stateStore = useStateStore();
    const monsterCardMaxId = 190;

    // hide OK popup and return when it is opponent's turn
    if (stateStore.currentTurn == WHO.OPP && stateStore.phase != PHASE.SUPPORT1) {
        for (let i = 0; i < 4; i++) {
            document.getElementById(`okUi${i}`).style.visibility = "hidden"
        }
        document.getElementById(`okUiDeck`).style.visibility = "hidden"
        return;
    }

    // do nothing when RACK UP DP
    if (stateStore.phase == PHASE.RACK_UP_DP) {
        return;
    }

    // hide OK popup
    if (phase != PHASE.ENTRANCE || phase != PHASE.RACK_UP_DP || phase != PHASE.DIGIVOLVE) {
        for (let i = 0; i < 4; i++) {
            document.getElementById(`okUi${i}`).style.visibility = "hidden"
        }
        document.getElementById(`okUiDeck`).style.visibility = "hidden"
    }

    // hand card
    for (let i = 0; i < playerStore.pHand.length; i++) {
        const handCardId = playerStore.pHand[i];

        if (!handCardId) {
            document.getElementById(`okUi${i}`).style.visibility = "hidden"
            continue;
        }

        // ENTRANCE Phase
        if (phase == PHASE.ENTRANCE && parseInt(handCardId) <= monsterCardMaxId  && playerStore.pActiveMonStackCount == 0) {
            document.getElementById(`okUi${i}`).style.visibility = "visible"
        }
        // DIGIVOLVE Phase
        else if (phase == PHASE.DIGIVOLVE && parseInt(handCardId) <= monsterCardMaxId) {
            const card = playerStore.pCards.filter(el => el.id == handCardId)[0]
            const myLevel = levelToNumber(card.level)
            const mySpecialty = card.specialty
            const myDp = card.dp
            const activeDigimonLevel = levelToNumber(playerStore.pActiveMon.level)
            const activeDigimonSpecialty = playerStore.pActiveMon.specialty
            const totalDp = playerStore.pDpTotal

            // check if valid digivolution
            if (myLevel - activeDigimonLevel != 1) {
                console.log(`Incompatible digivolution. My level: ${myLevel}, active level: ${activeDigimonLevel}`)
                document.getElementById(`okUi${i}`).style.visibility = "hidden"
            } else if (mySpecialty != activeDigimonSpecialty) {
                console.log(`Incompatible digivolution. My specialty: ${mySpecialty}, active specialty: ${activeDigimonSpecialty}`)
                document.getElementById(`okUi${i}`).style.visibility = "hidden"
            } else if (myDp > totalDp) {
                console.log(`Incompatible digivolution. My DP: ${myDp}, total DP: ${totalDp}}`)
                document.getElementById(`okUi${i}`).style.visibility = "hidden"
            } else {
                document.getElementById(`okUi${i}`).style.visibility = "visible"
            }
        }
        // Support Phase
        else if (phase == PHASE.SUPPORT1 && stateStore.firstSetSupport == WHO.PLAYER) {
            if (playerStore.pSupport.cardId) {
                document.getElementById(`okUi${i}`).style.visibility = "hidden"
            } else {
                document.getElementById(`okUi${i}`).style.visibility = "visible"
            }
        }
        else if (phase == PHASE.SUPPORT2 && stateStore.firstSetSupport != WHO.PLAYER) {
            if (playerStore.pSupport.cardId) {
                document.getElementById(`okUi${i}`).style.visibility = "hidden"
            } else {
                document.getElementById(`okUi${i}`).style.visibility = "visible"
            }
        }
    }

    // deck top card
    // Support Phase
    if (phase == PHASE.SUPPORT1 && stateStore.firstSetSupport == WHO.PLAYER) {
        if (playerStore.pSupport.cardId) {
            document.getElementById(`okUiDeck`).style.visibility = "hidden"
        } else {
            document.getElementById(`okUiDeck`).style.visibility = "visible"
        }
    } 
    else if (phase == PHASE.SUPPORT2 && stateStore.firstSetSupport != WHO.PLAYER) {
        if (playerStore.pSupport.cardId) {
            document.getElementById(`okUiDeck`).style.visibility = "hidden"
        } else {
            document.getElementById(`okUiDeck`).style.visibility = "visible"
        }
    }
    // Other phases
    else {
        document.getElementById(`okUiDeck`).style.visibility = "hidden"
    }
}

/**
 * Add pulse effect when hover over
 */
export const addPulseEffect = (obj, renderer, pulseClass) => {
    // Calculate the bounding box of the object
    const bbox = new THREE.Box3().setFromObject(obj);
    // Get the top left corner in 3D space
    const topLeft3D = new THREE.Vector3(bbox.min.x, bbox.max.y, bbox.min.z);
    const bottomRight3D = new THREE.Vector3(bbox.max.x, bbox.min.y, bbox.min.z);
    topLeft3D.project(renderer.three.camera);
    bottomRight3D.project(renderer.three.camera);

    // get 2D window position
    const widthHalf = 0.5 * renderer.canvas.width;
    const heightHalf = 0.5 * renderer.canvas.height;

    topLeft3D.x = (topLeft3D.x * widthHalf) + widthHalf;
    topLeft3D.y = -(topLeft3D.y * heightHalf) + heightHalf;
    bottomRight3D.x = (bottomRight3D.x * widthHalf) + widthHalf;
    bottomRight3D.y = -(bottomRight3D.y * heightHalf) + heightHalf;

    // Calculate the width and height in 2D
    const width2D = Math.abs(bottomRight3D.x - topLeft3D.x) * 0.9;
    const height2D = Math.abs(bottomRight3D.y - topLeft3D.y) * 0.8;
    
    // pulse effect
    const pulse = document.getElementById("fieldPulse")
    pulse.style.top = `${topLeft3D.y + heightHalf * 0.02}px`
    pulse.style.left = `${topLeft3D.x + widthHalf * 0.01}px`
    pulse.style.height = `${height2D}px`
    pulse.style.width = `${width2D}px`
    pulse.style.visibility = "visible"
    pulse.classList.add(pulseClass)
}

/**
 * Remove pulse effect when not hover over
 */
export const removePulseEffect = () => {
    const pulse = document.getElementById("fieldPulse");
    pulse.classList.remove("pulse-effect-hover");
    pulse.classList.remove("pulse-effect-support");
    pulse.style.visibility = "hidden"
}

/**
 * Move support card to offline stack
*/
export const moveSupportToOffline = (scene) => {
    const playerStore = usePlayerStore();
    const oppStore = useOpponentStore();
    let pHasSupport = true;
    let oHasSupport = true;

    // if there is no card set, do nothing
    if (!playerStore.pSupport.cardId) {
        pHasSupport = false;
    }
    if (!oppStore.oSupport.cardId) {
        oHasSupport = false;
    }

    let card;
    if (pHasSupport) {
        card = scene.getObjectByName(`${CARD_NAME.PLAYER}${playerStore.pSupport.cardId}`);
        // animate
        animateSupportToOffline(card);
        // update offline
        playerStore.addPOffline(playerStore.pSupport.cardId);
        // remove player support state
        playerStore.removePSupport();
        // update offline count
        const offlineCnt = document.getElementById("pOfflineCount");
        offlineCnt.innerHTML = playerStore.pOfflineCount;
    }
    if (oHasSupport) {
        card = scene.getObjectByName(`${CARD_NAME.OPP}${oppStore.oSupport.cardId}`);
        // animate
        animateSupportToOffline(card);
        // update offline
        oppStore.addOOffline(oppStore.oSupport.cardId);
        // remove player support state
        oppStore.removeOSupport();
        // update offline count
        const offlineCnt = document.getElementById("oOfflineCount");
        offlineCnt.innerHTML = oppStore.oOfflineCount;
    }
}

/**
 * Draw cards from deck to hand
 */
export const drawDeckCardToHand = async (who, scene, count) => {
    const maxHandCount = 4;

    // PLAYER
    if (who == WHO.PLAYER) {
        const playerStore = usePlayerStore();
        const pDeck = scene.getObjectByName(DECK_NAME.PLAYER).children;

        // get how many to draw count
        const handCount = playerStore.pHandCount || 0;
        let drawCount;
        if (handCount + count > maxHandCount) {
            drawCount = maxHandCount - handCount
        } else {
            drawCount = count;
        }

        let cardsToDraw = []
        for (let i = 0; i < drawCount; i++) {
            const cardId = playerStore.pDeck[playerStore.pDeckCount - 1 - i];
            const card = pDeck.filter(card => card.name.replace(CARD_NAME.PLAYER, "") == cardId)[0]
            cardsToDraw.push(card)
        }

        // set cards to hand until 4
        for (let i = 0; i < drawCount; i++) {
            const card = cardsToDraw[i];

            if (!card) continue;

            // update deck count
            const cardId = card.name.replace(CARD_NAME.PLAYER, "");
            playerStore.removePDeck(cardId);
            const deckCnt = document.getElementById("pDeckCount");
            deckCnt.innerHTML = playerStore.pDeckCount;

            // animate
            await animateCardToHand(card, playerStore.pHandNextEmptyIndex);

            // update hand count
            playerStore.addPHand(cardId);
        }
    } else { // OPPONENT
        const oppStore = useOpponentStore();
        const oDeck = scene.getObjectByName(DECK_NAME.OPP).children;

        // get how many to draw count
        const handCount = oppStore.oHandCount || 0;
        let drawCount;
        if (handCount + count > maxHandCount) {
            drawCount = maxHandCount - handCount
        } else {
            drawCount = count;
        }

        let cardsToDraw = []
        for (let i = 0; i < drawCount; i++) {
            const cardId = oppStore.oDeck[oppStore.oDeckCount - 1 - i];
            const card = oDeck.filter(card => card.name.replace(CARD_NAME.OPP, "") == cardId)[0]
            cardsToDraw.push(card)
        }

        // set cards to hand until 4
        for (let i = 0; i < drawCount; i++) {
            const card = cardsToDraw[i];

            if (!card) continue;

            // update deck count
            const cardId = card.name.replace(CARD_NAME.OPP, "");            
            oppStore.removeODeck(cardId);
            const deckCnt = document.getElementById("oDeckCount");
            deckCnt.innerHTML = oppStore.oDeckCount;

            // animate
            await animateCardToHand(card, oppStore.oHandNextEmptyIndex);

            // update hand count
            oppStore.addOHand(cardId);
        }
    }
}

/**
 * Discard all cards in hand
 */
export const discardAllHandCards = async (who, scene) => {
    const playerStore = usePlayerStore();
    const oppStore = useOpponentStore();
    let handCards = [];

    if (who == WHO.PLAYER) {
        handCards = [...playerStore.pHand].filter(el => el).map((el) => {
            if (el) return `${CARD_NAME.PLAYER}${el}`
        });
        // remove all cards from hand to offline stack
        await discardPHandCards(scene, handCards);
    } else {
        handCards = [...oppStore.oHand].filter(el => el).map((el) => {
            if (el) return `${CARD_NAME.OPP}${el}`
        });
        // remove all cards from hand to offline stack
        await discardOHandCards(scene, handCards);
    }
}

/**
 * Discard n cards from hand to offline
 */
export const discardHandCardsGivenId = async (who, scene, cardIds) => {
    let handCards = [];

    if (who == WHO.PLAYER) {
        handCards = [cardIds].map((el) => {
            if (el) return `${CARD_NAME.PLAYER}${el}`
        });
        // remove cards from hand to offline stack
        await discardPHandCards(scene, handCards);
    } else {
        handCards = [cardIds].map((el) => {
            if (el) return `${CARD_NAME.OPP}${el}`
        });
        // remove cards from hand to offline stack
        await discardOHandCards(scene, handCards);
    }
}

const discardPHandCards = async (scene, handCards) => {
    const playerStore = usePlayerStore();
    const htmlCountId = "pOfflineCount";
    for (let i = 0; i < handCards.length; i++) {
        const cardName = handCards[i];
        const card = scene.getObjectByName(cardName)
        const cardId = cardName.replace(CARD_NAME.PLAYER, "");

        // update hand
        playerStore.removePHand(cardId);
        
        // animate
        await animateHandToOffline(card);
        
        // update offline
        playerStore.addPOffline(cardId);
        // update offline count
        const offlineCnt = document.getElementById(htmlCountId);
        offlineCnt.innerHTML = playerStore.pOfflineCount;
    }
}

const discardOHandCards = async (scene, handCards) => {
    const oppStore = useOpponentStore();
    const htmlCountId = "oOfflineCount";
    for (let i = 0; i < handCards.length; i++) {
        const cardName = handCards[i];
        const card = scene.getObjectByName(cardName)
        const cardId = cardName.replace(CARD_NAME.OPP, "");
        
        // update hand
        oppStore.removeOHand(cardId);

        // animate
        await animateHandToOffline(card);

        // update offline
        oppStore.addOOffline(cardId);
        // update offline count
        const offlineCnt = document.getElementById(htmlCountId);
        offlineCnt.innerHTML = oppStore.oOfflineCount;
    }
}

/**
 * Set Player DP stack cards to Offline stack
 * @param {*} scene 
 */
export const setPlayerDpToOffline = async (scene, count) => {
    const playerStore = usePlayerStore();
    let discardCount = count

    if (discardCount > playerStore.pDpCount) {
        discardCount = playerStore.pDpCount;
    }
    const dpList = playerStore.pDp.slice().reverse().slice(0, discardCount); // make new copy in reverse order

    // remove all DP card from DP rack to offline stack
    for (let i = 0; i < dpList.length; i++) {

        const dpCardName = CARD_NAME.PLAYER + dpList[i].id.padStart(3, 0);
        const dpObj = scene.getObjectByName(dpCardName)

        // detach card from active field, then attach to deck
        scene.getObjectByName(DECK_NAME.PLAYER).attach(dpObj)

        // update DP
        playerStore.removePDp();
        // update DP count
        const dpCnt = document.getElementById("pDpCount");
        dpCnt.innerHTML = playerStore.pDpTotal;

        // animate
        await animateDpToOffline(dpObj);

        // update offline
        playerStore.addPOffline(dpList[i].id);
        // update offline count
        const offlineCnt = document.getElementById("pOfflineCount");
        offlineCnt.innerHTML = playerStore.pOfflineCount;
    }
}

/**
 * Set Opponent DP stack cards to Offline stack
 * @param {*} scene 
 */
export const setOppDpToOffline = async (scene, count) => {
    const oppStore = useOpponentStore();
    let discardCount  = count

    if (discardCount > oppStore.oDpCount) {
        discardCount = oppStore.oDpCount;
    }
    const dpList = oppStore.oDp.slice().reverse().slice(0, discardCount); // make new copy in reverse order

    // remove all DP card from DP rack to offline stack
    for (let i = 0; i < dpList.length; i++) {

        const dpCardName = CARD_NAME.OPP + dpList[i].id;
        const dpObj = scene.getObjectByName(dpCardName);
        
        // detach card from active field, then attach to deck
        scene.getObjectByName(DECK_NAME.OPP).attach(dpObj)

        // update DP
        oppStore.removeODp();
        // update DP count
        const dpCnt = document.getElementById("oDpCount");
        dpCnt.innerHTML = oppStore.oDpTotal;

        // animate
        await animateDpToOffline(dpObj);

        // update offline
        oppStore.addOOffline(dpList[i].id);
        // update offline count
        const offlineCnt = document.getElementById("oOfflineCount");
        offlineCnt.innerHTML = oppStore.oOfflineCount;
    }
}

/**
 * Set card details to info board
 */
export const setCardToInfoBoard = (scene, texture, props) => {
    // set image
    const infoBoardImg = scene.getObjectByName("infoBoardImg");
    infoBoardImg.material.map = texture;
    infoBoardImg.material.needsUpdate = true; // <<<< IMPORTANT!!!

    const infoNm = document.getElementById("infoNm");
    const infoHp = document.getElementById("infoHp");
    const infoOVal = document.getElementById("infoOVal");
    const infoTVal = document.getElementById("infoTVal");
    const infoXVal = document.getElementById("infoXVal");
    const infoXEff = document.getElementById("infoXEff");
    const infoXSpd = document.getElementById("infoXSpd");
    const infoLevel = document.getElementById("infoLevel");
    const infoSp = document.getElementById("infoSp");
    const infoDp = document.getElementById("infoDp");
    const infoPp = document.getElementById("infoPp");
    const infoSupport = document.getElementById("infoSupport");
    const infoSupportSpd = document.getElementById("infoSupportSpd");

    infoNm.innerHTML = props.card.name;
    infoHp.innerHTML = props.card.hp || "";
    infoOVal.innerHTML = props.card.cPow || "";
    infoTVal.innerHTML = props.card.tPow || "";
    infoXVal.innerHTML = props.card.xPow || "";
    infoXEff.innerHTML = props.card.xEffect || "";
    infoLevel.innerHTML = props.card.level || "";
    infoSp.src = specialtyToImg(props.card.specialty) || "";
    infoSp.className = `info-img ${specialtyToClass(props.card.specialty)}` || "";
    infoDp.innerHTML = props.card.dp || "";
    infoPp.innerHTML = props.card.pp || "";
    infoSupport.innerHTML = props.card.support || props.card.effect;
    
    const infoXSpdImg = speedToImg(props.card.xEffectSpeed);
    if (infoXSpdImg) {
        infoXSpd.src = infoXSpdImg;
        infoXSpd.style.visibility = "visible"
    } else {
        infoXSpd.style.visibility = "hidden"
    }
    const supportSpdImg = speedToImg(props.card.supportSpeed || props.card.speed);
    if (supportSpdImg) {
        infoSupportSpd.src = supportSpdImg;
        infoSupportSpd.style.visibility = "visible"
    } else {
        infoSupportSpd.style.visibility = "hidden"
    }
};

/**
 * Move Attack Choice board in/out
 */
export const moveAttackChoiceBoardIn = (moveIn, pChoice, oChoice) => {
    // html components to hide/unhide
    const pDeckCount = document.getElementById("pDeckCount");
    const pOfflineCount = document.getElementById("pOfflineCount");
    const oDeckCount = document.getElementById("oDeckCount");
    const oOfflineCount = document.getElementById("oOfflineCount");
    
    const playerName = document.getElementById("playerName");
    const playerDeckName = document.getElementById("playerDeckName");
    const oppName = document.getElementById("oppName");
    const oppDeckName = document.getElementById("oppDeckName");

    const pChoiceTurn = document.getElementById("pChoiceTurn");
    const oChoiceTurn = document.getElementById("oChoiceTurn");

    // move board in
    if (moveIn) {
        pDeckCount.style.visibility = "hidden";
        pOfflineCount.style.visibility = "hidden";
        oDeckCount.style.visibility = "hidden";
        oOfflineCount.style.visibility = "hidden";
        playerName.style.visibility = "hidden";
        playerDeckName.style.visibility = "hidden";
        oppName.style.visibility = "hidden";
        oppDeckName.style.visibility = "hidden";
        setPWinBar(false);
        setOWinBar(false);
        
        pChoiceTurn.innerHTML = turnToStr(useStateStore().currentTurn == WHO.PLAYER ? "1" : "2");
        oChoiceTurn.innerHTML = turnToStr(useStateStore().currentTurn == WHO.OPP ? "1" : "2");
    } else {
        // move board out
        pDeckCount.style.visibility = "visible";
        pOfflineCount.style.visibility = "visible";
        oDeckCount.style.visibility = "visible";
        oOfflineCount.style.visibility = "visible";
        playerName.style.visibility = "visible";
        playerDeckName.style.visibility = "visible";
        oppName.style.visibility = "visible";
        oppDeckName.style.visibility = "visible";
        setPWinBar(true);
        setOWinBar(true);
    }

    animateMoveChoiceBoardIn(moveIn, pChoice, oChoice);
}

/**
 * Move Active Field in
 */
export const moveActiveFieldIn = (pAFieldC, pSupportC, oAFieldC, oSupportC) => {
    const isMoveIn = true;

    let aFieldC;
    let supportC;
    let isPlayer;

    aFieldC = pAFieldC.value.mesh;
    supportC = pSupportC.value.mesh;
    isPlayer = true;

    // animate
    animateMoveActiveField(isMoveIn, isPlayer, aFieldC, supportC);

    aFieldC = oAFieldC.value.mesh;
    supportC = oSupportC.value.mesh;
    isPlayer = false;

    // animate
    animateMoveActiveField(isMoveIn, isPlayer, aFieldC, supportC);

}

/**
 * Move Active Field in
 */
export const moveActiveFieldOut = (pAField, pSupport, oAField, oSupport) => {
    const stateStore = useStateStore();
    const isMoveIn = false;

    let aFieldC;
    let supportC;
    let isPlayer;

    if (stateStore.currentTurn == WHO.PLAYER) {
        if (stateStore.phase == PHASE.SUPPORT1) {
            aFieldC = oAField;
            supportC = oSupport;
            isPlayer = false;
        } else if (stateStore.phase == PHASE.DIGIVOLVE_SPECIAL || stateStore.phase == PHASE.SUPPORT2) {
            aFieldC = pAField;
            supportC = pSupport;
            isPlayer = true;
        }
    } else {
        if (stateStore.phase == PHASE.SUPPORT1) {
            aFieldC = pAField;
            supportC = pSupport;
            isPlayer = true;
        } else if (stateStore.phase == PHASE.DIGIVOLVE_SPECIAL || stateStore.phase == PHASE.SUPPORT2) {
            aFieldC = oAField;
            supportC = oSupport;
            isPlayer = false;
        }
    }

    // animate
    animateMoveActiveField(isMoveIn, isPlayer, aFieldC, supportC);
}

/**
 * Set Player Support card
 */
export const setPlayerSupport = async (scene, isDeckTopCard, card) => {
    const playerStore = usePlayerStore();
    const cardId = card.name.replace(CARD_NAME.PLAYER, "");
    const monsterCardMaxId = 190;
    let effectSpeed;
    if (cardId > monsterCardMaxId) {
        effectSpeed = playerStore.pCards.filter(el=>el.id==cardId)[0].speed;
    } else {
        effectSpeed = playerStore.pCards.filter(el=>el.id==cardId)[0].supportSpeed;
    }

    // remove glow effect
    removePulseEffect();

    // remove OK popup
    const cardIndex = playerStore.pHand.indexOf(cardId)
    if (cardIndex > -1) {
      isDeckTopCard = false;
      playerStore.removePHand(cardId);
    } else {
      playerStore.removePDeck(cardId);
      
      // update deck count
      const deckCnt = document.getElementById("pDeckCount");
      deckCnt.innerHTML = playerStore.pDeckCount;
    }

    // remove all OK popup
    for (let i = 0; i < playerStore.pHand.length; i++) {
      document.getElementById(`okUi${i}`).style.visibility = "hidden"
    }
    document.getElementById(`okUiDeck`).style.visibility = "hidden"

    playerStore.setPSupport(cardId, effectSpeed, isDeckTopCard);

    // animate
    await animateCardToSupport(card, isDeckTopCard);
}

/**
 * Set Opponent Support card
 */
export const setOppSupport = async (scene, isDeckTopCard, card) => {
    const oppStore = useOpponentStore();
    const cardId = card.name.replace(CARD_NAME.OPP, "");
    const monsterCardMaxId = 190;
    let effectSpeed;
    if (cardId > monsterCardMaxId) {
        effectSpeed = oppStore.oCards.filter(el=>el.id==cardId)[0].speed;
    } else {
        effectSpeed = oppStore.oCards.filter(el=>el.id==cardId)[0].supportSpeed;
    }

    // remove glow effect
    removePulseEffect();

    // remove OK popup
    const cardIndex = oppStore.oHand.indexOf(cardId)
    if (cardIndex > -1) {
      isDeckTopCard = false;
      oppStore.removeOHand(cardId);
    } else {
      // update deck count
      oppStore.removeODeck(cardId);

      const deckCnt = document.getElementById("oDeckCount");
      deckCnt.innerHTML = oppStore.oDeckCount;
    }

    // remove all OK popup
    for (let i = 0; i < oppStore.oHand.length; i++) {
      document.getElementById(`okUi${i}`).style.visibility = "hidden"
    }
    document.getElementById(`okUiDeck`).style.visibility = "hidden"

    oppStore.setOSupport(cardId, effectSpeed, isDeckTopCard);

    // animate
    await animateCardToSupport(card, isDeckTopCard);
}

export const movePlayerActiveToOffline = async (card) => {
    const playerStore = usePlayerStore();

    // clear active board
    const pActiveNm = document.getElementById("pActiveNm");
    const pActiveC = document.getElementById("pActiveC");
    const pActiveT = document.getElementById("pActiveT");
    const pActiveX = document.getElementById("pActiveX");
    const pActiveXEff = document.getElementById("pActiveXEff");
    const pActiveHpLbl = document.getElementById("pActiveHpLbl");
    const pActiveHp = document.getElementById("pActiveHp");
    pActiveNm.innerHTML = "";
    pActiveC.innerHTML = "";
    pActiveT.innerHTML = "";
    pActiveX.innerHTML = "";
    pActiveXEff.innerHTML = "";
    pActiveHp.innerHTML = "";
    pActiveHpLbl.style.visibility = "hidden";
    pActiveHp.style.visibility = "hidden";

    // animate
    await animateActiveToOffline(card);
    // update offline
    playerStore.addPOffline(card.name.replace(CARD_NAME.PLAYER, ""));
    // update offline count
    const offlineCnt = document.getElementById("pOfflineCount");
    offlineCnt.innerHTML = playerStore.pOfflineCount;
}

export const moveOppActiveToOffline = async (card) => {
    const oppStore = useOpponentStore();

    // clear active board
    const oActiveNm = document.getElementById("oActiveNm");
    const oActiveC = document.getElementById("oActiveC");
    const oActiveT = document.getElementById("oActiveT");
    const oActiveX = document.getElementById("oActiveX");
    const oActiveXEff = document.getElementById("oActiveXEff");
    const oActiveHpLbl = document.getElementById("oActiveHpLbl");
    const oActiveHp = document.getElementById("oActiveHp");
    oActiveNm.innerHTML = "";
    oActiveC.innerHTML = "";
    oActiveT.innerHTML = "";
    oActiveX.innerHTML = "";
    oActiveXEff.innerHTML = "";
    oActiveHp.innerHTML = "";
    oActiveHpLbl.style.visibility = "hidden";
    oActiveHp.style.visibility = "hidden";
    
    // animate
    await animateActiveToOffline(card);
    // update offline
    oppStore.addOOffline(card.name.replace(CARD_NAME.OPP, ""));
    // update offline count
    const offlineCnt = document.getElementById("oOfflineCount");
    offlineCnt.innerHTML = oppStore.oOfflineCount;
}


export const setPWinBar = (isVisible) => {
    const visibility = isVisible ? "visible" : "hidden";
    const playerStore = usePlayerStore();
    for (let i = 0; i < playerStore.pWinCount; i++) {
        const winBar = document.getElementById(`pWinBar${i+1}`)
        winBar.style.visibility = visibility;
    }
}
export const setOWinBar = (isVisible) => {
    const visibility = isVisible ? "visible" : "hidden";
    const oppStore = useOpponentStore();
    for (let i = 0; i < oppStore.oWinCount; i++) {
        const winBar = document.getElementById(`oWinBar${i+1}`)
        winBar.style.visibility = visibility;
    }
}

export const set1stAttackBanner = (scene) => {
    const stateStore = useStateStore();
    // Change turn
    if (stateStore.currentTurn == WHO.PLAYER) {
        stateStore.setTurn(WHO.OPP);
        scene.getObjectByName("firstAttackBanner").position.set(6.3, 2.5, 0) // opponent side
      } else {
        stateStore.setTurn(WHO.PLAYER);
        scene.getObjectByName("firstAttackBanner").position.set(6.3, -2.5, 0) // player side
      }
}

export const setToOriginalValue = () => {
    const stateStore = useStateStore();
    const playerStore = usePlayerStore();
    const oppStore = useOpponentStore();

    if (!(stateStore.playerMode == MODE.DEV && stateStore.oppMode == MODE.DEV)) {
        if (playerStore.pActiveMonStackCount > 0) {
            // add penalty
            const activeMon = playerStore.pCards.find(card => card.id == playerStore.pActiveMon.id);
            addPCPower(setPenalty(playerStore.pActiveMon.level, activeMon.cPow, playerStore.pActiveMonStackCount)- parseInt(playerStore.pActiveMon.cPow));
            addPTPower(setPenalty(playerStore.pActiveMon.level, activeMon.tPow, playerStore.pActiveMonStackCount)- parseInt(playerStore.pActiveMon.tPow));
            addPXPower(setPenalty(playerStore.pActiveMon.level, activeMon.xPow, playerStore.pActiveMonStackCount)- parseInt(playerStore.pActiveMon.xPow));
        }
        if (oppStore.oActiveMonStackCount > 0) {
            const activeMon = oppStore.oCards.find(card => card.id == oppStore.oActiveMon.id);
            addOCPower(setPenalty(oppStore.oActiveMon.level, activeMon.cPow, oppStore.oActiveMonStackCount)- parseInt(oppStore.oActiveMon.cPow));
            addOTPower(setPenalty(oppStore.oActiveMon.level, activeMon.tPow, oppStore.oActiveMonStackCount)- parseInt(oppStore.oActiveMon.tPow));
            addOXPower(setPenalty(oppStore.oActiveMon.level, activeMon.xPow, oppStore.oActiveMonStackCount)- parseInt(oppStore.oActiveMon.xPow));
        }
    }
    // Reset attack choice
    playerStore.setPAttack("");
    oppStore.setOAttack("");
}

export const moveReturnToMainMenuBtn = () => {
    const returnBtn = document.getElementById("returnBtnId");
    returnBtn.style.bottom = "37vh";
    returnBtn.style.left = "44vw";
    returnBtn.style.border = "1px solid white";
}

/**
 * Discard n deck cards to Offline stack
 * @param {*} scene 
 */
export const setDeckCardToOffline = async (who, scene, count) => {
    let discardCount;
    // PLAYER
    if (who == WHO.PLAYER) {
        const playerStore = usePlayerStore();
        discardCount = count > playerStore.pDeckCount ? playerStore.pDeckCount : count;
        const pDeck = scene.getObjectByName(DECK_NAME.PLAYER).children;

        // get cards to be discarded
        let cardsToDiscard = []
        for (let i = 0; i < discardCount; i++) {
            const cardId = playerStore.pDeck[playerStore.pDeckCount - 1 - i];
            const card = pDeck.filter(card => card.name.replace(CARD_NAME.PLAYER, "") == cardId)[0]
            cardsToDiscard.push(card)
        }

        // discard
        for (let i = 0; i < discardCount; i++) {
            const card = cardsToDiscard[i];

            if (!card) continue;

            // update deck count
            const cardId = card.name.replace(CARD_NAME.PLAYER, "");
            playerStore.removePDeck(cardId);
            const deckCnt = document.getElementById("pDeckCount");
            deckCnt.innerHTML = playerStore.pDeckCount;

            // animate
            await animateDeckCardToOffline(card);

            // update offline
            playerStore.addPOffline(cardId);
            // update offline count
            const offlineCnt = document.getElementById("pOfflineCount");
            offlineCnt.innerHTML = playerStore.pOfflineCount;
        }
    } else { // OPPONENT
        const oppStore = useOpponentStore();
        discardCount = count > oppStore.oDeckCount ? oppStore.oDeckCount : count;
        const oDeck = scene.getObjectByName(DECK_NAME.OPP).children;

        // get cards to be discarded
        let cardsToDiscard = []
        for (let i = 0; i < discardCount; i++) {
            const cardId = oppStore.oDeck[oppStore.oDeckCount - 1 - i];
            const card = oDeck.filter(card => card.name.replace(CARD_NAME.OPP, "") == cardId)[0]
            cardsToDiscard.push(card)
        }

        // discard
        for (let i = 0; i < discardCount; i++) {
            const card = cardsToDiscard[i];

            if (!card) continue;

            // update deck count
            const cardId = card.name.replace(CARD_NAME.OPP, "");            
            oppStore.removeODeck(cardId);
            const deckCnt = document.getElementById("oDeckCount");
            deckCnt.innerHTML = oppStore.oDeckCount;

            // animate
            await animateDeckCardToOffline(card);

            // update offline
            oppStore.addOOffline(cardId);
            // update offline count
            const offlineCnt = document.getElementById("oOfflineCount");
            offlineCnt.innerHTML = oppStore.oOfflineCount;
        }
    }
}

/**
 * Return Offline stack cards to Online Deck
 * @param {*} scene 
 */
export const setOfflineCardToDeck = async (who, scene, count) => {
    let returnCount;
    // PLAYER
    if (who == WHO.PLAYER) {
        const playerStore = usePlayerStore();
        returnCount = count > playerStore.pOfflineCount ? playerStore.pOfflineCount : count;

        // get cards to be returned
        let cardsToReturn = []
        for (let i = 0; i < returnCount; i++) {
            const cardId = playerStore.pOffline[playerStore.pOfflineCount - 1 - i];
            const card = scene.getObjectByName(CARD_NAME.PLAYER + cardId);
            cardsToReturn.push(card)
        }

        // return
        for (let i = 0; i < returnCount; i++) {
            const card = cardsToReturn[i];

            if (!card) continue;

            const cardId = card.name.replace(CARD_NAME.PLAYER, "");
            // update offline
            playerStore.removePOffline(cardId);
            const offlineCnt = document.getElementById("pOfflineCount");
            offlineCnt.innerHTML = playerStore.pOfflineCount;
            
            // animate
            await animateOfflineCardToDeck(card);
            
            // update deck
            playerStore.addPDeck(cardId);
            const deckCnt = document.getElementById("pDeckCount");
            deckCnt.innerHTML = playerStore.pDeckCount;
        }
    } else { // OPPONENT
        const oppStore = useOpponentStore();
        returnCount = count > oppStore.oOfflineCount ? oppStore.oOfflineCount : count;

        // get cards to be returned
        let cardsToReturn = []
        for (let i = 0; i < returnCount; i++) {
            const cardId = oppStore.oOffline[oppStore.oOfflineCount - 1 - i];
            const card = scene.getObjectByName(CARD_NAME.OPP + cardId);
            cardsToReturn.push(card)
        }

        // return
        for (let i = 0; i < returnCount; i++) {
            const card = cardsToReturn[i];

            if (!card) continue;
            
            const cardId = card.name.replace(CARD_NAME.OPP, "");            
            // update offline
            oppStore.removeOOffline(cardId);
            const offlineCnt = document.getElementById("oOfflineCount");
            offlineCnt.innerHTML = oppStore.oOfflineCount;
            
            // animate
            await animateOfflineCardToDeck(card);
            
            // update deck
            oppStore.addODeck(cardId);
            const deckCnt = document.getElementById("oDeckCount");
            deckCnt.innerHTML = oppStore.oDeckCount;
        }
    }
}

/**
 * Set Opponent Active Monster
 */
export const setOppActiveMon = async (activeMonObj, activeMonInfo, isDigivolving) => {
    const oppStore = useOpponentStore();

    // remove HP label temporarily
    document.getElementById("oActiveHp").style.visibility = "hidden";
    document.getElementById("oActiveHpLbl").style.visibility = "hidden";

    // update hand
    oppStore.removeOHand(activeMonInfo.id);
    // update state - current active digimon
    oppStore.setOActiveMon(activeMonInfo.id, activeMonInfo.name, activeMonInfo.level, activeMonInfo.specialty,
        activeMonInfo.cPow, activeMonInfo.tPow, activeMonInfo.xPow, activeMonInfo.xEffectSpeed, activeMonInfo.hp);

    // move selected card to active field
    await animateHandToActive(activeMonObj, isDigivolving);

    // set name
    const oActiveNm = document.getElementById("oActiveNm");
    oActiveNm.innerHTML = activeMonInfo.name;

    // set attack
    const oActiveC = document.getElementById("oActiveC");
    const oActiveT = document.getElementById("oActiveT");
    const oActiveX = document.getElementById("oActiveX");
    const oActiveXEff = document.getElementById("oActiveXEff");
    const oActiveHpLbl = document.getElementById("oActiveHpLbl");
    const oActiveHp = document.getElementById("oActiveHp");

    // set penalties for abnormal digivolution
    if (activeMonInfo.level != LEVEL.R && !isDigivolving) {
        oActiveC.classList.add("active-penalty");
        oActiveT.classList.add("active-penalty");
        oActiveX.classList.add("active-penalty");
        oActiveHp.classList.add("active-penalty");
        oppStore.oActiveMon.cPow = setPenalty(activeMonInfo.level, oppStore.oActiveMon.cPow, oppStore.oActiveMonStackCount)
        oppStore.oActiveMon.tPow = setPenalty(activeMonInfo.level, oppStore.oActiveMon.tPow, oppStore.oActiveMonStackCount)
        oppStore.oActiveMon.xPow = setPenalty(activeMonInfo.level, oppStore.oActiveMon.xPow, oppStore.oActiveMonStackCount)
        oppStore.oActiveMon.hp = setPenalty(activeMonInfo.level, oppStore.oActiveMon.hp, oppStore.oActiveMonStackCount)
    } else if (activeMonInfo.level == LEVEL.U && isDigivolving && oppStore.oActiveMonStackCount == 2) {
        oActiveC.classList.add("active-penalty");
        oActiveT.classList.add("active-penalty");
        oActiveX.classList.add("active-penalty");
        oActiveHp.classList.add("active-penalty");
        oppStore.oActiveMon.cPow = setPenalty(activeMonInfo.level, oppStore.oActiveMon.cPow, oppStore.oActiveMonStackCount)
        oppStore.oActiveMon.tPow = setPenalty(activeMonInfo.level, oppStore.oActiveMon.tPow, oppStore.oActiveMonStackCount)
        oppStore.oActiveMon.xPow = setPenalty(activeMonInfo.level, oppStore.oActiveMon.xPow, oppStore.oActiveMonStackCount)
        oppStore.oActiveMon.hp = setPenalty(activeMonInfo.level, oppStore.oActiveMon.hp, oppStore.oActiveMonStackCount)
    } else {
        oActiveC.classList.remove("active-penalty");
        oActiveT.classList.remove("active-penalty");
        oActiveX.classList.remove("active-penalty");
        oActiveHp.classList.remove("active-penalty");
    }

    // X Effect
    oActiveXEff.innerHTML = activeMonInfo.xEffect.toUpperCase();
    // HP label
    oActiveHpLbl.style.visibility = "visible";
    oActiveHpLbl.className = "active-hp-label";
    oActiveHpLbl.innerHTML = "HP";
    oActiveHp.style.visibility = "visible";

    // Numbers go up
    animatePow(oActiveC, oppStore.oActiveMon.cPow, 0);
    animatePow(oActiveT, oppStore.oActiveMon.tPow, 0);
    animatePow(oActiveX, oppStore.oActiveMon.xPow, 0);
    animatePow(oActiveHp, oppStore.oActiveMon.hp, 0);

    // Set details on Attack Choice Board
    const oChoiceNm = document.getElementById("oChoiceNm");
    const oChoiceONm = document.getElementById("oChoiceONm");
    const oChoiceTNm = document.getElementById("oChoiceTNm");
    const oChoiceXNm = document.getElementById("oChoiceXNm");
    const oChoiceOVal = document.getElementById("oChoiceOVal");
    const oChoiceTVal = document.getElementById("oChoiceTVal");
    const oChoiceXVal = document.getElementById("oChoiceXVal");
    const oChoiceXEff = document.getElementById("oChoiceXEff");
    const oChoiceXSpd = document.getElementById("oChoiceXSpd");
    const oChoiceHp = document.getElementById("oChoiceHp");
    const oChoiceLevel = document.getElementById("oChoiceLevel");
    const oChoiceSp = document.getElementById("oChoiceSp");

    oChoiceNm.innerHTML = activeMonInfo.name;
    oChoiceONm.innerHTML = activeMonInfo.cAttack;
    oChoiceTNm.innerHTML = activeMonInfo.tAttack;
    oChoiceXNm.innerHTML = activeMonInfo.xAttack;
    oChoiceOVal.innerHTML = oppStore.oActiveMon.cPow;
    oChoiceTVal.innerHTML = oppStore.oActiveMon.tPow;
    oChoiceXVal.innerHTML = oppStore.oActiveMon.xPow;
    oChoiceXEff.innerHTML = activeMonInfo.xEffect;
    oChoiceHp.innerHTML = oppStore.oActiveMon.hp;
    oChoiceLevel.innerHTML = activeMonInfo.level;
    oChoiceSp.src = specialtyToImg(activeMonInfo.specialty);
    oChoiceSp.className = `choice-img ${specialtyToClass(activeMonInfo.specialty)}`

    const speedImg = speedToImg(activeMonInfo.xEffectSpeed);
    if (speedImg) {
        oChoiceXSpd.src = speedImg;
        oChoiceXSpd.style.visibility = "visible"
    } else {
        oChoiceXSpd.style.visibility = "hidden"
    }
};