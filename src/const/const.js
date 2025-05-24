export const PHASE = {
    DRAW: 1,
    REDRAW: 1.5,
    ENTRANCE: 2,
    RACK_UP_DP: 3,
    DIGIVOLVE_SPECIAL: 3.5,
    DIGIVOLVE: 4,
    CHOOSE_ATTACK: 5,
    SUPPORT1: 6,
    SUPPORT2: 6.5,
    BATTLE: 7,
    END: 0,
}
export const SPECIALTY = {
    FIRE: "Fire",
    ICE: "Ice",
    NATURE: "Nature",
    DARKNESS: "Darkness",
    RARE: "Rare",
    OPTION: "Option",
}

export const SPECIALTY_DETAILS = [
    {
        specialty: "Fire",
        topColor: "#D50000",  // accent-4
        bottomColor: "#FFCDD2", // lighten-4
    },
    {
        specialty: "Ice",
        topColor: "#2962FF", // accent-4
        bottomColor: "#BBDEFB", // lighten-4
    },
    {
        specialty: "Nature",
        topColor: "#00C853", // accent-4
        bottomColor: "#C8E6C9", // lighten-4
    },
    {
        specialty: "Darkness",
        topColor: "#212121", // grey-accent-4
        bottomColor: "#F5F5F5", // grey-lighten-4
    },
    {
        specialty: "Rare",
        topColor: "#FFD600", // accent-4
        bottomColor: "#FFF9C4", // lighten-4
    },
]

export const LEVEL = {
    R: "R",
    A: "A",
    C: "C",
    U: "U",
}

export const DECK_NAME = {
    PLAYER: "pDeck",
    OPP: "oDeck",
}

export const CARD_NAME = {
    PLAYER: "pCard",
    OPP: "oCard",
}

export const WHO = {
    PLAYER: "PLAYER",
    OPP: "OPPONENT",
}

export const COLOR_CODE = {
    FIRE_TOP: "#D50000",
    FIRE_BOTTOM: "#FFCDD2",
    ICE_TOP: "#2962FF",
    ICE_BOTTOM: "#BBDEFB",
    NATURE_TOP: "#00C853",
    NATURE_BOTTOM: "#C8E6C9",
    DARKNESS_TOP: "#212121",
    DARKNESS_BOTTOM: "#F5F5F5",
    RARE_TOP: "#FFD600",
    RARE_BOTTOM: "#FFF9C4",
    SUPPORT_TOP: "#808080",
    SUPPORT_BOTTOM: "#C0C0C0"
}

export const ATTACK = {
    C: "CIRCLE",
    T: "TRIANGLE",
    X: "CROSS",
}

export const SPEED = {
    BLUE: 3,
    GREEN: 2,
    RED: 1,
    NONE: 0,
}

export const MODE = {
    DEV: "DEV_MODE",
    PROD: "PROD_MODE",
    AI: "AI_MODE",
}

export const READY = {
    INIT_OK: 1,
    LOADING_OK: 2,
}