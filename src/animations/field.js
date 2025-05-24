import anime from "animejs";
import { useStateStore } from "../stores/state";
import { usePlayerStore } from "../stores/player";
import { ATTACK, CARD_NAME, WHO } from "../const/const";
import { setOWinBar, setOkPopup, setPWinBar } from "../components/fieldManager";
import { useOpponentStore } from "../stores/opponent";

export const animatePpPopup = async function (value, scene, isPlayer) {

    const popup = scene.getObjectByName("numberPopupUi");
    const popupHtml = document.getElementById("numberPopupUi")
    const ease = "linear"
    const duration = 50;
    const endDelay = 350;

    if (isPlayer) {
        popup.position.x = -6.5;
    } else {
        popup.position.x = 6.5;
    }
    popup.position.y = 0.7;
    
    const dy = 0.15;
    const y = popup.position.y + dy;
    
    popupHtml.innerHTML = `+${value}`;
    
    // animate
    anime({
        targets: [popup.position],
        y: y,
        duration: duration,
        easing: ease,
        endDelay: endDelay,
        begin: function () {
            popupHtml.style.visibility = "visible";
        }
    }).finished.then(() => {
        popupHtml.style.visibility = "hidden"
    });
}

export const animateHpPopup = async function (value, scene, isPlayer) {

    const popup = scene.getObjectByName("numberPopupUi");
    const popupHtml = document.getElementById("numberPopupUi")
    const ease = "linear"
    const duration = 50;
    const endDelay = 700;

    if (isPlayer) {
        popup.position.x = -2;
    } else {
        popup.position.x = 3.9;
    }
    popup.position.y = -0.5;
    
    const dy = 0.15;
    const y = popup.position.y + dy;
    
    popupHtml.innerHTML = value.toString().includes("-") ? `${value}` : `+${value}`;
    if (value < 0) {
        popupHtml.classList.add("number-popup-minus");
    }
    
    // animate
    await anime({
        targets: [popup.position],
        y: y,
        duration: duration,
        easing: ease,
        begin: function () {
            popupHtml.style.visibility = "visible";
        },
        endDelay: endDelay,
    }).finished.then(() => {
        popupHtml.style.visibility = "hidden"
        popupHtml.classList.remove("number-popup-minus");
    });
}

export const animatePowPopup = async function (value, scene, isPlayer, attack) {
    let popup;
    let popupHtml;
    const ease = "linear";
    const duration = 50;
    const endDelay = 700;
    
    // y position
    if (attack == ATTACK.C) {
        popup = scene.getObjectByName("cPopup");
        popupHtml = document.getElementById("cPopup");
        popup.position.y = 0.7;
    } else if (attack == ATTACK.T) {
        popup = scene.getObjectByName("tPopup");
        popupHtml = document.getElementById("tPopup");
        popup.position.y = 0.2;
    } else if (attack == ATTACK.X) {
        popup = scene.getObjectByName("xPopup");
        popupHtml = document.getElementById("xPopup");
        popup.position.y = -0.5;
    }
    // x position
    if (isPlayer) {
        popup.position.x = -4;
    } else {
        popup.position.x = 5.5;
    }
    // z position
    popup.position.z = 0.5;
    
    const dy = 0.15;
    const y = popup.position.y + dy;
    
    popupHtml.innerHTML = value.toString().includes("-") ? `${value}` : `+${value}`;
    if (value < 0) {
        popupHtml.classList.add("number-popup-minus");
    }
    
    // animate
    await anime({
        targets: [popup.position],
        y: y,
        duration: duration,
        easing: ease,
        begin: function () {
            popupHtml.style.visibility = "visible";
        },
        endDelay: endDelay,
    }).finished.then(() => {
        popupHtml.style.visibility = "hidden"
        popupHtml.classList.remove("number-popup-minus");
    });
}

export const animateMisfireFailurePopup = async function (scene, isPlayer, isXeff) {

    const popup = scene.getObjectByName("misfireFailurePopup");
    const popupHtml = document.getElementById("misfireFailurePopup");
    const ease = "linear"
    const duration = 50;
    const endDelay = 800;
    
    if (isPlayer) {
        if (isXeff) {
            popup.position.x = -3.45;
            popup.position.y = -0.5;
        } else {
            popup.position.x = -1.3;
            popup.position.y = -0.7;
        }
    } else {
        if (isXeff) {
            popup.position.x = 2.8;
            popup.position.y = -0.5;
        } else {
            popup.position.x = 0.8;
            popup.position.y = -0.3;
        }
    }
    
    const dy = 0.15;
    const y = popup.position.y + dy;
    
    // animate
    await anime({
        targets: [popup.position],
        y: y,
        duration: duration,
        easing: ease,
        endDelay: endDelay,
        begin: function () {
            popupHtml.style.visibility = "visible";
        }
    }).finished.then(() => {
        popupHtml.style.visibility = "hidden"
    });
}

export const animateBattleStatusPopup = async function (scene, isPlayer, msg) {

    const popup = scene.getObjectByName("battleStatusPopup");
    const popupHtml = document.getElementById("battleStatusPopup");
    const ease = "linear"
    const duration = 50;
    const endDelay = 800;

    if (isPlayer) {
        popup.position.x = -3.2;
    } else {
        popup.position.x = 3.1;
    }
    popup.position.y = 0;
    
    const dy = 0.15;
    const y = popup.position.y + dy;

    popupHtml.innerHTML = msg;
    
    // animate
    await anime({
        targets: [popup.position],
        y: y,
        duration: duration,
        easing: ease,
        endDelay: endDelay,
        begin: function () {
            popupHtml.style.visibility = "visible";
        }
    }).finished.then(() => {
        popupHtml.style.visibility = "hidden"
    });
}

/**
 * Flip support card during battle phase
 * @param {*} scene 
 */
export const animateFlipSupportCard = async (scene, who) => {
    const playerStore = usePlayerStore();
    const oppStore = useOpponentStore();
    let cardName;
    let card;
    let dy;
    
    if (who == WHO.PLAYER) {
        // flip only if support card from deck
        if (!playerStore.pSupport.isFromDeck) {
            return;
        }
        cardName = `${CARD_NAME.PLAYER}${playerStore.pSupport.cardId}`
        card = scene.getObjectByName(cardName)
        dy = -0.5
    } else {
        // flip only if support card from deck
        if (!oppStore.oSupport.isFromDeck) {
            return;
        }
        cardName = `${CARD_NAME.OPP}${oppStore.oSupport.cardId}`
        card = scene.getObjectByName(cardName)
        dy = 0.5
    }

    const yRotation = Math.PI * 2;
    const yPosition = card.position.y
    
    // animate
    anime({
        targets: [card.rotation],
        y: yRotation,
        duration: 200,
        easing: "linear",
    });
    await anime({
        targets: [card.position],
        keyframes: [
            { y: yPosition + dy, duration: 200 },
            { y: yPosition, duration: 200 },
        ],
        easing: "linear",
    }).finished;
}

/**
 * Move 2nd attack player field in/out to give 
 */
export const animateMoveActiveField = (isMoveIn, isPlayer, aField, support) => {
    let xAfield;
    let xSupport;

    if (isPlayer) {
        if (isMoveIn) {
            // move board in
            xAfield = -2.85;
            xSupport = -1.3;
        } else {
            xAfield = -4.8;
            xSupport = -1;
        }
    } else {
        if (isMoveIn) {
            // move board in
            xAfield = 2.9;
            xSupport = 1.4;
        } else {
            xAfield = 4.8;
            xSupport = 1.1;
        }
    }

    // animate
    anime({
        targets: [aField.position],
        x: xAfield,
        duration: 150,
        easing: "linear",
    });
    anime({
        targets: [support.position],
        x: xSupport,
        duration: 150,
        easing: "linear",
    });
}

/**
 * Move 1st attack player field in/out to give 
 */
export const animateMoveActiveField1st = (moveOut, pAField, pSupport) => {
    let pXf;
    let pXs;

    // move board out
    if (moveOut) {
        pXf = -4.8;
        pXs = -1;
    } else {
        // move board in
        pXf = -2.85;
        pXs = -1.3
    }

    // animate
    anime({
        targets: [pAField.position],
        x: pXf,
        duration: 150,
        easing: "linear",
    });
    anime({
        targets: [pSupport.position],
        x: pXs,
        duration: 150,
        easing: "linear",
    });
}

/**
 * Move 2nd attack player field in/out to give 
 */
export const animateMoveActiveField2nd = (moveOut, oAField, oSupport) => {
    let oXf;
    let oXs;

    // move board out
    if (moveOut) {
        oXf = 4.8;
        oXs = 1.1;
    } else {
        // move board in
        oXf = 2.9;
        oXs = 1.4;
    }

    // animate
    anime({
        targets: [oAField.position],
        x: oXf,
        duration: 150,
        easing: "linear",
    });
    anime({
        targets: [oSupport.position],
        x: oXs,
        duration: 150,
        easing: "linear",
    });
}

/**
 * Move both player's and opponent's attack choice board in/out of FOV
 */
export const animateMoveChoiceBoardIn = (moveIn, pChoice, oChoice) => {
    // new position
    let pY;
    let oY;

    // move board in
    if (moveIn) {
        pY = -2.7;
        oY = 2.8;
    } else {
        // move board out
        pY = -6;
        oY = 6;
    }

    // animate
    anime({
        targets: [pChoice.position],
        y: pY,
        duration: 120,
        easing: "linear",
    });
    anime({
        targets: [oChoice.position],
        y: oY,
        duration: 120,
        easing: "linear",
    });
};

/**
 * Move Info Board in/out of FOV
 */
export const animateMoveInfoBoardIn = (moveIn, isPlayer, scene) => {
    const infoBoard = scene.getObjectByName("infoBoard");

    // html components to hide/unhide
    const pDeckCount = document.getElementById("pDeckCount");
    const pOfflineCount = document.getElementById("pOfflineCount");
    const oDeckCount = document.getElementById("oDeckCount");
    const oOfflineCount = document.getElementById("oOfflineCount");
    const playerName = document.getElementById("playerName");
    const playerDeckName = document.getElementById("playerDeckName");
    const oppName = document.getElementById("oppName");
    const oppDeckName = document.getElementById("oppDeckName");

    // new position
    let x;
    let y;

    // move board in/out
    if (moveIn) {
        x = 0;
        // hide html count components
        if (isPlayer) {
            y = 2.8;
            oDeckCount.style.visibility = "hidden";
            oOfflineCount.style.visibility = "hidden";
            oppName.style.visibility = "hidden";
            oppDeckName.style.visibility = "hidden";
            // hide opponent win bar
            setOWinBar(false);
        } else {
            y = -2.8
            scene.traverse((child)=>{
                if (child.name.includes("info")) {
                    child.position.y -= 0.15
                }
            })
            scene.getObjectByName("infoBoard").position.y += 0.15
            scene.getObjectByName("infoBoardImg").position.y += 0.15
            pDeckCount.style.visibility = "hidden";
            pOfflineCount.style.visibility = "hidden";
            playerName.style.visibility = "hidden";
            playerDeckName.style.visibility = "hidden";
            // hide OK popup
            for (let i = 0; i < 4; i++) {
                document.getElementById(`okUi${i}`).style.visibility = "hidden"
            }
            document.getElementById(`okUiDeck`).style.visibility = "hidden"
            // hide player win bar
            setPWinBar(false);
        }
    } else {
        x = -16;
        // show html count components
        pDeckCount.style.visibility = "visible";
        pOfflineCount.style.visibility = "visible";
        oDeckCount.style.visibility = "visible";
        oOfflineCount.style.visibility = "visible";
        playerName.style.visibility = "visible";
        playerDeckName.style.visibility = "visible";
        oppName.style.visibility = "visible";
        oppDeckName.style.visibility = "visible";

        if (isPlayer) {
            y = 2.8;
            setOWinBar(true);
        } else {
            y = -2.8
            scene.traverse((child)=>{
                if (child.name.includes("info")) {
                    child.position.y += 0.15
                }
            })
            scene.getObjectByName("infoBoard").position.y -= 0.15
            scene.getObjectByName("infoBoardImg").position.y -= 0.15
            setPWinBar(true);
        }
        // set OK popup to visible again
        setOkPopup(useStateStore().phase);
    }

    // animate
    infoBoard.position.y = y
    anime({
        targets: [infoBoard.position],
        x: x,
        duration: 50,
        easing: "linear",
    });
};

/**
 * Move both player's and opponent's attack choice board in/out of FOV
 */
export const animateAttackChoice = async (moveIn, pChoice, oChoice) => {
    // new position
    let pY;
    let oY;
    const duration = 200;

    // move board in
    if (moveIn) {
        pY = -2.5;
        oY = 2.5;
    } else {
        // move board out
        pY = -7;
        oY = 7;
    }

    // animate
    anime({
        targets: [pChoice.position],
        y: pY,
        duration: duration,
        easing: "linear",
    });
    await anime({
        targets: [oChoice.position],
        y: oY,
        duration: duration,
        easing: "linear",
    }).finished;
};

// Turn camera from main menu to game board
export const animateCameraTurn = (camera, turnCameraToBoard) => {
    // new position
    let rY = turnCameraToBoard ? 0 : Math.PI;

    // animate
    anime({
        targets: [camera.rotation],
        y: rY,
        duration: 1000,
        easing: "linear",
    });
};

// attacking pulse effect
export const animateAttackPulse = async (who) => {
    const attackingPulse = document.getElementById(`pulse${who == WHO.PLAYER ? "P" : "O"}`)
    const beingAttackedPulse = document.getElementById(`pulse${who != WHO.PLAYER ? "P" : "O"}`)

    attackingPulse.classList.add("attack-pulse", `${who == WHO.PLAYER ? "player-pulse-position" : "opp-pulse-position"}`);
    
    await anime.timeline({
        easing: "linear",
        duration: 1150,
    }).add({
        duration: 750,
        complete: function () {
            attackingPulse.classList.remove("attack-pulse", `${who == WHO.PLAYER ? "player-pulse-position" : "opp-pulse-position"}`);
            beingAttackedPulse.classList.add("being-attacked-pulse", `${who != WHO.PLAYER ? "player-pulse-position" : "opp-pulse-position"}`);
        }
    }).add({
        duration: 400,
        complete: function () {
            beingAttackedPulse.classList.remove("being-attacked-pulse", `${who != WHO.PLAYER ? "player-pulse-position" : "opp-pulse-position"}`);
        }
    }).finished
}

// change specialty effect
export const animateSpecialtyChange = async (who) => {
    const specialtyChangeEff = document.getElementById(`pulse${who == WHO.PLAYER ? "P" : "O"}`)

    specialtyChangeEff.classList.add("glow-inside-out", `${who == WHO.PLAYER ? "player-specialty-position" : "opp-specialty-position"}`);
    
    await anime({
        duration: 1500,
        endDelay: 100,
        complete: function () {
            specialtyChangeEff.classList.remove("glow-inside-out", `${who == WHO.PLAYER ? "player-specialty-position" : "opp-specialty-position"}`);
        }
    }).finished
}

// digivolve effect
export const animateDigivolveEffect = async (who, scene) => {
    const popup = scene.getObjectByName("battleStatusPopup");
    const popupHtml = document.getElementById("battleStatusPopup");
    const ease = "linear"
    const duration = 50;
    const endDelay = 800;

    if (who == WHO.PLAYER) {
        popup.position.x = -1.25;
    } else {
        popup.position.x = 1.35;
    }
    popup.position.y = -0.25;
    
    const dy = 0.15;
    const y = popup.position.y + dy;

    popupHtml.innerHTML = "Digivolve";
    
    // animate digivolve popup
    await anime({
        targets: [popup.position],
        y: y,
        duration: duration,
        easing: ease,
        endDelay: endDelay,
        begin: function () {
            popupHtml.style.visibility = "visible";
        }
    }).finished.then(() => {
        popupHtml.style.visibility = "hidden"
    });

    const specialtyChangeEff = document.getElementById(`pulse${who == WHO.PLAYER ? "P" : "O"}`)
    specialtyChangeEff.classList.add("glow-inside-out", `${who == WHO.PLAYER ? "player-digivolve-position" : "opp-digivolve-position"}`);
    
    // animate glow
    await anime({
        duration: 1500,
        endDelay: 100,
        complete: function () {
            specialtyChangeEff.classList.remove("glow-inside-out", `${who == WHO.PLAYER ? "player-digivolve-position" : "opp-digivolve-position"}`);
        }
    }).finished
}

// add pause for good game flow for AI mode
export const briefPause = async () => {
    await anime({
        duration: 500,
    }).finished
}