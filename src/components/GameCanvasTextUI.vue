<template>
    <TresObject3D ref="textUiC" ></TresObject3D>
</template>

<script setup>
import { ref, watch, watchEffect, shallowRef, onBeforeUnmount } from "vue";
import { useGameStateStore } from "../stores/gameState"
import { CSS2DObject } from "three/examples/jsm/renderers/CSS2DRenderer.js"

// boleh access element pakai textUiC.value.children[0].element

const gameStateStore = useGameStateStore();
const textUiC = ref(null);
// hold refs to the created CSS2DObjects and their watcher stoppers
const managedCssObjects = shallowRef([]);

const cssObjectConfigs = [
    // Player Deck Count
    {
        id: "pDeckCount",
        className: "card-count",
        position: {x: -5.25, y: -3.05, z: 0},
        getHtmlContent: () => gameStateStore.playerDeckCount,
    },
    // Player Offline Count
    {
        id: "pOfflineCount",
        className: "card-count",
        position: {x: -5.25, y: -1.95, z: 0},
        getHtmlContent: () => gameStateStore.playerOfflineCount,
    },
    // Opponent Deck Count
    {
        id: "oDeckCount",
        className: "card-count",
        position: {x: 5.35, y: 2.05, z: 0},
        getHtmlContent: () => gameStateStore.opponentDeckCount,
    },
    // Opponent Offline Count
    {
        id: "oOfflineCount",
        className: "card-count",
        position: {x: 5.35, y: 3.15, z: 0},
        getHtmlContent: () => gameStateStore.opponentOfflineCount,
    },
    // Player DP Count
    {
        id: "pDpCount",
        className: "card-count",
        position: {x: -4.95, y: 0.7, z: 0},
        getHtmlContent: () => gameStateStore.playerDpCount,
    },
    // Player Active Monster - Name
    {
        id: "pActiveNm",
        className: "active-nm",
        position: {x: -2.8, y: 1.18, z: 0},
        getHtmlContent: () => gameStateStore.playerActiveMonster.name,
    },
    // Player Active Monster - 〇
    {
        id: "pActiveC",
        className: "active-pow",
        position: {x: -3.13, y: 0.58, z: 0},
        getHtmlContent: () => gameStateStore.playerActiveMonster.cAttack,
    },
    // Player Active Monster - △
    {
        id: "pActiveT",
        className: "active-pow",
        position: {x: -3.13, y: 0, z: 0},
        getHtmlContent: () => gameStateStore.playerActiveMonster.tAttack,
    },
    // Player Active Monster - ✕
    {
        id: "pActiveX",
        className: "active-pow",
        position: {x: -3.13, y: -0.58, z: 0},
        getHtmlContent: () => gameStateStore.playerActiveMonster.xAttack,
    },
    // Player Active Monster - ✕ Effect
    {
        id: "pActiveXEff",
        className: "active-eff",
        position: {x: -3.29, y: -1.12, z: 0},
        getHtmlContent: () => gameStateStore.playerActiveMonster.xEffect,
    },
    // Player Active Monster - HP label
    {
        id: "pActiveHpLbl",
        className: "active-hp-label",
        position: {x: -1.26, y: -0.795, z: 0},
        getHtmlContent: () => "HP",
    },
    // Player Active Monster - HP
    {
        id: "pActiveHp",
        className: "active-hp",
        position: {x: -1.25, y: -0.77, z: 0.002},
        getHtmlContent: () => gameStateStore.playerActiveMonster.hp,
    },
    // Opponent DP Count
    {
        id: "oDpCount",
        className: "card-count",
        position: {x: 5.03, y: 0.7, z: 0},
        getHtmlContent: () => gameStateStore.opponentDpCount,
    },
    // Opponent Active Monster - Name
    {
        id: "oActiveNm",
        className: "active-nm",
        position: {x: 2.3, y: 1.18, z: 0},
        getHtmlContent: () => gameStateStore.opponentActiveMonster.name,
    },
    // Opponent Active Monster - 〇
    {
        id: "oActiveC",
        className: "active-pow",
        position: {x: 3.65, y: 0.58, z: 0},
        getHtmlContent: () => gameStateStore.opponentActiveMonster.cAttack,
    },
    // Opponent Active Monster - △
    {
        id: "oActiveT",
        className: "active-pow",
        position: {x: 3.65, y: 0, z: 0},
        getHtmlContent: () => gameStateStore.opponentActiveMonster.tAttack,
    },
    // Opponent Active Monster - ✕
    {
        id: "oActiveX",
        className: "active-pow",
        position: {x: 3.65, y: -0.6, z: 0},
        getHtmlContent: () => gameStateStore.opponentActiveMonster.xAttack,
    },
    // Opponent Active Monster - ✕ Effect
    {
        id: "oActiveXEff",
        className: "active-eff",
        position: {x: 3.55, y: -1.12, z: 0},
        getHtmlContent: () => gameStateStore.opponentActiveMonster.xEffect,
    },
    // Opponent Active Monster - HP label
    {
        id: "oActiveHpLbl",
        className: "active-hp-label",
        position: {x: 1.351, y: -0.795, z: 0},
        getHtmlContent: () => "HP",
    },
    // Opponent Active Monster - HP
    {
        id: "oActiveHp",
        className: "active-hp",
        position: {x: 1.35, y: -0.77, z: 0.002},
        getHtmlContent: () => gameStateStore.opponentActiveMonster.hp,
    },
    // Player Attack Choice - Name
    {
        id: "pChoiceNm",
        className: "choice choice-name",
        position: {x: -2.15, y: -4.95, z: 0},
        getHtmlContent: () => gameStateStore.playerAttackChoice.name,
    },
    // Player Attack Choice - HP
    {
        id: "pChoiceHp",
        className: "choice",
        position: {x: 5.75, y: -4.95, z: 0},
        getHtmlContent: () => gameStateStore.playerAttackChoice.hp,
    },
    // Player Attack Choice - Level
    {
        id: "pChoiceLevel",
        className: "choice",
        position: {x: 7.6, y: -4.95, z: 0},
        getHtmlContent: () => gameStateStore.playerAttackChoice.level,
    },
    // Player Attack Choice - Specialty (img)
    {
        id: "pChoiceSp",
        className: "choice-img",
        position: {x: 5, y: -4.95, z: 0},
        getHtmlContent: () => gameStateStore.playerAttackChoice.specialty,
    },
    // Player Attack Choice - 〇 Name
    {
        id: "pChoiceONm",
        className: "choice",
        position: {x: -0.2, y: -5.5, z: 0},
        getHtmlContent: () => gameStateStore.playerAttackChoice.cAttack,
    },
    // Player Attack Choice - △ Name
    {
        id: "pChoiceTNm",
        className: "choice",
        position: {x: -0.2, y: -6.1, z: -0.1},
        getHtmlContent: () => gameStateStore.playerAttackChoice.tAttack,
    },
    // Player Attack Choice - ✕ Name
    {
        id: "pChoiceXNm",
        className: "choice",
        position: {x: -0.2, y: -6.7, z: -0.1},
        getHtmlContent: () => gameStateStore.playerAttackChoice.xAttack,
    },
    // Player Attack Choice - ✕ Effect
    {
        id: "pChoiceXEff",
        className: "choice choice-x-eff",
        position: {x: 1.9, y: -7.3, z: 0},
        getHtmlContent: () => gameStateStore.playerAttackChoice.xEffect,
    },
    // Player Attack Choice - 〇 Value
    {
        id: "pChoiceOVal",
        className: "choice choice-val",
        position: {x: 4.3, y: -5.5, z: 0},
        getHtmlContent: () => gameStateStore.playerAttackChoice.cPow,
    },
    // Player Attack Choice - △ Value
    {
        id: "pChoiceTVal",
        className: "choice choice-val",
        position: {x: 4.3, y: -6.1, z: 0},
        getHtmlContent: () => gameStateStore.playerAttackChoice.tPow,
    },
    // Player Attack Choice - ✕ Value
    {
        id: "pChoiceXVal",
        className: "choice choice-val",
        position: {x: 4.3, y: -6.7, z: 0},
        getHtmlContent: () => gameStateStore.playerAttackChoice.xPow,
    },
    // Player Attack Choice - ✕ Effect Speed (img)
    {
        id: "pChoiceXSpd",
        className: "choice-img",
        position: {x: 3.1, y: -7.25, z: 0},
        getHtmlContent: () => gameStateStore.playerAttackChoice.xSpeed,
    },
    // Player Attack Choice - Turn
    {
        id: "pChoiceTurn",
        className: "choice choice-turn",
        position: {x: 4.3, y: -7.3, z: 0},
        getHtmlContent: () => "",
    },
    // Opponent Attack Choice - Name
    {
        id: "oChoiceNm",
        className: "choice choice-name",
        position: {x: -2.15, y: 7.55, z: 0},
        getHtmlContent: () => "",
    },
    // Opponent Attack Choice - HP
    {
        id: "oChoiceHp",
        className: "choice",
        position: {x: 5.65, y: 7.55, z: 0},
        getHtmlContent: () => "",
    },
    // Opponent Attack Choice - Level
    {
        id: "oChoiceLevel",
        className: "choice",
        position: {x: 7.6, y: 7.55, z: 0},
        getHtmlContent: () => "",
    },
    // Opponent Attack Choice - Specialty (img)
    {
        id: "oChoiceSp",
        className: "choice-img",
        position: {x: 5, y: 7.55, z: 0},
        getHtmlContent: () => "",
    },
    // Opponent Attack Choice - 〇 Name
    {
        id: "oChoiceONm",
        className: "choice",
        position: {x: -0.2, y: 6.97, z: 0},
        getHtmlContent: () => "",
    },
    // Opponent Attack Choice - △ Name
    {
        id: "oChoiceTNm",
        className: "choice",
        position: {x: -0.2, y: 6.42, z: -0.1},
        getHtmlContent: () => "",
    },
    // Opponent Attack Choice - ✕ Name
    {
        id: "oChoiceXNm",
        className: "choice",
        position: {x: -0.2, y: 5.83, z: -0.1},
        getHtmlContent: () => "",
    },
    // Opponent Attack Choice - ✕ Effect
    {
        id: "oChoiceXEff",
        className: "choice choice-x-eff",
        position: {x: 1.95, y: 5.25, z: 0},
        getHtmlContent: () => "",
    },
    // Opponent Attack Choice - 〇 Value
    {
        id: "oChoiceOVal",
        className: "choice choice-val",
        position: {x: 4.3, y: 6.97, z: 0},
        getHtmlContent: () => "",
    },
    // Opponent Attack Choice - △ Value
    {
        id: "oChoiceTVal",
        className: "choice choice-val",
        position: {x: 4.3, y: 6.42, z: 0},
        getHtmlContent: () => "",
    },
    // Opponent Attack Choice - ✕ Value
    {
        id: "oChoiceXVal",
        className: "choice choice-val",
        position: {x: 4.3, y: 5.83, z: 0},
        getHtmlContent: () => "",
    },
    // Opponent Attack Choice - ✕ Effect Speed (img)
    {
        id: "oChoiceXSpd",
        className: "choice-img",
        position: {x: 3.1, y: 5.2, z: 0},
        getHtmlContent: () => "",
    },
    // Opponent Attack Choice - Turn
    {
        id: "oChoiceTurn",
        className: "choice choice-turn",
        position: {x: 4.3, y: 5.25, z: 0},
        getHtmlContent: () => "",
    },
    // Player Attack Choice - 〇 Name Hover
    {
        id: "choiceOHover",
        className: "attack-choice-invisible",
        position: {x: 0, y: -5.5, z: 0},
        getHtmlContent: () => "",
        pointerover: () => {
            this.className = "attack-choice-bloom";
        },
        pointerleave: () => {
            this.className = "attack-choice-invisible";
        },
        pointerdown: () => {
            // TODO: tukar ni ke gameStateStore
            // usePlayerStore().setPAttack(ATTACK.C)
            // if (useStateStore().oppMode == MODE.PROD) {
            //     socket.emit("set-attack-choice", ATTACK.C)
            // }
        }
    },
    // Player Attack Choice - △ Name Hover
    {
        id: "choiceTHover",
        className: "attack-choice-invisible",
        position: {x: 0, y: -6.05, z: 0},
        getHtmlContent: () => "",
        pointerover: () => {
            this.className = "attack-choice-bloom";
        },
        pointerleave: () => {
            this.className = "attack-choice-invisible";
        },
        pointerdown: () => {
            // TODO: tukar ni ke gameStateStore
            // usePlayerStore().setPAttack(ATTACK.T)
            // if (useStateStore().oppMode == MODE.PROD) {
            //     socket.emit("set-attack-choice", ATTACK.T)
            // }
        }
    },
    // Player Attack Choice - ✕ Name Hover
    {
        id: "choiceXHover",
        className: "attack-choice-invisible",
        position: {x: 0, y: -6.65, z: 0},
        getHtmlContent: () => "",
        pointerover: () => {
            this.className = "attack-choice-bloom";
        },
        pointerleave: () => {
            this.className = "attack-choice-invisible";
        },
        pointerdown: () => {
            // TODO: tukar ni ke gameStateStore
            // usePlayerStore().setPAttack(ATTACK.X)
            // if (useStateStore().oppMode == MODE.PROD) {
            //     socket.emit("set-attack-choice", ATTACK.X)
            // }
        }
    },

    // Info Board - Name
    {
        id: "infoNm",
        className: "info info-name",
        position: {x: -16.75, y: 4.13, z: 0},
        getHtmlContent: () => "",
    },
    // Info Board - HP
    {
        id: "infoHp",
        className: "info info-val",
        position: {x: -18.4, y: 3.55, z: 0},
        getHtmlContent: () => "",
    },
    // Info Board - 〇 Value
    {
        id: "infoOVal",
        className: "info info-val",
        position: {x: -18.4, y: 3, z: 0},
        getHtmlContent: () => "",
    },
    // Info Board - △ Value
    {
        id: "infoTVal",
        className: "info info-val",
        position: {x: -18.4, y: 2.46, z: 0},
        getHtmlContent: () => "",
    },
    // Info Board - ✕ Value
    {
        id: "infoXVal",
        className: "info info-val",
        position: {x: -18.4, y: 1.95, z: 0},
        getHtmlContent: () => "",
    },
    // Info Board - ✕ Effect
    {
        id: "infoXEff",
        className: "info info-x-eff",
        position: {x: -18.8, y: 1.5, z: 0},
        getHtmlContent: () => "",
    },
    // Info Board - ✕ Effect Speed (img)
    {
        id: "infoXSpd",
        className: "info-img",
        position: {x: -17.25, y: 1.55, z: 0},
        getHtmlContent: () => "",
    },
    // Info Board - Level
    {
        id: "infoLevel",
        className: "info",
        position: {x: -12.65, y: 4.13, z: 0},
        getHtmlContent: () => "",
    },
    // Info Board - Specialty (img)
    {
        id: "infoSp",
        className: "info-img",
        position: {x: -13.42, y: 4.13, z: 0},
        getHtmlContent: () => "",
    },
    // Info Board - DP
    {
        id: "infoDp",
        className: "info info-dp",
        position: {x: -16.9, y: 3.15, z: 0},
        getHtmlContent: () => "",
    },
    // Info Board - PP
    {
        id: "infoPp",
        className: "info info-dp",
        position: {x: -16.9, y: 2.2, z: 0},
        getHtmlContent: () => "",
    },
    // Info Board - Support
    {
        id: "infoSupport",
        className: "info info-eff",
        position: {x: -13.5, y: 2.55, z: 0},
        getHtmlContent: () => "",
    },
    // Info Board - Support Speed (img)
    {
        id: "infoSupportSpd",
        className: "info-img",
        position: {x: -11.9, y: 4.11, z: 0},
        getHtmlContent: () => "",
    },
    // Number Popup
    {
        id: "numberPopupUi",
        className: "number-popup",
        style: {
            visibility: "hidden"
        },
        position: {x: 0, y: 0, z: 0}, // Default position as .set() was not called
        getHtmlContent: () => "",
    },
    // 〇 Popup
    {
        id: "cPopup",
        className: "number-popup",
        style: {
            visibility: "hidden"
        },
        position: {x: 0, y: 0, z: 0}, // Default position
        getHtmlContent: () => "",
    },
    // △ Popup
    {
        id: "tPopup",
        className: "number-popup",
        style: {
            visibility: "hidden"
        },
        position: {x: 0, y: 0, z: 0}, // Default position
        getHtmlContent: () => "",
    },
    // ✕ Popup
    {
        id: "xPopup",
        className: "number-popup",
        style: {
            visibility: "hidden"
        },
        position: {x: 0, y: 0, z: 0}, // Default position
        getHtmlContent: () => "",
    },
    // OK! Popup Hand 0 - Leftmost (img)
    {
        id: "okUi0",
        className: "ok-popup svg-white",
        src: "/src/assets/symbols/square-check-regular.svg",
        style: {
            visibility: "hidden"
        },
        position: {x: -2, y: -1.5, z: 0},
        getHtmlContent: () => "",
    },
    // OK! Popup Hand 1 (img)
    {
        id: "okUi1",
        className: "ok-popup svg-white",
        src: "/src/assets/symbols/square-check-regular.svg",
        style: {
            visibility: "hidden"
        },
        position: {x: -0.1, y: -1.5, z: 0},
        getHtmlContent: () => "",
    },
    // OK! Popup Hand 2 (img)
    {
        id: "okUi2",
        className: "ok-popup svg-white",
        src: "/src/assets/symbols/square-check-regular.svg",
        style: {
            visibility: "hidden"
        },
        position: {x: 1.8, y: -1.5, z: 0},
        getHtmlContent: () => "",
    },
    // OK! Popup Hand 3 - Rightmost (img)
    {
        id: "okUi3",
        className: "ok-popup svg-white",
        src: "/src/assets/symbols/square-check-regular.svg",
        style: {
            visibility: "hidden"
        },
        position: {x: 3.7, y: -1.5, z: 0},
        getHtmlContent: () => "",
    },
    // OK! Popup Deck (img)
    {
        id: "okUiDeck",
        className: "ok-popup svg-white",
        src: "/src/assets/symbols/square-check-regular.png",
        style: {
            visibility: "hidden"
        },
        position: {x: -3.8, y: -2.6, z: 0},
        getHtmlContent: () => "",
    },
    // Player Win bar 1 (img)
    {
        id: "pWinBar1",
        className: "", // No className was set
        src: "/src/sprites/win-bar.png",
        style: {
            visibility: "hidden",
            height: "3vw",
            width: "7vw"
        },
        position: {x: 4.97, y: -1.86, z: 0},
        getHtmlContent: () => "",
    },
    // Player Win bar 2 (img)
    {
        id: "pWinBar2",
        className: "", // No className was set
        src: "/src/sprites/win-bar.png",
        style: {
            visibility: "hidden",
            height: "3vw",
            width: "7vw"
        },
        position: {x: 4.97, y: -2.55, z: 0},
        getHtmlContent: () => "",
    },
    // Player Win bar 3 (img)
    {
        id: "pWinBar3",
        className: "", // No className was set
        src: "/src/sprites/win-bar.png",
        style: {
            visibility: "hidden",
            height: "3vw",
            width: "7vw"
        },
        position: {x: 4.97, y: -3.2, z: 0},
        getHtmlContent: () => "",
    },
    // Opponent Win bar 1 (img)
    {
        id: "oWinBar1",
        className: "", // No className was set
        src: "/src/sprites/win-bar.png",
        style: {
            visibility: "hidden",
            height: "3vw",
            width: "7vw"
        },
        position: {x: -4.97, y: 3.25, z: 0},
        getHtmlContent: () => "",
    },
    // Opponent Win bar 2 (img)
    {
        id: "oWinBar2",
        className: "", // No className was set
        src: "/src/sprites/win-bar.png",
        style: {
            visibility: "hidden",
            height: "3vw",
            width: "7vw"
        },
        position: {x: -4.97, y: 2.6, z: 0},
        getHtmlContent: () => "",
    },
    // Opponent Win bar 3 (img)
    {
        id: "oWinBar3",
        className: "", // No className was set
        src: "/src/sprites/win-bar.png",
        style: {
            visibility: "hidden",
            height: "3vw",
            width: "7vw"
        },
        position: {x: -4.97, y: 1.93, z: 0},
        getHtmlContent: () => "",
    },
    // Misfire Failure
    {
        id: "misfireFailurePopup",
        className: "misfire-failure-popup",
        style: {
            visibility: "hidden",
        },
        position: {x: 0, y: 0, z: 0}, // Default position
        getHtmlContent: () => "Misfire Failure",
    },
    // Battle Status Popup
    {
        id: "battleStatusPopup",
        className: "eatup-hp-popup",
        style: {
            visibility: "hidden",
        },
        position: {x: 0, y: 0, z: 0}, // Default position
        getHtmlContent: () => "Eat-Up HP",
    },
    // Player Name
    {
        id: "playerName",
        className: "user-label",
        position: {x: -2.7, y: -4, z: 0},
        getHtmlContent: () => "Trainer A",
    },
    // Player Deck Name
    {
        id: "playerDeckName",
        className: "user-label",
        position: {x: 3, y: -4, z: 0},
        getHtmlContent: () => "Tricolor Deck",
    },
    // Opponent Name
    {
        id: "oppName",
        className: "user-label",
        position: {x: 3, y: 4, z: 0},
        getHtmlContent: () => "Trainer B",
    },
    // Opponent Deck Name
    {
        id: "oppDeckName",
        className: "user-label",
        position: {x: -2.7, y: 4, z: 0},
        getHtmlContent: () => "Super Long Deck Name",
    },
    // Match result banner
    {
        id: "matchResult",
        className: "match-result-banner",
        style: {
            visibility: "hidden",
        },
        position: {x: 0, y: 0, z: 1},
        getHtmlContent: () => "3 Wins, 0 Losses - Trainer A WINS!",
    },
    // Player Attack choice
    {
        id: "choiceDisplayP",
        className: "attack-choice-display",
        position: {x: 0, y: -7, z: 1},
        getHtmlContent: () => "",
    },
    // Opponent Attack choice
    {
        id: "choiceDisplayO",
        className: "attack-choice-display",
        position: {x: 0, y: 7, z: 1},
        getHtmlContent: () => "",
    },
    // Field Pulse
    {
        id: "fieldPulse",
        className: "", // No className was set
        position: {x: 0, y: 0, z: 0}, // Default position
        getHtmlContent: () => "",
    },
    // Player Attack Pulse
    {
        id: "pulseP",
        className: "", // No className was set
        position: {x: 0, y: 0, z: 0}, // Default position
        getHtmlContent: () => "",
    },
    // Opponent Attack Pulse
    {
        id: "pulseO",
        className: "", // No className was set
        position: {x: 0, y: 0, z: 0}, // Default position
        getHtmlContent: () => "",
    },

]

watch(
    () => textUiC.value,
    () => {
        if (!textUiC.value) return;

        const createdElements = [];

        cssObjectConfigs.forEach((config) => {
            const { id, className, style, src, position, getHtmlContent, pointerover, pointerleave, pointerdown } = config;
            const element = document.createElement("div");
            element.id = id;
            element.className = className;
            if (pointerover) element.onpointerover = pointerover;
            if (pointerleave) element.onpointerleave = pointerleave;
            if (pointerdown) element.onpointerdown = pointerdown;

            if (style) {
                Object.entries(style).forEach(([key, value]) => {
                    element.style[key] = value;
                });
            }

            if (src) element.src = src;

            const cssObject = new CSS2DObject(element);
            cssObject.position.set(position.x, position.y, position.z);
            cssObject.name = id;
            textUiC.value.add(cssObject);

            const stopWatcher = watchEffect(() => {
                element.innerHTML = getHtmlContent();
            });

            createdElements.push({
                cssObject,
                stopWatcher
            });
        });

        managedCssObjects.value = createdElements;
        console.log("text UI watcher")
    }, { once: true }
)

onBeforeUnmount(() => {
    managedCssObjects.value.forEach(({ cssObject, stopWatcher }) => {
        textUiC.value.clear()
        stopWatcher();
    });
    managedCssObjects.value = [];
})

</script>