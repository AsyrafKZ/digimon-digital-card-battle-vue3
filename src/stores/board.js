import { defineStore } from "pinia";
import { shallowRef } from "vue";
import { animate, createTimeline } from "animejs";
import { useGameStateStore } from "./gameState";

// rotation: Math.PI = rotate 180 degrees
// when setting scale, scale = target state scale/current state scale eg. scale = hand scale/deck scale

const playerDeck = {
    position: { x: -4.25, y: -3.07, z: 0 }, // dz = 0.002 for every stack
    rotation: { x: 0, y: Math.PI, z: Math.PI * 3/2 },
    scale: { x: 4/5, y: 4/5, z: 1 }
}

const playerHand = {
    position: { x: -2.65, y1: -2.17, y2: -2.47, z: 0, dx: 1.9 }, // dx = 1.9 for every hand card
    rotation: { x: 0, y: Math.PI * 2, z1: Math.PI * 2, z2: 0 }, // so, basically y: 0, z: 0??
    scale: { x: 8/5, y: 38/25, z: 1 }
}

const playerOffline = {
    position: { x: -4.23, y: -1.95, z: 0 }, // dZ = 0.002 for every stack
    rotation: { x: 0, y: 0, z: Math.PI * 5/2 },
    scale: { x: 4/5, y: 4/5, z: 1 }
}

const playerActive = {
    position: { x1: -1, x2: -1.25, y: -0.25, z: 0.05 }, // dZ = 0.001 for every digivolved card
    rotation: { x: 0, y: 0, z: 0 },
    scale: { x: 8/5, y: 38/25, z: 1 }
}

const playerSupport = {
    position: { x: -0.93, y1: -1, y2: -0.5, z: 0.05 },
    rotation: { x: 0, y: 0, z: 0 },
    scale: { x: 8/5, y: 38/25, z: 1 }
}

const opponentDeck = {
    position: { x: 4.2, y: 2, z: 0 }, // dz = 0.002 for every stack
    rotation: { x: 0, y: Math.PI, z: Math.PI * 3/2 },
    scale: { x: 4/5, y: 4/5, z: 1 }
}

const opponentHand = {
    position: { x: -3.1, y1: 2.2, y2: 2.5, z: 0, dx: 1.9 }, // dx = 1.9 for every hand card
    rotation: { x: 0, y: Math.PI * 2, z1: Math.PI * 2, z2: 0 }, // so, basically y: 0, z: 0??
    scale: { x: 8/5, y: 38/25, z: 1 }
}

const opponentOffline = {
    position: { x: 4.23, y: 3.09, z: 0 }, // dZ = 0.002 for every stack
    rotation: { x: 0, y: 0, z: Math.PI * 5/2 },
    scale: { x: 4/5, y: 4/5, z: 1 }
}

const opponentActive = {
    position: { x1: 1, x2: 1.35, y: -0.25, z: 0 }, // dZ = 0.001 for every digivolved card
    rotation: { x: 0, y: 0, z: 0 },
    scale: { x: 0, y: 0, z: 1 }
}

const opponentSupport = {
    position: { x: 1.06, y1: 0.56, y2: 0.06, z: 0 },
    rotation: { x: 0, y: 0, z: 0 },
    scale: { x: 8/5, y: 38/25, z: 1 }
}

export const useBoardStore = defineStore("board", {
    state: () => ({
        scene: shallowRef(null),
        playerDeckCount: 0,
        opponentDeckCount: 0,
        playerHandPos: {
            one: { x: 2.0, y: 0.9, },
            two: { x: 0, y: 0, },
            three: { x: 0, y: 0, },
            four: { x: 0, y: 0, },
            four: { x: 0, y: 0,},
        },
        playerDeck: {
            position: { x: -4.25,y: -3.07, z: 0.0 },
            rotation: { x: 0, y: Math.PI, z: Math.PI * 3 / 2},
            scale: { x: 4/5, y: 4/5, z: 1,}
        }
    }),
    getters: {
        //
    },
    actions: {
        initScene(scene) {
            this.scene = shallowRef(scene);
            console.log("scene", this.scene)
        },
        setInitCard(cardName, actorId, scene) {
            // get card
            const card = scene.getObjectByName(cardName)
            let count = 0;
            if (actorId == useGameStateStore().player.id) {
                this.playerDeckCount++
                count = this.playerDeckCount
            } else {
                this.opponentDeckCount++
                count = this.opponentDeckCount
            }
            
            // get target position
            let targetPos = actorId == "localPlayer" ? playerDeck.position : opponentDeck.position;
            let targetRotation = actorId == "localPlayer" ? playerDeck.rotation : opponentDeck.rotation;
            let targetScale = actorId == "localPlayer" ? playerDeck.scale : opponentDeck.scale;
            // console.log("actorId", actorId, "targetPos", targetPos, "targetRotation", targetRotation, "targetScale", targetScale)

            // animate
            animate(card.position, {
                x: targetPos.x,
                y: targetPos.y,
                z: targetPos.z + count * 0.002,
                duration: 0,
            });
            animate(card.rotation, {
                y: targetRotation.y,
                z: targetRotation.z,
                duration: 0,
            })
            animate(card.scale, {
                x: targetScale.x,
                y: targetScale.y,
                duration: 0,
            });
        },
        async moveCardToHand(cardName, handPos, scene) {
            // get card
            const card = scene.getObjectByName(cardName)
            // get target position
            const targetPos = useGameStateStore().isPlayerTurn ? playerHand.position : opponentHand.position;
            const targetRotation = useGameStateStore().isPlayerTurn ? playerHand.rotation : opponentHand.rotation;
            const targetScale = useGameStateStore().isPlayerTurn ? playerHand.scale : opponentHand.scale;
            
            // animate
            const tl = createTimeline({
                defaults: {
                    duration: 250,
                    easing: "cubicBezier(.5, .05, .1, .3)",
                }
            })
            tl.add(card.scale, {
                x: targetScale.x,
                y: targetScale.y,
            }, "0")
            tl.add(card.position, {
                x: targetPos.x + handPos * targetPos.dx,
                y: targetPos.y1,
            }, "0")
            tl.add(card.rotation, {
                z: targetRotation.z1, duration: 50
            }, "0")
            tl.add(card.rotation, {
                y: targetRotation.y, duration: 200
            }, "50")
            tl.add(card.position, {
                y: targetPos.y2,
                z: targetPos.z
            }, "200")
            return tl;

        },
        moveCardToDeck(cardName, scene) {
            // get card
            // const card = useGameStateStore().cardMeshes[cardUuid].value;
            const card = scene.getObjectByName(cardName)
            console.log("card", card, "uuid", cardUuid)
            // get target position
            const targetPos = playerDeck.position;
            // animate
            animate({
                targets: [card.position],
                x: targetPos.x,
                y: targetPos.y,
                z: targetPos.z,
                duration: 250,
                easing: "cubicBezier(.5, .05, .1, .3)"
            });
            animate({
                targets: [card.rotation],
                keyframes: [
                  { z: this.playerDeck.rotation.z, duration: 50 },
                  { y: this.playerDeck.rotation.y, duration: 200 },
                ],
                duration: 250,
                easing: "cubicBezier(.5, .05, .1, .3)"
            })
            animate({
                targets: [card.scale],
                x: this.playerDeck.scale.x,
                y: this.playerDeck.scale.y,
                duration: 250,
                easing: "cubicBezier(.5, .05, .1, .3)"
            });
        },
    }
})