<template>
    <!-- player deck count -->
    <TextLabel :position="{ x: -5.25, y: -3.05, z: 0 }">
        <div id="pDeckCount" class="card-count">
            {{ gameStateStore.playerDeckCount }}
        </div>
    </TextLabel>
    <!-- player offline count -->
    <TextLabel :position="{ x: -5.25, y: -1.95, z: 0 }">
        <div id="pOfflineCount" class="card-count">
            {{ gameStateStore.playerOfflineCount }}
        </div>
    </TextLabel>
    <!-- opponent deck count -->
    <TextLabel :position="{ x: 5.35, y: 2.05, z: 0 }">
        <div id="oDeckCount" class="card-count">
            {{ gameStateStore.opponentDeckCount }}
        </div>
    </TextLabel>
    <!-- opponent offline count -->
    <TextLabel :position="{ x: 5.35, y: 3.1, z: 0 }">
        <div id="oOfflineCount" class="card-count">
            {{ gameStateStore.opponentOfflineCount }}
        </div>
    </TextLabel>
    
    <!-- player DP count -->
    <TextLabel :position="{ x: -4.95, y: 0.7, z: 0 }" name="pDpCount">
        <div id="pDpCount" class="card-count">
            {{ gameStateStore.playerDpCount }}
        </div>
    </TextLabel>
    <!-- player active monster name -->
    <TextLabel :position="{ x: -2.8, y: 1.18, z: 0 }" name="pActiveNm">
        <div id="pActiveNm" class="active-nm">
            {{ gameStateStore.playerActiveMonster.name }}
        </div>
    </TextLabel>
    <!-- player active monster 〇 -->
    <TextLabel :position="{ x: -3.13, y: 0.58, z: 0 }" name="pActiveC">
        <div id="pActiveC" class="active-pow">
            {{ gameStateStore.playerActiveMonster.cAttack }}
        </div>
    </TextLabel>
    <!-- player active monster △ -->
    <TextLabel :position="{ x: -3.13, y: 0, z: 0 }" name="pActiveT">
        <div id="pActiveT" class="active-pow">
            {{ gameStateStore.playerActiveMonster.tAttack }}
        </div>
    </TextLabel>
    <!-- player active monster ✕ -->
    <TextLabel :position="{ x: -3.13, y: -0.6, z: 0 }" name="pActiveX">
        <div id="pActiveX" class="active-pow">
            {{ gameStateStore.playerActiveMonster.xAttack }}
        </div>
    </TextLabel>
    <!-- player active monster ✕ Effect -->
    <TextLabel :position="{ x: -3.29, y: -1.12, z: 0 }" name="pActiveXEff">
        <div id="pActiveXEff" class="active-eff">
            {{ gameStateStore.playerActiveMonster.xEffect }}
        </div>
    </TextLabel>
    <!-- player active monster HP label -->
    <TextLabel :position="{ x: -1.26, y: -0.795, z: 0 }" name="pActiveHpLbl">
        <div id="pActiveHpLbl" class="active-hp-label">
            HP
        </div>
    </TextLabel>
    <!-- player active monster HP -->
    <TextLabel :position="{ x: -1.25, y: -0.77, z: 0.002 }" name="pActiveHp">
        <div id="pActiveHp" class="active-hp">
            {{ gameStateStore.playerActiveMonster.hp }}
        </div>
    </TextLabel>

    <!-- opponent DP count -->
    <TextLabel :position="{ x: 5.03, y: 0.7, z: 0 }" name="oDpCount">
        <div id="oDpCount" class="card-count">
            {{ gameStateStore.opponentDpCount }}
        </div>
    </TextLabel>
    <!-- opponent active monster name -->
    <TextLabel :position="{ x: 2.2, y: 1.18, z: 0 }" name="oActiveNm">
        <div id="oActiveNm" class="active-nm">
            {{ gameStateStore.opponentActiveMonster.name }}
        </div>
    </TextLabel>
    <!-- opponent active monster 〇 -->
    <TextLabel :position="{ x: 3.65, y: 0.58, z: 0 }" name="oActiveC">
        <div id="oActiveC" class="active-pow">
            {{ gameStateStore.opponentActiveMonster.cAttack }}
        </div>
    </TextLabel>
    <!-- opponent active monster △ -->
    <TextLabel :position="{ x: 3.65, y: 0, z: 0 }" name="oActiveT">
        <div id="oActiveT" class="active-pow">
            {{ gameStateStore.opponentActiveMonster.tAttack }}
        </div>
    </TextLabel>
    <!-- opponent active monster ✕ -->
    <TextLabel :position="{ x: 3.65, y: -0.6, z: 0 }" name="oActiveX">
        <div id="oActiveX" class="active-pow">
            {{ gameStateStore.opponentActiveMonster.xAttack }}
        </div>
    </TextLabel>
    <!-- opponent active monster ✕ Effect -->
    <TextLabel :position="{ x: 3.55, y: -1.12, z: 0 }" name="oActiveXEff">
        <div id="oActiveXEff" class="active-eff">
            {{ gameStateStore.opponentActiveMonster.xEffect }}
        </div>
    </TextLabel>
    <!-- opponent active monster HP label -->
    <TextLabel :position="{ x: 1.351, y: -0.795, z: 0 }" name="oActiveHpLbl">
        <div id="oActiveHpLbl" class="active-hp-label">
            HP
        </div>
    </TextLabel>
    <!-- opponent active monster HP -->
    <TextLabel :position="{ x: 1.35, y: -0.77, z: 0.002 }" name="oActiveHp">
        <div id="oActiveHp" class="active-hp">
            {{ gameStateStore.opponentActiveMonster.hp }}
        </div>
    </TextLabel>

    <!-- Player Attack Choice - Name -->
    <TextLabel :position="{ x: -2.15, y: -4.95, z: 0 }" name="pChoiceNm">
        <div id="pChoiceNm" class="choice choice-name">
            {{  }}
        </div>
    </TextLabel>

    <!-- Player Attack Choice - HP -->
    <TextLabel :position="{ x: 5.75, y: -4.95, z: 0 }" name="pChoiceHp">
        <div id="pChoiceHp" class="choice">
            {{  }}
        </div>
    </TextLabel>

    <!-- Player Attack Choice - Level -->
    <TextLabel :position="{ x: 7.6, y: -4.95, z: 0 }" name="pChoiceLevel">
        <div id="pChoiceLevel" class="choice">
            {{  }}
        </div>
    </TextLabel>

    <!-- Player Attack Choice - Specialty -->
    <TextLabel :position="{ x: 5, y: -4.95, z: 0 }" name="pChoiceSp">
        <img id="pChoiceSp" class="choice-img" />
    </TextLabel>

    <!-- Player Attack Choice - 〇 Name -->
    <TextLabel :position="{ x: -0.2, y: -5.5, z: 0 }" name="pChoiceONm">
        <div id="pChoiceONm" class="choice">
            {{  }}
        </div>
    </TextLabel>

    <!-- Player Attack Choice - △ Name -->
    <TextLabel :position="{ x: -0.2, y: -6.1, z: -0.1 }" name="pChoiceTNm">
        <div id="pChoiceTNm" class="choice">
            {{  }}
        </div>
    </TextLabel>

    <!-- Player Attack Choice - ✕ Name -->
    <TextLabel :position="{ x: -0.2, y: -6.7, z: -0.1 }" name="pChoiceXNm">
        <div id="pChoiceXNm" class="choice">
            {{  }}
        </div>
    </TextLabel>

    <!-- Player Attack Choice - ✕ Effect -->
    <TextLabel :position="{ x: 1.9, y: -7.3, z: 0 }" name="pChoiceXEff">
        <div id="pChoiceXEff" class="choice choice-x-eff">
            {{  }}
        </div>
    </TextLabel>

    <!-- Player Attack Choice - 〇 Value -->
    <TextLabel :position="{ x: 4.3, y: -5.5, z: 0 }" name="pChoiceOVal">
        <div id="pChoiceOVal" class="choice choice-val">
            {{  }}
        </div>
    </TextLabel>

    <!-- Player Attack Choice - △ Value -->
    <TextLabel :position="{ x: 4.3, y: -6.1, z: 0 }" name="pChoiceTVal">
        <div id="pChoiceTVal" class="choice choice-val">
            {{  }}
        </div>
    </TextLabel>

    <!-- Player Attack Choice - ✕ Value -->
    <TextLabel :position="{ x: 4.3, y: -6.7, z: 0 }" name="pChoiceXVal">
        <div id="pChoiceXVal" class="choice choice-val">
            {{  }}
        </div>
    </TextLabel>

    <!-- Player Attack Choice - ✕ Effect Speed -->
    <TextLabel :position="{ x: 3.1, y: -7.25, z: 0 }" name="pChoiceXSpd">
        <img id="pChoiceXSpd" class="choice-img" />
    </TextLabel>

    <!-- Player Attack Choice - Turn -->
    <TextLabel :position="{ x: 4.3, y: -7.3, z: 0 }" name="pChoiceTurn">
        <div id="pChoiceTurn" class="choice choice-turn">
            {{  }}
        </div>
    </TextLabel>

    <!-- Opponent Attack Choice - Name -->
    <TextLabel :position="{ x: -2.15, y: 7.55, z: 0 }" name="oChoiceNm">
        <div id="oChoiceNm" class="choice choice-name">
            {{  }}
        </div>
    </TextLabel>

    <!-- Opponent Attack Choice - HP -->
    <TextLabel :position="{ x: 5.65, y: 7.55, z: 0 }" name="oChoiceHp">
        <div id="oChoiceHp" class="choice">
            {{  }}
        </div>
    </TextLabel>

    <!-- Opponent Attack Choice - Level -->
    <TextLabel :position="{ x: 7.6, y: 7.55, z: 0 }" name="oChoiceLevel">
        <div id="oChoiceLevel" class="choice">
            {{  }}
        </div>
    </TextLabel>

    <!-- Opponent Attack Choice - Specialty -->
    <TextLabel :position="{ x: 5, y: 7.55, z: 0 }" name="oChoiceSp">
        <img id="oChoiceSp" class="choice-img" />
    </TextLabel>

    <!-- Opponent Attack Choice - 〇 Name -->
    <TextLabel :position="{ x: -0.2, y: 6.97, z: 0 }" name="oChoiceONm">
        <div id="oChoiceONm" class="choice">
            {{  }}
        </div>
    </TextLabel>

    <!-- Opponent Attack Choice - △ Name -->
    <TextLabel :position="{ x: -0.2, y: 6.42, z: -0.1 }" name="oChoiceTNm">
        <div id="oChoiceTNm" class="choice">
            {{  }}
        </div>
    </TextLabel>

    <!-- Opponent Attack Choice - ✕ Name -->
    <TextLabel :position="{ x: -0.2, y: 5.83, z: -0.1 }" name="oChoiceXNm">
        <div id="oChoiceXNm" class="choice">
            {{  }}
        </div>
    </TextLabel>

    <!-- Opponent Attack Choice - ✕ Effect -->
    <TextLabel :position="{ x: 1.95, y: 5.25, z: 0 }" name="oChoiceXEff">
        <div id="oChoiceXEff" class="choice choice-x-eff">
            {{  }}
        </div>
    </TextLabel>

    <!-- Opponent Attack Choice - 〇 Value -->
    <TextLabel :position="{ x: 4.3, y: 6.97, z: 0 }" name="oChoiceOVal">
        <div id="oChoiceOVal" class="choice choice-val">
            {{  }}
        </div>
    </TextLabel>

    <!-- Opponent Attack Choice - △ Value -->
    <TextLabel :position="{ x: 4.3, y: 6.42, z: 0 }" name="oChoiceTVal">
        <div id="oChoiceTVal" class="choice choice-val">
            {{  }}
        </div>
    </TextLabel>

    <!-- Opponent Attack Choice - ✕ Value -->
    <TextLabel :position="{ x: 4.3, y: 5.83, z: 0 }" name="oChoiceXVal">
        <div id="oChoiceXVal" class="choice choice-val">
            {{  }}
        </div>
    </TextLabel>

    <!-- Opponent Attack Choice - ✕ Effect Speed -->
    <TextLabel :position="{ x: 3.1, y: 5.2, z: 0 }" name="oChoiceXSpd">
        <img id="oChoiceXSpd" class="choice-img" />
    </TextLabel>

    <!-- Opponent Attack Choice - Turn -->
    <TextLabel :position="{ x: 4.3, y: 5.25, z: 0 }" name="oChoiceTurn">
        <div id="oChoiceTurn" class="choice choice-turn">
            {{  }}
        </div>
    </TextLabel>

    <!-- Player Attack Choice - 〇 Name Hover -->
    <TextLabel :position="{ x: 0, y: -5.5, z: 0 }" name="choiceOHover">
        <div id="choiceOHover" :class="isChoiceOHover ? 'attack-choice-bloom' : 'attack-choice-invisible'" 
            @pointerover="isChoiceOHover = true" 
            @pointerleave="isChoiceOHover = false"
            @click="onSelect('circle')">
        </div>
    </TextLabel>

    <!-- Player Attack Choice - △ Name Hover -->
    <TextLabel :position="{ x: 0, y: -6.05, z: 0 }" name="choiceTHover">
        <div id="choiceTHover" :class="isChoiceTHover ? 'attack-choice-bloom' : 'attack-choice-invisible'" 
            @pointerover="isChoiceTHover = true" 
            @pointerleave="isChoiceTHover = false"
            @click="onSelect('triangle')">
        </div>
    </TextLabel>

    <!-- Player Attack Choice - ✕ Name Hover -->
    <TextLabel :position="{ x: 0, y: -6.65, z: 0 }" name="choiceXHover">
        <div id="choiceXHover" :class="isChoiceXHover ? 'attack-choice-bloom' : 'attack-choice-invisible'" 
            @pointerover="isChoiceXHover = true" 
            @pointerleave="isChoiceXHover = false"
            @click="onSelect('cross')">
        </div>
    </TextLabel>

    <!-- Info Board - Name -->
    <TextLabel :position="{ x: -16.75, y: 4.13, z: 0 }" name="infoNm">
        <div id="infoNm" class="info info-name">
            {{  }}
        </div>
    </TextLabel>

    <!-- Info Board - HP -->
    <TextLabel :position="{ x: -18.4, y: 3.55, z: 0 }" name="infoHp">
        <div id="infoHp" class="info info-val">
            {{  }}
        </div>
    </TextLabel>

    <!-- Info Board - 〇 Value -->
    <TextLabel :position="{ x: -18.4, y: 3, z: 0 }" name="infoOVal">
        <div id="infoOVal" class="info info-val">
            {{  }}
        </div>
    </TextLabel>

    <!-- Info Board - △ Value -->
    <TextLabel :position="{ x: -18.4, y: 2.46, z: 0 }" name="infoTVal">
        <div id="infoTVal" class="info info-val">
            {{  }}
        </div>
    </TextLabel>

    <!-- Info Board - ✕ Value -->
    <TextLabel :position="{ x: -18.4, y: 1.95, z: 0 }" name="infoXVal">
        <div id="infoXVal" class="info info-val">
            {{  }}
        </div>
    </TextLabel>

    <!-- Info Board - ✕ Effect -->
    <TextLabel :position="{ x: -18.8, y: 1.5, z: 0 }" name="infoXEff">
        <div id="infoXEff" class="info info-x-eff">
            {{  }}
        </div>
    </TextLabel>

    <!-- Info Board - ✕ Effect Speed -->
    <TextLabel :position="{ x: -17.25, y: 1.55, z: 0 }" name="infoXSpd">
        <img id="infoXSpd" class="info-img" />
    </TextLabel>

    <!-- Info Board - Level -->
    <TextLabel :position="{ x: -12.65, y: 4.13, z: 0 }" name="infoLevel">
        <div id="infoLevel" class="info">
            {{  }}
        </div>
    </TextLabel>

    <!-- Info Board - Specialty -->
    <TextLabel :position="{ x: -13.42, y: 4.13, z: 0 }" name="infoSp">
        <img id="infoSp" class="info-img" />
    </TextLabel>

    <!-- Info Board - DP -->
    <TextLabel :position="{ x: -16.9, y: 3.15, z: 0 }" name="infoDp">
        <div id="infoDp" class="info info-dp">
            {{  }}
        </div>
    </TextLabel>

    <!-- Info Board - PP -->
    <TextLabel :position="{ x: -16.9, y: 2.2, z: 0 }" name="infoPp">
        <div id="infoPp" class="info info-dp">
            {{  }}
        </div>
    </TextLabel>

    <!-- Info Board - Support -->
    <TextLabel :position="{ x: -13.5, y: 2.55, z: 0 }" name="infoSupport">
        <div id="infoSupport" class="info info-eff">
            {{  }}
        </div>
    </TextLabel>

    <!-- Info Board - Support Speed -->
    <TextLabel :position="{ x: -11.9, y: 4.11, z: 0 }" name="infoSupportSpd">
        <img id="infoSupportSpd" class="info-img" />
    </TextLabel>

    <!-- Number Popup -->
    <TextLabel name="numberPopupUi">
        <div id="numberPopupUi" class="number-popup" style="visibility: hidden;">
            {{  }}
        </div>
    </TextLabel>

    <!-- 〇 Popup -->
    <TextLabel name="cPopup">
        <div id="cPopup" class="number-popup" style="visibility: hidden;">
            {{  }}
        </div>
    </TextLabel>

    <!-- △ Popup -->
    <TextLabel name="tPopup">
        <div id="tPopup" class="number-popup" style="visibility: hidden;">
            {{  }}
        </div>
    </TextLabel>

    <!-- ✕ Popup -->
    <TextLabel name="xPopup">
        <div id="xPopup" class="number-popup" style="visibility: hidden;">
            {{  }}
        </div>
    </TextLabel>

    <!-- OK! Popup Hand 0 - Leftmost -->
    <TextLabel :position="{ x: -2, y: -1.5, z: 0 }" name="okUi0">
        <img id="okUi0" class="ok-popup svg-white" src="/src/assets/symbols/square-check-regular.svg" style="visibility: hidden;" />
    </TextLabel>

    <!-- OK! Popup Hand 1 -->
    <TextLabel :position="{ x: -0.1, y: -1.5, z: 0 }" name="okUi1">
        <img id="okUi1" class="ok-popup svg-white" src="/src/assets/symbols/square-check-regular.svg" style="visibility: hidden;" />
    </TextLabel>

    <!-- OK! Popup Hand 2 -->
    <TextLabel :position="{ x: 1.8, y: -1.5, z: 0 }" name="okUi2">
        <img id="okUi2" class="ok-popup svg-white" src="/src/assets/symbols/square-check-regular.svg" style="visibility: hidden;" />
    </TextLabel>

    <!-- OK! Popup Hand 3 - Rightmost -->
    <TextLabel :position="{ x: 3.7, y: -1.5, z: 0 }" name="okUi3">
        <img id="okUi3" class="ok-popup svg-white" src="/src/assets/symbols/square-check-regular.svg" style="visibility: hidden;" />
    </TextLabel>

    <!-- OK! Popup Deck -->
    <TextLabel :position="{ x: -3.8, y: -2.6, z: 0 }" name="okUiDeck">
        <img id="okUiDeck" class="ok-popup svg-white" src="/src/assets/symbols/square-check-regular.svg" style="visibility: hidden;" />
    </TextLabel>

    <!-- Player Win bar 1 -->
    <TextLabel :position="{ x: 4.97, y: -1.86, z: 0 }" name="pWinBar1">
        <img id="pWinBar1" src="/src/sprites/win-bar.png" style="visibility: hidden; height: 3vw; width: 7vw;" />
    </TextLabel>

    <!-- Player Win bar 2 -->
    <TextLabel :position="{ x: 4.97, y: -2.55, z: 0 }" name="pWinBar2">
        <img id="pWinBar2" src="/src/sprites/win-bar.png" style="visibility: hidden; height: 3vw; width: 7vw;" />
    </TextLabel>

    <!-- Player Win bar 3 -->
    <TextLabel :position="{ x: 4.97, y: -3.2, z: 0 }" name="pWinBar3">
        <img id="pWinBar3" src="/src/sprites/win-bar.png" style="visibility: hidden; height: 3vw; width: 7vw;" />
    </TextLabel>

    <!-- Opponent Win bar 1 -->
    <TextLabel :position="{ x: -4.97, y: 3.25, z: 0 }" name="oWinBar1">
        <img id="oWinBar1" src="/src/sprites/win-bar.png" style="visibility: hidden; height: 3vw; width: 7vw;" />
    </TextLabel>

    <!-- Opponent Win bar 2 -->
    <TextLabel :position="{ x: -4.97, y: 2.6, z: 0 }" name="oWinBar2">
        <img id="oWinBar2" src="/src/sprites/win-bar.png" style="visibility: hidden; height: 3vw; width: 7vw;" />
    </TextLabel>

    <!-- Opponent Win bar 3 -->
    <TextLabel :position="{ x: -4.97, y: 1.93, z: 0 }" name="oWinBar3">
        <img id="oWinBar3" src="/src/sprites/win-bar.png" style="visibility: hidden; height: 3vw; width: 7vw;" />
    </TextLabel>

    <!-- Misfire Failure -->
    <TextLabel name="misfireFailurePopup">
        <div id="misfireFailurePopup" class="misfire-failure-popup" style="visibility: hidden;">
            Misfire Failure
        </div>
    </TextLabel>

    <!-- Battle Status Popup -->
    <TextLabel name="battleStatusPopup">
        <div id="battleStatusPopup" class="eatup-hp-popup" style="visibility: hidden;">
            Eat-Up HP
        </div>
    </TextLabel>

    <!-- Player Name -->
    <TextLabel :position="{ x: -2.7, y: -4, z: 0 }" name="playerName">
        <div id="playerName" class="user-label">
            {{ gameStateStore.player.name || "Trainer A" }}
        </div>
    </TextLabel>

    <!-- Player Deck Name -->
    <TextLabel :position="{ x: 3, y: -4, z: 0 }" name="playerDeckName">
        <div id="playerDeckName" class="user-label">
            {{ gameStateStore.player.deck.deckName || "error" }}
        </div>
    </TextLabel>

    <!-- Opponent Name -->
    <TextLabel :position="{ x: 3, y: 4, z: 0 }" name="oppName">
        <div id="oppName" class="user-label">
            {{ gameStateStore.opponent.name || "CPU" }}
        </div>
    </TextLabel>

    <!-- Opponent Deck Name -->
    <TextLabel :position="{ x: -2.7, y: 4, z: 0 }" name="oppDeckName">
        <div id="oppDeckName" class="user-label">
             {{ gameStateStore.opponent.deck.deckName || "error" }}
        </div>
    </TextLabel>

    <!-- Match result banner -->
    <TextLabel :position="{ x: 0, y: 0, z: 1 }" name="matchResult">
        <div id="matchResult" class="match-result-banner" style="visibility: hidden;">
            3 Wins, 0 Losses - Trainer A WINS!
        </div>
    </TextLabel>

    <!-- Player Attack choice -->
    <TextLabel :position="{ x: 0, y: -7, z: 1 }" name="choiceDisplayP">
        <div id="choiceDisplayP" class="attack-choice-display">
            {{  }}
        </div>
    </TextLabel>

    <!-- Opponent Attack choice -->
    <TextLabel :position="{ x: 0, y: 7, z: 1 }" name="choiceDisplayO">
        <div id="choiceDisplayO" class="attack-choice-display">
            {{  }}
        </div>
    </TextLabel>

    <!-- Field Pulse -->
    <TextLabel name="fieldPulse">
        <div id="fieldPulse">
            {{  }}
        </div>
    </TextLabel>

    <!-- Player Attack Pulse -->
    <TextLabel name="pulseP">
        <div id="pulseP">
            {{  }}
        </div>
    </TextLabel>

    <!-- Opponent Attack Pulse -->
    <TextLabel name="pulseO">
        <div id="pulseO">
            {{  }}
        </div>
    </TextLabel>
    
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useGameStateStore } from "../stores/gameState"
import TextLabel from "./TextLabel.vue"

const testHtml = ref("hello world ref");
const gameStateStore = useGameStateStore();
console.log("gameStateStore.player.cards.length", gameStateStore.player.cards.length)

// hover refs
const isChoiceOHover = ref(false);
const isChoiceTHover = ref(false);
const isChoiceXHover = ref(false);

async function fetchAsyncData() {
    try {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        testHtml.value = "hello world after 2 seconds";
    } catch (error) {
        console.error("Error in fetchAsyncData:", error);
        testHtml.value = "Error in fetchAsyncData";
    }
}

function onSelect(event) {
    console.log("onSelect", event);
    // if selected circle, set circle attack
    // usePlayerStore().setPAttack(ATTACK.C)
    //     if (useStateStore().oppMode == MODE.PROD) {
    //         socket.emit("set-attack-choice", ATTACK.C)
    //     }
}

onMounted(() => {
    fetchAsyncData();
})

</script>