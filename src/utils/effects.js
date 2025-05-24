import { animateCardToHand, animateHandToDeck } from "../animations/monster"
import { WHO, COLOR_CODE, SPECIALTY, LEVEL, ATTACK, CARD_NAME } from "../const/const"
import { usePlayerStore } from "../stores/player"
import fragmentShader from "../shaders/fragment.glsl.js"
import { attackChoiceToSymbol, hexToRgb, specialtyToColor } from "../utils/mapper.js"
import { setPlayerDpToOffline, setOppDpToOffline, discardAllHandCards, setDeckCardToOffline, drawDeckCardToHand, setOfflineCardToDeck, discardHandCardsGivenId } from "../components/fieldManager.js"
import { addAllPPower, addPCPower, addPTPower, addPXPower, addPHp, addAllOPower, addOCPower, addOTPower, addOXPower, addOHp } from "./battleCalculation.js"
import { useOpponentStore } from "../stores/opponent.js"
import { animateBattleStatusPopup, animateMisfireFailurePopup, animateSpecialtyChange } from "../animations/field.js"
import { useStateStore } from "../stores/state.js"
import { shuffleDeck } from "./createCard.js"

const noneEffect = async (who, scene, isXeff) => {
    await animateMisfireFailurePopup(scene, who == WHO.PLAYER, isXeff);
    return
}

export const effects = [
    {
        id: "000",
        // {{button|c}} Counter
        xEffect: async (who, scene, isXeff) => {
            await executeCcounter(who, scene, isXeff);
        },
        // Add number of DP Cards in DP Slot x100 to own Attack Power.
        effect: async (who, scene, isXeff) => {
            if (who == WHO.PLAYER) {
                const playerStore = usePlayerStore();
                const addPower = playerStore.pDpCount * 100
                await addAllPPower(addPower, scene);
            } else {
                const oppStore = useOpponentStore();
                const addPower = oppStore.oDpCount * 100
                await addAllOPower(addPower, scene);
            }
        }
    },
    {
        id: "001",
        // {{button|x}} Counter
        xEffect: async (who, scene, isXeff) => {
            await executeXcounter(who, scene, isXeff)
        },
        // Changes own Specialty to Fire. Boost own Attack Power +100.
        effect: async (who, scene, isXeff) => {
            await animateBattleStatusPopup(scene, who == WHO.PLAYER, "Change Specialty");
            await animateSpecialtyChange(who);
            // set gradient color
            const colorTopRgb = `vec3(${hexToRgb(COLOR_CODE.FIRE_TOP).join(",")})`;
            const colorBottomRgb = `vec3(${hexToRgb(COLOR_CODE.FIRE_BOTTOM).join(",")})`;
            const fShader = fragmentShader
                .replace("##COLOR_TOP", colorTopRgb)
                .replace("##COLOR_BOTTOM", colorBottomRgb);
            const addPower = 100

            if (who == WHO.PLAYER) {
                const playerStore = usePlayerStore();
                playerStore.pActiveMon.specialty = SPECIALTY.FIRE;
                // Change color
                const card = scene.getObjectByName(`${CARD_NAME.PLAYER}${playerStore.pActiveMon.id}`)
                card.material.fragmentShader = fShader;
                card.material.needsUpdate = true;
                await addAllPPower(addPower, scene);
            } else {
                const oppStore = useOpponentStore();
                oppStore.oActiveMon.specialty = SPECIALTY.FIRE;
                // Change color
                const card = scene.getObjectByName(`${CARD_NAME.OPP}${oppStore.oActiveMon.id}`)
                card.material.fragmentShader = fShader;
                card.material.needsUpdate = true;
                await addAllOPower(addPower, scene);
            }
        }
    },
    {
        id: "002",
        // Ice Foe x3
        xEffect: async (who, scene, isXeff) => {
            await executeSpecialtyFoeX3(who, scene, SPECIALTY.ICE, isXeff);
        },
        // Add number of Cards in Hand x100 to own Attack Power.
        effect: async (who, scene, isXeff) => {
            if (who == WHO.PLAYER) {
                const playerStore = usePlayerStore();
                const addPower = playerStore.pHandCount * 100
                await addAllPPower(addPower, scene)
            } else {
                const oppStore = useOpponentStore();
                const addPower = oppStore.oHandCount * 100
                await addAllOPower(addPower, scene)
            }
        }
    },
    {
        id: "003",
        // Eat-Up HP
        xEffect: async (who, scene, isXeff) => {
            const playerStore = usePlayerStore();
            const oppStore = useOpponentStore();
            if (who == WHO.PLAYER) {
                playerStore.setEatUpHp(true);
                await animateBattleStatusPopup(scene, true, "Eat-Up HP");
            } else if (who == WHO.OPP) {
                oppStore.setEatUpHp(true);
                await animateBattleStatusPopup(scene, false, "Eat-Up HP");
            }
        },
        // Digimon KO'd in battle revives with 500 HP. Battle is still lost.
        effect: async (who, scene, isXeff) => {
            const playerStore = usePlayerStore();
            const oppStore = useOpponentStore();
            const reviveHp = 500;
            if (who == WHO.PLAYER) {
                playerStore.setRevive(true, reviveHp);
                await animateBattleStatusPopup(scene, true, "Revive if KO");
            } else {
                oppStore.setRevive(true, reviveHp);
                await animateBattleStatusPopup(scene, false, "Revive if KO");
            }
        }
    },
    {
        id: "004",
        // {{button|x}} to 0
        xEffect: async (who, scene, isXeff) => {
            await executeXTo0(who, scene);
        },
        // If own Specialty is Fire, boost own Attack Power +300.
        effect: async (who, scene, isXeff) => {
            const playerStore = usePlayerStore();
            const oppStore = useOpponentStore();
            if (who == WHO.PLAYER && playerStore.pActiveMon.specialty == SPECIALTY.FIRE) {
                const addPower = 300
                await addAllPPower(addPower, scene)
            } else if (who == WHO.OPP && oppStore.oActiveMon.specialty == SPECIALTY.FIRE) {
                const addPower = 300
                await addAllOPower(addPower, scene)
            }
            else {
                await animateMisfireFailurePopup(scene, who == WHO.PLAYER, isXeff)
            }
        }
    },
    {
        id: "005",
        // None
        xEffect: noneEffect,
        // None
        effect: noneEffect,
    },
    {
        id: "006",
        // {{button|c}} Counter
        xEffect: async (who, scene, isXeff) => {
            await executeCcounter(who, scene, isXeff);
        },
        // Boost own Attack Power +300.
        effect: async (who, scene, isXeff) => {
            const addPower = 300
            if (who == WHO.PLAYER) {
                await addAllPPower(addPower, scene);
            } else {
                await addAllOPower(addPower, scene);
            }
        }
    },
    {
        id: "007",
        // 1st Attack
        xEffect: async (who, scene, isXeff) => {
            execute1stAttack(who, scene);
        },
        // If own Attack is 〇, attack first.
        effect: async (who, scene, isXeff) => {
            const playerStore = usePlayerStore();
            const oppStore = useOpponentStore();
            if (who == WHO.PLAYER && playerStore.pAttack == ATTACK.C) {
                execute1stAttack(who, scene);
            } else if (who == WHO.OPP && oppStore.oAttack == ATTACK.C) {
                execute1stAttack(who, scene);
            }
            else {
                await animateMisfireFailurePopup(scene, who == WHO.PLAYER, isXeff)
            }
        }
    },
    {
        id: "008",
        // Ice Foe x3
        xEffect: async (who, scene, isXeff) => {
            await executeSpecialtyFoeX3(who, scene, SPECIALTY.ICE, isXeff);
        },
        // If own Specialty is Fire, own Attack Power is doubled.
        effect: async (who, scene, isXeff) => {
            const playerStore = usePlayerStore();
            const oppStore = useOpponentStore();

            if (who == WHO.PLAYER && playerStore.pActiveMon.specialty == SPECIALTY.FIRE) {
                await Promise.all([
                    addPCPower(playerStore.pActiveMon.cPow, scene),
                    addPTPower(playerStore.pActiveMon.tPow, scene),
                    addPXPower(playerStore.pActiveMon.xPow, scene)
                ]) 
            } else if (who == WHO.OPP && oppStore.oActiveMon.specialty == SPECIALTY.FIRE) {
                await Promise.all([
                    addOCPower(oppStore.oActiveMon.cPow, scene),
                    addOTPower(oppStore.oActiveMon.tPow, scene),
                    addOXPower(oppStore.oActiveMon.xPow, scene)
                ])
            }
            else {
                await animateMisfireFailurePopup(scene, who == WHO.PLAYER, isXeff)
            }
        }
    },
    {
        id: "009",
        // {{button|c}} Counter
        xEffect: async (who, scene, isXeff) => {
            await executeCcounter(who, scene, isXeff);
        },
        // If own Level is U, boost own Attack Power +500.
        effect: async (who, scene, isXeff) => {
            const playerStore = usePlayerStore();
            const oppStore = useOpponentStore();

            if (who == WHO.PLAYER && playerStore.pActiveMon.level == LEVEL.U) {
                const addPower = 500;
                await addAllPPower(addPower, scene);
            } else if (who == WHO.OPP && oppStore.oActiveMon.level == LEVEL.U) {
                const addPower = 500;
                await addAllOPower(addPower, scene);
            } else {
                await animateMisfireFailurePopup(scene, who == WHO.PLAYER, isXeff)
            }
        }
    },
    {
        id: "010",
        // {{button|t}} Counter
        xEffect: async (who, scene, isXeff) => {
            await executeTcounter(who, scene, isXeff);
        },
        // None
        effect: noneEffect,
    },
    {
        id: "011",
        // {{button|c}} to 0
        xEffect: async (who, scene, isXeff) => {
            await executeCTo0(who, scene)
        },
        // Lower opponent's 〇 Attack Power to 0.
        effect: async (who, scene, isXeff) => {
            if (who == WHO.PLAYER) {
                const oppStore = useOpponentStore();
                await addOCPower(-oppStore.oActiveMon.cPow, scene)
            } else {
                const playerStore = usePlayerStore();
                await addPCPower(-playerStore.pActiveMon.cPow, scene)
            }
        }
    },
    {
        id: "012",
        // {{button|c}} Counter
        xEffect: async (who, scene, isXeff) => {
            await executeCcounter(who, scene, isXeff);
        },
        // If own Level is A, boost own Attack Power +300.
        effect: async (who, scene, isXeff) => {
            const playerStore = usePlayerStore();
            const oppStore = useOpponentStore();
            const addPower = 300;

            if (who == WHO.PLAYER && playerStore.pActiveMon.level == LEVEL.A) {
                await addAllPPower(addPower, scene);
            } else if (who == WHO.OPP && oppStore.oActiveMon.level == LEVEL.A) {
                await addAllOPower(addPower, scene);
            } else {
                await animateMisfireFailurePopup(scene, who == WHO.PLAYER, isXeff)
            }
        }
    },
    {
        id: "013",
        // 1st Attack
        xEffect: async (who, scene, isXeff) => {
            execute1stAttack(who, scene);
        },
        // If own attack is {{button|t}}, attack first.
        effect: async (who, scene, isXeff) => {
            const playerStore = usePlayerStore();
            const oppStore = useOpponentStore();

            if (who == WHO.PLAYER && playerStore.pAttack == ATTACK.T) {
                execute1stAttack(who, scene);
            } else if (who == WHO.OPP && oppStore.oAttack == ATTACK.T) {
                execute1stAttack(who, scene);
            } else {
                await animateMisfireFailurePopup(scene, who == WHO.PLAYER, isXeff)
            }
        }
    },
    {
        id: "014",
        // {{button|c}} Counter
        xEffect: async (who, scene, isXeff) => {
            await executeCcounter(who, scene, isXeff);
        },
        // If own Level is C, boost own Attack Power +300.
        effect: async (who, scene, isXeff) => {
            const playerStore = usePlayerStore();
            const oppStore = useOpponentStore();
            const addPower = 300;

            if (who == WHO.PLAYER && playerStore.pActiveMon.level == LEVEL.C) {
                await addAllPPower(addPower, scene);
            } else if (who == WHO.OPP && oppStore.oActiveMon.level == LEVEL.C) {
                await addAllOPower(addPower, scene);
            } else {
                await animateMisfireFailurePopup(scene, who == WHO.PLAYER, isXeff)
            }
        }
    },
    {
        id: "015",
        // {{button|c}} Counter
        xEffect: async (who, scene, isXeff) => {
            await executeCcounter(who, scene, isXeff);
        },
        // Change own Specialty to Fire. Boost own Attack Power +200.
        effect: async (who, scene, isXeff) => {
            await animateBattleStatusPopup(scene, who == WHO.PLAYER, "Change Specialty");
            await animateSpecialtyChange(who);
            // set gradient color
            const colorTopRgb = `vec3(${hexToRgb(COLOR_CODE.FIRE_TOP).join(",")})`;
            const colorBottomRgb = `vec3(${hexToRgb(COLOR_CODE.FIRE_BOTTOM).join(",")})`;
            const fShader = fragmentShader
                .replace("##COLOR_TOP", colorTopRgb)
                .replace("##COLOR_BOTTOM", colorBottomRgb);
            const addPower = 200;

            if (who == WHO.PLAYER) {
                const playerStore = usePlayerStore();
                playerStore.pActiveMon.specialty = SPECIALTY.FIRE;
                // Change color
                const card = scene.getObjectByName(`${CARD_NAME.PLAYER}${playerStore.pActiveMon.id}`)
                card.material.fragmentShader = fShader;
                card.material.needsUpdate = true;
                await addAllPPower(addPower, scene);
            } else {
                const oppStore = useOpponentStore();
                oppStore.oActiveMon.specialty = SPECIALTY.FIRE;
                // Change color
                const card = scene.getObjectByName(`${CARD_NAME.OPP}${oppStore.oActiveMon.id}`)
                card.material.fragmentShader = fShader;
                card.material.needsUpdate = true;
                await addAllOPower(addPower, scene);
            }
        }
    },
    {
        id: "016",
        // Nature Foe x3
        xEffect: async (who, scene, isXeff) => {
            await executeSpecialtyFoeX3(who, scene, SPECIALTY.NATURE, isXeff);
        },
        // None
        effect: noneEffect,
    },
    {
        id: "017",
        // {{button|c}} to 0
        xEffect: async (who, scene, isXeff) => {
            await executeCTo0(who, scene)
        },
        // None
        effect: noneEffect,
    },
    {
        id: "018",
        // Ice Foe x3
        xEffect: async (who, scene, isXeff) => {
            await executeSpecialtyFoeX3(who, scene, SPECIALTY.ICE, isXeff);
        },
        // If opponent's Specialty is Ice, own Attack Power is tripled.
        effect: async (who, scene, isXeff) => {
            const playerStore = usePlayerStore();
            const oppStore = useOpponentStore();

            if (who == WHO.PLAYER && oppStore.oActiveMon.specialty == SPECIALTY.ICE) {
                await Promise.all([
                    addPCPower(playerStore.pActiveMon.cPow * 2, scene),
                    addPTPower(playerStore.pActiveMon.tPow * 2, scene),
                    addPXPower(playerStore.pActiveMon.xPow * 2, scene),
                ])
            } else if (who == WHO.OPP && playerStore.pActiveMon.specialty == SPECIALTY.ICE) {
                await Promise.all([
                    addOCPower(oppStore.oActiveMon.cPow * 2, scene),
                    addOTPower(oppStore.oActiveMon.tPow * 2, scene),
                    addOXPower(oppStore.oActiveMon.xPow * 2, scene),
                ])
            } else {
                await animateMisfireFailurePopup(scene, who == WHO.PLAYER, isXeff)
            }
        }
    },
    {
        id: "019",
        // Ice Foe x3
        xEffect: async (who, scene, isXeff) => {
            await executeSpecialtyFoeX3(who, scene, SPECIALTY.ICE, isXeff);
        },
        // Use 〇 and Boost own 〇 Attack Power +400.
        effect: async (who, scene, isXeff) => {
            const playerStore = usePlayerStore();
            const oppStore = useOpponentStore();
            const addPower = 400;

            if (who == WHO.PLAYER) {
                playerStore.setPAttack(ATTACK.C);
                changeAttackChoiceDisplay(who, playerStore.pAttack)
                await addPCPower(addPower, scene)
            } else {
                oppStore.setOAttack(ATTACK.C);
                changeAttackChoiceDisplay(who, oppStore.oAttack)
                await addOCPower(addPower, scene)
            }
        }
    },
    {
        id: "020",
        // 1st Attack
        xEffect: async (who, scene, isXeff) => {
            execute1stAttack(who, scene);
        },
        // Attack first.
        effect: async (who, scene, isXeff) => {
            execute1stAttack(who, scene);
        }
    },
    {
        id: "021",
        // 1st Attack
        xEffect: async (who, scene, isXeff) => {
            execute1stAttack(who, scene);
        },
        // Own HP become 10. Boost own Attack Power +500.
        effect: async (who, scene, isXeff) => {
            const playerStore = usePlayerStore();
            const oppStore = useOpponentStore();
            const addPower = 500;

            if (who == WHO.PLAYER) {
                await addAllPPower(addPower, scene);
                await addPHp(10 - parseInt(playerStore.pActiveMon.hp), scene);
            } else {
                await addAllOPower(addPower, scene);
                await addOHp(10 - parseInt(oppStore.oActiveMon.hp), scene);
            }
        }
    },
    {
        id: "022",
        // None
        xEffect: noneEffect,
        // Discard all own DP Cards in DP Slot, boost own Attack Power +300.
        effect: async (who, scene, isXeff) => {
            const addPower = 300;
            if (who == WHO.PLAYER) {
                await setPlayerDpToOffline(scene, usePlayerStore().pDpCount);
                await addAllPPower(addPower, scene);
            } else {
                await setOppDpToOffline(scene, useOpponentStore().oDpCount);
                await addAllOPower(addPower, scene);
            }
        }
    },
    {
        id: "023",
        // {{button|c}} to 0
        xEffect: async (who, scene, isXeff) => {
            await executeCTo0(who, scene)
        },
        // Own {{button|c}} Attack Power becomes same as own HP.
        effect: async (who, scene, isXeff) => {
            const playerStore = usePlayerStore();
            const oppStore = useOpponentStore();

            if (who == WHO.PLAYER) {
                const addPower = parseInt(playerStore.pActiveMon.hp) - parseInt(playerStore.pActiveMon.cPow);
                await addPCPower(addPower, scene);
            } else {
                const addPower = parseInt(oppStore.oActiveMon.hp) - parseInt(oppStore.oActiveMon.cPow);
                await addOCPower(addPower, scene);
            }
        }
    },
    {
        id: "024",
        // {{button|c}} to 0
        xEffect: async (who, scene, isXeff) => {
            await executeCTo0(who, scene)
        },
        // Boost own Attack Power +200.
        effect: async (who, scene, isXeff) => {
            const addPower = 200;
            if (who == WHO.PLAYER) {
                await addAllPPower(addPower, scene);
            } else {
                await addAllOPower(addPower, scene);
            }
        }
    },
    {
        id: "025",
        // Crash
        xEffect: async (who, scene, isXeff) => {
            await executeCrash(who, scene);
        },
        // If both Levels are C, boost own Attack Power +400.
        effect: async (who, scene, isXeff) => {
            const playerStore = usePlayerStore();
            const oppStore = useOpponentStore();
            const addPower = 400;

            if (playerStore.pActiveMon.level == LEVEL.C && oppStore.oActiveMon.level == LEVEL.C) {
                if (who == WHO.PLAYER) {
                    await addAllPPower(addPower, scene);
                } else {
                    await addAllOPower(addPower, scene);
                }
            } else {
                await animateMisfireFailurePopup(scene, who == WHO.PLAYER, isXeff)
            }
        }
    },
    {
        id: "026",
        // None
        xEffect: noneEffect,
        // Change own Specialty to Fire.
        effect: async (who, scene, isXeff) => {
            await animateBattleStatusPopup(scene, who == WHO.PLAYER, "Change Specialty");
            await animateSpecialtyChange(who);
            // set gradient color
            const colorTopRgb = `vec3(${hexToRgb(COLOR_CODE.FIRE_TOP).join(",")})`;
            const colorBottomRgb = `vec3(${hexToRgb(COLOR_CODE.FIRE_BOTTOM).join(",")})`;
            const fShader = fragmentShader
                .replace("##COLOR_TOP", colorTopRgb)
                .replace("##COLOR_BOTTOM", colorBottomRgb);

            if (who == WHO.PLAYER) {
                const playerStore = usePlayerStore();
                playerStore.pActiveMon.specialty = SPECIALTY.FIRE;
                // Change color
                const card = scene.getObjectByName(`${CARD_NAME.PLAYER}${playerStore.pActiveMon.id}`)
                card.material.fragmentShader = fShader;
                card.material.needsUpdate = true;
            } else {
                const oppStore = useOpponentStore();
                oppStore.oActiveMon.specialty = SPECIALTY.FIRE;
                // Change color
                const card = scene.getObjectByName(`${CARD_NAME.OPP}${oppStore.oActiveMon.id}`)
                card.material.fragmentShader = fShader;
                card.material.needsUpdate = true;
            }
        }
    },
    {
        id: "027",
        // {{button|c}} to 0
        xEffect: async (who, scene, isXeff) => {
            await executeCTo0(who, scene)
        },
        // Boost own {{button|c}} Attack Power +300.
        effect: async (who, scene, isXeff) => {
            const addPower = 300;
            if (who == WHO.PLAYER) {
                await addPCPower(addPower, scene);
            } else {
                await addOCPower(addPower, scene);
            }
        }
    },
    {
        id: "028",
        // Crash
        xEffect: async (who, scene, isXeff) => {
            await executeCrash(who, scene);
        },
        // None
        effect: noneEffect
    },
    {
        id: "029",
        // 1st Attack
        xEffect: async (who, scene, isXeff) => {
            execute1stAttack(who, scene);
        },
        // Boost own Attack Power +200.
        effect: async (who, scene, isXeff) => {
            const addPower = 200;
            if (who == WHO.PLAYER) {
                await addAllPPower(addPower, scene);
            } else {
                await addAllOPower(addPower, scene);
            }
        }
    },
    {
        id: "030",
        // {{button|x}} Counter
        xEffect: async (who, scene, isXeff) => {
            await executeXcounter(who, scene, isXeff);
        },
        // Boost own {{button|t}} Attack Power +300.
        effect: async (who, scene, isXeff) => {
            const addPower = 300;
            if (who == WHO.PLAYER) {
                await addPTPower(addPower, scene);
            } else {
                await addOTPower(addPower, scene);
            }
        }
    },
    {
        id: "031",
        // {{button|c}} Counter
        xEffect: async (who, scene, isXeff) => {
            await executeCcounter(who, scene, isXeff);
        },
        // Boost own {{button|x}} Attack Power +200.
        effect: async (who, scene, isXeff) => {
            const addPower = 200;
            if (who == WHO.PLAYER) {
                await addPXPower(addPower, scene);
            } else {
                await addOXPower(addPower, scene);
            }
        }
    },
    {
        id: "032",
        // Ice Foe x3
        xEffect: async (who, scene, isXeff) => {
            await executeSpecialtyFoeX3(who, scene, SPECIALTY.ICE, isXeff);
        },
        // If opponent's Specialty is Ice, own Attack Power is doubled.
        effect: async (who, scene, isXeff) => {
            const playerStore = usePlayerStore();
            const oppStore = useOpponentStore();

            if (who == WHO.PLAYER && oppStore.oActiveMon.specialty == SPECIALTY.ICE) {
                await Promise([
                    addPCPower(playerStore.pActiveMon.cPow, scene),
                    addPTPower(playerStore.pActiveMon.tPow, scene),
                    addPXPower(playerStore.pActiveMon.xPow, scene),
                ])
            } else if (who == WHO.OPP && playerStore.pActiveMon.specialty == SPECIALTY.ICE) {
                await Promise.all([
                    addOCPower(oppStore.oActiveMon.cPow, scene),
                    addOTPower(oppStore.oActiveMon.tPow, scene),
                    addOXPower(oppStore.oActiveMon.xPow, scene),
                ])
            } else {
                await animateMisfireFailurePopup(scene, who == WHO.PLAYER, isXeff)
            }
        }
    },
    {
        id: "033",
        // None
        xEffect: noneEffect,
        // None
        effect: noneEffect
    },
    {
        id: "034",
        // {{button|c}} to 0"
        xEffect: async (who, scene, isXeff) => {
            await executeCTo0(who, scene)
        },
        // None
        effect: noneEffect
    },
    {
        id: "035",
        // {{button|x}} Counter
        xEffect: async (who, scene, isXeff) => {
            await executeXcounter(who, scene, isXeff);
        },
        // Change own Specialty to Ice. Recover own HP by +100.
        effect: async (who, scene, isXeff) => {
            await animateBattleStatusPopup(scene, who == WHO.PLAYER, "Change Specialty");
            await animateSpecialtyChange(who);
            // set gradient color
            const colorTopRgb = `vec3(${hexToRgb(COLOR_CODE.ICE_TOP).join(",")})`;
            const colorBottomRgb = `vec3(${hexToRgb(COLOR_CODE.ICE_BOTTOM).join(",")})`;
            const fShader = fragmentShader
                .replace("##COLOR_TOP", colorTopRgb)
                .replace("##COLOR_BOTTOM", colorBottomRgb);
            const addHp = 100;

            if (who == WHO.PLAYER) {
                const playerStore = usePlayerStore();
                playerStore.pActiveMon.specialty = SPECIALTY.ICE;
                // Change color
                const card = scene.getObjectByName(`${CARD_NAME.PLAYER}${playerStore.pActiveMon.id}`)
                card.material.fragmentShader = fShader;
                card.material.needsUpdate = true;
                await addPHp(addHp, scene);
            } else {
                const oppStore = useOpponentStore();
                oppStore.oActiveMon.specialty = SPECIALTY.ICE;
                // Change color
                const card = scene.getObjectByName(`${CARD_NAME.OPP}${oppStore.oActiveMon.id}`)
                card.material.fragmentShader = fShader;
                card.material.needsUpdate = true;
                await addOHp(addHp, scene);
            }
        }
    },
    {
        id: "036",
        // Fire Foe x3
        xEffect: async (who, scene, isXeff) => {
            await executeSpecialtyFoeX3(who, scene, SPECIALTY.FIRE, isXeff);
        },
        // If own Specialty is Ice, opponent's Support Effect is voided.
        effect: async (who, scene, isXeff) => {
            const playerStore = usePlayerStore();
            const oppStore = useOpponentStore();

            if (who == WHO.PLAYER && playerStore.pActiveMon.specialty == SPECIALTY.ICE) {
                oppStore.setOSupportVoid();
            } else if (who == WHO.OPP && oppStore.oActiveMon.specialty == SPECIALTY.ICE) {
                playerStore.setPSupportVoid();
            }
            else {
                await animateMisfireFailurePopup(scene, who == WHO.PLAYER, isXeff)
            }
        }
    },
    {
        id: "037",
        // Fire Foe x3
        xEffect: async (who, scene, isXeff) => {
            await executeSpecialtyFoeX3(who, scene, SPECIALTY.FIRE, isXeff);
        },
        // If own Cards in Hand 3 or more, opponent's Attack Power becomes 0.
        effect: async (who, scene, isXeff) => {
            const playerStore = usePlayerStore();
            const oppStore = useOpponentStore();

            if (who == WHO.PLAYER && playerStore.pHandCount >= 3) {
                await Promise.all([
                    executeCTo0(who, scene),
                    executeTTo0(who, scene),
                    executeXTo0(who, scene),
                ])
            } else if (who == WHO.OPP && oppStore.oHandCount >= 3) {
                await Promise.all([
                    executeCTo0(who, scene),
                    executeTTo0(who, scene),
                    executeXTo0(who, scene),
                ])
            }
            else {
                await animateMisfireFailurePopup(scene, who == WHO.PLAYER, isXeff)
            }
        }
    },
    {
        id: "038",
        // {{button|c}} to 0
        xEffect: async (who, scene, isXeff) => {
            await executeCTo0(who, scene)
        },
        // Recover own HP by +200.
        effect: async (who, scene, isXeff) => {
            const addHp = 200;

            if (who == WHO.PLAYER) {
                await addPHp(addHp, scene);
            } else {
                await addOHp(addHp, scene);
            }
        }
    },
    {
        id: "039",
        // {{button|t}} Counter
        xEffect: async (who, scene, isXeff) => {
            await executeTcounter(who, scene, isXeff);
        },
        // Add number of DP Cards in DP Slot x100 to own HP.
        effect: async (who, scene, isXeff) => {
            if (who == WHO.PLAYER) {
                const playerStore = usePlayerStore();
                const addHp = playerStore.pDpCount * 100
                await addPHp(addHp, scene);
            } else {
                const oppStore = useOpponentStore();
                const addHp = oppStore.oDpCount * 100
                await addOHp(addHp, scene);
            }
        }
    },
    {
        id: "040",
        // {{button|c}} to 0
        xEffect: async (who, scene, isXeff) => {
            await executeCTo0(who, scene)
        },
        // If own Specialty is Ice, opponent's Attack Power is halved.
        effect: async (who, scene, isXeff) => {
            const playerStore = usePlayerStore();
            const oppStore = useOpponentStore();

            if (who == WHO.PLAYER && playerStore.pActiveMon.specialty == SPECIALTY.ICE) {
                await Promise.all([
                  executeCToHalved(WHO.OPP),
                  executeTToHalved(WHO.OPP),
                  executeXToHalved(WHO.OPP),
                ])
            } else if (who == WHO.OPP && oppStore.oActiveMon.specialty == SPECIALTY.ICE) {
                await Promise.all([
                    executeCToHalved(WHO.PLAYER),
                    executeTToHalved(WHO.PLAYER),
                    executeXToHalved(WHO.PLAYER),
                ])
            }
            else {
                await animateMisfireFailurePopup(scene, who == WHO.PLAYER, isXeff)
            }
        }
    },
    {
        id: "041",
        // {{button|t}} Counter
        xEffect: async (who, scene, isXeff) => {
            await executeTcounter(who, scene, isXeff);
        },
        // {{button|t}} Counterattack. Attack second.
        effect: async (who, scene, isXeff) => {
            await executeTcounter(who, scene, isXeff);
            if (who == WHO.PLAYER) {
                execute1stAttack(WHO.OPP, scene);
            } else if (who == WHO.OPP) {
                execute1stAttack(WHO.PLAYER, scene);
            }
        }
    },
    {
        id: "042",
        // {{button|c}} Counter
        xEffect: async (who, scene, isXeff) => {
            await executeCcounter(who, scene, isXeff);
        },
        // {{button|c}} Counterattack. Attack second.
        effect: async (who, scene, isXeff) => {
            await executeCcounter(who, scene, isXeff);
            if (who == WHO.PLAYER) {
                execute1stAttack(WHO.OPP, scene);
            } else if (who == WHO.OPP) {
                execute1stAttack(WHO.PLAYER, scene);
            }
        }
    },
    {
        id: "043",
        // Jamming
        xEffect: async (who, scene, isXeff) => {
            if (who == WHO.PLAYER) {
                useOpponentStore().setOSupportVoid();
            } else if (who == WHO.OPP) {
                usePlayerStore().setPSupportVoid();
            }
        },
        // Opponent's Support Effect is voided.
        effect: async (who, scene, isXeff) => {
            if (who == WHO.PLAYER) {
                useOpponentStore().setOSupportVoid();
            } else if (who == WHO.OPP) {
                usePlayerStore().setPSupportVoid();
            }
        },
    },
    {
        id: "044",
        // {{button|c}} to 0
        xEffect: async (who, scene, isXeff) => {
            await executeCTo0(who, scene)
        },
        // Lower opponent's {{button|c}} Attack Power to 0.
        effect: async (who, scene, isXeff) => {
            await executeCTo0(who, scene)
        },
    },
    {
        id: "045",
        // {{button|x}} to 0
        xEffect: async (who, scene, isXeff) => {
            await executeXTo0(who, scene)
        },
        // Lower opponent's {{button|x}} Attack Power to 0.
        effect: async (who, scene, isXeff) => {
            await executeXTo0(who, scene)
        },
    },
    {
        id: "046",
        // {{button|c}} Counter
        xEffect: async (who, scene, isXeff) => {
            await executeCcounter(who, scene, isXeff);
        },
        // Opponent uses {{button|c}}.
        effect: async (who, scene, isXeff) => {
            if (who == WHO.PLAYER) {
                const oppStore = useOpponentStore();
                oppStore.setOAttack(ATTACK.C)
                changeAttackChoiceDisplay(who, oppStore.oAttack)
            } else if (who == WHO.OPP) {
                const playerStore = usePlayerStore();
                playerStore.setPAttack(ATTACK.C)
                changeAttackChoiceDisplay(who, playerStore.pAttack)
            }
        },
    },
    {
        id: "047",
        // Fire Foe x3
        xEffect: async (who, scene, isXeff) => {
            await executeSpecialtyFoeX3(who, scene, SPECIALTY.FIRE, isXeff);
        },
        // If opponent's Specialty is Fire, own Attack Power is tripled.
        effect: async (who, scene, isXeff) => {
            const playerStore = usePlayerStore();
            const oppStore = useOpponentStore();

            if (who == WHO.PLAYER && oppStore.oActiveMon.specialty == SPECIALTY.FIRE) {
                await Promise.all([
                    addPCPower(playerStore.pActiveMon.cPow * 2, scene),
                    addPTPower(playerStore.pActiveMon.tPow * 2, scene),
                    addPXPower(playerStore.pActiveMon.xPow * 2, scene),
                ])
            } else if (who == WHO.OPP && playerStore.pActiveMon.specialty == SPECIALTY.FIRE) {
                await Promise.all([
                    addOCPower(oppStore.oActiveMon.cPow * 2, scene),
                    addOTPower(oppStore.oActiveMon.tPow * 2, scene),
                    addOXPower(oppStore.oActiveMon.xPow * 2, scene),
                ])
            } else {
                await animateMisfireFailurePopup(scene, who == WHO.PLAYER, isXeff)
            }
        }
    },
    {
        id: "048",
        // {{button|x}} to 0
        xEffect: async (who, scene, isXeff) => {
            await executeXTo0(who, scene)
        },
        // If own Attack is not {{button|c}}, recover own HP by +300.
        effect: async (who, scene, isXeff) => {
            const playerStore = usePlayerStore();
            const oppStore = useOpponentStore();
            const addHp = 300;

            if (who == WHO.PLAYER && playerStore.pAttack != ATTACK.C) {
                await addPHp(addHp, scene)
            } else if (who == WHO.OPP && oppStore.oAttack != ATTACK.C) {
                await addOHp(addHp, scene)
            } else {
                await animateMisfireFailurePopup(scene, who == WHO.PLAYER, isXeff)
            }
        }
    },
    {
        id: "049",
        // {{button|t}} to 0
        xEffect: async (who, scene, isXeff) => {
            await executeTTo0(who, scene)
        },
        // Own HP become 700.
        effect: async (who, scene, isXeff) => {
            const playerStore = usePlayerStore();
            const oppStore = useOpponentStore();

            if (who == WHO.PLAYER) {
                await addPHp(700 - parseInt(playerStore.pActiveMon.hp), scene);
            } else {
                await addOHp(700 - parseInt(oppStore.oActiveMon.hp), scene);
            }
        }
    },
    {
        id: "050",
        // {{button|c}} to 0
        xEffect: async (who, scene, isXeff) => {
            await executeCTo0(who, scene)
        },
        // Opponent's Attack Power is halved.
        effect: async (who, scene, isXeff) => {
            const playerStore = usePlayerStore();
            const oppStore = useOpponentStore();

            if (who == WHO.PLAYER) {
                await Promise.all([
                    executeCToHalved(WHO.OPP),
                    executeTToHalved(WHO.OPP),
                    executeXToHalved(WHO.OPP),
                ])
            } else if (who == WHO.OPP) {
                await Promise.all([
                    executeCToHalved(WHO.PLAYER),
                    executeTToHalved(WHO.PLAYER),
                    executeXToHalved(WHO.PLAYER),
                ])
            }
        }
    },
    {
        id: "051",
        // {{button|c}} to 0
        xEffect: async (who, scene, isXeff) => {
            await executeCTo0(who, scene)
        },
        // None
        effect: noneEffect
    },
    {
        id: "052",
        // Fire Foe x3
        xEffect: async (who, scene, isXeff) => {
            await executeSpecialtyFoeX3(who, scene, SPECIALTY.FIRE, isXeff);
        },
        // Recover own HP by +200.
        effect: async (who, scene, isXeff) => {
            const addHp = 200;

            if (who == WHO.PLAYER) {
                await addPHp(addHp, scene);
            } else {
                await addOHp(addHp, scene);
            }
        }
    },
    {
        id: "053",
        // {{button|c}} to 0
        xEffect: async (who, scene, isXeff) => {
            await executeCTo0(who, scene)
        },
        // Change opponent's Specialty to Ice.
        effect: async (who, scene, isXeff) => {
            // set gradient color
            const colorTopRgb = `vec3(${hexToRgb(COLOR_CODE.ICE_TOP).join(",")})`;
            const colorBottomRgb = `vec3(${hexToRgb(COLOR_CODE.ICE_BOTTOM).join(",")})`;
            const fShader = fragmentShader
            .replace("##COLOR_TOP", colorTopRgb)
            .replace("##COLOR_BOTTOM", colorBottomRgb);
            
            if (who == WHO.PLAYER) {
                await animateBattleStatusPopup(scene, false, "Change Specialty");
                await animateSpecialtyChange(WHO.OPP);
                const oppStore = useOpponentStore();
                oppStore.oActiveMon.specialty = SPECIALTY.ICE;
                // Change color
                const card = scene.getObjectByName(`${CARD_NAME.OPP}${oppStore.oActiveMon.id}`)
                card.material.fragmentShader = fShader;
                card.material.needsUpdate = true;
            } else {
                await animateBattleStatusPopup(scene, true, "Change Specialty");
                await animateSpecialtyChange(WHO.PLAYER);
                const playerStore = usePlayerStore();
                playerStore.pActiveMon.specialty = SPECIALTY.ICE;
                // Change color
                const card = scene.getObjectByName(`${CARD_NAME.PLAYER}${playerStore.pActiveMon.id}`)
                card.material.fragmentShader = fShader;
                card.material.needsUpdate = true;
            }
        }
    },
    {
        id: "054",
        // {{button|c}} to 0
        xEffect: async (who, scene, isXeff) => {
            await executeCTo0(who, scene)
        },
        // Lower opponent's {{button|c}} Attack Power to 0.
        effect: async (who, scene, isXeff) => {
            await executeCTo0(who, scene)
        },
    },
    {
        id: "055",
        // None
        xEffect: noneEffect,
        // Recover own HP by +200.
        effect: async (who, scene, isXeff) => {
            const addHp = 200;

            if (who == WHO.PLAYER) {
                await addPHp(addHp, scene);
            } else {
                await addOHp(addHp, scene);
            }
        }
    },
    {
        id: "056",
        // {{button|c}} to 0
        xEffect: async (who, scene, isXeff) => {
            await executeCTo0(who, scene)
        },
        // If opponent used {{button|c}}, change it to {{button|x}}.
        effect: async (who, scene, isXeff) => {
            const playerStore = usePlayerStore();
            const oppStore = useOpponentStore();

            if (who == WHO.PLAYER && oppStore.oAttack == ATTACK.C) {
                oppStore.setOAttack(ATTACK.X)
                changeAttackChoiceDisplay(who, oppStore.oAttack)
            } else if (who == WHO.OPP && playerStore.pAttack == ATTACK.C) {
                playerStore.setPAttack(ATTACK.X)
                changeAttackChoiceDisplay(who, playerStore.pAttack)
            }
        },
    },
    {
        id: "057",
        // Jamming
        xEffect: async (who, scene, isXeff) => {
            if (who == WHO.PLAYER) {
                useOpponentStore().setOSupportVoid();
            } else if (who == WHO.OPP) {
                usePlayerStore().setPSupportVoid();
            }
        },
        // Change own Specialty to Ice.
        effect: async (who, scene, isXeff) => {
            await animateBattleStatusPopup(scene, who == WHO.PLAYER, "Change Specialty");
            await animateSpecialtyChange(who);
            // set gradient color
            const colorTopRgb = `vec3(${hexToRgb(COLOR_CODE.ICE_TOP).join(",")})`;
            const colorBottomRgb = `vec3(${hexToRgb(COLOR_CODE.ICE_BOTTOM).join(",")})`;
            const fShader = fragmentShader
                .replace("##COLOR_TOP", colorTopRgb)
                .replace("##COLOR_BOTTOM", colorBottomRgb);

            if (who == WHO.PLAYER) {
                const playerStore = usePlayerStore();
                playerStore.pActiveMon.specialty = SPECIALTY.FIRE;
                // Change color
                const card = scene.getObjectByName(`${CARD_NAME.PLAYER}${playerStore.pActiveMon.id}`)
                card.material.fragmentShader = fShader;
                card.material.needsUpdate = true;
            } else {
                const oppStore = useOpponentStore();
                oppStore.oActiveMon.specialty = SPECIALTY.FIRE;
                // Change color
                const card = scene.getObjectByName(`${CARD_NAME.OPP}${oppStore.oActiveMon.id}`)
                card.material.fragmentShader = fShader;
                card.material.needsUpdate = true;
            }
        }
    },
    {
        id: "058",
        // Fire Foe x3
        xEffect: async (who, scene, isXeff) => {
            await executeSpecialtyFoeX3(who, scene, SPECIALTY.FIRE, isXeff);
        },
        // If opponent's Specialty is fire, own Attack Power is tripled.
        effect: async (who, scene, isXeff) => {
            const playerStore = usePlayerStore();
            const oppStore = useOpponentStore();

            if (who == WHO.PLAYER && oppStore.oActiveMon.specialty == SPECIALTY.FIRE) {
                await Promise.all([
                    addPCPower(playerStore.pActiveMon.cPow * 2, scene),
                    addPTPower(playerStore.pActiveMon.tPow * 2, scene),
                    addPXPower(playerStore.pActiveMon.xPow * 2, scene),
                ]) 
            } else if (who == WHO.OPP && playerStore.pActiveMon.specialty == SPECIALTY.FIRE) {
                await Promise.all([
                    addOCPower(oppStore.oActiveMon.cPow * 2, scene),
                    addOTPower(oppStore.oActiveMon.tPow * 2, scene),
                    addOXPower(oppStore.oActiveMon.xPow * 2, scene),
                ])
            } else {
                await animateMisfireFailurePopup(scene, who == WHO.PLAYER, isXeff)
            }
        }
    },
    {
        id: "059",
        // {{button|c}} Counter
        xEffect: async (who, scene, isXeff) => {
            await executeCcounter(who, scene, isXeff);
        },
        // None
        effect: noneEffect
    },
    {
        id: "060",
        // {{button|x}} Counter
        xEffect: async (who, scene, isXeff) => {
            await executeXcounter(who, scene, isXeff);
        },
        // None
        effect: noneEffect
    },
    {
        id: "061",
        // {{button|t}} to 0
        xEffect: async (who, scene, isXeff) => {
            await executeTTo0(who, scene)
        },
        // Lower opponent's {{button|t}} Attack Power to 0.
        effect: async (who, scene, isXeff) => {
            await executeTTo0(who, scene)
        },
    },
    {
        id: "062",
        // {{button|c}} to 0
        xEffect: async (who, scene, isXeff) => {
            await executeCTo0(who, scene)
        },
        // None
        effect: noneEffect
    },
    {
        id: "063",
        // {{button|c}} to 0
        xEffect: async (who, scene, isXeff) => {
            await executeCTo0(who, scene)
        },
        // If own HP are less then 200, reduce opponent's Attack Power to 0.
        effect: async (who, scene, isXeff) => {
            const playerStore = usePlayerStore();
            const oppStore = useOpponentStore();

            if (who == WHO.PLAYER && playerStore.pActiveMon.hp < 200) {
                await Promise.all([
                    executeCTo0(who, scene),
                    executeTTo0(who, scene),
                    executeXTo0(who, scene),
                ])
            } else if (who == WHO.OPP && oppStore.oActiveMon.hp < 200) {
                await Promise.all([
                    executeCTo0(who, scene),
                    executeTTo0(who, scene),
                    executeXTo0(who, scene),
                ])
            }
            else {
                await animateMisfireFailurePopup(scene, who == WHO.PLAYER, isXeff)
            }
        }
    },
    {
        id: "064",
        // {{button|c}} to 0
        xEffect: async (who, scene, isXeff) => {
            await executeCTo0(who, scene)
        },
        // If opponent's Specialty is Fire, reduce opponent's Attack Power to 0.
        effect: async (who, scene, isXeff) => {
            const playerStore = usePlayerStore();
            const oppStore = useOpponentStore();

            if (who == WHO.PLAYER && oppStore.oActiveMon.specialty == SPECIALTY.FIRE) {
                await Promise.all([
                    executeCTo0(who, scene),
                    executeTTo0(who, scene),
                    executeXTo0(who, scene),
                ])
            } else if (who == WHO.OPP && playerStore.pActiveMon.specialty == SPECIALTY.FIRE) {
                await Promise.all([
                    executeCTo0(who, scene),
                    executeTTo0(who, scene),
                    executeXTo0(who, scene),
                ])
            } else {
                await animateMisfireFailurePopup(scene, who == WHO.PLAYER, isXeff)
            }
        }
    },
    {
        id: "065",
        // Fire Foe x3
        xEffect: async (who, scene, isXeff) => {
            await executeSpecialtyFoeX3(who, scene, SPECIALTY.FIRE, isXeff);
        },
        // If opponent's Specialty is Fire, own Attack Power is doubled.
        effect: async (who, scene, isXeff) => {
            const playerStore = usePlayerStore();
            const oppStore = useOpponentStore();

            if (who == WHO.PLAYER && oppStore.oActiveMon.specialty == SPECIALTY.FIRE) {
                await Promise.all([
                    addPCPower(playerStore.pActiveMon.cPow, scene),
                    addPTPower(playerStore.pActiveMon.tPow, scene),
                    addPXPower(playerStore.pActiveMon.xPow, scene),    
                ])
            } else if (who == WHO.OPP && playerStore.pActiveMon.specialty == SPECIALTY.FIRE) {
                await Promise.all([
                    addOCPower(oppStore.oActiveMon.cPow, scene),
                    addOTPower(oppStore.oActiveMon.tPow, scene),
                    addOXPower(oppStore.oActiveMon.xPow, scene),
                ])
            } else {
                await animateMisfireFailurePopup(scene, who == WHO.PLAYER, isXeff)
            }
        }
    },
    {
        id: "066",
        // {{button|c}} to 0
        xEffect: async (who, scene, isXeff) => {
            await executeCTo0(who, scene)
        },
        // Reduce opponent's {{button|c}} Attack Power to 0.
        effect: async (who, scene, isXeff) => {
            await executeCTo0(who, scene)
        }
    },
    {
        id: "067",
        // {{button|x}} to 0
        xEffect: async (who, scene, isXeff) => {
            await executeXTo0(who, scene)
        },
        // Reduce opponent's {{button|x}} Attack Power to 0.
        effect: async (who, scene, isXeff) => {
            await executeXTo0(who, scene)
        }
    },
    {
        id: "068",
        xEffect: noneEffect,
        // None
        effect: noneEffect
    },
    {
        id: "069",
        // {{button|c}} to 0
        xEffect: async (who, scene, isXeff) => {
            await executeCTo0(who, scene)
        },
        // Opponent uses O.
        effect: async (who, scene, isXeff) => {
            if (who == WHO.PLAYER) {
                const oppStore = useOpponentStore();
                oppStore.setOAttack(ATTACK.C)
                changeAttackChoiceDisplay(who, oppStore.oAttack)
            } else if (who == WHO.OPP) {
                const playerStore = usePlayerStore();
                playerStore.setPAttack(ATTACK.C)
                changeAttackChoiceDisplay(who, playerStore.pAttack)
            }
        },
    },
    {
        id: "070",
        // Dark Foe x3
        xEffect: async (who, scene, isXeff) => {
            await executeSpecialtyFoeX3(who, scene, SPECIALTY.DARKNESS, isXeff);
        },
        // If opponent's Specialty is Darkness, own Attack Power is +200 & HP +200.
        effect: async (who, scene, isXeff) => {
            const playerStore = usePlayerStore();
            const oppStore = useOpponentStore();
            const addPower = 200;
            const addHp = 200;

            if (who == WHO.PLAYER && oppStore.oActiveMon.specialty == SPECIALTY.DARKNESS) {
                await Promise.all([
                    addPCPower(addPower, scene),
                    addPTPower(addPower, scene),
                    addPXPower(addPower, scene),
                ])
                await addPHp(addHp, scene)
            } else if (who == WHO.OPP && playerStore.pActiveMon.specialty == SPECIALTY.DARKNESS) {
                await Promise.all([
                    addOCPower(addPower, scene),
                    addOTPower(addPower, scene),
                    addOXPower(addPower, scene),
                ])
                await addOHp(addHp, scene)
            } else {
                await animateMisfireFailurePopup(scene, who == WHO.PLAYER, isXeff)
            }
        }
    },
    {
        id: "071",
        // {{button|x}} to 0
        xEffect: async (who, scene, isXeff) => {
            await executeXTo0(who, scene)
        },
        // {{button|x}} Counterattack. Attack second.
        effect: async (who, scene, isXeff) => {
            await executeXcounter(who, scene, isXeff);
            if (who == WHO.PLAYER) {
                execute1stAttack(WHO.OPP, scene);
            } else if (who == WHO.OPP) {
                execute1stAttack(WHO.PLAYER, scene);
            }
        },
    },
    {
        id: "072",
        // 1st Attack
        xEffect: async (who, scene, isXeff) => {
            execute1stAttack(who, scene);
        },
        // If own level is U, own Attack Power is doubled.
        effect: async (who, scene, isXeff) => {
            const playerStore = usePlayerStore();
            const oppStore = useOpponentStore();

            if (who == WHO.PLAYER && playerStore.pActiveMon.level == LEVEL.U) {
                await Promise.all([
                    addPCPower(playerStore.pActiveMon.cPow, scene),
                    addPTPower(playerStore.pActiveMon.tPow, scene),
                    addPXPower(playerStore.pActiveMon.xPow, scene),
                ])
            } else if (who == WHO.OPP && oppStore.oActiveMon.level == LEVEL.U) {
                await Promise.all([
                    addOCPower(oppStore.oActiveMon.cPow, scene),
                    addOTPower(oppStore.oActiveMon.tPow, scene),
                    addOXPower(oppStore.oActiveMon.xPow, scene),
                ])
            } else {
                await animateMisfireFailurePopup(scene, who == WHO.PLAYER, isXeff)
            }
        }
    },
    {
        id: "073",
        // Eat-up HP
        xEffect: async (who, scene, isXeff) => {
            const playerStore = usePlayerStore();
            const oppStore = useOpponentStore();
            if (who == WHO.PLAYER) {
                playerStore.setEatUpHp(true);
                await animateBattleStatusPopup(scene, true, "Eat-Up HP");
            } else if (who == WHO.OPP) {
                oppStore.setEatUpHp(true);
                await animateBattleStatusPopup(scene, false, "Eat-Up HP");
            }
        },
        // If opponent's HP are 1000+, own attack becomes \"Eat-up HP.\"
        effect: async (who, scene, isXeff) => {
            const playerStore = usePlayerStore();
            const oppStore = useOpponentStore();

            if (who == WHO.PLAYER && oppStore.oActiveMon.hp > 1000) {
                playerStore.setEatUpHp(true);
                await animateBattleStatusPopup(scene, true, "Eat-Up HP");
            } else if (who == WHO.OPP && playerStore.pActiveMon.hp > 1000) {
                oppStore.setEatUpHp(true);
                await animateBattleStatusPopup(scene, false, "Eat-Up HP");
            }
            else {
                await animateMisfireFailurePopup(scene, who == WHO.PLAYER, isXeff)
            }
        }
    },
    {
        id: "074",
        // 1st Attack
        xEffect: async (who, scene, isXeff) => {
            execute1stAttack(who, scene);
        },
        // None
        effect: noneEffect
    },
    {
        id: "075",
        // Darkness Foe x3
        xEffect: async (who, scene, isXeff) => {
            await executeSpecialtyFoeX3(who, scene, SPECIALTY.DARKNESS, isXeff);
        },
        // If opponent's Specialty is Darkness, boost own Attack Power +500.
        effect: async (who, scene, isXeff) => {
            const playerStore = usePlayerStore();
            const oppStore = useOpponentStore();
            const addPower = 500;

            if (who == WHO.PLAYER && oppStore.oActiveMon.specialty == SPECIALTY.DARKNESS) {
                await addAllPPower(addPower, scene);
            } else if (who == WHO.OPP && playerStore.pActiveMon.specialty == SPECIALTY.DARKNESS) {
                await addAllOPower(addPower, scene);
            } else {
                await animateMisfireFailurePopup(scene, who == WHO.PLAYER, isXeff)
            }
        }
    },
    {
        id: "076",
        // {{button|t}} to 0
        xEffect: async (who, scene, isXeff) => {
            await executeTTo0(who, scene)
        },
        // If opponent's Specialty is not Nature, attack second.
        effect: async (who, scene, isXeff) => {
            const playerStore = usePlayerStore();
            const oppStore = useOpponentStore();

            if (who == WHO.PLAYER && oppStore.oActiveMon.specialty != SPECIALTY.NATURE) {
                execute1stAttack(WHO.OPP, scene);
            } else if (who == WHO.OPP && playerStore.pActiveMon.specialty != SPECIALTY.NATURE) {
                execute1stAttack(WHO.PLAYER, scene);
            } else {
                await animateMisfireFailurePopup(scene, who == WHO.PLAYER, isXeff)
            }
        }
    },
    {
        id: "077",
        // Darkness Foe x3
        xEffect: async (who, scene, isXeff) => {
            await executeSpecialtyFoeX3(who, scene, SPECIALTY.DARKNESS, isXeff);
        },
        // If opponent's Specialty is Darkness, recover own HP by +500.
        effect: async (who, scene, isXeff) => {
            const playerStore = usePlayerStore();
            const oppStore = useOpponentStore();
            const addHp = 500;

            if (who == WHO.PLAYER && oppStore.oActiveMon.specialty == SPECIALTY.DARKNESS) {
                await addPHp(addHp, scene)
            } else if (who == WHO.OPP && playerStore.pActiveMon.specialty == SPECIALTY.DARKNESS) {
                await addOHp(addHp, scene)
            } else {
                await animateMisfireFailurePopup(scene, who == WHO.PLAYER, isXeff)
            }
        }
    },
    {
        id: "078",
        // Eat-up HP
        xEffect: async (who, scene, isXeff) => {
            const playerStore = usePlayerStore();
            const oppStore = useOpponentStore();
            if (who == WHO.PLAYER) {
                playerStore.setEatUpHp(true);
                await animateBattleStatusPopup(scene, true, "Eat-Up HP");
            } else if (who == WHO.OPP) {
                oppStore.setEatUpHp(true);
                await animateBattleStatusPopup(scene, false, "Eat-Up HP");
            }
        },
        // Recover own HP by +200.
        effect: async (who, scene, isXeff) => {
            const addHp = 200;

            if (who == WHO.PLAYER) {
                await addPHp(addHp, scene);
            } else {
                await addOHp(addHp, scene);
            }
        }
    },
    {
        id: "079",
        // {{button|c}} Counter
        xEffect: async (who, scene, isXeff) => {
            await executeCcounter(who, scene, isXeff);
        },
        // None
        effect: noneEffect
    },
    {
        id: "080",
        // None
        xEffect: noneEffect,
        // None
        effect: noneEffect
    },
    {
        id: "081",
        // 1st Attack
        xEffect: async (who, scene, isXeff) => {
            execute1stAttack(who, scene);
        },
        // If own level is U, own Attack Power is doubled.
        effect: async (who, scene, isXeff) => {
            const playerStore = usePlayerStore();
            const oppStore = useOpponentStore();

            if (who == WHO.PLAYER && playerStore.pActiveMon.level == LEVEL.U) {
                await Promise.all([
                    addPCPower(playerStore.pActiveMon.cPow, scene),
                    addPTPower(playerStore.pActiveMon.tPow, scene),
                    addPXPower(playerStore.pActiveMon.xPow, scene),
                ])
            } else if (who == WHO.OPP && oppStore.oActiveMon.level == LEVEL.U) {
                await Promise.all([
                    addOCPower(oppStore.oActiveMon.cPow, scene),
                    addOTPower(oppStore.oActiveMon.tPow, scene),
                    addOXPower(oppStore.oActiveMon.xPow, scene),
                ])
            } else {
                await animateMisfireFailurePopup(scene, who == WHO.PLAYER, isXeff)
            }
        }
    },
    {
        id: "082",
        // Darkness Foe x3
        xEffect: async (who, scene, isXeff) => {
            await executeSpecialtyFoeX3(who, scene, SPECIALTY.DARKNESS, isXeff);
        },
        // If opponent's Specialty is Darkness, own Attack Power is tripled.
        effect: async (who, scene, isXeff) => {
            const playerStore = usePlayerStore();
            const oppStore = useOpponentStore();

            if (who == WHO.PLAYER && oppStore.oActiveMon.specialty == SPECIALTY.DARKNESS) {
                await Promise.all([
                    addPCPower(playerStore.pActiveMon.cPow * 2, scene),
                    addPTPower(playerStore.pActiveMon.tPow * 2, scene),
                    addPXPower(playerStore.pActiveMon.xPow * 2, scene),
                ])
            } else if (who == WHO.OPP && playerStore.pActiveMon.specialty == SPECIALTY.DARKNESS) {
                await Promise.all([
                    addOCPower(oppStore.oActiveMon.cPow * 2, scene),
                    addOTPower(oppStore.oActiveMon.tPow * 2, scene),
                    addOXPower(oppStore.oActiveMon.xPow * 2, scene),
                ])
            } else {
                await animateMisfireFailurePopup(scene, who == WHO.PLAYER, isXeff)
            }
        }
    },
    {
        id: "083",
        // {{button|x}} to 0
        xEffect: async (who, scene, isXeff) => {
            await executeXTo0(who, scene)
        },
        // If own HP are less than 500, boost own Attack Power +300.
        effect: async (who, scene, isXeff) => {
            const playerStore = usePlayerStore();
            const oppStore = useOpponentStore();
            const addPower = 300;

            if (who == WHO.PLAYER && playerStore.pActiveMon.hp < 500) {
                await addAllPPower(addPower, scene);
            } else if (who == WHO.OPP && oppStore.oActiveMon.hp < 500) {
                await addAllOPower(addPower, scene);
            }
            else {
                await animateMisfireFailurePopup(scene, who == WHO.PLAYER, isXeff)
            }
        }
    },
    {
        id: "084",
        // {{button|t}} to 0
        xEffect: async (who, scene, isXeff) => {
            await executeTTo0(who, scene)
        },
        // Boost own Attack Power +100.
        effect: async (who, scene, isXeff) => {
            const addPower = 100;
            if (who == WHO.PLAYER) {
                await addAllPPower(addPower, scene);
            } else if (who == WHO.OPP) {
                await addAllOPower(addPower, scene);
            }
        }
    },
    {
        id: "085",
        // None
        xEffect: noneEffect,
        // If own level is lower, boost own Attack Power +500.
        effect: async (who, scene, isXeff) => {
            const addPower = 500;

            if (who == WHO.PLAYER && isOwnLevelLower(who)) {
                await addAllPPower(addPower, scene);
            } else if (who == WHO.OPP && isOwnLevelLower(who)) {
                await addAllOPower(addPower, scene);
            }
        }
    },
    {
        id: "086",
        // {{button|c}} Counter
        xEffect: async (who, scene, isXeff) => {
            await executeCcounter(who, scene, isXeff);
        },
        // None
        effect: noneEffect
    },
    {
        id: "087",
        // {{button|c}} to 0
        xEffect: async (who, scene, isXeff) => {
            await executeCTo0(who, scene)
        },
        // Recover own HP by +100. Boost own Attack Power by +100. 
        effect: async (who, scene, isXeff) => {
            const addPower = 100;
            const addHp = 100;

            if (who == WHO.PLAYER) {
                await addPHp(addHp, scene);
                await addAllPPower(addPower, scene);
            } else {
                await addOHp(addHp, scene);
                await addAllOPower(addPower, scene);
            }
        }
    },
    {
        id: "088",
        // {{button|c}} to 0
        xEffect: async (who, scene, isXeff) => {
            await executeCTo0(who, scene)
        },
        // If opponent's Specialty is Darkness, lower opponent's Attack Power to 0.
        effect: async (who, scene, isXeff) => {
            const playerStore = usePlayerStore();
            const oppStore = useOpponentStore();

            if (who == WHO.PLAYER && oppStore.oActiveMon.specialty == SPECIALTY.DARKNESS) {
                await Promise.all([
                    executeCTo0(who, scene),
                    executeTTo0(who, scene),
                    executeXTo0(who, scene),
                ])
            } else if (who == WHO.OPP && playerStore.pActiveMon.specialty == SPECIALTY.DARKNESS) {
                await Promise.all([
                    executeCTo0(who, scene),
                    executeTTo0(who, scene),
                    executeXTo0(who, scene),
                ])
            } else {
                await animateMisfireFailurePopup(scene, who == WHO.PLAYER, isXeff)
            }
        }
    },
    {
        id: "089",
        // 1st Attack
        xEffect: async (who, scene, isXeff) => {
            execute1stAttack(who, scene);
        },
        // Attack first
        effect: async (who, scene, isXeff) => {
            execute1stAttack(who, scene);
        },
    },
    {
        id: "090",
        // {{button|t}} Counter
        xEffect: async (who, scene, isXeff) => {
            await executeTcounter(who, scene, isXeff);
        },
        // None
        effect: noneEffect
    },
    {
        id: "091",
        // None
        xEffect: noneEffect,
        // Boost own Attack Power +200.
        effect: async (who, scene, isXeff) => {
            const addPower = 200;
            if (who == WHO.PLAYER) {
                await addAllPPower(addPower, scene);
            } else {
                await addAllOPower(addPower, scene);
            }
        }
    },
    {
        id: "092",
        // Jamming
        xEffect: async (who, scene, isXeff) => {
            if (who == WHO.PLAYER) {
                useOpponentStore().setOSupportVoid();
            } else if (who == WHO.OPP) {
                usePlayerStore().setPSupportVoid();
            }
        },
        // Changes opponent's Specialty to Nature.
        effect: async (who, scene, isXeff) => {
            // set gradient color
            const colorTopRgb = `vec3(${hexToRgb(COLOR_CODE.NATURE_TOP).join(",")})`;
            const colorBottomRgb = `vec3(${hexToRgb(COLOR_CODE.NATURE_BOTTOM).join(",")})`;
            const fShader = fragmentShader
                .replace("##COLOR_TOP", colorTopRgb)
                .replace("##COLOR_BOTTOM", colorBottomRgb);

            if (who == WHO.PLAYER) {
                await animateBattleStatusPopup(scene, false, "Change Specialty");
                await animateSpecialtyChange(WHO.OPP);
                const oppStore = useOpponentStore();
                oppStore.oActiveMon.specialty = SPECIALTY.NATURE;
                // Change color
                const card = scene.getObjectByName(`${CARD_NAME.OPP}${oppStore.oActiveMon.id}`)
                card.material.fragmentShader = fShader;
                card.material.needsUpdate = true;
            } else {
                await animateBattleStatusPopup(scene, true, "Change Specialty");
                await animateSpecialtyChange(WHO.PLAYER);
                const playerStore = usePlayerStore();
                playerStore.pActiveMon.specialty = SPECIALTY.NATURE;
                // Change color
                const card = scene.getObjectByName(`${CARD_NAME.PLAYER}${playerStore.pActiveMon.id}`)
                card.material.fragmentShader = fShader;
                card.material.needsUpdate = true;
            }
        }
    },
    {
        id: "093",
        // {{button|c}} to 0
        xEffect: async (who, scene, isXeff) => {
            await executeCTo0(who, scene)
        },
        // Lower opponent's Attack Power to 0. Opponent's HP are doubled.
        effect: async (who, scene, isXeff) => {

            if (who == WHO.PLAYER) {
                const oppStore = useOpponentStore();
                await Promise.all([
                    executeCTo0(who, scene),
                    executeTTo0(who, scene),
                    executeXTo0(who, scene),
                ])
                await addOHp(oppStore.oActiveMon.hp, scene)
            } else if (who == WHO.OPP) {
                const playerStore = usePlayerStore();
                await Promise.all([
                    executeCTo0(who, scene),
                    executeTTo0(who, scene),
                    executeXTo0(who, scene),
                ])
                await addPHp(playerStore.pActiveMon.hp, scene)
            }
        }
    },
    {
        id: "094",
        // 1st Attack
        xEffect: async (who, scene, isXeff) => {
            execute1stAttack(who, scene);
        },
        // None
        effect: noneEffect,
    },
    {
        id: "095",
        // None
        xEffect: noneEffect,
        // If own Level is R, boost own Attack Power +300.
        effect: async (who, scene, isXeff) => {
            const playerStore = usePlayerStore();
            const oppStore = useOpponentStore();
            const addPower = 300;

            if (who == WHO.PLAYER && playerStore.pActiveMon.level == LEVEL.R) {
                await addAllPPower(addPower, scene);
            } else if (who == WHO.OPP && oppStore.oActiveMon.level == LEVEL.R) {
                await addAllOPower(addPower, scene);
            } else {
                await animateMisfireFailurePopup(scene, who == WHO.PLAYER, isXeff)
            }
        }
    },
    {
        id: "096",
        // {{button|c}} to 0
        xEffect: async (who, scene, isXeff) => {
            await executeCTo0(who, scene)
        },
        // If opponent's Specialty is Darkness, lower opponent's Attack Power -200.
        effect: async (who, scene, isXeff) => {
            const playerStore = usePlayerStore();
            const oppStore = useOpponentStore();
            const reduceAttack = -200;

            if (who == WHO.PLAYER && oppStore.oActiveMon.specialty == SPECIALTY.DARKNESS) {
                await addAllOPower(reduceAttack, scene);
            } else if (who == WHO.OPP && playerStore.pActiveMon.specialty == SPECIALTY.DARKNESS) {
                await addAllPPower(reduceAttack, scene);
            } else {
                await animateMisfireFailurePopup(scene, who == WHO.PLAYER, isXeff)
            }
        }
    },
    {
        id: "097",
        // {{button|c}} to 0
        xEffect: async (who, scene, isXeff) => {
            await executeCTo0(who, scene)
        },
        // None
        effect: noneEffect,
    },
    {
        id: "098",
        // Eat-up HP
        xEffect: async (who, scene, isXeff) => {
            const playerStore = usePlayerStore();
            const oppStore = useOpponentStore();
            if (who == WHO.PLAYER) {
                playerStore.setEatUpHp(true);
                await animateBattleStatusPopup(scene, true, "Eat-Up HP");
            } else if (who == WHO.OPP) {
                oppStore.setEatUpHp(true);
                await animateBattleStatusPopup(scene, false, "Eat-Up HP");
            }
        },
        // None
        effect: noneEffect,
    },
    {
        id: "099",
        // {{button|t}} Counter
        xEffect: async (who, scene, isXeff) => {
            await executeTcounter(who, scene, isXeff);
        },
        // Changes own Specialty to Nature. Draw 1 Card.
        effect: async (who, scene, isXeff) => {
            await animateBattleStatusPopup(scene, who == WHO.PLAYER, "Change Specialty");
            await animateSpecialtyChange(who);
            // set gradient color
            const colorTopRgb = `vec3(${hexToRgb(COLOR_CODE.NATURE_TOP).join(",")})`;
            const colorBottomRgb = `vec3(${hexToRgb(COLOR_CODE.NATURE_BOTTOM).join(",")})`;
            const fShader = fragmentShader
                .replace("##COLOR_TOP", colorTopRgb)
                .replace("##COLOR_BOTTOM", colorBottomRgb);
            const drawCount = 1;

            // Change Specialty to Nature
            if (who == WHO.PLAYER) {
                const playerStore = usePlayerStore();
                playerStore.pActiveMon.specialty = SPECIALTY.NATURE;
                const card = scene.getObjectByName(`${CARD_NAME.PLAYER}${playerStore.pActiveMon.id}`)
                card.material.fragmentShader = fShader;
                card.material.needsUpdate = true;
            } else {
                const oppStore = useOpponentStore();
                oppStore.oActiveMon.specialty = SPECIALTY.NATURE;
                const card = scene.getObjectByName(`${CARD_NAME.OPP}${oppStore.oActiveMon.id}`)
                card.material.fragmentShader = fShader;
                card.material.needsUpdate = true;
            }

            // Draw 1 card
            await drawDeckCardToHand(who, scene, drawCount);
        }
    },
    {
        id: "100",
        // Ice Foe x3
        xEffect: async (who, scene, isXeff) => {
            await executeSpecialtyFoeX3(who, scene, SPECIALTY.ICE, isXeff);
        },
        // If opponent's Specialty is Ice, boost own Attack Power +300.
        effect: async (who, scene, isXeff) => {
            const playerStore = usePlayerStore();
            const oppStore = useOpponentStore();
            const addPower = 300;

            if (who == WHO.PLAYER && oppStore.oActiveMon.specialty == SPECIALTY.ICE) {
                await addAllPPower(addPower, scene);
            } else if (who == WHO.OPP && playerStore.pActiveMon.specialty == SPECIALTY.ICE) {
                await addAllOPower(addPower, scene);
            } else {
                await animateMisfireFailurePopup(scene, who == WHO.PLAYER, isXeff)
            }
        }
    },
    {
        id: "101",
        // {{button|x}} to 0
        xEffect: async (who, scene, isXeff) => {
            await executeXTo0(who, scene)
        },
        // If own HP are more than opponent's HP, own Attack Power is doubled.
        effect: async (who, scene, isXeff) => {
            const playerStore = usePlayerStore();
            const oppStore = useOpponentStore();

            if (who == WHO.PLAYER && playerStore.pActiveMon.hp > oppStore.oActiveMon.hp) {
                await Promise.all([
                    addPCPower(playerStore.pActiveMon.cPow, scene),
                    addPTPower(playerStore.pActiveMon.tPow, scene),
                    addPXPower(playerStore.pActiveMon.xPow, scene),
                ])
            } else if (who == WHO.OPP && oppStore.oActiveMon.hp > playerStore.pActiveMon.hp) {
                await Promise.all([
                    addOCPower(oppStore.oActiveMon.cPow, scene),
                    addOTPower(oppStore.oActiveMon.tPow, scene),
                    addOXPower(oppStore.oActiveMon.xPow, scene),
                ])
            }
            else {
                await animateMisfireFailurePopup(scene, who == WHO.PLAYER, isXeff)
            }
        }
    },
    {
        id: "102",
        // Jamming
        xEffect: async (who, scene, isXeff) => {
            if (who == WHO.PLAYER) {
                useOpponentStore().setOSupportVoid();
            } else if (who == WHO.OPP) {
                usePlayerStore().setPSupportVoid();
            }
        },
        // Lower both Attack Powers -200.
        effect: async (who, scene, isXeff) => {
            const addPower = -200;

            await Promise.all([
                addPCPower(addPower, scene),
                addPTPower(addPower, scene),
                addPXPower(addPower, scene),
            ])
            await Promise.all([
                addOCPower(addPower, scene),
                addOTPower(addPower, scene),
                addOXPower(addPower, scene),
            ])
        }
    },
    {
        id: "103",
        // Crash
        xEffect: async (who, scene, isXeff) => {
            await executeCrash(who, scene);
        },
        // Own HP are halved. Change own Specialty to Darkness.
        effect: async (who, scene, isXeff) => {
            await animateBattleStatusPopup(scene, who == WHO.PLAYER, "Change Specialty");
            await animateSpecialtyChange(who);
            // set gradient color
            const colorTopRgb = `vec3(${hexToRgb(COLOR_CODE.DARKNESS_TOP).join(",")})`;
            const colorBottomRgb = `vec3(${hexToRgb(COLOR_CODE.DARKNESS_BOTTOM).join(",")})`;
            const fShader = fragmentShader
                .replace("##COLOR_TOP", colorTopRgb)
                .replace("##COLOR_BOTTOM", colorBottomRgb);

            if (who == WHO.PLAYER) {
                const playerStore = usePlayerStore();
                await addPHp(Math.round(parseInt(-playerStore.pActiveMon.hp) / 2), scene);
 
                playerStore.pActiveMon.specialty = SPECIALTY.DARKNESS;
                // Change color
                const card = scene.getObjectByName(`${CARD_NAME.PLAYER}${playerStore.pActiveMon.id}`)
                card.material.fragmentShader = fShader;
                card.material.needsUpdate = true;
            } else {
                const oppStore = useOpponentStore();
                await addOHp(Math.round(parseInt(-oppStore.oActiveMon.hp) / 2), scene);

                oppStore.oActiveMon.specialty = SPECIALTY.DARKNESS;
                // Change color
                const card = scene.getObjectByName(`${CARD_NAME.OPP}${oppStore.oActiveMon.id}`)
                card.material.fragmentShader = fShader;
                card.material.needsUpdate = true;
            }
        }
    },
    {
        id: "104",
        // None
        xEffect: noneEffect,
        // Discard 7 Cards from own Online Deck. Opponent's HP are halved.
        effect: async (who, scene, isXeff) => {
            // discard 7 cards
            const discardCount = 7;
            await setDeckCardToOffline(who, scene, discardCount);

            // halve HP
            if (who == WHO.PLAYER) {
                const oppStore = useOpponentStore();
                await addOHp(Math.round(parseInt(-oppStore.oActiveMon.hp) / 2), scene);
            } else {
                const playerStore = usePlayerStore();
                await addPHp(Math.round(parseInt(-playerStore.pActiveMon.hp) / 2), scene);
            }
        }
    },
    {
        id: "105",
        // Own HP become 10. Changes opponent's Specialty to Darkness.
        effect: async (who, scene, isXeff) => {
            const playerStore = usePlayerStore();
            const oppStore = useOpponentStore();

            // set gradient color
            const colorTopRgb = `vec3(${hexToRgb(COLOR_CODE.DARKNESS_TOP).join(",")})`;
            const colorBottomRgb = `vec3(${hexToRgb(COLOR_CODE.DARKNESS_BOTTOM).join(",")})`;
            const fShader = fragmentShader
                .replace("##COLOR_TOP", colorTopRgb)
                .replace("##COLOR_BOTTOM", colorBottomRgb);

            if (who == WHO.PLAYER) {
                await addPHp(10 - parseInt(playerStore.pActiveMon.hp), scene);

                await animateBattleStatusPopup(scene, false, "Change Specialty");
                await animateSpecialtyChange(WHO.OPP);
                oppStore.oActiveMon.specialty = SPECIALTY.DARKNESS;
                // Change color
                const card = scene.getObjectByName(`${CARD_NAME.OPP}${oppStore.oActiveMon.id}`)
                card.material.fragmentShader = fShader;
                card.material.needsUpdate = true;
            } else {
                await addOHp(10 - parseInt(oppStore.oActiveMon.hp), scene);

                await animateBattleStatusPopup(scene, true, "Change Specialty");
                await animateSpecialtyChange(WHO.PLAYER);
                playerStore.pActiveMon.specialty = SPECIALTY.DARKNESS;
                // Change color
                const card = scene.getObjectByName(`${CARD_NAME.PLAYER}${playerStore.pActiveMon.id}`)
                card.material.fragmentShader = fShader;
                card.material.needsUpdate = true;
            }
        }
    },
    {
        id: "106",
        // Nature Foe x3
        xEffect: async (who, scene, isXeff) => {
            await executeSpecialtyFoeX3(who, scene, SPECIALTY.NATURE, isXeff);
        },
        // None
        effect: noneEffect,
    },
    {
        id: "107",
        // Jamming
        xEffect: async (who, scene, isXeff) => {
            if (who == WHO.PLAYER) {
                useOpponentStore().setOSupportVoid();
            } else if (who == WHO.OPP) {
                usePlayerStore().setPSupportVoid();
            }
        },
        // Both players discard all Cards in Hands.
        effect: async (who, scene, isXeff) => {
            await discardAllHandCards(WHO.PLAYER, scene);
            await discardAllHandCards(WHO.OPP, scene);
        },
    },
    {
        id: "108",
        // Crash
        xEffect: async (who, scene, isXeff) => {
            await executeCrash(who, scene);
        },
        // None
        effect: noneEffect,
    },
    {
        id: "109",
        // Jamming
        xEffect: async (who, scene, isXeff) => {
            if (who == WHO.PLAYER) {
                useOpponentStore().setOSupportVoid();
            } else if (who == WHO.OPP) {
                usePlayerStore().setPSupportVoid();
            }
        },
        // Discard 5 Cards from own Online Deck. Boost own Attack Power +400.
        effect: async (who, scene, isXeff) => {
            // discard 5 cards
            const discardCount = 5;
            await setDeckCardToOffline(who, scene, discardCount);

            // Boost own Attack Power +400
            const addPower = 400;
            if (who == WHO.PLAYER) {
                await addAllPPower(addPower, scene);
            } else {
                await addAllOPower(addPower, scene);
            }
        }
    },
    {
        id: "110",
        // Eat-up HP
        xEffect: async (who, scene, isXeff) => {
            const playerStore = usePlayerStore();
            const oppStore = useOpponentStore();
            if (who == WHO.PLAYER) {
                playerStore.setEatUpHp(true);
                await animateBattleStatusPopup(scene, true, "Eat-Up HP");
            } else if (who == WHO.OPP) {
                oppStore.setEatUpHp(true);
                await animateBattleStatusPopup(scene, false, "Eat-Up HP");
            }
        },
        // Both players boost Attack Power +200.
        effect: async (who, scene, isXeff) => {
            const addPower = 200;
            await addAllPPower(addPower, scene);
            await addAllOPower(addPower, scene);
        }
    },
    {
        id: "111",
        // Eat-up HP
        xEffect: async (who, scene, isXeff) => {
            const playerStore = usePlayerStore();
            const oppStore = useOpponentStore();
            if (who == WHO.PLAYER) {
                playerStore.setEatUpHp(true);
                await animateBattleStatusPopup(scene, true, "Eat-Up HP");
            } else if (who == WHO.OPP) {
                oppStore.setEatUpHp(true);
                await animateBattleStatusPopup(scene, false, "Eat-Up HP");
            }
        },
        // Digimon KO'd in battle revives with 500 HP. Battle is still lost.
        effect: async (who, scene, isXeff) => {
            const playerStore = usePlayerStore();
            const oppStore = useOpponentStore();
            const reviveHp = 500;
            if (who == WHO.PLAYER) {
                playerStore.setRevive(true, reviveHp);
                await animateBattleStatusPopup(scene, true, "Revive if KO");
            } else {
                oppStore.setRevive(true, reviveHp);
                await animateBattleStatusPopup(scene, false, "Revive if KO");
            }
        }
    },
    {
        id: "112",
        // 1st Attack
        xEffect: async (who, scene, isXeff) => {
            execute1stAttack(who, scene);
        },
        // Both players' HP are halved.
        effect: async (who, scene, isXeff) => {
            const playerStore = usePlayerStore();
            const oppStore = useOpponentStore();
            await addPHp(Math.round(parseInt(-playerStore.pActiveMon.hp) / 2), scene);
            await addOHp(Math.round(parseInt(-oppStore.oActiveMon.hp) / 2), scene);
        }
    },
    {
        id: "113",
        // Nature Foe x3
        xEffect: async (who, scene, isXeff) => {
            await executeSpecialtyFoeX3(who, scene, SPECIALTY.NATURE, isXeff);
        },
        // If opponent's Specialty is Nature, opponent discards all Cards.
        effect: async (who, scene, isXeff) => {
            const playerStore = usePlayerStore();
            const oppStore = useOpponentStore();

            if (who == WHO.PLAYER && oppStore.oActiveMon.specialty == SPECIALTY.NATURE) {
                await discardAllHandCards(WHO.OPP, scene);
            } else if (who == WHO.OPP && playerStore.pActiveMon.specialty == SPECIALTY.NATURE) {
                await discardAllHandCards(WHO.PLAYER, scene);
            } else {
                await animateMisfireFailurePopup(scene, who == WHO.PLAYER, isXeff)
            }
        }
    },
    {
        id: "114",
        // Eat-up HP
        xEffect: async (who, scene, isXeff) => {
            const playerStore = usePlayerStore();
            const oppStore = useOpponentStore();
            if (who == WHO.PLAYER) {
                playerStore.setEatUpHp(true);
                await animateBattleStatusPopup(scene, true, "Eat-Up HP");
            } else if (who == WHO.OPP) {
                oppStore.setEatUpHp(true);
                await animateBattleStatusPopup(scene, false, "Eat-Up HP");
            }
        },
        // Discard 7 Cards from own Online Deck, own Attack is \"Eat-up HP.\"
        effect: async (who, scene, isXeff) => {
            // discard 7 cards
            const discardCount = 7;
            await setDeckCardToOffline(who, scene, discardCount);

            const playerStore = usePlayerStore();
            const oppStore = useOpponentStore();
            if (who == WHO.PLAYER) {
                playerStore.setEatUpHp(true);
                await animateBattleStatusPopup(scene, true, "Eat-Up HP");
            } else {
                oppStore.setEatUpHp(true);
                await animateBattleStatusPopup(scene, false, "Eat-Up HP");
            }
        }
    },
    {
        id: "115",
        // Jamming
        xEffect: async (who, scene, isXeff) => {
            if (who == WHO.PLAYER) {
                useOpponentStore().setOSupportVoid();
            } else if (who == WHO.OPP) {
                usePlayerStore().setPSupportVoid();
            }
        },
        // Own HP become 10. Own Attack Power is doubled.
        effect: async (who, scene, isXeff) => {
            const playerStore = usePlayerStore();
            if (who == WHO.PLAYER) {
                await addPHp(10 - parseInt(playerStore.pActiveMon.hp), scene);
                await Promise.all([
                    addPCPower(playerStore.pActiveMon.cPow, scene),
                    addPTPower(playerStore.pActiveMon.tPow, scene),
                    addPXPower(playerStore.pActiveMon.xPow, scene),
                ])
            } else {
                await addOHp(10 - parseInt(oppStore.oActiveMon.hp), scene);
                await Promise.all([
                    addOCPower(oppStore.oActiveMon.cPow, scene),
                    addOTPower(oppStore.oActiveMon.tPow, scene),
                    addOXPower(oppStore.oActiveMon.xPow, scene),
                ])
            }
        }
    },
    {
        id: "116",
        // None
        xEffect: noneEffect,
        // Own HP are halved. Boost own Attack Power +400.
        effect: async (who, scene, isXeff) => {
            const addPower = 400;
            if (who == WHO.PLAYER) {
                const playerStore = usePlayerStore();
                await addPHp(Math.round(parseInt(-playerStore.pActiveMon.hp) / 2), scene);
                await addAllPPower(addPower, scene);
            } else {
                const oppStore = useOpponentStore();
                await addOHp(Math.round(parseInt(-oppStore.oActiveMon.hp) / 2), scene);
                await addAllOPower(addPower, scene);
            }
        }
    },
    {
        id: "117",
        // Eat-up HP
        xEffect: async (who, scene, isXeff) => {
            const playerStore = usePlayerStore();
            const oppStore = useOpponentStore();
            if (who == WHO.PLAYER) {
                playerStore.setEatUpHp(true);
                await animateBattleStatusPopup(scene, true, "Eat-Up HP");
            } else if (who == WHO.OPP) {
                oppStore.setEatUpHp(true);
                await animateBattleStatusPopup(scene, false, "Eat-Up HP");
            }
        },
        // Discard 1 DP Card from own DP Slot. Boost own Attack Power +200.
        effect: async (who, scene, isXeff) => {
            const discardCount = 1;
            const addPower = 200;
            if (who == WHO.PLAYER) {
                // discard
                await setPlayerDpToOffline(scene, discardCount);
                // boost attack
                await addAllPPower(addPower, scene);
            } else {
                // discard
                await setOppDpToOffline(scene, discardCount);
                // boost attack
                await addAllOPower(addPower, scene);
            }
        }
    },
    {
        id: "118",
        // Jamming
        xEffect: async (who, scene, isXeff) => {
            if (who == WHO.PLAYER) {
                useOpponentStore().setOSupportVoid();
            } else if (who == WHO.OPP) {
                usePlayerStore().setPSupportVoid();
            }
        },
        // Discard all Cards in own Hand, then draw 2 Cards.
        effect: async (who, scene, isXeff) => {
            const drawCount = 2;
            await discardAllHandCards(who, scene);
            await drawDeckCardToHand(who, scene, drawCount);
        },
    },
    {
        id: "119",
        // None
        xEffect: noneEffect,
        // Own Attack becomes {{button|t}}.
        effect: async (who, scene, isXeff) => {
            if (who == WHO.PLAYER) {
                const playerStore = usePlayerStore();
                playerStore.setPAttack(ATTACK.T)
                changeAttackChoiceDisplay(who, playerStore.pAttack)
            } else if (who == WHO.OPP) {
                const oppStore = useOpponentStore();
                oppStore.setOAttack(ATTACK.T)
                changeAttackChoiceDisplay(who, oppStore.oAttack)
            }
        },
    },
    {
        id: "120",
        // Nature Foe x3
        xEffect: async (who, scene, isXeff) => {
            await executeSpecialtyFoeX3(who, scene, SPECIALTY.NATURE, isXeff);
        },
        // If opponent's Specialty is Nature, own Attack Power is tripled.
        effect: async (who, scene, isXeff) => {
            const playerStore = usePlayerStore();
            const oppStore = useOpponentStore();

            if (who == WHO.PLAYER && oppStore.oActiveMon.specialty == SPECIALTY.NATURE) {
                await Promise.all([
                    addPCPower(playerStore.pActiveMon.cPow * 2, scene),
                    addPTPower(playerStore.pActiveMon.tPow * 2, scene),
                    addPXPower(playerStore.pActiveMon.xPow * 2, scene),
                ])
            } else if (who == WHO.OPP && playerStore.pActiveMon.specialty == SPECIALTY.NATURE) {
                await Promise.all([
                    addOCPower(oppStore.oActiveMon.cPow * 2, scene),
                    addOTPower(oppStore.oActiveMon.tPow * 2, scene),
                    addOXPower(oppStore.oActiveMon.xPow * 2, scene),
                ])
            } else {
                await animateMisfireFailurePopup(scene, who == WHO.PLAYER, isXeff)
            }
        }
    },
    {
        id: "121",
        // None
        xEffect: noneEffect,
        // Own Attack becomes {{button|x}}.
        effect: async (who, scene, isXeff) => {
            if (who == WHO.PLAYER) {
                const playerStore = usePlayerStore();
                playerStore.setPAttack(ATTACK.X)
                changeAttackChoiceDisplay(who, playerStore.pAttack)
            } else if (who == WHO.OPP) {
                const oppStore = useOpponentStore();
                oppStore.setOAttack(ATTACK.X)
                changeAttackChoiceDisplay(who, oppStore.oAttack)
            }
        },
    },
    {
        id: "122",
        // {{button|t}} Counter
        xEffect: async (who, scene, isXeff) => {
            await executeTcounter(who, scene, isXeff);
        },
        // Discard Cards in own DP Slot and multiply Attack Power by number of discards.
        effect: async (who, scene, isXeff) => {
            if (who == WHO.PLAYER) {
                const playerStore = usePlayerStore();
                const discardCount = playerStore.pDpCount;
                if (discardCount > 0) {
                    await setPlayerDpToOffline(scene, discardCount);
                    await Promise.all([
                        addPCPower(playerStore.pActiveMon.cPow * (discardCount - 1), scene),
                        addPTPower(playerStore.pActiveMon.tPow * (discardCount - 1), scene),
                        addPXPower(playerStore.pActiveMon.xPow * (discardCount - 1), scene),
                    ])
                }
            } else {
                const oppStore = useOpponentStore();
                const discardCount = oppStore.oDpCount;
                if (discardCount > 0) {
                    await setOppDpToOffline(scene, discardCount);
                    await Promise.all([
                        addOCPower(oppStore.oActiveMon.cPow * (discardCount - 1), scene),
                        addOTPower(oppStore.oActiveMon.tPow * (discardCount - 1), scene),
                        addOXPower(oppStore.oActiveMon.xPow * (discardCount - 1), scene),
                    ])
                }
            }
        }
    },
    {
        id: "123",
        // Eat-up HP
        xEffect: async (who, scene, isXeff) => {
            const playerStore = usePlayerStore();
            const oppStore = useOpponentStore();
            if (who == WHO.PLAYER) {
                playerStore.setEatUpHp(true);
                await animateBattleStatusPopup(scene, true, "Eat-Up HP");
            } else if (who == WHO.OPP) {
                oppStore.setEatUpHp(true);
                await animateBattleStatusPopup(scene, false, "Eat-Up HP");
            }
        },
        // Change own Specialty to Darkness.
        effect: async (who, scene, isXeff) => {
            await animateBattleStatusPopup(scene, who == WHO.PLAYER, "Change Specialty");
            await animateSpecialtyChange(who);
            // set gradient color
            const colorTopRgb = `vec3(${hexToRgb(COLOR_CODE.DARKNESS_TOP).join(",")})`;
            const colorBottomRgb = `vec3(${hexToRgb(COLOR_CODE.DARKNESS_BOTTOM).join(",")})`;
            const fShader = fragmentShader
                .replace("##COLOR_TOP", colorTopRgb)
                .replace("##COLOR_BOTTOM", colorBottomRgb);

            if (who == WHO.PLAYER) {
                const playerStore = usePlayerStore();

                playerStore.pActiveMon.specialty = SPECIALTY.DARKNESS;
                // Change color
                const card = scene.getObjectByName(`${CARD_NAME.PLAYER}${playerStore.pActiveMon.id}`)
                card.material.fragmentShader = fShader;
                card.material.needsUpdate = true;
            } else {
                const oppStore = useOpponentStore();

                oppStore.oActiveMon.specialty = SPECIALTY.DARKNESS;
                // Change color
                const card = scene.getObjectByName(`${CARD_NAME.OPP}${oppStore.oActiveMon.id}`)
                card.material.fragmentShader = fShader;
                card.material.needsUpdate = true;
            }
        }
    },
    {
        id: "124",
        // Crash
        xEffect: async (who, scene, isXeff) => {
            await executeCrash(who, scene);
        },
        // Own HP are halved. Boost own Attack Power +300.
        effect: async (who, scene, isXeff) => {
            const addPower = 300;

            if (who == WHO.PLAYER) {
                const playerStore = usePlayerStore();
                await addPHp(Math.round(parseInt(-playerStore.pActiveMon.hp) / 2), scene);

                await addAllPPower(addPower, scene);
            } else {
                const oppStore = useOpponentStore();
                await addOHp(Math.round(parseInt(-oppStore.oActiveMon.hp) / 2), scene);

                await addAllOPower(addPower, scene);
            }
        }
    },
    {
        id: "125",
        // Crash
        xEffect: async (who, scene, isXeff) => {
            await executeCrash(who, scene);
        },
        // Both players boost Attack Power +300.
        effect: async (who, scene, isXeff) => {
            const addPower = 300;
            await addAllPPower(addPower, scene);
            await addAllOPower(addPower, scene);
        },
    },
    {
        id: "126",
        // {{button|c}} to 0
        xEffect: async (who, scene, isXeff) => {
            await executeCTo0(who, scene)
        },
        // Both players use {{button|t}}.
        effect: async (who, scene, isXeff) => {
            const playerStore = usePlayerStore();
            const oppStore = useOpponentStore();
            playerStore.setPAttack(ATTACK.T)
            changeAttackChoiceDisplay(who, playerStore.pAttack)
            oppStore.setOAttack(ATTACK.T)
            changeAttackChoiceDisplay(who, oppStore.oAttack)
        },
    },
    {
        id: "127",
        // Eat-up HP
        xEffect: async (who, scene, isXeff) => {
            const playerStore = usePlayerStore();
            const oppStore = useOpponentStore();
            if (who == WHO.PLAYER) {
                playerStore.setEatUpHp(true);
                await animateBattleStatusPopup(scene, true, "Eat-Up HP");
            } else if (who == WHO.OPP) {
                oppStore.setEatUpHp(true);
                await animateBattleStatusPopup(scene, false, "Eat-Up HP");
            }
        },
        // Discard 1 Card in DP Slot. change opponent's Specialty to Darkness.
        effect: async (who, scene, isXeff) => {
            const playerStore = usePlayerStore();
            const oppStore = useOpponentStore();
            const discardCount = 1;
            
            // change opponent's Specialty to Darkness
            // set gradient color
            const colorTopRgb = `vec3(${hexToRgb(COLOR_CODE.DARKNESS_TOP).join(",")})`;
            const colorBottomRgb = `vec3(${hexToRgb(COLOR_CODE.DARKNESS_BOTTOM).join(",")})`;
            const fShader = fragmentShader
            .replace("##COLOR_TOP", colorTopRgb)
            .replace("##COLOR_BOTTOM", colorBottomRgb);
            
            if (who == WHO.PLAYER) {
                // discard
                await setPlayerDpToOffline(scene, discardCount);
                
                await animateBattleStatusPopup(scene, false, "Change Specialty");
                await animateSpecialtyChange(WHO.OPP);
                oppStore.oActiveMon.specialty = SPECIALTY.DARKNESS;
                // Change color
                const card = scene.getObjectByName(`${CARD_NAME.OPP}${oppStore.oActiveMon.id}`)
                card.material.fragmentShader = fShader;
                card.material.needsUpdate = true;
            } else {
                // discard
                await setOppDpToOffline(scene, discardCount);

                await animateBattleStatusPopup(scene, true, "Change Specialty");
                await animateSpecialtyChange(WHO.PLAYER);
                playerStore.pActiveMon.specialty = SPECIALTY.DARKNESS;
                // Change color
                const card = scene.getObjectByName(`${CARD_NAME.PLAYER}${playerStore.pActiveMon.id}`)
                card.material.fragmentShader = fShader;
                card.material.needsUpdate = true;
            }
        }
    },
    {
        id: "128",
        // None
        xEffect: noneEffect,
        // Own Attack becomes {{button|c}}.
        effect: async (who, scene, isXeff) => {
            if (who == WHO.PLAYER) {
                const playerStore = usePlayerStore();
                playerStore.setPAttack(ATTACK.C)
                changeAttackChoiceDisplay(who, playerStore.pAttack)
            } else if (who == WHO.OPP) {
                const oppStore = useOpponentStore();
                oppStore.setOAttack(ATTACK.C)
                changeAttackChoiceDisplay(who, oppStore.oAttack)
            }
        },
    },
    {
        id: "129",
        // 1st Attack
        xEffect: async (who, scene, isXeff) => {
            execute1stAttack(who, scene);
        },
        // Both players use {{button|x}}.
        effect: async (who, scene, isXeff) => {
            const playerStore = usePlayerStore();
            const oppStore = useOpponentStore();
            playerStore.setPAttack(ATTACK.X)
            changeAttackChoiceDisplay(who, playerStore.pAttack)
            oppStore.setOAttack(ATTACK.X)
            changeAttackChoiceDisplay(who, oppStore.oAttack)
        },
    },
    {
        id: "130",
        // {{button|c}} to 0
        xEffect: async (who, scene, isXeff) => {
            await executeCTo0(who, scene)
        },
        // Both players use {{button|c}}.
        effect: async (who, scene, isXeff) => {
            const playerStore = usePlayerStore();
            const oppStore = useOpponentStore();
            playerStore.setPAttack(ATTACK.C)
            changeAttackChoiceDisplay(who, playerStore.pAttack)
            oppStore.setOAttack(ATTACK.C)
            changeAttackChoiceDisplay(who, oppStore.oAttack)
        },
    },
    {
        id: "131",
        // None
        xEffect: noneEffect,
        // Opponent's Attack Power become 300.
        effect: async (who, scene, isXeff) => {
            if (who == WHO.PLAYER) {
                const oppStore = useOpponentStore();

                await Promise.all([
                    addOCPower(300 - oppStore.oActiveMon.cPow, scene),
                    addOTPower(300 - oppStore.oActiveMon.tPow, scene),
                    addOXPower(300 - oppStore.oActiveMon.xPow, scene),
                ])
            } else if (who == WHO.OPP) {
                const playerStore = usePlayerStore();

                await Promise.all([
                    addPCPower(300 - playerStore.pActiveMon.cPow, scene),
                    addPTPower(300 - playerStore.pActiveMon.tPow, scene),
                    addPXPower(300 - playerStore.pActiveMon.xPow, scene),
                ])
            }
        },
    },
    {
        id: "132",
        // Nature Foe x3
        xEffect: async (who, scene, isXeff) => {
            await executeSpecialtyFoeX3(who, scene, SPECIALTY.NATURE, isXeff);
        },
        // If opponent's Specialty is Nature, own Attack Power is doubled.
        effect: async (who, scene, isXeff) => {
            const playerStore = usePlayerStore();
            const oppStore = useOpponentStore();

            if (who == WHO.PLAYER && oppStore.oActiveMon.specialty == SPECIALTY.NATURE) {
                await Promise.all([
                    addPCPower(playerStore.pActiveMon.cPow, scene),
                    addPTPower(playerStore.pActiveMon.tPow, scene),
                    addPXPower(playerStore.pActiveMon.xPow, scene),
                ])
            } else if (who == WHO.OPP && playerStore.pActiveMon.specialty == SPECIALTY.NATURE) {
                await Promise.all([
                    addOCPower(oppStore.oActiveMon.cPow, scene),
                    addOTPower(oppStore.oActiveMon.tPow, scene),
                    addOXPower(oppStore.oActiveMon.xPow, scene),
                ])
            } else {
                await animateMisfireFailurePopup(scene, who == WHO.PLAYER, isXeff)
            }
        }
    },
    {
        id: "133",
        // {{button|x}} to 0
        xEffect: async (who, scene, isXeff) => {
            await executeXTo0(who, scene)
        },
        // If opponent's Level is A, opponent's HP are halved.
        effect: async (who, scene, isXeff) => {
            const playerStore = usePlayerStore();
            const oppStore = useOpponentStore();

            if (who == WHO.PLAYER && oppStore.oActiveMon.level == LEVEL.A) {
                await addOHp(Math.round(parseInt(-oppStore.oActiveMon.hp) / 2), scene);
            } else if (who == WHO.OPP && playerStore.pActiveMon.level == LEVEL.A) {
                await addPHp(Math.round(parseInt(-playerStore.pActiveMon.hp) / 2), scene);
            } else {
                await animateMisfireFailurePopup(scene, who == WHO.PLAYER, isXeff)
            }
        }
    },
    {
        id: "134",
        // {{button|t}} to 0
        xEffect: async (who, scene, isXeff) => {
            await executeTTo0(who, scene)
        },
        // Reduce own Attack Power by -100. Recover own HP by +200.
        effect: async (who, scene, isXeff) => {
            const addPower = -100;
            const addHp = 200;
            if (who == WHO.PLAYER) {
                await addAllPPower(addPower, scene);
                await addPHp(addHp, scene);
            } else {
                await addAllOPower(addPower, scene);
                await addOHp(addHp, scene);
            }
        }
    },
    {
        id: "135",
        // {{button|c}} to 0
        xEffect: async (who, scene, isXeff) => {
            await executeCTo0(who, scene)
        },
        // Boost own {{button|x}} Attack Power +200. {{button|c}} & {{button|t}} Attack Power are 0.
        effect: async (who, scene, isXeff) => {
            const addPower = 200;
            if (who == WHO.PLAYER) {
                await addPXPower(addPower, scene);
                await Promise.all([
                    executeTTo0(WHO.OPP, scene),
                    executeXTo0(WHO.OPP, scene),
                ])
            } else {
                await addOXPower(addPower, scene);
                await Promise.all([
                    executeTTo0(WHO.PLAYER, scene),
                    executeXTo0(WHO.PLAYER, scene),
                ])
            }
        }
    },
    {
        id: "136",
        // Rare Foe x3
        xEffect: async (who, scene, isXeff) => {
            await executeSpecialtyFoeX3(who, scene, SPECIALTY.RARE, isXeff);
        },
        // If opponent's Specialty is Rare, opponent's HP become 100.
        effect: async (who, scene, isXeff) => {
            const playerStore = usePlayerStore();
            const oppStore = useOpponentStore();

            if (who == WHO.PLAYER && oppStore.oActiveMon.specialty == SPECIALTY.RARE) {
                await addOHp(100 - parseInt(oppStore.oActiveMon.hp), scene);
            } else if (who == WHO.OPP && playerStore.pActiveMon.specialty == SPECIALTY.RARE) {
                await addPHp(100 - parseInt(playerStore.pActiveMon.hp), scene);
            } else {
                await animateMisfireFailurePopup(scene, who == WHO.PLAYER, isXeff)
            }
        }
    },
    {
        id: "137",
        // Eat-up HP
        xEffect: async (who, scene, isXeff) => {
            const playerStore = usePlayerStore();
            const oppStore = useOpponentStore();
            if (who == WHO.PLAYER) {
                playerStore.setEatUpHp(true);
                await animateBattleStatusPopup(scene, true, "Eat-Up HP");
            } else if (who == WHO.OPP) {
                oppStore.setEatUpHp(true);
                await animateBattleStatusPopup(scene, false, "Eat-Up HP");
            }
        },
        // Own Attack becomes \"Eat-up HP.\" Own Attack Power is halved.
        effect: async (who, scene, isXeff) => {
            const playerStore = usePlayerStore();
            const oppStore = useOpponentStore();
            if (who == WHO.PLAYER) {
                playerStore.setEatUpHp(true);
                await animateBattleStatusPopup(scene, true, "Eat-Up HP");

                await Promise.all([
                    executeCToHalved(who),
                    executeTToHalved(who),
                    executeXToHalved(who),
                ])
            } else if (who == WHO.OPP) {
                oppStore.setEatUpHp(true);
                await animateBattleStatusPopup(scene, false, "Eat-Up HP");

                await Promise.all([
                    executeCToHalved(who),
                    executeTToHalved(who),
                    executeXToHalved(who),
                ])
            }
        },
    },
    {
        id: "138",
        // Jamming
        xEffect: async (who, scene, isXeff) => {
            if (who == WHO.PLAYER) {
                useOpponentStore().setOSupportVoid();
            } else if (who == WHO.OPP) {
                usePlayerStore().setPSupportVoid();
            }
        },
        // Opponent's HP are halved. opponent's Attack Power is doubled.
        effect: async (who, scene, isXeff) => {
            const playerStore = usePlayerStore();
            const oppStore = useOpponentStore();
            if (who == WHO.PLAYER) {
                await addOHp(Math.round(parseInt(-oppStore.oActiveMon.hp) / 2), scene);
                await Promise.all([
                    addOCPower(oppStore.oActiveMon.cPow, scene),
                    addOTPower(oppStore.oActiveMon.tPow, scene),
                    addOXPower(oppStore.oActiveMon.xPow, scene),
                ])
            } else {
                await addPHp(Math.round(parseInt(-playerStore.pActiveMon.hp) / 2), scene);
                await Promise.all([
                    addPCPower(playerStore.pActiveMon.cPow, scene),
                    addPTPower(playerStore.pActiveMon.tPow, scene),
                    addPXPower(playerStore.pActiveMon.xPow, scene),
                ])
            }
        }
    },
    {
        id: "139",
        // Jamming
        xEffect: async (who, scene, isXeff) => {
            if (who == WHO.PLAYER) {
                useOpponentStore().setOSupportVoid();
            } else if (who == WHO.OPP) {
                usePlayerStore().setPSupportVoid();
            }
        },
        // Discard 1 of opponent's Cards in DP Slot. Draw 1 Card
        effect: async (who, scene, isXeff) => {
            const discardCount = 1;
            const drawCount = 1;

            // discard
            if (who == WHO.PLAYER) {
                await setOppDpToOffline(scene, discardCount);
            } else {
                await setPlayerDpToOffline(scene, discardCount);
            }
            // draw
            await drawDeckCardToHand(who, scene, drawCount);
        }
    },
    {
        id: "140",
        //  Rare Foe x3
        xEffect: async (who, scene, isXeff) => {
            await executeSpecialtyFoeX3(who, scene, SPECIALTY.RARE, isXeff);
        },
        // If opponent's Specialty is Rare, lower opponent's Attack Power to 0
        effect: async (who, scene, isXeff) => {
            const playerStore = usePlayerStore();
            const oppStore = useOpponentStore();

            if (who == WHO.PLAYER && oppStore.oActiveMon.specialty == SPECIALTY.RARE) {
                await Promise.all([
                    executeCTo0(who, scene),
                    executeTTo0(who, scene),
                    executeXTo0(who, scene),
                ])
            } else if (who == WHO.OPP && playerStore.pActiveMon.specialty == SPECIALTY.RARE) {
                await Promise.all([
                    executeCTo0(who, scene),
                    executeTTo0(who, scene),
                    executeXTo0(who, scene),
                ])
            } else {
                await animateMisfireFailurePopup(scene, who == WHO.PLAYER, isXeff)
            }
        }
    },
    {
        id: "141",
        //  {{button|c}} Counter
        xEffect: async (who, scene, isXeff) => {
            await executeCcounter(who, scene, isXeff);
        },
        // {{button|c}} Counterattack. Attack second
        effect: async (who, scene, isXeff) => {
            await executeCcounter(who, scene, isXeff);
            if (who == WHO.PLAYER) {
                execute1stAttack(WHO.OPP, scene);
            } else if (who == WHO.OPP) {
                execute1stAttack(WHO.PLAYER, scene);
            }
        }
    },
    {
        id: "142",
        //  Jamming
        xEffect: async (who, scene, isXeff) => {
            if (who == WHO.PLAYER) {
                useOpponentStore().setOSupportVoid();
            } else if (who == WHO.OPP) {
                usePlayerStore().setPSupportVoid();
            }
        },
        // Recover own HP by +100. Boost own {{button|x}} Attack Power by +100
        effect: async (who, scene, isXeff) => {
            const addHp = 200;
            const addPower = 100;

            if (who == WHO.PLAYER) {
                await addPHp(addHp, scene);
                await addPXPower(addPower, scene);
            } else {
                await addOHp(addHp, scene);
                await addOXPower(addPower, scene);
            }
        }
    },
    {
        id: "143",
        //  {{button|t}} to 0
        xEffect: async (who, scene, isXeff) => {
            await executeTTo0(who, scene)
        },
        // If opponent's Specialty is Darkness, lower opponent's Attack Power to 0
        effect: async (who, scene, isXeff) => {
            const playerStore = usePlayerStore();
            const oppStore = useOpponentStore();

            if (who == WHO.PLAYER && oppStore.oActiveMon.specialty == SPECIALTY.DARKNESS) {
                await Promise.all([
                    executeCTo0(who, scene),
                    executeTTo0(who, scene),
                    executeXTo0(who, scene),
                ])
            } else if (who == WHO.OPP && playerStore.pActiveMon.specialty == SPECIALTY.DARKNESS) {
                await Promise.all([
                    executeCTo0(who, scene),
                    executeTTo0(who, scene),
                    executeXTo0(who, scene),
                ])
            } else {
                await animateMisfireFailurePopup(scene, who == WHO.PLAYER, isXeff)
            }
        }
    },
    {
        id: "144",
        //  {{button|c}} to 0
        xEffect: async (who, scene, isXeff) => {
            await executeCTo0(who, scene)
        },
        // Swap own Specialty with opponent's Specialty
        effect: async (who, scene, isXeff) => {
            const playerStore = usePlayerStore();
            const oppStore = useOpponentStore();

            const playerSpecialty = playerStore.pActiveMon.specialty
            const oppSpecialty = oppStore.oActiveMon.specialty

            const playerNewColors = specialtyToColor(oppSpecialty)
            const oppNewColors = specialtyToColor(playerSpecialty)

            // set gradient color
            let colorTopRgb = `vec3(${hexToRgb(playerNewColors[0]).join(",")})`;
            let colorBottomRgb = `vec3(${hexToRgb(playerNewColors[1]).join(",")})`;
            let fShader = fragmentShader
                .replace("##COLOR_TOP", colorTopRgb)
                .replace("##COLOR_BOTTOM", colorBottomRgb);

            await animateBattleStatusPopup(scene, true, "Change Specialty");
            await animateSpecialtyChange(WHO.PLAYER);
            playerStore.pActiveMon.specialty = oppSpecialty;
            const pCard = scene.getObjectByName(`${CARD_NAME.PLAYER}${playerStore.pActiveMon.id}`)
            pCard.material.fragmentShader = fShader;
            pCard.material.needsUpdate = true;
            
            // set gradient color
            colorTopRgb = `vec3(${hexToRgb(oppNewColors[0]).join(",")})`;
            colorBottomRgb = `vec3(${hexToRgb(oppNewColors[1]).join(",")})`;
            fShader = fragmentShader
            .replace("##COLOR_TOP", colorTopRgb)
            .replace("##COLOR_BOTTOM", colorBottomRgb);
            
            await animateBattleStatusPopup(scene, false, "Change Specialty");
            await animateSpecialtyChange(WHO.OPP);
            oppStore.oActiveMon.specialty = playerSpecialty;
            const oCard = scene.getObjectByName(`${CARD_NAME.OPP}${oppStore.oActiveMon.id}`)
            oCard.material.fragmentShader = fShader;
            oCard.material.needsUpdate = true;
        }
    },
    {
        id: "145",
        //  Jamming
        xEffect: async (who, scene, isXeff) => {
            if (who == WHO.PLAYER) {
                useOpponentStore().setOSupportVoid();
            } else if (who == WHO.OPP) {
                usePlayerStore().setPSupportVoid();
            }
        },
        // Opponent's Specialty becomes the same as own Specialty
        effect: async (who, scene, isXeff) => {
            const playerStore = usePlayerStore();
            const oppStore = useOpponentStore();

            const playerSpecialty = playerStore.pActiveMon.specialty
            const oppSpecialty = oppStore.oActiveMon.specialty

            const playerNewColors = specialtyToColor(oppSpecialty)
            const oppNewColors = specialtyToColor(playerSpecialty)

            if (who == WHO.PLAYER) {
                // set gradient color
                colorTopRgb = `vec3(${hexToRgb(oppNewColors[0]).join(",")})`;
                colorBottomRgb = `vec3(${hexToRgb(oppNewColors[1]).join(",")})`;
                fShader = fragmentShader
                    .replace("##COLOR_TOP", colorTopRgb)
                    .replace("##COLOR_BOTTOM", colorBottomRgb);

                await animateBattleStatusPopup(scene, false, "Change Specialty");
                await animateSpecialtyChange(WHO.OPP);
                oppStore.oActiveMon.specialty = playerSpecialty;
                const oCard = scene.getObjectByName(`${CARD_NAME.OPP}${oppStore.oActiveMon.id}`)
                oCard.material.fragmentShader = fShader;
                oCard.material.needsUpdate = true;
            } else {
                // set gradient color
                let colorTopRgb = `vec3(${hexToRgb(playerNewColors[0]).join(",")})`;
                let colorBottomRgb = `vec3(${hexToRgb(playerNewColors[1]).join(",")})`;
                let fShader = fragmentShader
                    .replace("##COLOR_TOP", colorTopRgb)
                    .replace("##COLOR_BOTTOM", colorBottomRgb);

                await animateBattleStatusPopup(scene, true, "Change Specialty");
                await animateSpecialtyChange(WHO.PLAYER);
                playerStore.pActiveMon.specialty = oppSpecialty;
                const pCard = scene.getObjectByName(`${CARD_NAME.PLAYER}${playerStore.pActiveMon.id}`)
                pCard.material.fragmentShader = fShader;
                pCard.material.needsUpdate = true;
            }
        }
    },
    {
        id: "146",
        //  Crash
        xEffect: async (who, scene, isXeff) => {
            await executeCrash(who, scene);
        },
        // Opponent uses {{button|x}}
        effect: async (who, scene, isXeff) => {
            if (who == WHO.PLAYER) {
                const oppStore = useOpponentStore();
                oppStore.setOAttack(ATTACK.X)
                changeAttackChoiceDisplay(who, oppStore.oAttack)
            } else {
                const playerStore = usePlayerStore();
                playerStore.setPAttack(ATTACK.X)
                changeAttackChoiceDisplay(who, playerStore.pAttack)
            }
        },
    },
    {
        id: "147",
        //  Darkness Foe x3
        xEffect: async (who, scene, isXeff) => {
            await executeSpecialtyFoeX3(who, scene, SPECIALTY.DARKNESS, isXeff);
        },
        // Recover own HP by +200. Boost own Attack Power by +100
        effect: async (who, scene, isXeff) => {
            const addPower = 100;
            const addHp = 200;
            if (who == WHO.PLAYER) {
                await addPHp(addHp, scene);
                await addAllPPower(addPower, scene);
            } else {
                await addOHp(addHp, scene);
                await addAllOPower(addPower, scene);
            }
        }
    },
    {
        id: "148",
        //  1st Attack
        xEffect: async (who, scene, isXeff) => {
            execute1stAttack(who, scene);
        },
        // None
        effect: noneEffect
    },
    {
        id: "149",
        //  {{button|c}} Counter
        xEffect: async (who, scene, isXeff) => {
            await executeCcounter(who, scene, isXeff);
        },
        // None
        effect: noneEffect
    },
    {
        id: "150",
        //  Jamming
        xEffect: async (who, scene, isXeff) => {
            if (who == WHO.PLAYER) {
                useOpponentStore().setOSupportVoid();
            } else if (who == WHO.OPP) {
                usePlayerStore().setPSupportVoid();
            }
        },
        // Lower opponent's {{button|x}} Attack Power to 0
        effect: async (who, scene, isXeff) => {
            await executeXTo0(who, scene)
        }
    },
    {
        id: "151",
        //  {{button|c}} to 0
        xEffect: async (who, scene, isXeff) => {
            await executeCTo0(who, scene)
        },
        // If opponent has more than 2 Cards in DP Slot, his Attack Power is 0
        effect: async (who, scene, isXeff) => {
            const playerStore = usePlayerStore();
            const oppStore = useOpponentStore();

            if (who == WHO.PLAYER && playerStore.pActiveMon.pDpCount > 2) {
                await Promise.all([
                    executeCTo0(who, scene),
                    executeTTo0(who, scene),
                    executeXTo0(who, scene),
                ])
            } else if (who == WHO.OPP && oppStore.oActiveMon.oDpCount > 2) {
                await Promise.all([
                    executeCTo0(who, scene),
                    executeTTo0(who, scene),
                    executeXTo0(who, scene),
                ])
            }
        }
    },
    {
        id: "152",
        //  Darkness Foe x3
        xEffect: async (who, scene, isXeff) => {
            await executeSpecialtyFoeX3(who, scene, SPECIALTY.DARKNESS, isXeff);
        },
        // If opponent's Specialty is Darkness, opponent's Support Effect is voided
        effect: async (who, scene, isXeff) => {
            const playerStore = usePlayerStore();
            const oppStore = useOpponentStore();

            if (who == WHO.PLAYER && oppStore.oActiveMon.specialty == SPECIALTY.DARKNESS) {
                oppStore.setOSupportVoid();
            } else if (who == WHO.OPP && playerStore.pActiveMon.specialty == SPECIALTY.DARKNESS) {
                playerStore.setPSupportVoid();
            } else {
                await animateMisfireFailurePopup(scene, who == WHO.PLAYER, isXeff)
            }
        }
    },
    {
        id: "153",
        //  {{button|x}} Counter
        xEffect: async (who, scene, isXeff) => {
            await executeXcounter(who, scene, isXeff);
        },
        // If opponent used {{button|x}}, discard all Cards in opponent's Hand
        effect: async (who, scene, isXeff) => {
            const playerStore = usePlayerStore();
            const oppStore = useOpponentStore();

            if (who == WHO.PLAYER && oppStore.oAttack == ATTACK.X) {
                await discardAllHandCards(WHO.OPP, scene);
            } else if (who == WHO.OPP && playerStore.pAttack == ATTACK.X) {
                await discardAllHandCards(WHO.PLAYER, scene);
            } else {
                await animateMisfireFailurePopup(scene, who == WHO.PLAYER, isXeff)
            }
        },
    },
    {
        id: "154",
        //  {{button|c}} to 0
        xEffect: async (who, scene, isXeff) => {
            await executeCTo0(who, scene)
        },
        // Move the top Card from Offline Pile to Online Deck
        effect: async (who, scene, isXeff) => {
            const returnCount = 1;
            await setOfflineCardToDeck(who, scene, returnCount);
        },
    },
    {
        id: "155",
        //  {{button|c}} to 0
        xEffect: async (who, scene, isXeff) => {
            await executeCTo0(who, scene)
        },
        // Discard opponent's top DP Card shown in DP Slot
        effect: async (who, scene, isXeff) => {
            const discardCount = 1;
            if (who == WHO.PLAYER) {
                await setOppDpToOffline(scene, discardCount);
            } else {
                await setPlayerDpToOffline(scene, discardCount);
            }
        }
    },
    {
        id: "156",
        //  {{button|x}} Counter
        xEffect: async (who, scene, isXeff) => {
            await executeXcounter(who, scene, isXeff);
        },
        // Return all Cards in own Hand to Online Deck and Shuffle
        effect: async (who, scene, isXeff) => {
            const playerStore = usePlayerStore();
            const oppStore = useOpponentStore();
            let handCards = [];

            if (who == WHO.PLAYER) {
                handCards = [...playerStore.pHand].filter(el => el).map((el) => {
                    if (el) return `${CARD_NAME.PLAYER}${el}`
                });
                for (let i = 0; i < handCards.length; i++) {
                    const cardName = handCards[i];
                    const card = scene.getObjectByName(cardName)
                    const cardId = cardName.replace(CARD_NAME.PLAYER, "");
            
                    // update hand
                    playerStore.removePHand(cardId);
                    
                    // animate
                    await animateHandToDeck(card);
                    
                    // update offline
                    playerStore.addPDeck(cardId);
                    const deckCnt = document.getElementById("pDeckCount");
                    deckCnt.innerHTML = playerStore.pDeckCount;
                }
            } else if (who == WHO.OPP) {
                handCards = [...oppStore.oHand].filter(el => el).map((el) => {
                    if (el) return `${CARD_NAME.OPP}${el}`
                });
                for (let i = 0; i < handCards.length; i++) {
                    const cardName = handCards[i];
                    const card = scene.getObjectByName(cardName)
                    const cardId = cardName.replace(CARD_NAME.OPP, "");
                    
                    // update hand
                    oppStore.removeOHand(cardId);
            
                    // animate
                    await animateHandToDeck(card);
            
                    // update deck
                    oppStore.addODeck(cardId);
                    const deckCnt = document.getElementById("oDeckCount");
                    deckCnt.innerHTML = oppStore.oDeckCount;
                }
            }
        },
    },
    {
        id: "157",
        //  {{button|x}} to 0
        xEffect: async (who, scene, isXeff) => {
            await executeXTo0(who, scene)
        },
        // Discard opponent's 2 top DP Cards in his DP Slot
        effect: async (who, scene, isXeff) => {
            const discardCount = 2;
            if (who == WHO.PLAYER) {
                await setOppDpToOffline(scene, discardCount);
            } else {
                await setPlayerDpToOffline(scene, discardCount);
            }
        },
    },
    {
        id: "158",
        //  Jamming
        xEffect: async (who, scene, isXeff) => {
            if (who == WHO.PLAYER) {
                useOpponentStore().setOSupportVoid();
            } else if (who == WHO.OPP) {
                usePlayerStore().setPSupportVoid();
            }
        },
        // Discard 1 Card from opponent's Hand at random
        effect: async (who, scene, isXeff) => {
            if (who == WHO.PLAYER) {
                const oppStore = useOpponentStore()
                const handCards = oppStore.oHand.filter(el => {
                    if (el) return el
                })
                const cardId = handCards[Math.floor(Math.random() * 100) % handCards.length]
                await discardHandCardsGivenId(who, scene, cardId)
            } else if (who == WHO.OPP) {
                const playerStore = usePlayerStore()
                const handCards = playerStore.pHand.filter(el => {
                    if (el) return el
                })
                const cardId = handCards[Math.floor(Math.random() * 100) % handCards.length]
                await discardHandCardsGivenId(who, scene, cardId)
            }
        },
    },
    {
        id: "159",
        //  Rare Foe x3
        xEffect: async (who, scene, isXeff) => {
            await executeSpecialtyFoeX3(who, scene, SPECIALTY.RARE, isXeff);
        },
        // Discard 3 Cards from opponent's Online Deck
        effect: async (who, scene, isXeff) => {
            const discardCount = 3;
            if (who == WHO.PLAYER) {
                await setDeckCardToOffline(WHO.OPP, scene, discardCount);
            } else if (who == WHO.OPP) {
                await setDeckCardToOffline(WHO.PLAYER, scene, discardCount);
            }
        },
    },
    {
        id: "160",
        //  None
        xEffect: noneEffect,
        // Discard all Cards in DP Slot. Foe discards same number of DP Cards
        effect: async (who, scene, isXeff) => {
            const playerStore = usePlayerStore();
            const oppStore = useOpponentStore();

            if (who == WHO.PLAYER) {
                const pDiscardCount = playerStore.pDpCount
                await setPlayerDpToOffline(scene, pDiscardCount);
                
                const oDiscardCount = oppStore.oDpCount > pDiscardCount ? pDiscardCount : oppStore.oDpCount
                await setOppDpToOffline(scene, oDiscardCount);
            } else {
                const oDiscardCount = oppStore.oDpCount
                await setOppDpToOffline(scene, oDiscardCount);
                
                const pDiscardCount = playerStore.pDpCount > oDiscardCount ? oDiscardCount : playerStore.pDpCount
                await setPlayerDpToOffline(scene, pDiscardCount);
            }
        },
    },
    {
        id: "161",
        //  Rare Foe x3
        xEffect: async (who, scene, isXeff) => {
            await executeSpecialtyFoeX3(who, scene, SPECIALTY.RARE, isXeff);
        },
        // Opponent uses {{button|t}}
        effect: async (who, scene, isXeff) => {
            if (who == WHO.PLAYER) {
                const oppStore = useOpponentStore();
                oppStore.setOAttack(ATTACK.T)
                changeAttackChoiceDisplay(who, oppStore.oAttack)
            } else {
                const playerStore = usePlayerStore();
                playerStore.setPAttack(ATTACK.T)
                changeAttackChoiceDisplay(who, playerStore.pAttack)
            }
        },
    },
    {
        id: "162",
        //  {{button|c}} Counter
        xEffect: async (who, scene, isXeff) => {
            await executeCcounter(who, scene, isXeff);
        },
        // None
        effect: noneEffect,
    },
    {
        id: "163",
        //  None
        xEffect: noneEffect,
        // None
        effect: noneEffect,
    },
    {
        id: "164",
        //  1st Attack
        xEffect: async (who, scene, isXeff) => {
            execute1stAttack(who, scene);
        },
        // Opponent uses {{button|c}}. Lower opponent's Attack Power -100
        effect: async (who, scene, isXeff) => {
            const addPower = 100;

            if (who == WHO.PLAYER) {
                const oppStore = useOpponentStore();
                oppStore.setOAttack(ATTACK.C)
                changeAttackChoiceDisplay(who, oppStore.oAttack)
                await addAllOPower(-addPower, scene)
            } else {
                const playerStore = usePlayerStore();
                playerStore.setPAttack(ATTACK.C)
                changeAttackChoiceDisplay(who, playerStore.pAttack)
                await addAllPPower(-addPower, scene);
            }
        },
    },
    {
        id: "165",
        //  None
        xEffect: noneEffect,
        // If 1 or less Cards left in own Hand, opponent's Attack Power goes to 0
        effect: async (who, scene, isXeff) => {
            const playerStore = usePlayerStore();
            const oppStore = useOpponentStore();

            if (who == WHO.PLAYER && playerStore.pHandCount <= 1) {
                await Promise.all([
                    executeCTo0(who, scene),
                    executeTTo0(who, scene),
                    executeXTo0(who, scene),
                ])
            } else if (who == WHO.OPP && oppStore.oHandCount <= 1) {
                await Promise.all([
                    executeCTo0(who, scene),
                    executeTTo0(who, scene),
                    executeXTo0(who, scene),
                ])
            }
        }
    },
    {
        id: "166",
        //  Crash
        xEffect: async (who, scene, isXeff) => {
            await executeCrash(who, scene);
        },
        // Discard all Cards in DP Slot. Recover HP, mumber of discards x100
        effect: async (who, scene, isXeff) => {
            const playerStore = usePlayerStore();
            const oppStore = useOpponentStore();

            if (who == WHO.PLAYER) {
                const pDiscardCount = playerStore.pDpCount
                await setPlayerDpToOffline(scene, pDiscardCount);

                const addHp = pDiscardCount * 100;
                await addPHp(addHp, scene)
            } else {
                const oDiscardCount = oppStore.oDpCount
                await setOppDpToOffline(scene, oDiscardCount);

                const addHp = oDiscardCount * 100;
                await addOHp(addHp, scene)
            }
        },
    },
    {
        id: "167",
        //  {{button|t}} Counter
        xEffect: async (who, scene, isXeff) => {
            await executeTcounter(who, scene, isXeff);
        },
        // Discard 1 Card at random from own Hand. HP of both Players are 200
        effect: async (who, scene, isXeff) => {
            if (who == WHO.PLAYER) {
                const playerStore = usePlayerStore()
                await addPHp(200 - parseInt(playerStore.pActiveMon.hp), scene);

                const handCards = playerStore.pHand.filter(el => {
                    if (el) return el
                })
                const cardId = handCards[Math.floor(Math.random() * 100) % handCards.length]
                await discardHandCardsGivenId(who, scene, cardId)
            } else if (who == WHO.OPP) {
                const oppStore = useOpponentStore()
                await addOHp(200 - parseInt(oppStore.oActiveMon.hp), scene);

                const handCards = oppStore.oHand.filter(el => {
                    if (el) return el
                })
                const cardId = handCards[Math.floor(Math.random() * 100) % handCards.length]
                await discardHandCardsGivenId(who, scene, cardId)
            }
        },
    },
    {
        id: "168",
        //  Jamming
        xEffect: async (who, scene, isXeff) => {
            if (who == WHO.PLAYER) {
                useOpponentStore().setOSupportVoid();
            } else if (who == WHO.OPP) {
                usePlayerStore().setPSupportVoid();
            }
        },
        // Opponent's Support Effect is voided
        effect: async (who, scene, isXeff) => {
            if (who == WHO.PLAYER) {
                useOpponentStore().setOSupportVoid();
            } else if (who == WHO.OPP) {
                usePlayerStore().setPSupportVoid();
            }
        }
    },
    {
        id: "169",
        //  Rare Foe x3
        xEffect: async (who, scene, isXeff) => {
            await executeSpecialtyFoeX3(who, scene, SPECIALTY.RARE, isXeff);
        },
        // None
        effect: noneEffect
    },
    {
        id: "170",
        //  {{button|c}} to 0
        xEffect: async (who, scene, isXeff) => {
            await executeCTo0(who, scene)
        },
        // Own HP become same as opponent's
        effect: async (who, scene, isXeff) => {
            const playerStore = usePlayerStore();
            const oppStore = useOpponentStore();

            if (who == WHO.PLAYER) {
                await addPHp(oppStore.oActiveMon.hp - playerStore.pActiveMon.hp, scene)
            } else {
                await addOHp(playerStore.pActiveMon.hp - oppStore.oActiveMon.hp, scene)
            }
        }
    },
    {
        id: "171",
        //  {{button|c}} to 0
        xEffect: async (who, scene, isXeff) => {
            await executeCTo0(who, scene)
        },
        // Opponent's HP become same as own. Own Attack Power becomes 0
        effect: async (who, scene, isXeff) => {
            const playerStore = usePlayerStore();
            const oppStore = useOpponentStore();

            if (who == WHO.PLAYER) {
                await addOHp(playerStore.pActiveMon.hp - oppStore.oActiveMon.hp, scene)
                await Promise.all([
                    executeCTo0(WHO.OPP, scene),
                    executeTTo0(WHO.OPP, scene),
                    executeXTo0(WHO.OPP, scene),
                ])
            } else {
                await addPHp(oppStore.oActiveMon.hp - playerStore.pActiveMon.hp, scene)
                await Promise.all([
                    executeCTo0(WHO.PLAYER, scene),
                    executeTTo0(WHO.PLAYER, scene),
                    executeXTo0(WHO.PLAYER, scene),
                ])
            }
        }
    },
    {
        id: "172",
        //  {{button|c}} Counter
        xEffect: async (who, scene, isXeff) => {
            await executeCcounter(who, scene, isXeff);
        },
        // Boost own Attack Power +100. Draw 1 Card
        effect: async (who, scene, isXeff) => {
            const addPower = 100;
            const drawCount = 1;

            if (who == WHO.PLAYER) {
                await addAllPPower(addPower, scene);
            } else {
                await addAllOPower(addPower, scene);
            }
            // Draw 1 card
            await drawDeckCardToHand(who, scene, drawCount);
        }
    },
    {
        id: "173",
        //  {{button|c}} to 0
        xEffect: async (who, scene, isXeff) => {
            await executeCTo0(who, scene)
        },
        // Boost own Attack Power by +100. Draw 1 Card
        effect: async (who, scene, isXeff) => {
            const addPower = 100;
            const drawCount = 1;

            if (who == WHO.PLAYER) {
                await addAllPPower(addPower, scene);
            } else {
                await addAllOPower(addPower, scene);
            }
            // Draw 1 card
            await drawDeckCardToHand(who, scene, drawCount);
        }
    },
    {
        id: "174",
        //  {{button|c}} to 0
        xEffect: async (who, scene, isXeff) => {
            await executeCTo0(who, scene)
        },
        // If foe's Specialty is Darkness, own Attack Power is Doubled. Draw 1 Card
        effect: async (who, scene, isXeff) => {
            const playerStore = usePlayerStore();
            const oppStore = useOpponentStore();
            const drawCount = 1;

            if (who == WHO.PLAYER && oppStore.oActiveMon.specialty == SPECIALTY.DARKNESS) {
                await Promise.all([
                    addPCPower(playerStore.pActiveMon.cPow, scene),
                    addPTPower(playerStore.pActiveMon.tPow, scene),
                    addPXPower(playerStore.pActiveMon.xPow, scene),
                ])
                // Draw 1 card
                await drawDeckCardToHand(who, scene, drawCount);
            } else if (who == WHO.OPP && playerStore.pActiveMon.specialty == SPECIALTY.DARKNESS) {
                await Promise.all([
                    addOCPower(oppStore.oActiveMon.cPow, scene),
                    addOTPower(oppStore.oActiveMon.tPow, scene),
                    addOXPower(oppStore.oActiveMon.xPow, scene),
                ])
                // Draw 1 card
                await drawDeckCardToHand(who, scene, drawCount);
            } else {
                await animateMisfireFailurePopup(scene, who == WHO.PLAYER, isXeff)
            }
        }
    },
    {
        id: "175",
        //  None
        xEffect: noneEffect,
        // Boost own Attack Power +100. Draw 1 Card
        effect: async (who, scene, isXeff) => {
            const addPower = 100;
            const drawCount = 1;

            if (who == WHO.PLAYER) {
                await addAllPPower(addPower, scene);
            } else {
                await addAllOPower(addPower, scene);
            }
            // Draw 1 card
            await drawDeckCardToHand(who, scene, drawCount);
        }
    },
    {
        id: "176",
        //  {{button|c}} to 0
        xEffect: async (who, scene, isXeff) => {
            await executeCTo0(who, scene)
        },
        // Discard 2 Cards from opponent's Online Deck. Draw 1 Card
        effect: async (who, scene, isXeff) => {
            const discardCount = 2;
            const drawCount = 1;
            
            if (who == WHO.PLAYER) {
                // discard 2 cards
                await setDeckCardToOffline(WHO.OPP, scene, discardCount);
            } else {
                // discard 2 cards
                await setDeckCardToOffline(WHO.PLAYER, scene, discardCount);
            }
            // Draw 1 card
            await drawDeckCardToHand(who, scene, drawCount);
        }
    },
    {
        id: "177",
        //  {{button|x}} Counter
        xEffect: async (who, scene, isXeff) => {
            await executeXcounter(who, scene, isXeff);
        },
        // Lower Opponent's Attack Power -100. Draw 1 Card
        effect: async (who, scene, isXeff) => {
            const addPower = -100;
            const drawCount = 1;

            if (who == WHO.PLAYER) {
                await addAllOPower(addPower, scene)
            } else {
                await addAllPPower(addPower, scene);
            }
            // Draw 1 card
            await drawDeckCardToHand(who, scene, drawCount);
        },
    },
    {
        id: "178",
        //  Fire Foe x3
        xEffect: async (who, scene, isXeff) => {
            await executeSpecialtyFoeX3(who, scene, SPECIALTY.FIRE, isXeff);
        },
        // Change own Specialty to Nature. Draw 1 Card
        effect: async (who, scene, isXeff) => {
            const drawCount = 1;
            // set gradient color
            await animateBattleStatusPopup(scene, who == WHO.PLAYER, "Change Specialty");
            await animateSpecialtyChange(who);
            const colorTopRgb = `vec3(${hexToRgb(COLOR_CODE.NATURE_TOP).join(",")})`;
            const colorBottomRgb = `vec3(${hexToRgb(COLOR_CODE.NATURE_BOTTOM).join(",")})`;
            const fShader = fragmentShader
                .replace("##COLOR_TOP", colorTopRgb)
                .replace("##COLOR_BOTTOM", colorBottomRgb);

            // Change color
            if (who == WHO.PLAYER) {
                const playerStore = usePlayerStore();

                playerStore.pActiveMon.specialty = SPECIALTY.NATURE;
                const card = scene.getObjectByName(`${CARD_NAME.PLAYER}${playerStore.pActiveMon.id}`)
                card.material.fragmentShader = fShader;
                card.material.needsUpdate = true;
            } else {
                const oppStore = useOpponentStore();

                oppStore.oActiveMon.specialty = SPECIALTY.NATURE;
                const card = scene.getObjectByName(`${CARD_NAME.OPP}${oppStore.oActiveMon.id}`)
                card.material.fragmentShader = fShader;
                card.material.needsUpdate = true;
            }
            // Draw 1 card
            await drawDeckCardToHand(who, scene, drawCount);
        }
    },
    {
        id: "179",
        //  {{button|c}} to 0
        xEffect: async (who, scene, isXeff) => {
            await executeCTo0(who, scene)
        },
        // Draw 3 Cards
        effect: async (who, scene, isXeff) => {
            const drawCount = 3;
            await drawDeckCardToHand(who, scene, drawCount);
        },
    },
    {
        id: "180",
        //  1st Attack
        xEffect: async (who, scene, isXeff) => {
            execute1stAttack(who, scene);
        },
        // If foe's Specialty is Nature, own Attack Power is doubled. Draw 1 Card
        effect: async (who, scene, isXeff) => {
            const playerStore = usePlayerStore();
            const oppStore = useOpponentStore();
            const drawCount = 1;

            if (who == WHO.PLAYER && oppStore.oActiveMon.specialty == SPECIALTY.NATURE) {
                await Promise.all([
                    addPCPower(playerStore.pActiveMon.cPow, scene),
                    addPTPower(playerStore.pActiveMon.tPow, scene),
                    addPXPower(playerStore.pActiveMon.xPow, scene),
                ])
                // Draw 1 card
                await drawDeckCardToHand(who, scene, drawCount);
            } else if (who == WHO.OPP && playerStore.pActiveMon.specialty == SPECIALTY.NATURE) {
                await Promise.all([
                    addOCPower(oppStore.oActiveMon.cPow, scene),
                    addOTPower(oppStore.oActiveMon.tPow, scene),
                    addOXPower(oppStore.oActiveMon.xPow, scene),
                ])
                // Draw 1 card
                await drawDeckCardToHand(who, scene, drawCount);
            } else {
                await animateMisfireFailurePopup(scene, who == WHO.PLAYER, isXeff)
            }
        }
    },
    {
        id: "181",
        //  {{button|c}} to 0
        xEffect: async (who, scene, isXeff) => {
            await executeCTo0(who, scene)
        },
        // Change own Specialty to Nature. Draw 1 card
        effect: async (who, scene, isXeff) => {
            const drawCount = 1;
            // set gradient color
            await animateBattleStatusPopup(scene, who == WHO.PLAYER, "Change Specialty");
            await animateSpecialtyChange(who);
            const colorTopRgb = `vec3(${hexToRgb(COLOR_CODE.NATURE_TOP).join(",")})`;
            const colorBottomRgb = `vec3(${hexToRgb(COLOR_CODE.NATURE_BOTTOM).join(",")})`;
            const fShader = fragmentShader
                .replace("##COLOR_TOP", colorTopRgb)
                .replace("##COLOR_BOTTOM", colorBottomRgb);
            
            // Change color
            if (who == WHO.PLAYER) {
                const playerStore = usePlayerStore();

                playerStore.pActiveMon.specialty = SPECIALTY.NATURE;
                const card = scene.getObjectByName(`${CARD_NAME.PLAYER}${playerStore.pActiveMon.id}`)
                card.material.fragmentShader = fShader;
                card.material.needsUpdate = true;
            } else {
                const oppStore = useOpponentStore();

                oppStore.oActiveMon.specialty = SPECIALTY.NATURE;
                const card = scene.getObjectByName(`${CARD_NAME.OPP}${oppStore.oActiveMon.id}`)
                card.material.fragmentShader = fShader;
                card.material.needsUpdate = true;
            }
            // Draw 1 card
            await drawDeckCardToHand(who, scene, drawCount);
        }
    },
    {
        id: "182",
        //  {{button|c}} Counter
        xEffect: async (who, scene, isXeff) => {
            await executeCcounter(who, scene, isXeff);
        },
        // Draw 3 Cards
        effect: async (who, scene, isXeff) => {
            const drawCount = 3;
            await drawDeckCardToHand(who, scene, drawCount);
        },
    },
    {
        id: "183",
        //  {{button|c}} Counter
        xEffect: async (who, scene, isXeff) => {
            await executeCcounter(who, scene, isXeff);
        },
        // If foe's Specialty is Darkness, own Attack Power is doubled. Draw 1 Card
        effect: async (who, scene, isXeff) => {
            const playerStore = usePlayerStore();
            const oppStore = useOpponentStore();
            const drawCount = 1;

            if (who == WHO.PLAYER && oppStore.oActiveMon.specialty == SPECIALTY.DARKNESS) {
                await Promise.all([
                    addPCPower(playerStore.pActiveMon.cPow, scene),
                    addPTPower(playerStore.pActiveMon.tPow, scene),
                    addPXPower(playerStore.pActiveMon.xPow, scene),
                ])
                // Draw 1 card
                await drawDeckCardToHand(who, scene, drawCount);
            } else if (who == WHO.OPP && playerStore.pActiveMon.specialty == SPECIALTY.DARKNESS) {
                await Promise.all([
                    addOCPower(oppStore.oActiveMon.cPow, scene),
                    addOTPower(oppStore.oActiveMon.tPow, scene),
                    addOXPower(oppStore.oActiveMon.xPow, scene),
                ])
                // Draw 1 card
                await drawDeckCardToHand(who, scene, drawCount);
            } else {
                await animateMisfireFailurePopup(scene, who == WHO.PLAYER, isXeff)
            }
        }
    },
    {
        id: "184",
        //  {{button|t}} Counter
        xEffect: async (who, scene, isXeff) => {
            await executeTcounter(who, scene, isXeff);
        },
        // Change own Specialty to Nature. Draw 1 Card
        effect: async (who, scene, isXeff) => {
            const drawCount = 1;
            // set gradient color
            await animateBattleStatusPopup(scene, who == WHO.PLAYER, "Change Specialty");
            await animateSpecialtyChange(who);
            const colorTopRgb = `vec3(${hexToRgb(COLOR_CODE.NATURE_TOP).join(",")})`;
            const colorBottomRgb = `vec3(${hexToRgb(COLOR_CODE.NATURE_BOTTOM).join(",")})`;
            const fShader = fragmentShader
                .replace("##COLOR_TOP", colorTopRgb)
                .replace("##COLOR_BOTTOM", colorBottomRgb);

            // Change color
            if (who == WHO.PLAYER) {
                const playerStore = usePlayerStore();

                playerStore.pActiveMon.specialty = SPECIALTY.NATURE;
                const card = scene.getObjectByName(`${CARD_NAME.PLAYER}${playerStore.pActiveMon.id}`)
                card.material.fragmentShader = fShader;
                card.material.needsUpdate = true;
            } else {
                const oppStore = useOpponentStore();

                oppStore.oActiveMon.specialty = SPECIALTY.NATURE;
                const card = scene.getObjectByName(`${CARD_NAME.OPP}${oppStore.oActiveMon.id}`)
                card.material.fragmentShader = fShader;
                card.material.needsUpdate = true;
            }
            // Draw 1 card
            await drawDeckCardToHand(who, scene, drawCount);
        }
    },
    {
        id: "185",
        //  {{button|t}} to 0
        xEffect: async (who, scene, isXeff) => {
            await executeTTo0(who, scene)
        },
        // Boost own Attack Power by +100. Draw 1 Card
        effect: async (who, scene, isXeff) => {
            const addPower = 100;
            const drawCount = 1;

            if (who == WHO.PLAYER) {
                await addAllPPower(addPower, scene);
            } else {
                await addAllOPower(addPower, scene);
            }
            // Draw 1 card
            await drawDeckCardToHand(who, scene, drawCount);
        }
    },
    {
        id: "186",
        //  Jamming
        xEffect: async (who, scene, isXeff) => {
            if (who == WHO.PLAYER) {
                useOpponentStore().setOSupportVoid();
            } else if (who == WHO.OPP) {
                usePlayerStore().setPSupportVoid();
            }
        },
        // Lower Opponent's Attack Power -100. Draw 1 Card
        effect: async (who, scene, isXeff) => {
            const addPower = 100;
            const drawCount = 1;

            if (who == WHO.PLAYER) {
                await addAllOPower(-addPower, scene)
            } else {
                await addAllPPower(-addPower, scene);
            }
            // Draw 1 card
            await drawDeckCardToHand(who, scene, drawCount);
        },
    },
    {
        id: "187",
        //  {{button|c}} to 0
        xEffect: async (who, scene, isXeff) => {
            await executeCTo0(who, scene)
        },
        // Lower Opponent's Attack Power -100. Draw 1 Card
        effect: async (who, scene, isXeff) => {
            const addPower = 100;
            const drawCount = 1;

            if (who == WHO.PLAYER) {
                await addAllOPower(-addPower, scene)
            } else {
                await addAllPPower(-addPower, scene);
            }
            // Draw 1 card
            await drawDeckCardToHand(who, scene, drawCount);
        },
    },
    {
        id: "188",
        //  {{button|x}} to 0
        xEffect: async (who, scene, isXeff) => {
            await executeXTo0(who, scene)
        },
        // Draw 3 Cards
        effect: async (who, scene, isXeff) => {
            const drawCount = 3;
            await drawDeckCardToHand(who, scene, drawCount);
        },
    },
    {
        id: "189",
        //  None
        xEffect: noneEffect,
        // Discard 2 Cards from opponent's Online Deck. Draw 1 Card
        effect: async (who, scene, isXeff) => {
            const discardCount = 2;
            const drawCount = 1;

            if (who == WHO.PLAYER) {
                // discard 2 cards
                await setDeckCardToOffline(WHO.OPP, scene, discardCount);
            } else {
                // discard 2 cards
                await setDeckCardToOffline(WHO.PLAYER, scene, discardCount);
            }
            // Draw 1 card
            await drawDeckCardToHand(who, scene, drawCount);
        }
    },
    {
        id: "190",
        //  {{button|c}} to 0
        xEffect: async (who, scene, isXeff) => {
            await executeCTo0(who, scene)
        },
        // Discard 2 Cards from opponent's Online Deck. Draw 1 Card
        effect: async (who, scene, isXeff) => {
            const discardCount = 2;
            const drawCount = 1;
            
            if (who == WHO.PLAYER) {
                // discard 2 cards
                await setDeckCardToOffline(who, scene, discardCount);
            } else {
                // discard 2 cards
                await setDeckCardToOffline(who, scene, discardCount);
            }
            // Draw 1 card
            await drawDeckCardToHand(who, scene, drawCount);
        }
    },
    { // Own HP are halved. Counterattack. Attack second
        id: "191",
        effect: async (who, scene, isXeff) => {
            const playerStore = usePlayerStore();
            const oppStore = useOpponentStore();
            if (who == WHO.PLAYER) {
                await addPHp(Math.round(parseInt(-playerStore.pActiveMon.hp) / 2), scene);

                if (oppStore.oAttack == ATTACK.C) {
                    await executeCcounter(who, scene, isXeff);
                } else if (oppStore.oAttack == ATTACK.T) {
                    await executeTcounter(who, scene, isXeff);
                } else if (oppStore.oAttack == ATTACK.X) {
                    await executeXcounter(who, scene, isXeff);
                }

                execute1stAttack(WHO.OPP, scene);
            } else {
                await addOHp(Math.round(parseInt(-oppStore.oActiveMon.hp) / 2), scene);

                if (playerStore.pAttack == ATTACK.C) {
                    await executeCcounter(who, scene, isXeff);
                } else if (playerStore.pAttack == ATTACK.T) {
                    await executeTcounter(who, scene, isXeff);
                } else if (playerStore.pAttack == ATTACK.X) {
                    await executeXcounter(who, scene, isXeff);
                }

                execute1stAttack(WHO.PLAYER, scene);
            }
        }
    },
    { // Discard 1 Card from own Hand. Boost both players' Attack Power +600
        id: "192",
        effect: async (who, scene, isXeff) => {
            const addPower = 600;
            
            if (who == WHO.PLAYER) {
                const playerStore = usePlayerStore()

                const handCards = playerStore.pHand.filter(el => {
                    if (el) return el
                })
                const cardId = handCards[Math.floor(Math.random() * 100) % handCards.length]
                await discardHandCardsGivenId(who, scene, cardId)
            } else if (who == WHO.OPP) {
                const oppStore = useOpponentStore()

                const handCards = oppStore.oHand.filter(el => {
                    if (el) return el
                })
                const cardId = handCards[Math.floor(Math.random() * 100) % handCards.length]
                await discardHandCardsGivenId(who, scene, cardId)
            }

            await addAllPPower(addPower, scene);
            await addAllOPower(addPower, scene);
        },
    },
    { // If own Level is below opponent's, opponent's Attack Power becomes 0
        id: "193",
        effect: async (who, scene, isXeff) => {
            if (who == WHO.PLAYER && isOwnLevelLower(who)) {
                await Promise.all([
                    executeCTo0(who, scene),
                    executeTTo0(who, scene),
                    executeXTo0(who, scene),
                ])
            } else if (who == WHO.OPP && isOwnLevelLower(who)) {
                await Promise.all([
                    executeCTo0(who, scene),
                    executeTTo0(who, scene),
                    executeXTo0(who, scene),
                ])
            }
        }
    },
    { // Discard 7 Cards from Online Deck. Own Attack Power is same as own HP
        id: "194",
        effect: async (who, scene, isXeff) => {
            // discard 7 cards
            const discardCount = 7;
            await setDeckCardToOffline(who, scene, discardCount);

            // adjust attack power
            const playerStore = usePlayerStore();
            const oppStore = useOpponentStore();
            if (who == WHO.PLAYER) {
                const addCPower = parseInt(playerStore.pActiveMon.hp) - parseInt(playerStore.pActiveMon.cPow);
                const addTPower = parseInt(playerStore.pActiveMon.hp) - parseInt(playerStore.pActiveMon.tPow);
                const addXPower = parseInt(playerStore.pActiveMon.hp) - parseInt(playerStore.pActiveMon.xPow);
                await Promise.all([
                    addPCPower(addCPower, scene),
                    addPTPower(addTPower, scene),
                    addPXPower(addXPower, scene)
                ])
            } else if (who == WHO.OPP) {
                const addCPower = parseInt(oppStore.oActiveMon.hp) - parseInt(oppStore.oActiveMon.cPow);
                const addTPower = parseInt(oppStore.oActiveMon.hp) - parseInt(oppStore.oActiveMon.tPow);
                const addXPower = parseInt(oppStore.oActiveMon.hp) - parseInt(oppStore.oActiveMon.xPow);
                await Promise.all([
                    addOCPower(addCPower, scene),
                    addOTPower(addTPower, scene),
                    addOXPower(addXPower, scene)
                ])
            }
        },
    },
    { // Own HP are halved. Opponent's Attack Power becomes 0
        id: "195",
        effect: async (who, scene, isXeff) => {
            if (who == WHO.PLAYER) {
                const playerStore = usePlayerStore();
                await addPHp(Math.round(parseInt(-playerStore.pActiveMon.hp) / 2), scene);

                await Promise.all([
                    executeCTo0(who, scene),
                    executeTTo0(who, scene),
                    executeXTo0(who, scene),
                ])
            } else {
                const oppStore = useOpponentStore();
                await addOHp(Math.round(parseInt(-oppStore.oActiveMon.hp) / 2), scene);

                await Promise.all([
                    executeCTo0(who, scene),
                    executeTTo0(who, scene),
                    executeXTo0(who, scene),
                ])
            }
        }
    },
    { // If opponent's HP are more than 1000, opponent's HP are halved
        id: "196",
        effect: async (who, scene, isXeff) => {
            const playerStore = usePlayerStore();
            const oppStore = useOpponentStore();

            if (who == WHO.PLAYER && oppStore.oActiveMon.hp > 1000) {
                await addOHp(Math.round(parseInt(-oppStore.oActiveMon.hp) / 2), scene);
            } else if (who == WHO.OPP && playerStore.pActiveMon.hp > 1000) {
                await addPHp(Math.round(parseInt(-playerStore.pActiveMon.hp) / 2), scene);
            }
            else {
                await animateMisfireFailurePopup(scene, who == WHO.PLAYER, isXeff)
            }
        }
    },
    { // Discard 7 Cards from own Online Deck. Recover own HP by +1000
        id: "197",
        effect: async (who, scene, isXeff) => {
            // discard 7 cards
            const discardCount = 7;
            await setDeckCardToOffline(who, scene, discardCount);
            
            const addHp = 200;
            if (who == WHO.PLAYER) {
                await addPHp(addHp, scene);
            } else if (who == WHO.OPP) {
                await addOHp(addHp, scene);
            }
        },
    },
    { // Discard 7 Cards from own Online Deck. Boost own Attack Power +500
        id: "198",
        effect: async (who, scene, isXeff) => {
            // discard 7 cards
            const discardCount = 7;
            await setDeckCardToOffline(who, scene, discardCount);

            const addPower = 500;
            if (who == WHO.PLAYER) {
                await addAllPPower(addPower, scene);
            } else if (who == WHO.OPP) {
                await addAllOPower(addPower, scene);
            }
        },
    },
    { // If opponent's HP is less than own, boost own Attack Power +400
        id: "199",
        effect: async (who, scene, isXeff) => {
            const playerStore = usePlayerStore();
            const oppStore = useOpponentStore();
            const addPower = 400;

            if (who == WHO.PLAYER && playerStore.pActiveMon.hp > oppStore.oActiveMon.hp) {
                await addAllPPower(addPower, scene);
            } else if (who == WHO.OPP && oppStore.oActiveMon.hp > playerStore.pActiveMon.hp) {
                await addAllOPower(addPower, scene);
            }
            else {
                await animateMisfireFailurePopup(scene, who == WHO.PLAYER, isXeff)
            }
        }
    },
    { // None
        id: "200",
        effect: noneEffect
    },
    { // If both players use same Attack, discard all Cards in foe's Hand
        id: "201",
        effect: async (who, scene, isXeff) => {
            const playerStore = usePlayerStore();
            const oppStore = useOpponentStore();

            if (playerStore.pAttack == oppStore.oAttack) {
                if (who == WHO.PLAYER) {
                    await discardAllHandCards(WHO.OPP, scene);
                } else {
                    await discardAllHandCards(WHO.PLAYER, scene);
                }
            } else {
                await animateMisfireFailurePopup(scene, who == WHO.PLAYER, isXeff)
            }
        }
    },
    { // Discard all Cards in own Hand. Own Attack Power is doubled
        id: "202",
        effect: async (who, scene, isXeff) => {
            const playerStore = usePlayerStore();
            const oppStore = useOpponentStore();

            if (who == WHO.PLAYER) {
                await discardAllHandCards(WHO.PLAYER, scene);
                // attack doubled
                await Promise.all([
                    addPCPower(playerStore.pActiveMon.cPow, scene),
                    addPTPower(playerStore.pActiveMon.tPow, scene),
                    addPXPower(playerStore.pActiveMon.xPow, scene),
                ])
            } else {
                await discardAllHandCards(WHO.OPP, scene);
                // attack doubled
                await Promise.all([
                    addOCPower(oppStore.oActiveMon.cPow, scene),
                    addOTPower(oppStore.oActiveMon.tPow, scene),
                    addOXPower(oppStore.oActiveMon.xPow, scene),
                ])
            }
        }
    },
    { // Both players' Attack Power becomes 0
        id: "203",
        effect: async (who, scene, isXeff) => {
            await Promise.all([
                executeCTo0(WHO.PLAYER, scene),
                executeTTo0(WHO.PLAYER, scene),
                executeXTo0(WHO.PLAYER, scene),
            ])
            await Promise.all([
                executeCTo0(WHO.OPP, scene),
                executeTTo0(WHO.OPP, scene),
                executeXTo0(WHO.OPP, scene),
            ])
        }
    },
    { // Attack first. Boost own Attack Power +100
        id: "204",
        effect: async (who, scene, isXeff) => {
            const addPower = 100;

            execute1stAttack(who, scene);
            if (who == WHO.PLAYER) {
                // boost attack
                await addAllPPower(addPower, scene);
            } else {
                // boost attack
                await addAllOPower(addPower, scene);
            }
        }
    },
    { // Own attack becomes \"Eat-up HP.\""
        id: "205",
        effect: async (who, scene, isXeff) => {
            const playerStore = usePlayerStore();
            const oppStore = useOpponentStore();
            if (who == WHO.PLAYER) {
                playerStore.setEatUpHp(true);
            } else {
                oppStore.setEatUpHp(true);
            }
            await animateBattleStatusPopup(scene, false, "Eat-Up HP");
        }
    },
    { // If own Specialty is Fire, boost own Attack Power +100, recover HP +200
        id: "206",
        effect: async (who, scene, isXeff) => {
            const playerStore = usePlayerStore();
            const oppStore = useOpponentStore();
            const addPower = 100;
            const addHp = 200;

            if (who == WHO.PLAYER && playerStore.pActiveMon.specialty == SPECIALTY.FIRE) {
                await addAllPPower(addPower, scene);
                await addPHp(addHp, scene);
            } else if (who == WHO.OPP && oppStore.oActiveMon.specialty == SPECIALTY.FIRE) {
                await addAllOPower(addPower, scene);
                await addOHp(addHp, scene);
            }
            else {
                await animateMisfireFailurePopup(scene, who == WHO.PLAYER, isXeff)
            }
        }
    },
    { // If own Specialty is Ice, boost own Attack Power +100, recover HP +200
        id: "207",
        effect: async (who, scene, isXeff) => {
            const playerStore = usePlayerStore();
            const oppStore = useOpponentStore();
            const addPower = 100;
            const addHp = 200;

            if (who == WHO.PLAYER && playerStore.pActiveMon.specialty == SPECIALTY.ICE) {
                await addAllPPower(addPower, scene);
                await addPHp(addHp, scene);
            } else if (who == WHO.OPP && oppStore.oActiveMon.specialty == SPECIALTY.ICE) {
                await addAllOPower(addPower, scene);
                await addOHp(addHp, scene);
            }
            else {
                await animateMisfireFailurePopup(scene, who == WHO.PLAYER, isXeff)
            }
        }
    },
    { // If own Specialty is Nature, boost own Attack Power +100, recover HP +200
        id: "208",
        effect: async (who, scene, isXeff) => {
            const playerStore = usePlayerStore();
            const oppStore = useOpponentStore();
            const addPower = 100;
            const addHp = 200;

            if (who == WHO.PLAYER && playerStore.pActiveMon.specialty == SPECIALTY.NATURE) {
                await addAllPPower(addPower, scene);
                await addPHp(addHp, scene);
            } else if (who == WHO.OPP && oppStore.oActiveMon.specialty == SPECIALTY.NATURE) {
                await addAllOPower(addPower, scene);
                await addOHp(addHp, scene);
            }
            else {
                await animateMisfireFailurePopup(scene, who == WHO.PLAYER, isXeff)
            }
        }
    },
    { // If own Specialty is Darkness, boost own Attack Power +100, recover HP +200
        id: "209",
        effect: async (who, scene, isXeff) => {
            const playerStore = usePlayerStore();
            const oppStore = useOpponentStore();
            const addPower = 100;
            const addHp = 200;

            if (who == WHO.PLAYER && playerStore.pActiveMon.specialty == SPECIALTY.DARKNESS) {
                await addAllPPower(addPower, scene);
                await addPHp(addHp, scene);
            } else if (who == WHO.OPP && oppStore.oActiveMon.specialty == SPECIALTY.DARKNESS) {
                await addAllOPower(addPower, scene);
                await addOHp(addHp, scene);
            }
            else {
                await animateMisfireFailurePopup(scene, who == WHO.PLAYER, isXeff)
            }
        }
    },
    { // If own Specialty is Rare, boost own Attack Power +100, recover HP +200
        id: "210",
        effect: async (who, scene, isXeff) => {
            const playerStore = usePlayerStore();
            const oppStore = useOpponentStore();
            const addPower = 100;
            const addHp = 200;

            if (who == WHO.PLAYER && playerStore.pActiveMon.specialty == SPECIALTY.RARE) {
                await addAllPPower(addPower, scene);
                await addPHp(addHp, scene);
            } else if (who == WHO.OPP && oppStore.oActiveMon.specialty == SPECIALTY.RARE) {
                await addAllOPower(addPower, scene);
                await addOHp(addHp, scene);
            }
            else {
                await animateMisfireFailurePopup(scene, who == WHO.PLAYER, isXeff)
            }
        }
    },
    { // If Specialties are same, boost own Attack Power +200, recover HP +400
        id: "211",
        effect: async (who, scene, isXeff) => {
            const playerStore = usePlayerStore();
            const oppStore = useOpponentStore();
            const addPower = 200;
            const addHp = 400;

            if (playerStore.pActiveMon.specialty == oppStore.oActiveMon.specialty) {
                if (who == WHO.PLAYER) {
                    await addAllPPower(addPower, scene);
                    await addPHp(addHp, scene);
                } else if (who == WHO.OPP) {
                    await addAllOPower(addPower, scene);
                    await addOHp(addHp, scene);
                }
            }
                else {
                await animateMisfireFailurePopup(scene, who == WHO.PLAYER, isXeff)
            }
        }
    },
    { // Discard 7 Cards from both players' Online Decks
        id: "212",
        effect: async (who, scene, isXeff) => {
            // discard 7 cards
            const discardCount = 7;
            await setDeckCardToOffline(WHO.PLAYER, scene, discardCount);
            await setDeckCardToOffline(WHO.OPP, scene, discardCount);
        }
    },
    { // If both Attacks are same, discard 7 Cards from foe's Online Deck
        id: "213",
        effect: async (who, scene, isXeff) => {
            const playerStore = usePlayerStore();
            const oppStore = useOpponentStore();
            const discardCount = 7;

            if (playerStore.pAttack == oppStore.oAttack) {
                if (who == WHO.PLAYER) {
                    await setDeckCardToOffline(WHO.OPP, scene, discardCount);
                } else {
                    await setDeckCardToOffline(WHO.PLAYER, scene, discardCount);
                }
            } else {
                await animateMisfireFailurePopup(scene, who == WHO.PLAYER, isXeff)
            }
        }
    },
    { // Discard 1 Card in own DP Slot. Discard all foe's Cards in DP Slot
        id: "214",
        effect: async (who, scene, isXeff) => {            
            if (who == WHO.PLAYER) {
                await setPlayerDpToOffline(scene, 1);
                await setOppDpToOffline(scene, useOpponentStore().oDpCount);
            } else {
                await setOppDpToOffline(scene, 1);
                await setPlayerDpToOffline(scene, usePlayerStore().pDpCount);
            }
        }
    },
    { // Both players' attacks become {{button|c}}. Boost own {{button|c}} Attack Power +100
        id: "215",
        effect: async (who, scene, isXeff) => {
            const playerStore = usePlayerStore();
            const oppStore = useOpponentStore();
            const addPower = 100;

            playerStore.setPAttack(ATTACK.C)
            changeAttackChoiceDisplay(who, playerStore.pAttack)
            oppStore.setOAttack(ATTACK.C)
            changeAttackChoiceDisplay(who, oppStore.oAttack)

            if (who == WHO.PLAYER) {
                await addPCPower(addPower, scene);
            } else if (who == WHO.OPP) {
                await addOCPower(addPower, scene);
            }
        },
    },
    { // Changes opponent's Specialty to Fire. Draw 1 Card from own Online Deck
        id: "216",
        effect: async (who, scene, isXeff) => {
            const playerStore = usePlayerStore();
            const oppStore = useOpponentStore();
            const drawCount = 1;

            // change opponent's Specialty to Fire
            // set gradient color
            const colorTopRgb = `vec3(${hexToRgb(COLOR_CODE.FIRE_TOP).join(",")})`;
            const colorBottomRgb = `vec3(${hexToRgb(COLOR_CODE.FIRE_BOTTOM).join(",")})`;
            const fShader = fragmentShader
                .replace("##COLOR_TOP", colorTopRgb)
                .replace("##COLOR_BOTTOM", colorBottomRgb);

            // Change color
            if (who == WHO.PLAYER) {
                await animateBattleStatusPopup(scene, false, "Change Specialty");
                await animateSpecialtyChange(WHO.OPP);
                oppStore.oActiveMon.specialty = SPECIALTY.FIRE;
                const card = scene.getObjectByName(`${CARD_NAME.OPP}${oppStore.oActiveMon.id}`)
                card.material.fragmentShader = fShader;
                card.material.needsUpdate = true;
            } else {
                await animateBattleStatusPopup(scene, true, "Change Specialty");
                await animateSpecialtyChange(WHO.PLAYER);
                playerStore.pActiveMon.specialty = SPECIALTY.FIRE;
                const card = scene.getObjectByName(`${CARD_NAME.PLAYER}${playerStore.pActiveMon.id}`)
                card.material.fragmentShader = fShader;
                card.material.needsUpdate = true;
            }
            // draw
            await drawDeckCardToHand(who, scene, drawCount);
        }
    },
    { // Changes opponent's Specialty to Ice. Draw 1 Card from own Online Deck
        id: "217",
        effect: async (who, scene, isXeff) => {
            const playerStore = usePlayerStore();
            const oppStore = useOpponentStore();
            const drawCount = 1;

            // change opponent's Specialty to Ice
            // set gradient color
            const colorTopRgb = `vec3(${hexToRgb(COLOR_CODE.ICE_TOP).join(",")})`;
            const colorBottomRgb = `vec3(${hexToRgb(COLOR_CODE.ICE_BOTTOM).join(",")})`;
            const fShader = fragmentShader
                .replace("##COLOR_TOP", colorTopRgb)
                .replace("##COLOR_BOTTOM", colorBottomRgb);

            // Change color
            if (who == WHO.PLAYER) {
                await animateBattleStatusPopup(scene, false, "Change Specialty");
                await animateSpecialtyChange(WHO.OPP);
                oppStore.oActiveMon.specialty = SPECIALTY.ICE;
                const card = scene.getObjectByName(`${CARD_NAME.OPP}${oppStore.oActiveMon.id}`)
                card.material.fragmentShader = fShader;
                card.material.needsUpdate = true;
            } else {
                await animateBattleStatusPopup(scene, true, "Change Specialty");
                await animateSpecialtyChange(WHO.PLAYER);
                playerStore.pActiveMon.specialty = SPECIALTY.ICE;
                const card = scene.getObjectByName(`${CARD_NAME.PLAYER}${playerStore.pActiveMon.id}`)
                card.material.fragmentShader = fShader;
                card.material.needsUpdate = true;
            }
            // draw
            await drawDeckCardToHand(who, scene, drawCount);
        }
    },
    { // Changes opponent's Specialty to Nature. Draw 1 Card from own Online Deck
        id: "218",
        effect: async (who, scene, isXeff) => {
            const playerStore = usePlayerStore();
            const oppStore = useOpponentStore();
            const drawCount = 1;

            // change opponent's Specialty to Nature
            // set gradient color
            const colorTopRgb = `vec3(${hexToRgb(COLOR_CODE.NATURE_TOP).join(",")})`;
            const colorBottomRgb = `vec3(${hexToRgb(COLOR_CODE.NATURE_BOTTOM).join(",")})`;
            const fShader = fragmentShader
                .replace("##COLOR_TOP", colorTopRgb)
                .replace("##COLOR_BOTTOM", colorBottomRgb);

            // Change color
            if (who == WHO.PLAYER) {
                await animateBattleStatusPopup(scene, false, "Change Specialty");
                await animateSpecialtyChange(WHO.OPP);
                oppStore.oActiveMon.specialty = SPECIALTY.NATURE;
                const card = scene.getObjectByName(`${CARD_NAME.OPP}${oppStore.oActiveMon.id}`)
                card.material.fragmentShader = fShader;
                card.material.needsUpdate = true;
            } else {
                await animateBattleStatusPopup(scene, true, "Change Specialty");
                await animateSpecialtyChange(WHO.PLAYER);
                playerStore.pActiveMon.specialty = SPECIALTY.NATURE;
                const card = scene.getObjectByName(`${CARD_NAME.PLAYER}${playerStore.pActiveMon.id}`)
                card.material.fragmentShader = fShader;
                card.material.needsUpdate = true;
            }
            // draw
            await drawDeckCardToHand(who, scene, drawCount);
        }
    },
    { // Changes opponent's Specialty to Darkness. Draw 1 Card from own Online Deck
        id: "219",
        execute: async (who, scene, isXeff) => {
            const playerStore = usePlayerStore();
            const oppStore = useOpponentStore();
            const drawCount = 1;

            // change opponent's Specialty to Darkness
            // set gradient color
            const colorTopRgb = `vec3(${hexToRgb(COLOR_CODE.DARKNESS_TOP).join(",")})`;
            const colorBottomRgb = `vec3(${hexToRgb(COLOR_CODE.DARKNESS_BOTTOM).join(",")})`;
            const fShader = fragmentShader
                .replace("##COLOR_TOP", colorTopRgb)
                .replace("##COLOR_BOTTOM", colorBottomRgb);

            // Change color
            if (who == WHO.PLAYER) {
                await animateBattleStatusPopup(scene, false, "Change Specialty");
                await animateSpecialtyChange(WHO.OPP);
                oppStore.oActiveMon.specialty = SPECIALTY.DARKNESS;
                const card = scene.getObjectByName(`${CARD_NAME.OPP}${oppStore.oActiveMon.id}`)
                card.material.fragmentShader = fShader;
                card.material.needsUpdate = true;
            } else {
                await animateBattleStatusPopup(scene, true, "Change Specialty");
                await animateSpecialtyChange(WHO.PLAYER);
                playerStore.pActiveMon.specialty = SPECIALTY.DARKNESS;
                const card = scene.getObjectByName(`${CARD_NAME.PLAYER}${playerStore.pActiveMon.id}`)
                card.material.fragmentShader = fShader;
                card.material.needsUpdate = true;
            }
            // draw
            await drawDeckCardToHand(who, scene, drawCount);
        }
    },
    { // Changes opponent's Specialty to Rare. Draw 1 Card from own Online Deck
        id: "220",
        effect: async (who, scene, isXeff) => {
            const playerStore = usePlayerStore();
            const oppStore = useOpponentStore();
            const drawCount = 1;

            // change opponent's Specialty to Rare
            // set gradient color
            const colorTopRgb = `vec3(${hexToRgb(COLOR_CODE.RARE_TOP).join(",")})`;
            const colorBottomRgb = `vec3(${hexToRgb(COLOR_CODE.RARE_BOTTOM).join(",")})`;
            const fShader = fragmentShader
                .replace("##COLOR_TOP", colorTopRgb)
                .replace("##COLOR_BOTTOM", colorBottomRgb);

            // Change color
            if (who == WHO.PLAYER) {
                await animateBattleStatusPopup(scene, false, "Change Specialty");
                await animateSpecialtyChange(WHO.OPP);
                oppStore.oActiveMon.specialty = SPECIALTY.RARE;
                const card = scene.getObjectByName(`${CARD_NAME.OPP}${oppStore.oActiveMon.id}`)
                card.material.fragmentShader = fShader;
                card.material.needsUpdate = true;
            } else {
                await animateBattleStatusPopup(scene, true, "Change Specialty");
                await animateSpecialtyChange(WHO.PLAYER);
                playerStore.pActiveMon.specialty = SPECIALTY.RARE;
                const card = scene.getObjectByName(`${CARD_NAME.PLAYER}${playerStore.pActiveMon.id}`)
                card.material.fragmentShader = fShader;
                card.material.needsUpdate = true;
            }
            // draw
            await drawDeckCardToHand(who, scene, drawCount);
        }
    },
    { // If own HP are less than foe's HP, recover own HP by +700
        id: "221",
        effect: async (who, scene, isXeff) => {
            const playerStore = usePlayerStore();
            const oppStore = useOpponentStore();
            const addHp = 700;

            if (who == WHO.PLAYER && playerStore.pActiveMon.hp < oppStore.oActiveMon.hp) {
                await addPHp(addHp, scene);
            } else if (who == WHO.OPP && oppStore.oActiveMon.hp < playerStore.pActiveMon.hp) {
                await addOHp(addHp, scene);
            }
            else {
                await animateMisfireFailurePopup(scene, who == WHO.PLAYER, isXeff)
            }
        }
    },
    { // Opponent's {{button|c}} Attack Power goes to 0. Recover own HP by +100
        id: "222",
        effect: async (who, scene, isXeff) => {
            const addHp = 100;
            await executeCTo0(who, scene)

            if (who == WHO.PLAYER) {
                await addPHp(addHp, scene);
            } else {
                await addOHp(addHp, scene);
            }
        }
    },
    { // Opponent's {{button|t}} Attack Power goes to 0. Recover own HP by +100
        id: "223",
        effect: async (who, scene, isXeff) => {
            const addHp = 100;
            await executeTTo0(who, scene)

            if (who == WHO.PLAYER) {
                await addPHp(addHp, scene);
            } else {
                await addOHp(addHp, scene);
            }
        }
    },
    { // Opponent's {{button|x}} Attack Power goes to 0. Recover own HP by +100
        id: "224",
        effect: async (who, scene, isXeff) => {
            const addHp = 100;
            await executeXTo0(who, scene)

            if (who == WHO.PLAYER) {
                await addPHp(addHp, scene);
            } else {
                await addOHp(addHp, scene);
            }
        }
    },
    { // Opponent discards 2 Cards from his Online Deck and 1 Card from Hand
        id: "225",
        effect: async (who, scene, isXeff) => {
            const discardCount = 2;
            if (who == WHO.PLAYER) {
                // discard 2 cards
                await setDeckCardToOffline(WHO.OPP, scene, discardCount);
                
                // discard 1 hand card
                const oppStore = useOpponentStore()
                const handCards = oppStore.oHand.filter(el => {
                    if (el) return el
                })
                const cardId = handCards[Math.floor(Math.random() * 100) % handCards.length]
                console.log("handCards", handCards)
                console.log("cardId", cardId)
                await discardHandCardsGivenId(WHO.OPP, scene, cardId)
            } else {
                // discard 2 cards
                await setDeckCardToOffline(WHO.PLAYER, scene, discardCount);
                
                // discard 1 hand card
                const playerStore = usePlayerStore()
                const handCards = playerStore.pHand.filter(el => {
                    if (el) return el
                })
                const cardId = handCards[Math.floor(Math.random() * 100) % handCards.length]
                await discardHandCardsGivenId(WHO.PLAYER, scene, cardId)
            }
        }
    },
    { // Own Attack Power becomes 0. Opponent's HP are halved
        id: "226",
        effect: async (who, scene, isXeff) => {
            const playerStore = usePlayerStore();
            const oppStore = useOpponentStore();

            if (who == WHO.PLAYER) {
                await Promise.all([
                    executeCTo0(WHO.OPP, scene),
                    executeTTo0(WHO.OPP, scene),
                    executeXTo0(WHO.OPP, scene),
                ])
                await addOHp(Math.round(parseInt(-oppStore.oActiveMon.hp) / 2), scene);
            } else if (who == WHO.OPP) {
                await Promise.all([
                    executeCTo0(WHO.PLAYER, scene),
                    executeTTo0(WHO.PLAYER, scene),
                    executeXTo0(WHO.PLAYER, scene),
                ])
                await addPHp(Math.round(parseInt(-playerStore.pActiveMon.hp) / 2), scene);
            }
        }
    },
    { // Make own HP 10. Own Attack Power is tripled
        id: "227",
        effect: async (who, scene, isXeff) => {
            const playerStore = usePlayerStore();
            const oppStore = useOpponentStore();

            if (who == WHO.PLAYER) {
                await addPHp(10 - parseInt(playerStore.pActiveMon.hp), scene);
                await Promise.all([
                    addPCPower(playerStore.pActiveMon.cPow * 2, scene),
                    addPTPower(playerStore.pActiveMon.tPow * 2, scene),
                    addPXPower(playerStore.pActiveMon.xPow * 2, scene),
                ])
            } else {
                await addOHp(10 - parseInt(oppStore.oActiveMon.hp), scene);
                await Promise.all([
                    addOCPower(oppStore.oActiveMon.cPow * 2, scene),
                    addOTPower(oppStore.oActiveMon.tPow * 2, scene),
                    addOXPower(oppStore.oActiveMon.xPow * 2, scene),
                ])
            }
        }
    },
    { // Discard own Hand. Multiply own Attack Power by number of discarded Cards
        id: "228",
        effect: async (who, scene, isXeff) => {
            if (who == WHO.PLAYER) {
                const playerStore = usePlayerStore();
                const discardCount = playerStore.pHandCount
                if (discardCount > 0) {
                    await discardAllHandCards(WHO.PLAYER, scene);
                    await Promise.all([
                        addPCPower(playerStore.pActiveMon.cPow * (discardCount - 1), scene),
                        addPTPower(playerStore.pActiveMon.tPow * (discardCount - 1), scene),
                        addPXPower(playerStore.pActiveMon.xPow * (discardCount - 1), scene),
                    ])
                }
            } else {
                const oppStore = useOpponentStore();
                const discardCount = oppStore.oHandCount
                if (discardCount > 0) {
                    await discardAllHandCards(WHO.OPP, scene);
                    await Promise.all([
                        addOCPower(oppStore.oActiveMon.cPow * (discardCount - 1), scene),
                        addOTPower(oppStore.oActiveMon.tPow * (discardCount - 1), scene),
                        addOXPower(oppStore.oActiveMon.xPow * (discardCount - 1), scene),
                    ])
                }
            }
        },
    },
    { // Discard own DP Slot Cards. Multiply own Attack Power by number of discards
        id: "229",
        effect: async (who, scene, isXeff) => {
            if (who == WHO.PLAYER) {
                const playerStore = usePlayerStore();
                const discardCount = playerStore.pDpCount;
                if (discardCount > 0) {
                    await setPlayerDpToOffline(scene, discardCount);
                    await Promise.all([
                        addPCPower(playerStore.pActiveMon.cPow * (discardCount - 1), scene),
                        addPTPower(playerStore.pActiveMon.tPow * (discardCount - 1), scene),
                        addPXPower(playerStore.pActiveMon.xPow * (discardCount - 1), scene),
                    ])
                }
            } else {
                const oppStore = useOpponentStore();
                const discardCount = oppStore.oDpCount;
                if (discardCount > 0) {
                    await setOppDpToOffline(scene, discardCount);
                    await Promise.all([
                        addOCPower(oppStore.oActiveMon.cPow * (discardCount - 1), scene),
                        addOTPower(oppStore.oActiveMon.tPow * (discardCount - 1), scene),
                        addOXPower(oppStore.oActiveMon.xPow * (discardCount - 1), scene),
                    ])
                }
            }
        }
    },
    { // Own Attack Power matches own HP, then own HP are halved
        id: "230",
        effect: async (who, scene, isXeff) => {
            if (who == WHO.PLAYER) {
                const playerStore = usePlayerStore();
                const hp = playerStore.pActiveMon.hp;
                await Promise.all([
                    addPCPower(hp - playerStore.pActiveMon.cPow, scene),
                    addPTPower(hp - playerStore.pActiveMon.tPow, scene),
                    addPXPower(hp - playerStore.pActiveMon.xPow, scene),
                ])
                await addPHp(Math.round(parseInt(-playerStore.pActiveMon.hp) / 2), scene);
            } else {
                const oppStore = useOpponentStore();
                const hp = oppStore.oActiveMon.hp;
                await Promise.all([
                    addOCPower(hp - oppStore.oActiveMon.cPow, scene),
                    addOTPower(hp - oppStore.oActiveMon.tPow, scene),
                    addOXPower(hp - oppStore.oActiveMon.xPow, scene),
                ])
                await addOHp(Math.round(parseInt(-oppStore.oActiveMon.hp) / 2), scene);
            }
        }
    },
    { // If own Level is R, boost own Attack Power +400
        id: "231",
        effect: async (who, scene, isXeff) => {
            const playerStore = usePlayerStore();
            const oppStore = useOpponentStore();
            const addPower = 400;

            if (who == WHO.PLAYER && playerStore.pActiveMon.level == LEVEL.R) {
                await addAllPPower(addPower, scene);
            } else if (who == WHO.OPP && oppStore.oActiveMon.level == LEVEL.R) {
                await addAllOPower(addPower, scene);
            } else {
                await animateMisfireFailurePopup(scene, who == WHO.PLAYER, isXeff)
            }
        }
    },
    { // If own Level is C, boost own Attack Power +400
        id: "232",
        effect: async (who, scene, isXeff) => {
            const playerStore = usePlayerStore();
            const oppStore = useOpponentStore();
            const addPower = 400;

            if (who == WHO.PLAYER && playerStore.pActiveMon.level == LEVEL.C) {
                await addAllPPower(addPower, scene);
            } else if (who == WHO.OPP && oppStore.oActiveMon.level == LEVEL.C) {
                await addAllOPower(addPower, scene);
            } else {
                await animateMisfireFailurePopup(scene, who == WHO.PLAYER, isXeff)
            }
        }
    },
    { // If own Level is U, boost own Attack Power +400
        id: "233",
        effect: async (who, scene, isXeff) => {
            const playerStore = usePlayerStore();
            const oppStore = useOpponentStore();
            const addPower = 400;

            if (who == WHO.PLAYER && playerStore.pActiveMon.level == LEVEL.U) {
                await addAllPPower(addPower, scene);
            } else if (who == WHO.OPP && oppStore.oActiveMon.level == LEVEL.U) {
                await addAllOPower(addPower, scene);
            } else {
                await animateMisfireFailurePopup(scene, who == WHO.PLAYER, isXeff)
            }
        }
    },
    { // If opponent is Level A, his Atk Pwr becomes 0 and own Atk Pwr is doubled
        id: "234",
        effect: async (who, scene, isXeff) => {
            const playerStore = usePlayerStore();
            const oppStore = useOpponentStore();

            if (who == WHO.PLAYER && oppStore.oActiveMon.level == LEVEL.A) {
                await Promise.all([
                    executeCTo0(who, scene),
                    executeTTo0(who, scene),
                    executeXTo0(who, scene),
                ])
                await Promise.all([
                    addPCPower(playerStore.pActiveMon.cPow, scene),
                    addPTPower(playerStore.pActiveMon.tPow, scene),
                    addPXPower(playerStore.pActiveMon.xPow, scene),
                ])
            } else if (who == WHO.OPP && playerStore.pActiveMon.level == LEVEL.A) {
                await Promise.all([
                    executeCTo0(who, scene),
                    executeTTo0(who, scene),
                    executeXTo0(who, scene),
                ])
                await Promise.all([
                    addOCPower(oppStore.oActiveMon.cPow, scene),
                    addOTPower(oppStore.oActiveMon.tPow, scene),
                    addOXPower(oppStore.oActiveMon.xPow, scene),
                ])
            } else {
                await animateMisfireFailurePopup(scene, who == WHO.PLAYER, isXeff)
            }
        }
    },
    { // If opponent is Level U, his Atk Pwr becomes 0 and own Atk Pwr is doubled
        id: "235",
        effect: async (who, scene, isXeff) => {
            const playerStore = usePlayerStore();
            const oppStore = useOpponentStore();

            if (who == WHO.PLAYER && oppStore.oActiveMon.level == LEVEL.U) {
                await Promise.all([
                    executeCTo0(who, scene),
                    executeTTo0(who, scene),
                    executeXTo0(who, scene),
                ])
                await Promise.all([
                    addPCPower(playerStore.pActiveMon.cPow, scene),
                    addPTPower(playerStore.pActiveMon.tPow, scene),
                    addPXPower(playerStore.pActiveMon.xPow, scene),
                ])
            } else if (who == WHO.OPP && playerStore.pActiveMon.level == LEVEL.U) {
                await Promise.all([
                    executeCTo0(who, scene),
                    executeTTo0(who, scene),
                    executeXTo0(who, scene),
                ])
                await Promise.all([
                    addOCPower(oppStore.oActiveMon.cPow, scene),
                    addOTPower(oppStore.oActiveMon.tPow, scene),
                    addOXPower(oppStore.oActiveMon.xPow, scene),
                ])
            } else {
                await animateMisfireFailurePopup(scene, who == WHO.PLAYER, isXeff)
            }
        }
    },
    { // If foe's Specialty is Fire or Ice, his Attack Power goes to 0
        id: "236",
        effect: async (who, scene, isXeff) => {
            const playerStore = usePlayerStore();
            const oppStore = useOpponentStore();

            if (who == WHO.PLAYER && (oppStore.oActiveMon.specialty == SPECIALTY.FIRE || oppStore.oActiveMon.specialty == SPECIALTY.ICE)) {
                await Promise.all([
                    executeCTo0(who, scene),
                    executeTTo0(who, scene),
                    executeXTo0(who, scene),
                ])
            } else if (who == WHO.OPP && playerStore.pActiveMon.level == LEVEL.U) {
                await Promise.all([
                    executeCTo0(who, scene),
                    executeTTo0(who, scene),
                    executeXTo0(who, scene),
                ])
            } else {
                await animateMisfireFailurePopup(scene, who == WHO.PLAYER, isXeff)
            }
        }
    },
    { // If foe's Specialty is Nature or Darkness, his Attack Power goes to 0
        id: "237",
        effect: async (who, scene, isXeff) => {
            const playerStore = usePlayerStore();
            const oppStore = useOpponentStore();

            if (who == WHO.PLAYER && (oppStore.oActiveMon.specialty == SPECIALTY.NATURE || oppStore.oActiveMon.specialty == SPECIALTY.DARKNESS)) {
                await Promise.all([
                    executeCTo0(who, scene),
                    executeTTo0(who, scene),
                    executeXTo0(who, scene),
                ])
            } else if (who == WHO.OPP && playerStore.pActiveMon.level == LEVEL.U) {
                await Promise.all([
                    executeCTo0(who, scene),
                    executeTTo0(who, scene),
                    executeXTo0(who, scene),
                ])
            } else {
                await animateMisfireFailurePopup(scene, who == WHO.PLAYER, isXeff)
            }
        }
    },
    { // Changes both players' Specialties to Rare
        id: "238",
        effect: async (who, scene, isXeff) => {
            // set gradient color
            const colorTopRgb = `vec3(${hexToRgb(COLOR_CODE.RARE_TOP).join(",")})`;
            const colorBottomRgb = `vec3(${hexToRgb(COLOR_CODE.RARE_BOTTOM).join(",")})`;
            const fShader = fragmentShader
                .replace("##COLOR_TOP", colorTopRgb)
                .replace("##COLOR_BOTTOM", colorBottomRgb);

            await animateBattleStatusPopup(scene, true, "Change Specialty");
            await animateSpecialtyChange(WHO.PLAYER);
            const playerStore = usePlayerStore();
            playerStore.pActiveMon.specialty = SPECIALTY.RARE;
            // Change color
            const playerCard = scene.getObjectByName(`${CARD_NAME.PLAYER}${playerStore.pActiveMon.id}`)
            playerCard.material.fragmentShader = fShader;
            playerCard.material.needsUpdate = true;
            
            await animateBattleStatusPopup(scene, false, "Change Specialty");
            await animateSpecialtyChange(WHO.OPP);
            const oppStore = useOpponentStore();
            oppStore.oActiveMon.specialty = SPECIALTY.RARE;
            // Change color
            const oppCard = scene.getObjectByName(`${CARD_NAME.OPP}${oppStore.oActiveMon.id}`)
            oppCard.material.fragmentShader = fShader;
            oppCard.material.needsUpdate = true;
        }
    },
    { // KO'd Digimon revives with 1000. Battle is still lost
        id: "239",
        effect: async (who, scene, isXeff) => {
            const playerStore = usePlayerStore();
            const oppStore = useOpponentStore();
            const reviveHp = 1000;
            if (who == WHO.PLAYER) {
                playerStore.setRevive(true, reviveHp);
                await animateBattleStatusPopup(scene, true, "Revive if KO");
            } else {
                oppStore.setRevive(true, reviveHp);
                await animateBattleStatusPopup(scene, false, "Revive if KO");
            }
        }
    },
    { // If both Attacks are same, own Attack Power is tripled
        id: "240",
        effect: async (who, scene, isXeff) => {
            const playerStore = usePlayerStore();
            const oppStore = useOpponentStore();

            if (playerStore.pAttack == oppStore.oAttack) {
                if (who == WHO.PLAYER) {
                    await Promise.all([
                        addPCPower(playerStore.pActiveMon.cPow * 2, scene),
                        addPTPower(playerStore.pActiveMon.tPow * 2, scene),
                        addPXPower(playerStore.pActiveMon.xPow * 2, scene),
                    ])
                } else {
                    await Promise.all([
                        addOCPower(oppStore.oActiveMon.cPow * 2, scene),
                        addOTPower(oppStore.oActiveMon.tPow * 2, scene),
                        addOXPower(oppStore.oActiveMon.xPow * 2, scene),
                    ])
                }
            } else {
                await animateMisfireFailurePopup(scene, who == WHO.PLAYER, isXeff)
            }
        }
    },
    { // If both players use same attack, opponent's Attack Power becomes 0
        id: "241",
        effect: async (who, scene, isXeff) => {
            const playerStore = usePlayerStore();
            const oppStore = useOpponentStore();

            if (playerStore.pAttack == oppStore.oAttack) {
                if (who == WHO.PLAYER) {
                    await Promise.all([
                        executeCTo0(who, scene),
                        executeTTo0(who, scene),
                        executeXTo0(who, scene),
                    ])
                } else {
                    await Promise.all([
                        executeCTo0(who, scene),
                        executeTTo0(who, scene),
                        executeXTo0(who, scene),
                    ])
                }
            } else {
                await animateMisfireFailurePopup(scene, who == WHO.PLAYER, isXeff)
            }
        }
    },
    { // If both players use same Attack, recover own HP +700
        id: "242",
        effect: async (who, scene, isXeff) => {
            const playerStore = usePlayerStore();
            const oppStore = useOpponentStore();
            const addHp = 700;

            if (playerStore.pAttack == oppStore.oAttack) {
                if (who == WHO.PLAYER) {
                    await addPHp(addHp, scene);
                } else {
                    await addOHp(addHp, scene);
                }
            } else {
                await animateMisfireFailurePopup(scene, who == WHO.PLAYER, isXeff)
            }
        }
    },
    { // If both Attacks are different, recover own HP by +500
        id: "243",
        effect: async (who, scene, isXeff) => {
            const playerStore = usePlayerStore();
            const oppStore = useOpponentStore();
            const addHp = 500;

            if (playerStore.pAttack != oppStore.oAttack) {
                if (who == WHO.PLAYER) {
                    await addPHp(addHp, scene);
                } else {
                    await addOHp(addHp, scene);
                }
            } else {
                await animateMisfireFailurePopup(scene, who == WHO.PLAYER, isXeff)
            }
        }
    },
    { // Recover own HP by +500. Recover foe's HP by +200
        id: "244",
        effect: async (who, scene, isXeff) => {
            const addOwnHp = 500;
            const addFoeHp = 200;

            if (who == WHO.PLAYER) {
                await addPHp(addOwnHp, scene);
                await addOHp(addFoeHp, scene);
            } else {
                await addOHp(addOwnHp, scene);
                await addPHp(addFoeHp, scene);
            }
        }
    },
    { // If both attacks are different, own Attack Power is doubled
        id: "245",
        effect: async (who, scene, isXeff) => {
            const playerStore = usePlayerStore();
            const oppStore = useOpponentStore();

            if (playerStore.pAttack != oppStore.oAttack) {
                if (who == WHO.PLAYER) {
                    await Promise.all([
                        addPCPower(playerStore.pActiveMon.cPow, scene),
                        addPTPower(playerStore.pActiveMon.tPow, scene),
                        addPXPower(playerStore.pActiveMon.xPow, scene),
                    ])
                } else {
                    await Promise.all([
                        addOCPower(oppStore.oActiveMon.cPow, scene),
                        addOTPower(oppStore.oActiveMon.tPow, scene),
                        addOXPower(oppStore.oActiveMon.xPow, scene),
                    ])
                }
            } else {
                await animateMisfireFailurePopup(scene, who == WHO.PLAYER, isXeff)
            }
        }
    },
    { // Own Attack Power is halved. Recover own HP by +500
        id: "246",
        effect: async (who, scene, isXeff) => {
            const addHp = 500;

            if (who == WHO.PLAYER) {
                await Promise.all([
                    executeCToHalved(who),
                    executeTToHalved(who),
                    executeXToHalved(who),
                ])
                await addPHp(addHp, scene);
            } else if (who == WHO.OPP) {
                await Promise.all([
                    executeCToHalved(who),
                    executeTToHalved(who),
                    executeXToHalved(who),
                ])
                await addOHp(addHp, scene);
            }
        },
    },
    { // Move top 3 Cards from Offline Pile to Online Deck and shuffle
        id: "247",
        // Move the top Card from Offline Pile to Online Deck
        effect: async (who, scene, isXeff) => {
            const returnCount = 1;
            await setOfflineCardToDeck(who, scene, returnCount);
        },
    },
    { // Draw until there are 4 Cards in own Hand. Recover own HP by +100
        id: "248",
        effect: async (who, scene, isXeff) => {
            const drawCount = 4;
            const addHp = 100;

            await drawDeckCardToHand(who, scene, drawCount);
            if (who == WHO.PLAYER) {
                await addPHp(addHp, scene);
            } else {
                await addOHp(addHp, scene);
            }
        }
    },
    { // If opponent uses {{button|c}}, attack first and boost own Attack Power +500
        id: "249",
        effect: async (who, scene, isXeff) => {
            const playerStore = usePlayerStore();
            const oppStore = useOpponentStore();
            const addPower = 500;

            if (who == WHO.PLAYER && oppStore.oAttack == ATTACK.C) {
                execute1stAttack(who, scene);
                await addAllPPower(addPower, scene);
            } else if (who == WHO.OPP && playerStore.pAttack == ATTACK.C) {
                execute1stAttack(who, scene);
                await addAllOPower(addPower, scene);
            } else {
                await animateMisfireFailurePopup(scene, who == WHO.PLAYER, isXeff)
            }
        },
    },
    { // If opponent uses {{button|t}}, attack first and boost own Attack Power +500
        id: "250",
        effect: async (who, scene, isXeff) => {
            const playerStore = usePlayerStore();
            const oppStore = useOpponentStore();
            const addPower = 500;

            if (who == WHO.PLAYER && oppStore.oAttack == ATTACK.T) {
                execute1stAttack(who, scene);
                await addAllPPower(addPower, scene);
            } else if (who == WHO.OPP && playerStore.pAttack == ATTACK.T) {
                execute1stAttack(who, scene);
                await addAllOPower(addPower, scene);
            } else {
                await animateMisfireFailurePopup(scene, who == WHO.PLAYER, isXeff)
            }
        },
    },
    { // If opponent uses {{button|x}}, attack first and boost own Attack Power +500
        id: "251",
        effect: async (who, scene, isXeff) => {
            const playerStore = usePlayerStore();
            const oppStore = useOpponentStore();
            const addPower = 500;

            if (who == WHO.PLAYER && oppStore.oAttack == ATTACK.X) {
                execute1stAttack(who, scene);
                await addAllPPower(addPower, scene);
            } else if (who == WHO.OPP && playerStore.pAttack == ATTACK.X) {
                execute1stAttack(who, scene);
                await addAllOPower(addPower, scene);
            } else {
                await animateMisfireFailurePopup(scene, who == WHO.PLAYER, isXeff)
            }
        },
    },
    { // Opponent discards 2 Cards at random from his Hand
        id: "252",
        effect: async (who, scene, isXeff) => {
            if (who == WHO.PLAYER) {
                const playerStore = usePlayerStore()

                const handCards1 = playerStore.pHand.filter(el => {
                    if (el) return el
                })
                const cardId1 = handCards1[Math.floor(Math.random() * 100) % handCards1.length]
                await discardHandCardsGivenId(who, scene, cardId1)

                const handCards2 = playerStore.pHand.filter(el => {
                    if (el) return el
                })
                const cardId2 = handCards2[Math.floor(Math.random() * 100) % handCards2.length]
                await discardHandCardsGivenId(who, scene, cardId2)
            } else if (who == WHO.OPP) {
                const oppStore = useOpponentStore()

                const handCards1 = oppStore.oHand.filter(el => {
                    if (el) return el
                })
                const cardId1 = handCards1[Math.floor(Math.random() * 100) % handCards1.length]
                await discardHandCardsGivenId(who, scene, cardId1)

                const handCards2 = oppStore.oHand.filter(el => {
                    if (el) return el
                })
                const cardId2 = handCards2[Math.floor(Math.random() * 100) % handCards2.length]
                await discardHandCardsGivenId(who, scene, cardId1)
            }
        },
    },
    { // Opponent's Support and Option Effects are voided
        id: "253",
        effect: async (who, scene, isXeff) => {
            if (who == WHO.PLAYER) {
                useOpponentStore().setOSupportVoid();
            } else if (who == WHO.OPP) {
                usePlayerStore().setPSupportVoid();
            }
        },
    },
    { // If own Level is lower, switch HP with opponent
        id: "254",
        effect: async (who, scene, isXeff) => {
            const playerStore = usePlayerStore();
            const oppStore = useOpponentStore();

            if (who == WHO.PLAYER && isOwnLevelLower(who)) {
                const tempHp = playerStore.pActiveMon.hp;
                let diff = playerStore.pActiveMon.hp - oppStore.oActiveMon.hp
                await addPHp(diff > 0 ? -diff : diff, scene)
                diff = oppStore.oActiveMon.hp - tempHp;
                await addOHp(diff > 0 ? -diff : diff, scene)
            } else if (who == WHO.OPP && isOwnLevelLower(who)) {
                const tempHp = oppStore.oActiveMon.hp;
                let diff = oppStore.oActiveMon.hp - playerStore.pActiveMon.hp
                await addOHp(diff > 0 ? -diff : diff, scene)
                diff = playerStore.pActiveMon.hp - tempHp;
                await addPHp(diff > 0 ? -diff : diff, scene)
            }
        }
    },
    { // Opponent discards 4 top Cards from Online Deck
        id: "255",
        effect: async (who, scene, isXeff) => {
            const discardCount = 4;
            if (who == WHO.PLAYER) {
                await setDeckCardToOffline(WHO.OPP, scene, discardCount);
            } else {
                await setDeckCardToOffline(WHO.PLAYER, scene, discardCount);
            }
        }
    },
    { // Own Attack Power, HP, and Specialty become same as the opponent's
        id: "256",
        effect: async (who, scene, isXeff) => {
            const playerStore = usePlayerStore();
            const oppStore = useOpponentStore();

            if (who == WHO.PLAYER) {
                playerStore.pActiveMon = {
                    ...playerStore.pActiveMon,
                    cPow: oppStore.oActiveMon.cPow,
                    tPow: oppStore.oActiveMon.tPow,
                    xPow: oppStore.oActiveMon.xPow,
                    hp: oppStore.oActiveMon.hp,
                    specialty: oppStore.oActiveMon.specialty,
                }
            } else {
                oppStore.oActiveMon = {
                    ...oppStore.oActiveMon,
                    cPow: playerStore.pActiveMon.cPow,
                    tPow: playerStore.pActiveMon.tPow,
                    xPow: playerStore.pActiveMon.xPow,
                    hp: playerStore.pActiveMon.hp,
                    specialty: playerStore.pActiveMon.specialty,
                }
            }
        }
    },
    { // Pick Partner Card from own Online Deck at random and put in own Hand
        id: "257",
        effect: async (who, scene, isXeff) => {
            //  TODO
        }
    },
    { // Change own Specialty to Fire. Boost own Attack Power +200
        id: "258",
        effect: async (who, scene, isXeff) => {
            await animateBattleStatusPopup(scene, who == WHO.PLAYER, "Change Specialty");
            await animateSpecialtyChange(who);
            // set gradient color
            const colorTopRgb = `vec3(${hexToRgb(COLOR_CODE.FIRE_TOP).join(",")})`;
            const colorBottomRgb = `vec3(${hexToRgb(COLOR_CODE.FIRE_BOTTOM).join(",")})`;
            const fShader = fragmentShader
                .replace("##COLOR_TOP", colorTopRgb)
                .replace("##COLOR_BOTTOM", colorBottomRgb);
            const addPower = 200

            if (who == WHO.PLAYER) {
                const playerStore = usePlayerStore();
                playerStore.pActiveMon.specialty = SPECIALTY.FIRE;
                // Change color
                const card = scene.getObjectByName(`${CARD_NAME.PLAYER}${playerStore.pActiveMon.id}`)
                card.material.fragmentShader = fShader;
                card.material.needsUpdate = true;
                await addAllPPower(addPower, scene);
            } else {
                const oppStore = useOpponentStore();
                oppStore.oActiveMon.specialty = SPECIALTY.FIRE;
                // Change color
                const card = scene.getObjectByName(`${CARD_NAME.OPP}${oppStore.oActiveMon.id}`)
                card.material.fragmentShader = fShader;
                card.material.needsUpdate = true;
                await addAllOPower(addPower, scene);
            }
        }
    },
    { // Change own Specialty to Ice. Recover own HP by +200
        id: "259",
        effect: async (who, scene, isXeff) => {
            await animateBattleStatusPopup(scene, who == WHO.PLAYER, "Change Specialty");
            await animateSpecialtyChange(who);
            // set gradient color
            const colorTopRgb = `vec3(${hexToRgb(COLOR_CODE.ICE_TOP).join(",")})`;
            const colorBottomRgb = `vec3(${hexToRgb(COLOR_CODE.ICE_BOTTOM).join(",")})`;
            const fShader = fragmentShader
                .replace("##COLOR_TOP", colorTopRgb)
                .replace("##COLOR_BOTTOM", colorBottomRgb);
            const addHp = 200;

            if (who == WHO.PLAYER) {
                const playerStore = usePlayerStore();
                playerStore.pActiveMon.specialty = SPECIALTY.ICE;
                // Change color
                const card = scene.getObjectByName(`${CARD_NAME.PLAYER}${playerStore.pActiveMon.id}`)
                card.material.fragmentShader = fShader;
                card.material.needsUpdate = true;
                await addPHp(addHp, scene);
            } else {
                const oppStore = useOpponentStore();
                oppStore.oActiveMon.specialty = SPECIALTY.ICE;
                // Change color
                const card = scene.getObjectByName(`${CARD_NAME.OPP}${oppStore.oActiveMon.id}`)
                card.material.fragmentShader = fShader;
                card.material.needsUpdate = true;
                await addOHp(addHp, scene);
            }
        }
    },
    { // Change own Specialty to Nature. Attack first
        id: "260",
        effect: async (who, scene, isXeff) => {
            await animateBattleStatusPopup(scene, who == WHO.PLAYER, "Change Specialty");
            await animateSpecialtyChange(who);
            // set gradient color
            const colorTopRgb = `vec3(${hexToRgb(COLOR_CODE.NATURE_TOP).join(",")})`;
            const colorBottomRgb = `vec3(${hexToRgb(COLOR_CODE.NATURE_BOTTOM).join(",")})`;
            const fShader = fragmentShader
                .replace("##COLOR_TOP", colorTopRgb)
                .replace("##COLOR_BOTTOM", colorBottomRgb);

            if (who == WHO.PLAYER) {
                const playerStore = usePlayerStore();
                // Change Specialty to Nature
                playerStore.pActiveMon.specialty = SPECIALTY.NATURE;
                const card = scene.getObjectByName(`${CARD_NAME.PLAYER}${playerStore.pActiveMon.id}`)
                card.material.fragmentShader = fShader;
                card.material.needsUpdate = true;

                // attack first
                execute1stAttack(who, scene);
            } else {
                const oppStore = useOpponentStore();
                // Change Specialty to Nature
                oppStore.oActiveMon.specialty = SPECIALTY.NATURE;
                const card = scene.getObjectByName(`${CARD_NAME.OPP}${oppStore.oActiveMon.id}`)
                card.material.fragmentShader = fShader;
                card.material.needsUpdate = true;

                // attack first
                execute1stAttack(who, scene);
            }
        }
    },
    { // Change own Specialty to Darkness. Both players' HP are halved
        id: "261",
        effect: async (who, scene, isXeff) => {
            await animateBattleStatusPopup(scene, who == WHO.PLAYER, "Change Specialty");
            await animateSpecialtyChange(who);
            // set gradient color
            const colorTopRgb = `vec3(${hexToRgb(COLOR_CODE.DARKNESS_TOP).join(",")})`;
            const colorBottomRgb = `vec3(${hexToRgb(COLOR_CODE.DARKNESS_BOTTOM).join(",")})`;
            const fShader = fragmentShader
                .replace("##COLOR_TOP", colorTopRgb)
                .replace("##COLOR_BOTTOM", colorBottomRgb);

            if (who == WHO.PLAYER) {
                const playerStore = usePlayerStore();

                playerStore.pActiveMon.specialty = SPECIALTY.DARKNESS;
                // Change color
                const card = scene.getObjectByName(`${CARD_NAME.PLAYER}${playerStore.pActiveMon.id}`)
                card.material.fragmentShader = fShader;
                card.material.needsUpdate = true;

                // halve hp
                await addPHp(Math.round(parseInt(-playerStore.pActiveMon.hp) / 2), scene);
            } else {
                const oppStore = useOpponentStore();

                oppStore.oActiveMon.specialty = SPECIALTY.DARKNESS;
                // Change color
                const card = scene.getObjectByName(`${CARD_NAME.OPP}${oppStore.oActiveMon.id}`)
                card.material.fragmentShader = fShader;
                card.material.needsUpdate = true;

                // halve hp
                await addOHp(Math.round(parseInt(-oppStore.oActiveMon.hp) / 2), scene);
            }
        }
    },
    { // Change own Specialty to Rare. Opponent discards 1 Card at random
        id: "262",
        effect: async (who, scene, isXeff) => {
            await animateBattleStatusPopup(scene, who == WHO.PLAYER, "Change Specialty");
            await animateSpecialtyChange(who);
            // set gradient color
            const colorTopRgb = `vec3(${hexToRgb(COLOR_CODE.RARE_TOP).join(",")})`;
            const colorBottomRgb = `vec3(${hexToRgb(COLOR_CODE.RARE_BOTTOM).join(",")})`;
            const fShader = fragmentShader
                .replace("##COLOR_TOP", colorTopRgb)
                .replace("##COLOR_BOTTOM", colorBottomRgb);
            const playerStore = usePlayerStore();
            const oppStore = useOpponentStore();

            if (who == WHO.PLAYER) {
                playerStore.pActiveMon.specialty = SPECIALTY.RARE;
                // Change color
                const card = scene.getObjectByName(`${CARD_NAME.PLAYER}${playerStore.pActiveMon.id}`)
                card.material.fragmentShader = fShader;
                card.material.needsUpdate = true;

                // discard hand card    
                const handCards = oppStore.oHand.filter(el => {
                    if (el) return el
                })
                const cardId = handCards[Math.floor(Math.random() * 100) % handCards.length]
                await discardHandCardsGivenId(WHO.OPP, scene, cardId)
            } else {
                oppStore.oActiveMon.specialty = SPECIALTY.RARE;
                // Change color
                const card = scene.getObjectByName(`${CARD_NAME.OPP}${oppStore.oActiveMon.id}`)
                card.material.fragmentShader = fShader;
                card.material.needsUpdate = true;
                
                // discard hand card
                const handCards = playerStore.pHand.filter(el => {
                    if (el) return el
                })
                const cardId = handCards[Math.floor(Math.random() * 100) % handCards.length]
                await discardHandCardsGivenId(WHO.PLAYER, scene, cardId)
            }
        }
    },
    { // Opponent's attack changes from {{button|c}} to {{button|t}}, {{button|t}} to {{button|x}}, or {{button|x}} to {{button|c}}
        id: "263",
        effect: async (who, scene, isXeff) => {
            const playerStore = usePlayerStore();
            const oppStore = useOpponentStore();

            if (who == WHO.PLAYER) {
                if (oppStore.oAttack == ATTACK.C) {
                    oppStore.setOAttack(ATTACK.T)
                } else if (oppStore.oAttack == ATTACK.T) {
                    oppStore.setOAttack(ATTACK.X)
                } else if (oppStore.oAttack == ATTACK.X) {
                    oppStore.setOAttack(ATTACK.C)
                }
                changeAttackChoiceDisplay(who, oppStore.oAttack)
            } else if (who == WHO.OPP) {
                if (playerStore.pAttack == ATTACK.C) {
                    playerStore.setPAttack(ATTACK.T)
                } else if (playerStore.pAttack == ATTACK.T) {
                    playerStore.setPAttack(ATTACK.X)
                } else if (playerStore.pAttack == ATTACK.X) {
                    playerStore.setPAttack(ATTACK.C)
                }
                changeAttackChoiceDisplay(who, playerStore.pAttack)
            }
        },
    },
    { // Boost own Attack Power +300
        id: "264",
        effect: async (who, scene, isXeff) => {
            const addPower = 300;
            if (who == WHO.PLAYER) {
                await addAllPPower(addPower, scene);
            } else if (who == WHO.OPP) {
                await addAllOPower(addPower, scene);
            }
        }
    },
    { // Randomly discard 1 Card from own Hand. Opponent's Attack Power is 0
        id: "265",
        effect: async (who, scene, isXeff) => {
            if (who == WHO.PLAYER) {
                const playerStore = usePlayerStore()

                const handCards = playerStore.pHand.filter(el => {
                    if (el) return el
                })
                const cardId = handCards[Math.floor(Math.random() * 100) % handCards.length]
                await discardHandCardsGivenId(who, scene, cardId)

            } else if (who == WHO.OPP) {
                const oppStore = useOpponentStore()
                
                const handCards = oppStore.oHand.filter(el => {
                    if (el) return el
                })
                const cardId = handCards[Math.floor(Math.random() * 100) % handCards.length]
                await discardHandCardsGivenId(who, scene, cardId)
            }

            await Promise.all([
                executeCTo0(who, scene),
                executeTTo0(who, scene),
                executeXTo0(who, scene),
            ])
        }
    },
    { // Recover own HP by +300
        id: "266",
        effect: async (who, scene, isXeff) => {
            const addHp = 300;
            if (who == WHO.PLAYER) {
                await addPHp(addHp, scene);
            } else {
                await addOHp(addHp, scene);
            }
        }
    },
    { // Own {{button|c}} Attack Power is doubled
        id: "267",
        effect: async (who, scene, isXeff) => {
            const playerStore = usePlayerStore();
            const oppStore = useOpponentStore();
            if (who == WHO.PLAYER) {
                await addPCPower(playerStore.pActiveMon.cPow, scene);
            } else {
                await addOCPower(oppStore.oActiveMon.cPow, scene);
            }
        }
    },
    { // Own {{button|t}} Attack Power is doubled
        id: "268",
        effect: async (who, scene, isXeff) => {
            const playerStore = usePlayerStore();
            const oppStore = useOpponentStore();
            if (who == WHO.PLAYER) {
                await addPTPower(playerStore.pActiveMon.tPow, scene);
            } else {
                await addOTPower(oppStore.oActiveMon.tPow, scene);
            }
        }
    },
    { // Own {{button|x}} Attack Power is doubled
        id: "269",
        effect: async (who, scene, isXeff) => {
            const playerStore = usePlayerStore();
            const oppStore = useOpponentStore();
            if (who == WHO.PLAYER) {
                await addPXPower(playerStore.pActiveMon.xPow, scene);
            } else {
                await addOXPower(oppStore.oActiveMon.xPow, scene);
            }
        }
    },
    { // Opponent's {{button|c}} Attack Power is 0
        id: "270",
        effect: async (who, scene, isXeff) => {
            await executeCTo0(who, scene)
        }
    },
    { // Opponent's {{button|t}} Attack Power is 0
        id: "271",
        effect: async (who, scene, isXeff) => {
            await executeTTo0(who, scene)
        }
    },
    { // Opponent's {{button|x}} Attack Power is 0
        id: "272",
        effect: async (who, scene, isXeff) => {
            await executeXTo0(who, scene)
        }
    },
    { // Boost own Attack Power +100
        id: "273",
        effect: async (who, scene, isXeff) => {
            const addPower = 100;
            if (who == WHO.PLAYER) {
                await addAllPPower(addPower, scene);
            } else if (who == WHO.OPP) {
                await addAllOPower(addPower, scene);
            }
        }
    },
    { // Recover own HP by +100
        id: "274",
        effect: async (who, scene, isXeff) => {
            const addHp = 100;
            if (who == WHO.PLAYER) {
                await addPHp(addHp, scene);
            } else {
                await addOHp(addHp, scene);
            }
        }
    },
    { // KO'd Digimon revives with 100 HP. Battle is still lost
        id: "275",
        effect: async (who, scene, isXeff) => {
            const playerStore = usePlayerStore();
            const oppStore = useOpponentStore();
            const reviveHp = 100;
            if (who == WHO.PLAYER) {
                playerStore.setRevive(true, reviveHp);
                await animateBattleStatusPopup(scene, true, "Revive if KO");
            } else {
                oppStore.setRevive(true, reviveHp);
                await animateBattleStatusPopup(scene, false, "Revive if KO");
            }
        }
    },
    { // Draw 2 Cards from Online Deck
        id: "276",
        effect: async (who, scene, isXeff) => {
            const drawCount = 2;
            await drawDeckCardToHand(who, scene, drawCount);
        }
    },
    { // Change own Specialty to Nature
        id: "277",
        effect: async (who, scene, isXeff) => {
            await animateBattleStatusPopup(scene, who == WHO.PLAYER, "Change Specialty");
            await animateSpecialtyChange(who);
            // set gradient color
            const colorTopRgb = `vec3(${hexToRgb(COLOR_CODE.NATURE_TOP).join(",")})`;
            const colorBottomRgb = `vec3(${hexToRgb(COLOR_CODE.NATURE_BOTTOM).join(",")})`;
            const fShader = fragmentShader
                .replace("##COLOR_TOP", colorTopRgb)
                .replace("##COLOR_BOTTOM", colorBottomRgb);

            if (who == WHO.PLAYER) {
                const playerStore = usePlayerStore();
                // Change Specialty to Nature
                playerStore.pActiveMon.specialty = SPECIALTY.NATURE;
                const card = scene.getObjectByName(`${CARD_NAME.PLAYER}${playerStore.pActiveMon.id}`)
                card.material.fragmentShader = fShader;
                card.material.needsUpdate = true;
            } else {
                const oppStore = useOpponentStore();
                // Change Specialty to Nature
                oppStore.oActiveMon.specialty = SPECIALTY.NATURE;
                const card = scene.getObjectByName(`${CARD_NAME.OPP}${oppStore.oActiveMon.id}`)
                card.material.fragmentShader = fShader;
                card.material.needsUpdate = true;
            }
        }
    },
    { // Changes own Specialty to Rare
        id: "278",
        effect: async (who, scene, isXeff) => {
            await animateBattleStatusPopup(scene, who == WHO.PLAYER, "Change Specialty");
            await animateSpecialtyChange(who);
            // set gradient color
            const colorTopRgb = `vec3(${hexToRgb(COLOR_CODE.RARE_TOP).join(",")})`;
            const colorBottomRgb = `vec3(${hexToRgb(COLOR_CODE.RARE_BOTTOM).join(",")})`;
            const fShader = fragmentShader
                .replace("##COLOR_TOP", colorTopRgb)
                .replace("##COLOR_BOTTOM", colorBottomRgb);

            if (who == WHO.PLAYER) {
                const playerStore = usePlayerStore();

                playerStore.pActiveMon.specialty = SPECIALTY.RARE;
                // Change color
                const card = scene.getObjectByName(`${CARD_NAME.PLAYER}${playerStore.pActiveMon.id}`)
                card.material.fragmentShader = fShader;
                card.material.needsUpdate = true;
            } else {
                const oppStore = useOpponentStore();

                oppStore.oActiveMon.specialty = SPECIALTY.RARE;
                // Change color
                const card = scene.getObjectByName(`${CARD_NAME.OPP}${oppStore.oActiveMon.id}`)
                card.material.fragmentShader = fShader;
                card.material.needsUpdate = true;
            }
        }
    },
    { // Changes own Specialty to Fire
        id: "279",
        effect: async (who, scene, isXeff) => {
            await animateBattleStatusPopup(scene, who == WHO.PLAYER, "Change Specialty");
            await animateSpecialtyChange(who);
            // set gradient color
            const colorTopRgb = `vec3(${hexToRgb(COLOR_CODE.FIRE_TOP).join(",")})`;
            const colorBottomRgb = `vec3(${hexToRgb(COLOR_CODE.FIRE_BOTTOM).join(",")})`;
            const fShader = fragmentShader
                .replace("##COLOR_TOP", colorTopRgb)
                .replace("##COLOR_BOTTOM", colorBottomRgb);

            if (who == WHO.PLAYER) {
                const playerStore = usePlayerStore();
                playerStore.pActiveMon.specialty = SPECIALTY.FIRE;
                // Change color
                const card = scene.getObjectByName(`${CARD_NAME.PLAYER}${playerStore.pActiveMon.id}`)
                card.material.fragmentShader = fShader;
                card.material.needsUpdate = true;
            } else {
                const oppStore = useOpponentStore();
                oppStore.oActiveMon.specialty = SPECIALTY.FIRE;
                // Change color
                const card = scene.getObjectByName(`${CARD_NAME.OPP}${oppStore.oActiveMon.id}`)
                card.material.fragmentShader = fShader;
                card.material.needsUpdate = true;
            }
        }
    },
    { // Change own Specialty to Darkness
        id: "280",
        effect: async (who, scene, isXeff) => {
            await animateBattleStatusPopup(scene, who == WHO.PLAYER, "Change Specialty");
            await animateSpecialtyChange(who);
            // set gradient color
            const colorTopRgb = `vec3(${hexToRgb(COLOR_CODE.DARKNESS_TOP).join(",")})`;
            const colorBottomRgb = `vec3(${hexToRgb(COLOR_CODE.DARKNESS_BOTTOM).join(",")})`;
            const fShader = fragmentShader
                .replace("##COLOR_TOP", colorTopRgb)
                .replace("##COLOR_BOTTOM", colorBottomRgb);

            if (who == WHO.PLAYER) {
                const playerStore = usePlayerStore();
                playerStore.pActiveMon.specialty = SPECIALTY.DARKNESS;
                // Change color
                const card = scene.getObjectByName(`${CARD_NAME.PLAYER}${playerStore.pActiveMon.id}`)
                card.material.fragmentShader = fShader;
                card.material.needsUpdate = true;
            } else {
                const oppStore = useOpponentStore();
                oppStore.oActiveMon.specialty = SPECIALTY.DARKNESS;
                // Change color
                const card = scene.getObjectByName(`${CARD_NAME.OPP}${oppStore.oActiveMon.id}`)
                card.material.fragmentShader = fShader;
                card.material.needsUpdate = true;
            }
        }
    },
    { // Change own Specialty to Ice
        id: "281",
        effect: async (who, scene, isXeff) => {
            await animateBattleStatusPopup(scene, who == WHO.PLAYER, "Change Specialty");
            await animateSpecialtyChange(who);
            // set gradient color
            const colorTopRgb = `vec3(${hexToRgb(COLOR_CODE.ICE_TOP).join(",")})`;
            const colorBottomRgb = `vec3(${hexToRgb(COLOR_CODE.ICE_BOTTOM).join(",")})`;
            const fShader = fragmentShader
                .replace("##COLOR_TOP", colorTopRgb)
                .replace("##COLOR_BOTTOM", colorBottomRgb);
            const addHp = 200;

            if (who == WHO.PLAYER) {
                const playerStore = usePlayerStore();
                playerStore.pActiveMon.specialty = SPECIALTY.ICE;
                // Change color
                const card = scene.getObjectByName(`${CARD_NAME.PLAYER}${playerStore.pActiveMon.id}`)
                card.material.fragmentShader = fShader;
                card.material.needsUpdate = true;
            } else {
                const oppStore = useOpponentStore();
                oppStore.oActiveMon.specialty = SPECIALTY.ICE;
                // Change color
                const card = scene.getObjectByName(`${CARD_NAME.OPP}${oppStore.oActiveMon.id}`)
                card.material.fragmentShader = fShader;
                card.material.needsUpdate = true;
            }
        }
    },
    { // Own attack becomes {{button|c}}
        id: "282",
        effect: async (who, scene, isXeff) => {
            if (who == WHO.PLAYER) {
                const playerStore = usePlayerStore();
                playerStore.setPAttack(ATTACK.C)
                changeAttackChoiceDisplay(who, playerStore.pAttack)
            } else if (who == WHO.OPP) {
                const oppStore = useOpponentStore();
                oppStore.setOAttack(ATTACK.C)
                changeAttackChoiceDisplay(who, oppStore.oAttack)
            }
        },
    },
    { // Own attack becomes {{button|t}}
        id: "283",
        effect: async (who, scene, isXeff) => {
            if (who == WHO.PLAYER) {
                const playerStore = usePlayerStore();
                playerStore.setPAttack(ATTACK.T)
                changeAttackChoiceDisplay(who, playerStore.pAttack)
            } else if (who == WHO.OPP) {
                const oppStore = useOpponentStore();
                oppStore.setOAttack(ATTACK.T)
                changeAttackChoiceDisplay(who, oppStore.oAttack)
            }
        },
    },
    { // Own attack becomes {{button|x}}
        id: "284",
        effect: async (who, scene, isXeff) => {
            if (who == WHO.PLAYER) {
                const playerStore = usePlayerStore();
                playerStore.setPAttack(ATTACK.X)
                changeAttackChoiceDisplay(who, playerStore.pAttack)
            } else if (who == WHO.OPP) {
                const oppStore = useOpponentStore();
                oppStore.setOAttack(ATTACK.X)
                changeAttackChoiceDisplay(who, oppStore.oAttack)
            }
        },
    },
    { // Own Attack Power is tripled
        id: "285",
        effect: async (who, scene, isXeff) => {
            const playerStore = usePlayerStore();
            const oppStore = useOpponentStore();

            if (who == WHO.PLAYER) {
                await Promise.all([
                    addPCPower(playerStore.pActiveMon.cPow * 2, scene),
                    addPTPower(playerStore.pActiveMon.tPow * 2, scene),
                    addPXPower(playerStore.pActiveMon.xPow * 2, scene),
                ])
            } else {
                await Promise.all([
                    addOCPower(oppStore.oActiveMon.cPow * 2, scene),
                    addOTPower(oppStore.oActiveMon.tPow * 2, scene),
                    addOXPower(oppStore.oActiveMon.xPow * 2, scene),
                ])
            }
        }
    },
    { // Recover own HP by +1000
        id: "286",
        effect: async (who, scene, isXeff) => {
            const addHp = 1000;
            if (who == WHO.PLAYER) {
                await addPHp(addHp, scene);
            } else {
                await addOHp(addHp, scene);
            }
        }
    },
    { // If opponent's HP are lower then own, opponent's HP become 10
        id: "287",
        effect: async (who, scene, isXeff) => {
            const playerStore = usePlayerStore();
            const oppStore = useOpponentStore();

            if (who == WHO.PLAYER && oppStore.oActiveMon.hp < playerStore.pActiveMon.hp) {
                await addOHp(10 - parseInt(oppStore.oActiveMon.hp), scene);
            } else if (who == WHO.OPP && playerStore.pActiveMon.hp < oppStore.oActiveMon.hp) {
                await addPHp(10 - parseInt(playerStore.pActiveMon.hp), scene);
            }
        }
    },
    { // Own Attack Power is boosted by the number of own HP
        id: "288",
        effect: async (who, scene, isXeff) => {
            const playerStore = usePlayerStore();
            const oppStore = useOpponentStore();
            if (who == WHO.PLAYER) {
                await addAllPPower(playerStore.pActiveMon.hp, scene)
            } else {
                await addAllOPower(oppStore.oActiveMon.hp, scene)
            }
        }
    },
    { // Opponent's Support and Option Effects are voided. His Attack Power is 0
        id: "289",
        effect: async (who, scene, isXeff) => {
            if (who == WHO.PLAYER) {
                useOpponentStore().setOSupportVoid();
            } else if (who == WHO.OPP) {
                usePlayerStore().setPSupportVoid();
            }
            await Promise.all([
                executeCTo0(who, scene),
                executeTTo0(who, scene),
                executeXTo0(who, scene),
            ])
        },
    },
    { // Attack first. Own attack becomes \"Eat-up HP.\" Boost Attack Power +200
        id: "290",
        effect: async (who, scene, isXeff) => {
            const playerStore = usePlayerStore();
            const oppStore = useOpponentStore();
            const addPower = 200;

            execute1stAttack(who, scene);

            if (who == WHO.PLAYER) {
                playerStore.setEatUpHp(true);
                await animateBattleStatusPopup(scene, true, "Eat-Up HP");
                await addAllPPower(addPower, scene);
            } else {
                oppStore.setEatUpHp(true);
                await animateBattleStatusPopup(scene, true, "Eat-Up HP");
                await addAllOPower(addPower, scene);
            }
        },
    },
    { // Move top 10 Cards from Offline Pile to Online Deck, then shuffle
        id: "291",
        effect: async (who, scene, isXeff) => {
            const returnCount = 10;
            await setOfflineCardToDeck(who, scene, returnCount);
            reshuffleDeck(who, scene);
        }
    },
    { // Opponent discards his Hand and all Cards in his DP Slot
        id: "292",
        effect: async (who, scene, isXeff) => {
            const playerStore = usePlayerStore();
            const oppStore = useOpponentStore();

            if (who == WHO.PLAYER) {
                await discardAllHandCards(WHO.OPP, scene);
                await setOppDpToOffline(scene, oppStore.oDpCount);
            } else if (who == WHO.OPP) {
                await discardAllHandCards(WHO.PLAYER, scene);
                await setPlayerDpToOffline(scene, playerStore.pDpCount);
            }
        }
    },
    { // Can digivolve regardless of own Specialty, Level, or Digivolve Pts
        id: "293",
        effect: async (who, scene, isXeff) => {
            // TODO
        }
    },
    { // Digivolve a Level A Digimon to C or U. (DP are needed.)"
        id: "294",
        effect: async (who, scene, isXeff) => {
            // TODO
        }
    },
    { // Can digivolve regardless of own Specialty by adding DP +20
        id: "295",
        effect: async (who, scene, isXeff) => {
            // TODO
        }
    },
    { // Can digivolve Digimon at same Level. (Need DP) (Ignore Specialty)"
        id: "296",
        effect: async (who, scene, isXeff) => {
            // TODO
        }
    },
    { // Can digivolve from R to U. (DP are needed.)"
        id: "297",
        effect: async (who, scene, isXeff) => {
            // TODO
        }
    },
    { // Downgrade a Level A Digimon to Level R
        id: "298",
        effect: async (who, scene, isXeff) => {
            // TODO
        }
    },
    { // Can disregard DP in digivolving. (Not possible in Abnormal states)"
        id: "299",
        effect: async (who, scene, isXeff) => {
            // TODO
        }
    },
    { // DownGrade own digivolution by 1 Level. HP double when successful
        id: "300",
        effect: async (who, scene, isXeff) => {
            // TODO
        }
    }
]

const executeCcounter = async (who, scene, isXeff) => {
    const playerStore = usePlayerStore();
    const oppStore = useOpponentStore();
    if (who == WHO.PLAYER) {
        if (oppStore.oAttack == ATTACK.C) {
            // set opponent 〇 attack value to player X
            const cPow = parseInt(oppStore.oActiveMon.cPow);
            await addPXPower(cPow, scene)
            // set opponent 〇 attack value to 0
            await addOCPower(-cPow, scene);
        } else {
            await animateMisfireFailurePopup(scene, true, isXeff)
        }
    } else {
        if (playerStore.pAttack == ATTACK.C) {
            // set player 〇 attack value to opponent X
            const cPow = parseInt(playerStore.pActiveMon.cPow)
            await addOXPower(cPow, scene)
            // set player 〇 attack value to 0
            await addPCPower(-cPow, scene);
        } else {
            await animateMisfireFailurePopup(scene, false, isXeff)
        }
    }
}

const executeTcounter = async (who, scene, isXeff) => {
    const playerStore = usePlayerStore();
    const oppStore = useOpponentStore();
    if (who == WHO.PLAYER) {
        if (oppStore.oAttack == ATTACK.T) {
            // set opponent T attack value to own X
            const tPow = parseInt(oppStore.oActiveMon.tPow)
            await addPXPower(tPow, scene)
            // set opponent T attack value to 0
            await addOTPower(-tPow, scene);
        } else {
            await animateMisfireFailurePopup(scene, false, isXeff)
        }
    } else {
        if (playerStore.pAttack == ATTACK.T) {
            // set player T attack value to opponent X
            const tPow = parseInt(playerStore.pActiveMon.tPow)
            await addOXPower(tPow, scene)
            // set player T attack value to 0
            await addPTPower(-tPow, scene);
        } else {
            await animateMisfireFailurePopup(scene, false, isXeff)
        }
    }
}

const executeXcounter = async (who, scene, isXeff) => {
    const playerStore = usePlayerStore();
    const oppStore = useOpponentStore();
    if (who == WHO.PLAYER) {
        if (oppStore.oAttack == ATTACK.X) {
            // set opponent X attack value to own X
            const xPow = parseInt(oppStore.oActiveMon.xPow)
            await addPXPower(xPow, scene)
            // set opponent X attack value to 0
            await addOXPower(-xPow, scene);
        } else {
            await animateMisfireFailurePopup(scene, false, isXeff)
        }
    } else {
        if (playerStore.pAttack == ATTACK.X) {
            // set player X attack value to opponent X
            const xPow = parseInt(playerStore.pActiveMon.xPow)
            await addOXPower(xPow, scene)
            // set player X attack value to 0
            await addPXPower(-xPow, scene);
        } else {
            await animateMisfireFailurePopup(scene, false, isXeff)
        }
    }
}

const executeSpecialtyFoeX3 = async (who, scene, specialty, isXeff) => {
    const playerStore = usePlayerStore();
    const oppStore = useOpponentStore();
    if (who == WHO.PLAYER && oppStore.oActiveMon.specialty == specialty) {
        // current x 1 + current x 2 
        const xPow = parseInt(playerStore.pActiveMon.xPow)
        await addPXPower(xPow * 2, scene)
    } else if (who == WHO.OPP && playerStore.pActiveMon.specialty == specialty) {
        // current x 1 + current x 2 
        const xPow = parseInt(oppStore.oActiveMon.xPow)
        await addOXPower(xPow * 2, scene)
    } else {
        await animateMisfireFailurePopup(scene, who == WHO.PLAYER, isXeff)
    }
}

const executeCTo0 = async (who, scene) => {
    const playerStore = usePlayerStore();
    const oppStore = useOpponentStore();
    if (who == WHO.PLAYER) {
        await addOCPower(-oppStore.oActiveMon.cPow, scene);
    } else if (who == WHO.OPP) {
        await addPCPower(-playerStore.pActiveMon.cPow, scene);
    }
}

const executeTTo0 = async (who, scene) => {
    const playerStore = usePlayerStore();
    const oppStore = useOpponentStore();
    if (who == WHO.PLAYER) {
        await addOTPower(-oppStore.oActiveMon.tPow, scene);
    } else if (who == WHO.OPP) {
        await addPTPower(-playerStore.pActiveMon.tPow, scene);
    }
}

const executeXTo0 = async (who, scene) => {
    const playerStore = usePlayerStore();
    const oppStore = useOpponentStore();
    if (who == WHO.PLAYER) {
        await addOXPower(-oppStore.oActiveMon.xPow, scene);
    } else if (who == WHO.OPP) {
        await addPXPower(-playerStore.pActiveMon.xPow, scene);
    }
}

const executeCToHalved = async (who, scene) => {
    const playerStore = usePlayerStore();
    const oppStore = useOpponentStore();
    if (who == WHO.PLAYER) {
        await addOCPower(Math.round(parseInt(-oppStore.oActiveMon.cPow) / 2), scene);
    } else if (who == WHO.OPP) {
        await addPCPower(Math.round(parseInt(-playerStore.pActiveMon.cPow) / 2), scene);
    }
}

const executeTToHalved = async (who, scene) => {
    const playerStore = usePlayerStore();
    const oppStore = useOpponentStore();
    if (who == WHO.PLAYER) {
        await addPTPower(Math.round(parseInt(-oppStore.oActiveMon.cPow) / 2), scene);
    } else if (who == WHO.OPP) {
        await addOTPower(Math.round(parseInt(-playerStore.pActiveMon.cPow) / 2), scene);
    }
}

const executeXToHalved = async (who, scene) => {
    const playerStore = usePlayerStore();
    const oppStore = useOpponentStore();
    if (who == WHO.PLAYER) {
        await addOXPower(Math.round(parseInt(-oppStore.oActiveMon.xPow) / 2), scene);
    } else if (who == WHO.OPP) {
        await addPXPower(Math.round(parseInt(-playerStore.pActiveMon.xPow) / 2), scene);
    }
}

const execute1stAttack = async (who, scene) => {
    const stateStore = useStateStore();
    if (who == WHO.PLAYER) {
        stateStore.setBattleFirstAttack(WHO.PLAYER);
        await animateBattleStatusPopup(scene, true, "1st Attack");
    } else if (who == WHO.OPP) {
        stateStore.setBattleFirstAttack(WHO.OPP);
        await animateBattleStatusPopup(scene, false, "1st Attack");
    }
}

const executeCrash = async (who, scene) => {
    const playerStore = usePlayerStore();
    const oppStore = useOpponentStore();
    if (who == WHO.PLAYER) {
        await addPXPower(playerStore.pActiveMon.hp, scene)
        await addPHp(10 - playerStore.pActiveMon.hp, scene)
        await animateBattleStatusPopup(scene, true, "Self-Destruct");
    } else if (who == WHO.OPP) {
        await addOXPower(oppStore.oActiveMon.hp, scene)
        await addOHp(10 - oppStore.oActiveMon.hp, scene)
        await animateBattleStatusPopup(scene, false, "Self-Destruct");
    }
}

const isOwnLevelLower = (who) => {
    const playerStore = usePlayerStore();
    const oppStore = useOpponentStore();
    let myLvl;
    let vsLvl;

    if (who == WHO.PLAYER) {
        myLvl = playerStore.pActiveMon.level
        vsLvl = oppStore.oActiveMon.level
    } else {
        myLvl = oppStore.oActiveMon.level
        vsLvl = playerStore.pActiveMon.level
    }

    if (myLvl == LEVEL.R && vsLvl != LEVEL.R) {
        return true;
    } else if (myLvl == LEVEL.A && (vsLvl == LEVEL.C || vsLvl == LEVEL.U)) {
        return true;
    } else if (myLvl == LEVEL.C && vsLvl == LEVEL.U) {
        return true;
    } else {
        return false;
    }
}

const reshuffleDeck = (who, scene) => {
    if (who == WHO.PLAYER) {
        const playerStore = usePlayerStore();
        const shuffledIds = shuffleDeck(playerStore.pDeck)
        const posZ = 0.0;
        const dz = 0.002;
        for (let i = 0; i < shuffledIds.length; i++) {
            const cardId = shuffledIds[i];
            const z = posZ + i * dz;
            const card = scene.getObjectByName(CARD_NAME.PLAYER + cardId);
            card.position.z = z;
        }
    }
}

const changeAttackChoiceDisplay = (who, attack) => {
    if (who == WHO.ATTACK) {
        const pChoiceHtml = document.getElementById("choiceDisplayP")
        const pHtml = attackChoiceToSymbol(attack)
        pChoiceHtml.innerHTML = pHtml.symbol;
        pChoiceHtml.className = `attack-choice-display ${pHtml.class}`;
    } else {
        const oChoiceHtml = document.getElementById("choiceDisplayO")
        const oHtml = attackChoiceToSymbol(attack);
        oChoiceHtml.innerHTML = oHtml.symbol;
        oChoiceHtml.className = `attack-choice-display ${oHtml.class}`;
    }
}