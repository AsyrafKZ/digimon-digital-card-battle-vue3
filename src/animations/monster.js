import {animate} from "animejs";
import { usePlayerStore } from "../stores/player";
import { useStateStore } from "../stores/state";
import { CARD_NAME, WHO } from "../const/const";
import { useOpponentStore } from "../stores/opponent";


export const animateCardToHand = async function (obj, i) {
  
  // set target x position based on hand count
  const dx = 1.9;
  let x;
  let xPos;
  let yPos1;
  let yPos2;

  if (obj.name.includes(CARD_NAME.PLAYER)) {
    x = 1.6;
    xPos = obj.position.x + (x + dx * i);
    yPos1 = obj.position.y + 0.9;
    yPos2 = obj.position.y + 0.6;
  } else {
    x = -3.1
    xPos = x + dx * i;
    yPos1 = obj.position.y + 0.2;
    yPos2 = obj.position.y + 0.5;
  }

  const xScale = obj.scale.x * 2
  const yScale = obj.scale.y * 1.9

  const ease = "cubicBezier(.5, .05, .1, .3)"

  const duration = 250;

  // animate
  anime({
    targets: [obj.scale],
    x: xScale,
    y: yScale,
    duration: duration,
    easing: ease,
  });
  anime({
    targets: [obj.position],
    x: xPos,
    y: yPos1,
    duration: duration,
    easing: ease,
  });
  await anime({
    targets: [obj.rotation],
    keyframes: [
      { z: Math.PI * 2, duration: 50 },
      { y: Math.PI * 2, duration: 200 },
    ],
    duration: duration,
    easing: ease,
  }).finished.then(() => {
    anime({
      targets: [obj.position],
      y: yPos2,
      z: 0,
      duration: duration,
      easing: ease,
    }).finished
  });
}

/**
 * @param {*} obj 
 * Hand To Offline
 */
export const animateHandToOffline = async function (obj) {
  const playerStore = usePlayerStore();
  const oppStore = useOpponentStore();

  // set target x position based on hand count
  let xPos;
  let yPos;
  const zPos = 0.002;

  if (obj.name.includes(CARD_NAME.PLAYER)) {
    xPos = -4.23;
    yPos = -1.95;
  } else {
    xPos = 4.23;
    yPos = 3.09;
  }

  const xScale = obj.scale.x / 2;
  const yScale = obj.scale.y / 1.9;

  const ease = "cubicBezier(.5, .05, .1, .3)"

  const duration = 250;

  // lift up the card in z-index to prevent clipping
  obj.position.z = 0.5;

  // stack them up nicely
  if (obj.name.includes(CARD_NAME.PLAYER)) {
    obj.position.z = zPos + playerStore.pOfflineCount * zPos;
  } else {
    obj.position.z = zPos + oppStore.oOfflineCount * zPos;
  }
  // animate
  anime({
    targets: [obj.position],
    x: xPos,
    y: yPos,
    duration: duration,
    easing: ease,
  });
  anime({
    targets: [obj.scale],
    x: xScale,
    y: yScale,
    duration: duration,
    easing: ease,
  });
  await anime({
    targets: [obj.rotation],
    z: Math.PI * 5 / 2,
    duration: duration,
    easing: ease,
  }).finished
}

/**
 * Hand To Active
 * @param {*} obj 
 */
export const animateHandToActive = async function (obj, isDigivolving) {
  const playerStore = usePlayerStore();
  const oppStore = useOpponentStore();
  const yPos = -0.25;
  let xPos1;
  let xPos2;
  let zPos;

  if (useStateStore().currentTurn == WHO.PLAYER) {
    xPos1 = -1;
    xPos2 = -1.25;
    zPos = isDigivolving ? playerStore.pActiveMonStackCount * 0.001 : 0
  } else {
    xPos1 = 1;
    xPos2 = 1.35;
    zPos = isDigivolving ? oppStore.oActiveMonStackCount * 0.001 : 0
  }

  const ease = "cubicBezier(.5, .05, .1, .3)"

  const duration = 250;

  // animate
  await anime({
    targets: [obj.position],
    keyframes: [
      { x: xPos1, y: yPos, z: 0.05, duration: duration },
      { x: xPos2, z: zPos, duration: duration - 50 },
    ],
    easing: ease,
  }).finished;
}

/**
 * @param {*} obj 
 * Top Deck/Hand Card To Support
 */
export const animateCardToSupport = async function (obj, isDeckTopCard) {
  let xPos;
  let yPos1;
  let yPos2;

  if (obj.name.includes(CARD_NAME.PLAYER)) {
    xPos = -0.93;
    yPos1 = -1;
    yPos2 = -0.5;
  } else {
    xPos = 1.06;
    yPos1 = 0.56;
    yPos2 = 0.06;
  }

  const ease = "cubicBezier(.5, .05, .1, .3)"

  const duration = 250;

  // animate
  // Support from deck
  if (isDeckTopCard) {
    const xScale = obj.scale.x * 2
    const yScale = obj.scale.y * 1.9
    anime({
      targets: [obj.rotation],
      z: Math.PI * 2,
      duration: duration,
      easing: ease,
    });
    anime({
      targets: [obj.scale],
      x: xScale,
      y: yScale,
      duration: duration,
      easing: ease,
    });
  }

  await anime({
    targets: [obj.position],
    keyframes: [
      { x: xPos, y: yPos1, z: 0.05, duration: duration },
      { y: yPos2, duration: duration - 50 },
    ],
    easing: ease,
  }).finished;
}

/**
 * @param {*} obj 
 * Hand To DP RACK
 */
export const animateHandToDp = async function (obj) {
  const playerStore = usePlayerStore();
  const oppStore = useOpponentStore();

  const yPos = -0.3;
  const zPos = 0.002;
  const xScale = obj.scale.x * 0.52;
  const yScale = obj.scale.y * 0.52;
  const ease = "cubicBezier(.5, .05, .1, .3)"
  const duration = 150;
  let xPos;
  
  if (useStateStore().currentTurn == WHO.PLAYER) {
    xPos = -4.98;
  } else {
    xPos = 5;
  }

  // lift up the card in z-index to prevent clipping
  obj.position.z = 0.1;

  // stack them up nicely
  if (useStateStore().currentTurn == WHO.PLAYER) {
    obj.position.z = zPos + playerStore.pDpCount * zPos;
  } else {
    obj.position.z = zPos + oppStore.oDpCount * zPos;
  }
  // animate
  anime({
    targets: [obj.position],
    x: xPos,
    y: yPos,
    duration: duration,
    easing: ease,
  });
  await anime({
    targets: [obj.scale],
    x: xScale,
    y: yScale,
    duration: duration,
    easing: ease
  }).finished

}

/**
 * @param {*} obj 
 * 0 to target value
 */
export const animatePow = async function (htmlC, newVal, oldVal) {
  let valObj = {
    val: oldVal,
  };
  await anime({
    targets: valObj,
    val: newVal,
    round: 1,
    easing: "linear",
    duration: 1000,
    update: function () {
      htmlC.innerHTML = valObj.val;
    },
  }).finished;
}

/**
 * @param {*} obj 
 * Support To Offline
 */
export const animateSupportToOffline = async function (obj) {
  const playerStore = usePlayerStore();
  const oppStore = useOpponentStore();

  let xPos;
  let yPos;
  const zPos = 0.002;

  if (obj.name.includes(CARD_NAME.PLAYER)) {
    xPos = -4.23;
    yPos = -1.95;
  } else {
    xPos = 4.23;
    yPos = 3.09;
  }

  const ease = "cubicBezier(.5, .05, .1, .3)"
  const duration = 250;

  const xScale = obj.scale.x / 2;
  const yScale = obj.scale.y / 1.9;

  // lift up the card in z-index to prevent clipping
  obj.position.z = 0.5;

  // animate
  anime({
    targets: [obj.position],
    x: xPos,
    y: yPos,
    duration: duration,
    easing: ease,
  });
  anime({
    targets: [obj.scale],
    x: xScale,
    y: yScale,
    duration: duration,
    easing: ease,
  });
  anime({
    targets: [obj.rotation],
    z: Math.PI * 5 / 2,
    duration: duration,
    easing: ease,
  })

  // stack them up nicely
  if (obj.name.includes(CARD_NAME.PLAYER)) {
    obj.position.z = zPos + playerStore.pOfflineCount * zPos;
  } else {
    obj.position.z = zPos + oppStore.oOfflineCount * zPos;
  }
}

/**
 * @param {*} dpObj
 * DP Rack to Offline Stack
 */
export const animateDpToOffline = async function (dpObj) {
  const playerStore = usePlayerStore();
  const oppStore = useOpponentStore();

  let xPos;
  let yPos;
  const zPos = 0.002;

  if (dpObj.name.includes(CARD_NAME.PLAYER)) {
    xPos = -4.23;
    yPos = -1.95;
  } else {
    xPos = 4.23;
    yPos = 3.09;
  }
  
  const ease = "cubicBezier(.5, .05, .1, .3)"
  const duration = 250;

  const xScale = dpObj.scale.x * 1.05;
  const yScale = dpObj.scale.y * 1.05;

  // lift up the card in z-index to prevent clipping
  dpObj.position.z = 0.5;

  // stack them up nicely
  if (dpObj.name.includes(CARD_NAME.PLAYER)) {
    dpObj.position.z = zPos + playerStore.pOfflineCount * zPos;
  } else {
    dpObj.position.z = zPos + oppStore.oOfflineCount * zPos;
  }
  // animate
  anime({
    targets: [dpObj.position],
    x: xPos,
    y: yPos,
    duration: duration,
    easing: ease,
  });
  anime({
    targets: [dpObj.scale],
    x: xScale,
    y: yScale,
    duration: duration,
    easing: ease,
  });
  await anime({
    targets: [dpObj.rotation],
    z: Math.PI * 1 / 2,
    duration: duration,
    easing: ease,
  }).finished
}

/**
 * Active to Offline Stack
 */
export const animateActiveToOffline = async (obj) => {
  const playerStore = usePlayerStore();
  const oppStore = useOpponentStore();

  let xPos;
  let yPos;
  let zRot;
  const zPos = 0.002;

  if (obj.name.includes(CARD_NAME.PLAYER)) {
    xPos = -4.23;
    yPos = -1.95;
    zRot = Math.PI * 1 / 2;
  } else {
    xPos = 4.23;
    yPos = 3.09;
    zRot = Math.PI * 1 / 2;
  }

  const ease = "cubicBezier(.5, .05, .1, .3)"
  const duration = 250;

  const xScale = obj.scale.x / 2;
  const yScale = obj.scale.y / 1.9;

  // lift up the card in z-index to prevent clipping
  obj.position.z = 0.5;

  // stack them up nicely
  if (obj.name.includes(CARD_NAME.PLAYER)) {
    obj.position.z = zPos + playerStore.pOfflineCount * zPos;
  } else {
    obj.position.z = zPos + oppStore.oOfflineCount * zPos;
  }
  // animate
  anime({
    targets: [obj.position],
    x: xPos,
    y: yPos,
    duration: duration,
    easing: ease,
  });
  anime({
    targets: [obj.scale],
    x: xScale,
    y: yScale,
    duration: duration,
    easing: ease,
  });
  await anime({
    targets: [obj.rotation],
    z: zRot,
    duration: duration,
    easing: ease,
  }).finished
}

/**
 * Deck to Offline Stack
 */
export const animateDeckCardToOffline = async (obj) => {
  const playerStore = usePlayerStore();
  const oppStore = useOpponentStore();

  let xPos;
  let yPos;
  const zPos = 0.002;

  if (obj.name.includes(CARD_NAME.PLAYER)) {
    xPos = -4.23;
    yPos = -1.95;
  } else {
    xPos = 4.23;
    yPos = 3.09;
  }

  const ease = "cubicBezier(.5, .05, .1, .3)"
  const duration = 250;
  const xRotation = Math.PI;

  // lift up the card in z-index to prevent clipping
  obj.position.z = 0.5;

  // stack them up nicely
  if (obj.name.includes(CARD_NAME.PLAYER)) {
    obj.position.z = zPos + playerStore.pOfflineCount * zPos;
  } else {
    obj.position.z = zPos + oppStore.oOfflineCount * zPos;
  }
  // animate
  anime({
    targets: [obj.position],
    x: xPos,
    y: yPos,
    duration: duration,
    easing: ease,
  });
  await anime({
    targets: [obj.rotation],
    x: xRotation,
    duration: duration,
    easing: ease,
  }).finished
}

/**
 * Offline Stack to Deck
 */
export const animateOfflineCardToDeck = async (obj) => {
  const playerStore = usePlayerStore();
  const oppStore = useOpponentStore();

  let xPos;
  let yPos;
  const zPos = 0.002;

  if (obj.name.includes(CARD_NAME.PLAYER)) {
    xPos = -4.25;
    yPos = -3.07;
  } else {
    xPos = 4.2;
    yPos = 2;
  }

  const ease = "cubicBezier(.5, .05, .1, .3)"
  const duration = 250;
  const xRotation = -Math.PI;

  // lift up the card in z-index to prevent clipping
  obj.position.z = 0.5;

  // stack them up nicely
  if (obj.name.includes(CARD_NAME.PLAYER)) {
    obj.position.z = zPos + playerStore.pDeckCount * zPos;
  } else {
    obj.position.z = zPos + oppStore.oDeckCount * zPos;
  }
  // animate
  anime({
    targets: [obj.position],
    x: xPos,
    y: yPos,
    duration: duration,
    easing: ease,
  });
  await anime({
    targets: [obj.rotation],
    x: xRotation,
    duration: duration,
    easing: ease,
  }).finished
}

/**
 * Offline Stack to Deck
 */
export const animateHandToDeck = async (obj) => {
  const playerStore = usePlayerStore();
  const oppStore = useOpponentStore();

  let xPos;
  let yPos;
  const zPos = 0.002;

  if (obj.name.includes(CARD_NAME.PLAYER)) {
    xPos = -4.25;
    yPos = -3.07;
  } else {
    xPos = 4.2;
    yPos = 2;
  }

  const xScale = obj.scale.x / 2;
  const yScale = obj.scale.y / 1.9;
  const ease = "cubicBezier(.5, .05, .1, .3)"
  const duration = 250;
  const xRotation = -Math.PI;

  // lift up the card in z-index to prevent clipping
  obj.position.z = 0.5;

  // stack them up nicely
  if (obj.name.includes(CARD_NAME.PLAYER)) {
    obj.position.z = zPos + playerStore.pDeckCount * zPos;
  } else {
    obj.position.z = zPos + oppStore.oDeckCount * zPos;
  }
  // animate
  anime({
    targets: [obj.scale],
    x: xScale,
    y: yScale,
    duration: duration,
    easing: ease,
  });
  anime({
    targets: [obj.position],
    x: xPos,
    y: yPos,
    duration: duration,
    easing: ease,
  });
  await anime({
    targets: [obj.rotation],
    keyframes: [
      { z: -Math.PI * 2, duration: 50 },
      { y: -Math.PI * 2, duration: 200 },
    ],
    x: xRotation,
    duration: duration,
    easing: ease,
  }).finished
}