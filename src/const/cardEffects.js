import { ATTACK } from "./const"

export const SUPPORT_NONE_CARDS = [
    "005",
    "010",
    "016",
    "017",
    "028",
    "033",
    "034",
    "051",
    "059",
    "060",
    "062",
    "068",
    "074",
    "079",
    "086",
    "090",
    "094",
    "097",
    "098",
    "106",
    "108",
    "148",
    "149",
    "162",
    "163",
    "169"
]

export const isAttackChoiceCounter = (attack, cardId) => {
    if (attack == ATTACK.C) {
        return X_EFF_ANTI_C_CARDS.includes(cardId)
    } else if (attack == ATTACK.T) {
        return X_EFF_ANTI_T_CARDS.includes(cardId)
    } else if (attack == ATTACK.X) {
        return X_EFF_ANTI_X_CARDS.includes(cardId)
    }
}

export const X_EFF_ANTI_C_CARDS = [
    "000",
    "006",
    "009",
    "011",
    "012",
    "014",
    "015",
    "017",
    "023",
    "024",
    "027",
    "031",
    "034",
    "038",
    "040",
    "042",
    "044",
    "046",
    "050",
    "051",
    "053",
    "054",
    "056",
    "059",
    "062",
    "063",
    "064",
    "066",
    "069",
    "079",
    "086",
    "087",
    "088",
    "093",
    "096",
    "097",
    "126",
    "130",
    "135",
    "141",
    "144",
    "149",
    "151",
    "154",
    "155",
    "162",
    "170",
    "171",
    "172",
    "173",
    "174",
    "176",
    "179",
    "181",
    "182",
    "183",
    "187",
    "190"
]

export const X_EFF_ANTI_T_CARDS = [
    "010",
    "039",
    "041",
    "049",
    "061",
    "076",
    "084",
    "090",
    "099",
    "122",
    "134",
    "143",
    "167",
    "184",
    "185"
]

export const X_EFF_ANTI_X_CARDS = [
    "001",
    "004",
    "030",
    "035",
    "045",
    "048",
    "060",
    "067",
    "071",
    "083",
    "101",
    "133",
    "153",
    "156",
    "157",
    "177",
    "188"
]

export const X_EFF_1ST_ATTACK_CARDS = [
    "007",
    "013",
    "020",
    "021",
    "029",
    "072",
    "074",
    "081",
    "089",
    "094",
    "112",
    "129",
    "148",
    "164",
    "180"
]

export const X_EFF_ANTI_FIRE_CARDS = [
    "036",
    "037",
    "047",
    "052",
    "058",
    "065",
    "178"
]

export const X_EFF_ANTI_ICE_CARDS = [
    "002",
    "008",
    "018",
    "019",
    "032",
    "100"
]

export const X_EFF_ANTI_NATURE_CARDS = [
    "016",
    "106",
    "113",
    "120",
    "132"
]

export const X_EFF_ANTI_DARKNESS_CARDS = [
    "075",
    "077",
    "082",
    "147",
    "152"
]

export const X_EFF_ANTI_RARE_CARDS = [
    "136",
    "140",
    "159",
    "161",
    "169"
]

export const X_EFF_JAMMING_CARDS = [
    "043",
    "057",
    "092",
    "102",
    "107",
    "109",
    "115",
    "118",
    "138",
    "139",
    "142",
    "145",
    "150",
    "158",
    "168",
    "186"
]

export const X_EFF_CRASH_CARDS = [
    "025",
    "028",
    "103",
    "105",
    "108",
    "124",
    "125",
    "146",
    "166"
]

// X_EFF_SUPPORT_NONE_CARDS 21
// X_EFF_EATUPHP_CARDS 11

export const GENERAL_SUPPORT_MONSTER_CARDS = ["000", "001", "002", "003", "006", "011", "015", "023", "024", "027", "029", "030", "031"]

/**
 * ↓↓↓↓↓
 * OPTION CARDS
 * ↓↓↓↓↓
 */
export const GENERAL_SUPPORT_OPTION_CARDS = []

export const DIGIVOLUTION_CARDS = ["293", "294", "295", "296", "297", "298", "299", "300"]