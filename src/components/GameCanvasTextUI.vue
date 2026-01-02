<template>
    <TresGroup>
    <!-- player deck count -->
    <Html :position="[-5.25, -3.05, 0]" center @click="onClick">
        <div id="pDeckCount" class="card-count">
            {{ gameStateStore.playerDeckCount }}
        </div>
    </Html>
    <!-- player offline count -->
    <Html :position="[-5.25, -1.95, 0]" center @click="onClick">
        <div id="pOfflineCount" class="card-count">
            {{ gameStateStore.playerOfflineCount }}
        </div>
    </Html>
    <!-- opponent deck count -->
    <Html :position="[5.35, 2.05, 0]" center @click="onClick">
        <div id="oDeckCount" class="card-count">
            {{ gameStateStore.opponentDeckCount }}
        </div>
    </Html>
    <!-- opponent offline count -->
    <Html :position="[5.35, 3.1, 0]" center>
        <div id="oOfflineCount" class="card-count">
            {{ gameStateStore.opponentOfflineCount }}
        </div>
    </Html>
    
    <!-- player DP count -->
    <Html :position="[-4.95, 0.7, 0]" center name="pDpCount">
        <div id="pDpCount" class="card-count">
            {{ gameStateStore.playerDpCount }}
        </div>
    </Html>
    <!-- player active monster name -->
    <Html :position="[-2.8, 1.18, 0]" center name="pActiveNm">
        <div id="pActiveNm" class="active-nm">
            {{ gameStateStore.playerActiveMonster.name }}
        </div>
    </Html>
    <!-- player active monster 〇 -->
    <Html :position="[-3.13, 0.58, 0]" center name="pActiveC">
        <div id="pActiveC" class="active-pow">
            {{ gameStateStore.playerActiveMonster.cAttack }}
        </div>
    </Html>
    <!-- player active monster △ -->
    <Html :position="[-3.13, 0, 0]" center name="pActiveT">
        <div id="pActiveT" class="active-pow">
            {{ gameStateStore.playerActiveMonster.tAttack }}
        </div>
    </Html>
    <!-- player active monster ✕ -->
    <Html :position="[-3.13, -0.6, 0]" center name="pActiveX">
        <div id="pActiveX" class="active-pow">
            {{ gameStateStore.playerActiveMonster.xAttack }}
        </div>
    </Html>
    <!-- player active monster ✕ Effect -->
    <Html :position="[-3.29, -1.12, 0]" center name="pActiveXEff">
        <div id="pActiveXEff" class="active-eff">
            {{ gameStateStore.playerActiveMonster.xEffect }}
        </div>
    </Html>
    <!-- player active monster HP label -->
    <Html :position="[-1.26, -0.795, 0]" center name="pActiveHpLbl">
        <div id="pActiveHpLbl" class="active-hp-label">
            HP
        </div>
    </Html>
    <!-- player active monster HP -->
    <Html :position="[-1.25, -0.77, 0.002]" center name="pActiveHp">
        <div id="pActiveHp" class="active-hp">
            {{ gameStateStore.playerActiveMonster.hp }}
        </div>
    </Html>

    <!-- opponent DP count -->
    <Html :position="[5.03, 0.7, 0]" center name="oDpCount">
        <div id="oDpCount" class="card-count">
            {{ gameStateStore.opponentDpCount }}
        </div>
    </Html>
    <!-- opponent active monster name -->
    <Html :position="[2.2, 1.18, 0]" center name="oActiveNm">
        <div id="oActiveNm" class="active-nm">
            {{ gameStateStore.opponentActiveMonster.name }}
        </div>
    </Html>
    <!-- opponent active monster 〇 -->
    <Html :position="[3.65, 0.58, 0]" center name="oActiveC">
        <div id="oActiveC" class="active-pow">
            {{ gameStateStore.opponentActiveMonster.cAttack }}
        </div>
    </Html>
    <!-- opponent active monster △ -->
    <Html :position="[3.65, 0, 0]" center name="oActiveT">
        <div id="oActiveT" class="active-pow">
            {{ gameStateStore.opponentActiveMonster.tAttack }}
        </div>
    </Html>
    <!-- opponent active monster ✕ -->
    <Html :position="[3.65, -0.6, 0]" center name="oActiveX">
        <div id="oActiveX" class="active-pow">
            {{ gameStateStore.opponentActiveMonster.xAttack }}
        </div>
    </Html>
    <!-- opponent active monster ✕ Effect -->
    <Html :position="[3.55, -1.12, 0]" center name="oActiveXEff">
        <div id="oActiveXEff" class="active-eff">
            {{ gameStateStore.opponentActiveMonster.xEffect }}
        </div>
    </Html>
    <!-- opponent active monster HP label -->
    <Html :position="[1.351, -0.795, 0]" center name="oActiveHpLbl">
        <div id="oActiveHpLbl" class="active-hp-label">
            HP
        </div>
    </Html>
    <!-- opponent active monster HP -->
    <Html :position="[1.35, -0.77, 0.002]" center name="oActiveHp">
        <div id="oActiveHp" class="active-hp">
            {{ gameStateStore.opponentActiveMonster.hp }}
        </div>
    </Html>

    <!-- Player Attack Choice - Name -->
    <Html :position="[-2.15, -4.95, 0]" center name="pChoiceNm">
        <div id="pChoiceNm" class="choice choice-name">
            {{  }}
        </div>
    </Html>

    <!-- Player Attack Choice - HP -->
    <Html :position="[5.75, -4.95, 0]" center name="pChoiceHp">
        <div id="pChoiceHp" class="choice">
            {{  }}
        </div>
    </Html>

    <!-- Player Attack Choice - Level -->
    <Html :position="[7.6, -4.95, 0]" center name="pChoiceLevel">
        <div id="pChoiceLevel" class="choice">
            {{  }}
        </div>
    </Html>

    <!-- Player Attack Choice - Specialty -->
    <Html :position="[5, -4.95, 0]" center name="pChoiceSp">
        <img id="pChoiceSp" class="choice-img" />
    </Html>

    <!-- Player Attack Choice - 〇 Name -->
    <Html :position="[-0.2, -5.5, 0]" center name="pChoiceONm">
        <div id="pChoiceONm" class="choice">
            {{  }}
        </div>
    </Html>

    <!-- Player Attack Choice - △ Name -->
    <Html :position="[-0.2, -6.1, -0.1]" center name="pChoiceTNm">
        <div id="pChoiceTNm" class="choice">
            {{  }}
        </div>
    </Html>

    <!-- Player Attack Choice - ✕ Name -->
    <Html :position="[-0.2, -6.7, -0.1]" center name="pChoiceXNm">
        <div id="pChoiceXNm" class="choice">
            {{  }}
        </div>
    </Html>

    <!-- Player Attack Choice - ✕ Effect -->
    <Html :position="[1.9, -7.3, 0]" center name="pChoiceXEff">
        <div id="pChoiceXEff" class="choice choice-x-eff">
            {{  }}
        </div>
    </Html>

    <!-- Player Attack Choice - 〇 Value -->
    <Html :position="[4.3, -5.5, 0]" center name="pChoiceOVal">
        <div id="pChoiceOVal" class="choice choice-val">
            {{  }}
        </div>
    </Html>

    <!-- Player Attack Choice - △ Value -->
    <Html :position="[4.3, -6.1, 0]" center name="pChoiceTVal">
        <div id="pChoiceTVal" class="choice choice-val">
            {{  }}
        </div>
    </Html>

    <!-- Player Attack Choice - ✕ Value -->
    <Html :position="[4.3, -6.7, 0]" center name="pChoiceXVal">
        <div id="pChoiceXVal" class="choice choice-val">
            {{  }}
        </div>
    </Html>

    <!-- Player Attack Choice - ✕ Effect Speed -->
    <Html :position="[3.1, -7.25, 0]" center name="pChoiceXSpd">
        <img id="pChoiceXSpd" class="choice-img" />
    </Html>

    <!-- Player Attack Choice - Turn -->
    <Html :position="[4.3, -7.3, 0]" center name="pChoiceTurn">
        <div id="pChoiceTurn" class="choice choice-turn">
            {{  }}
        </div>
    </Html>

    <!-- Opponent Attack Choice - Name -->
    <Html :position="[-2.15, 7.55, 0]" center name="oChoiceNm">
        <div id="oChoiceNm" class="choice choice-name">
            {{  }}
        </div>
    </Html>

    <!-- Opponent Attack Choice - HP -->
    <Html :position="[5.65, 7.55, 0]" center name="oChoiceHp">
        <div id="oChoiceHp" class="choice">
            {{  }}
        </div>
    </Html>

    <!-- Opponent Attack Choice - Level -->
    <Html :position="[7.6, 7.55, 0]" center name="oChoiceLevel">
        <div id="oChoiceLevel" class="choice">
            {{  }}
        </div>
    </Html>

    <!-- Opponent Attack Choice - Specialty -->
    <Html :position="[5, 7.55, 0]" center name="oChoiceSp">
        <img id="oChoiceSp" class="choice-img" />
    </Html>

    <!-- Opponent Attack Choice - 〇 Name -->
    <Html :position="[-0.2, 6.97, 0]" center name="oChoiceONm">
        <div id="oChoiceONm" class="choice">
            {{  }}
        </div>
    </Html>

    <!-- Opponent Attack Choice - △ Name -->
    <Html :position="[-0.2, 6.42, -0.1]" center name="oChoiceTNm">
        <div id="oChoiceTNm" class="choice">
            {{  }}
        </div>
    </Html>

    <!-- Opponent Attack Choice - ✕ Name -->
    <Html :position="[-0.2, 5.83, -0.1]" center name="oChoiceXNm">
        <div id="oChoiceXNm" class="choice">
            {{  }}
        </div>
    </Html>

    <!-- Opponent Attack Choice - ✕ Effect -->
    <Html :position="[1.95, 5.25, 0]" center name="oChoiceXEff">
        <div id="oChoiceXEff" class="choice choice-x-eff">
            {{  }}
        </div>
    </Html>

    <!-- Opponent Attack Choice - 〇 Value -->
    <Html :position="[4.3, 6.97, 0]" center name="oChoiceOVal">
        <div id="oChoiceOVal" class="choice choice-val">
            {{  }}
        </div>
    </Html>

    <!-- Opponent Attack Choice - △ Value -->
    <Html :position="[4.3, 6.42, 0]" center name="oChoiceTVal">
        <div id="oChoiceTVal" class="choice choice-val">
            {{  }}
        </div>
    </Html>

    <!-- Opponent Attack Choice - ✕ Value -->
    <Html :position="[4.3, 5.83, 0]" center name="oChoiceXVal">
        <div id="oChoiceXVal" class="choice choice-val">
            {{  }}
        </div>
    </Html>

    <!-- Opponent Attack Choice - ✕ Effect Speed -->
    <Html :position="[3.1, 5.2, 0]" center name="oChoiceXSpd">
        <img id="oChoiceXSpd" class="choice-img" />
    </Html>

    <!-- Opponent Attack Choice - Turn -->
    <Html :position="[4.3, 5.25, 0]" center name="oChoiceTurn">
        <div id="oChoiceTurn" class="choice choice-turn">
            {{  }}
        </div>
    </Html>

    <!-- Player Attack Choice - 〇 Name Hover -->
    <Html :position="[0, -5.5, 0]" center name="choiceOHover">
        <div id="choiceOHover" :class="isChoiceOHover ? 'attack-choice-bloom' : 'attack-choice-invisible'" 
            @pointerover="isChoiceOHover = true" 
            @pointerleave="isChoiceOHover = false"
            @click="onSelect('circle')">
        </div>
    </Html>

    <!-- Player Attack Choice - △ Name Hover -->
    <Html :position="[0, -6.05, 0]" center name="choiceTHover">
        <div id="choiceTHover" :class="isChoiceTHover ? 'attack-choice-bloom' : 'attack-choice-invisible'" 
            @pointerover="isChoiceTHover = true" 
            @pointerleave="isChoiceTHover = false"
            @click="onSelect('triangle')">
        </div>
    </Html>

    <!-- Player Attack Choice - ✕ Name Hover -->
    <Html :position="[0, -6.65, 0]" center name="choiceXHover">
        <div id="choiceXHover" :class="isChoiceXHover ? 'attack-choice-bloom' : 'attack-choice-invisible'" 
            @pointerover="isChoiceXHover = true" 
            @pointerleave="isChoiceXHover = false"
            @click="onSelect('cross')">
        </div>
    </Html>

    <!-- Info Board - Name -->
    <Html :position="[-16.75, 4.13, 0]" center name="infoNm">
        <div id="infoNm" class="info info-name">
            {{  }}
        </div>
    </Html>

    <!-- Info Board - HP -->
    <Html :position="[-18.4, 3.55, 0]" center name="infoHp">
        <div id="infoHp" class="info info-val">
            {{  }}
        </div>
    </Html>

    <!-- Info Board - 〇 Value -->
    <Html :position="[-18.4, 3, 0]" center name="infoOVal">
        <div id="infoOVal" class="info info-val">
            {{  }}
        </div>
    </Html>

    <!-- Info Board - △ Value -->
    <Html :position="[-18.4, 2.46, 0]" center name="infoTVal">
        <div id="infoTVal" class="info info-val">
            {{  }}
        </div>
    </Html>

    <!-- Info Board - ✕ Value -->
    <Html :position="[-18.4, 1.95, 0]" center name="infoXVal">
        <div id="infoXVal" class="info info-val">
            {{  }}
        </div>
    </Html>

    <!-- Info Board - ✕ Effect -->
    <Html :position="[-18.8, 1.5, 0]" center name="infoXEff">
        <div id="infoXEff" class="info info-x-eff">
            {{  }}
        </div>
    </Html>

    <!-- Info Board - ✕ Effect Speed -->
    <Html :position="[-17.25, 1.55, 0]" center name="infoXSpd">
        <img id="infoXSpd" class="info-img" />
    </Html>

    <!-- Info Board - Level -->
    <Html :position="[-12.65, 4.13, 0]" center name="infoLevel">
        <div id="infoLevel" class="info">
            {{  }}
        </div>
    </Html>

    <!-- Info Board - Specialty -->
    <Html :position="[-13.42, 4.13, 0]" center name="infoSp">
        <img id="infoSp" class="info-img" />
    </Html>

    <!-- Info Board - DP -->
    <Html :position="[-16.9, 3.15, 0]" center name="infoDp">
        <div id="infoDp" class="info info-dp">
            {{  }}
        </div>
    </Html>

    <!-- Info Board - PP -->
    <Html :position="[-16.9, 2.2, 0]" center name="infoPp">
        <div id="infoPp" class="info info-dp">
            {{  }}
        </div>
    </Html>

    <!-- Info Board - Support -->
    <Html :position="[-13.5, 2.55, 0]" center name="infoSupport">
        <div id="infoSupport" class="info info-eff">
            {{  }}
        </div>
    </Html>

    <!-- Info Board - Support Speed -->
    <Html :position="[-11.9, 4.11, 0]" center name="infoSupportSpd">
        <img id="infoSupportSpd" class="info-img" />
    </Html>

    <!-- Number Popup -->
    <Html name="numberPopupUi">
        <div id="numberPopupUi" class="number-popup" style="visibility: hidden;">
            {{  }}
        </div>
    </Html>

    <!-- 〇 Popup -->
    <Html name="cPopup">
        <div id="cPopup" class="number-popup" style="visibility: hidden;">
            {{  }}
        </div>
    </Html>

    <!-- △ Popup -->
    <Html name="tPopup">
        <div id="tPopup" class="number-popup" style="visibility: hidden;">
            {{  }}
        </div>
    </Html>

    <!-- ✕ Popup -->
    <Html name="xPopup">
        <div id="xPopup" class="number-popup" style="visibility: hidden;">
            {{  }}
        </div>
    </Html>

    <!-- OK! Popup Hand 0 - Leftmost -->
    <Html :position="[-2, -1.5, 0]" center name="okUi0">
        <img id="okUi0" class="ok-popup svg-white" src="/src/assets/symbols/square-check-regular.svg" style="visibility: hidden;" />
    </Html>

    <!-- OK! Popup Hand 1 -->
    <Html :position="[-0.1, -1.5, 0]" center name="okUi1">
        <img id="okUi1" class="ok-popup svg-white" src="/src/assets/symbols/square-check-regular.svg" style="visibility: hidden;" />
    </Html>

    <!-- OK! Popup Hand 2 -->
    <Html :position="[1.8, -1.5, 0]" center name="okUi2">
        <img id="okUi2" class="ok-popup svg-white" src="/src/assets/symbols/square-check-regular.svg" style="visibility: hidden;" />
    </Html>

    <!-- OK! Popup Hand 3 - Rightmost -->
    <Html :position="[3.7, -1.5, 0]" center name="okUi3">
        <img id="okUi3" class="ok-popup svg-white" src="/src/assets/symbols/square-check-regular.svg" style="visibility: hidden;" />
    </Html>

    <!-- OK! Popup Deck -->
    <Html :position="[-3.8, -2.6, 0]" center name="okUiDeck">
        <img id="okUiDeck" class="ok-popup svg-white" src="/src/assets/symbols/square-check-regular.svg" style="visibility: hidden;" />
    </Html>

    <!-- Player Win bar 1 -->
    <Html :position="[4.97, -1.86, 0]" center name="pWinBar1">
        <img id="pWinBar1" src="/src/sprites/win-bar.png" style="visibility: hidden; height: 3vw; width: 7vw;" />
    </Html>

    <!-- Player Win bar 2 -->
    <Html :position="[4.97, -2.55, 0]" center name="pWinBar2">
        <img id="pWinBar2" src="/src/sprites/win-bar.png" style="visibility: hidden; height: 3vw; width: 7vw;" />
    </Html>

    <!-- Player Win bar 3 -->
    <Html :position="[4.97, -3.2, 0]" center name="pWinBar3">
        <img id="pWinBar3" src="/src/sprites/win-bar.png" style="visibility: hidden; height: 3vw; width: 7vw;" />
    </Html>

    <!-- Opponent Win bar 1 -->
    <Html :position="[-4.97, 3.25, 0]" center name="oWinBar1">
        <img id="oWinBar1" src="/src/sprites/win-bar.png" style="visibility: hidden; height: 3vw; width: 7vw;" />
    </Html>

    <!-- Opponent Win bar 2 -->
    <Html :position="[-4.97, 2.6, 0]" center name="oWinBar2">
        <img id="oWinBar2" src="/src/sprites/win-bar.png" style="visibility: hidden; height: 3vw; width: 7vw;" />
    </Html>

    <!-- Opponent Win bar 3 -->
    <Html :position="[-4.97, 1.93, 0]" center name="oWinBar3">
        <img id="oWinBar3" src="/src/sprites/win-bar.png" style="visibility: hidden; height: 3vw; width: 7vw;" />
    </Html>

    <!-- Misfire Failure -->
    <Html name="misfireFailurePopup">
        <div id="misfireFailurePopup" class="misfire-failure-popup" style="visibility: hidden;">
            Misfire Failure
        </div>
    </Html>

    <!-- Battle Status Popup -->
    <Html name="battleStatusPopup">
        <div id="battleStatusPopup" class="eatup-hp-popup" style="visibility: hidden;">
            Eat-Up HP
        </div>
    </Html>

    <!-- Player Name -->
    <Html :position="[-2.7, -4, 0]" center name="playerName">
        <div id="playerName" class="user-label">
            {{ gameStateStore.player.name || "Trainer A" }}
        </div>
    </Html>

    <!-- Player Deck Name -->
    <Html :position="[3, -4, 0]" center name="playerDeckName">
        <div id="playerDeckName" class="user-label">
            {{ gameStateStore.player.deck.deckName || "error" }}
        </div>
    </Html>

    <!-- Opponent Name -->
    <Html :position="[3, 4, 0]" center name="oppName">
        <div id="oppName" class="user-label">
            {{ gameStateStore.opponent.name || "CPU" }}
        </div>
    </Html>

    <!-- Opponent Deck Name -->
    <Html :position="[-2.7, 4, 0]" center name="oppDeckName">
        <div id="oppDeckName" class="user-label">
             {{ gameStateStore.opponent.deck.deckName || "error" }}
        </div>
    </Html>

    <!-- Match result banner -->
    <Html :position="[0, 0, 1]" center name="matchResult">
        <div id="matchResult" class="match-result-banner" style="visibility: hidden;">
            3 Wins, 0 Losses - Trainer A WINS!
        </div>
    </Html>

    <!-- Player Attack choice -->
    <Html :position="[0, -7, 1]" center name="choiceDisplayP">
        <div id="choiceDisplayP" class="attack-choice-display">
            {{  }}
        </div>
    </Html>

    <!-- Opponent Attack choice -->
    <Html :position="[0, 7, 1]" center name="choiceDisplayO">
        <div id="choiceDisplayO" class="attack-choice-display">
            {{  }}
        </div>
    </Html>

    <!-- Field Pulse -->
    <Html name="fieldPulse">
        <div id="fieldPulse">
            {{  }}
        </div>
    </Html>

    <!-- Player Attack Pulse -->
    <Html name="pulseP">
        <div id="pulseP">
            {{  }}
        </div>
    </Html>

    <!-- Opponent Attack Pulse -->
    <Html name="pulseO">
        <div id="pulseO">
            {{  }}
        </div>
    </Html>
    </TresGroup>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useGameStateStore } from "../stores/gameState"
import { Html } from "@tresjs/cientos";

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

function onClick(event) {
    console.log("onClick", event);
}

onMounted(() => {
    fetchAsyncData();
})

</script>