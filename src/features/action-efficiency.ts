/* 动作效率工具（原 item-tooltip 中，被 action-panel/action-queue 依赖） */

const actionHridToToolsSpeedBuffNamesMap = {
    "/action_types/brewing": "brewingSpeed",
    "/action_types/cheesesmithing": "cheesesmithingSpeed",
    "/action_types/cooking": "cookingSpeed",
    "/action_types/crafting": "craftingSpeed",
    "/action_types/foraging": "foragingSpeed",
    "/action_types/milking": "milkingSpeed",
    "/action_types/tailoring": "tailoringSpeed",
    "/action_types/woodcutting": "woodcuttingSpeed",
    "/action_types/alchemy": "alchemySpeed",
};

const actionHridToHouseNamesMap = {
    "/action_types/brewing": "/house_rooms/brewery",
    "/action_types/cheesesmithing": "/house_rooms/forge",
    "/action_types/cooking": "/house_rooms/kitchen",
    "/action_types/crafting": "/house_rooms/workshop",
    "/action_types/foraging": "/house_rooms/garden",
    "/action_types/milking": "/house_rooms/dairy_barn",
    "/action_types/tailoring": "/house_rooms/sewing_parlor",
    "/action_types/woodcutting": "/house_rooms/log_shed",
    "/action_types/alchemy": "/house_rooms/laboratory",
};

const itemEnhanceLevelToBuffBonusMap = {
    0: 0,
    1: 2,
    2: 4.2,
    3: 6.6,
    4: 9.2,
    5: 12,
    6: 15,
    7: 18.2,
    8: 21.6,
    9: 25.2,
    10: 29,
    11: 33.4,
    12: 38.4,
    13: 44,
    14: 50.2,
    15: 57,
    16: 64.4,
    17: 72.4,
    18: 81,
    19: 90.2,
    20: 100,
};

function getActionHridFromItemName(name) {
    let newName = name.replace("Milk", "Cow");
    newName = newName.replace("Log", "Tree");
    newName = newName.replace("Cowing", "Milking");
    newName = newName.replace("Rainbow Cow", "Unicow");
    newName = newName.replace("Collector's Boots", "Collectors Boots");
    newName = newName.replace("Knight's Aegis", "Knights Aegis");
    if (!initData_actionDetailMap) {
        console.error("getActionHridFromItemName no initData_actionDetailMap: " + name);
        return null;
    }
    for (const action of Object.values(initData_actionDetailMap)) {
        if (action.name === newName) {
            return action.hrid;
        }
    }
    return null;
}

function getToolsSpeedBuffByActionHrid(actionHrid) {
    let totalBuff = 0;
    for (const item of initData_characterItems) {
        if (item.itemLocationHrid.includes("_tool")) {
            const buffName = actionHridToToolsSpeedBuffNamesMap[initData_actionDetailMap[actionHrid].type];
            const enhanceBonus = 1 + itemEnhanceLevelToBuffBonusMap[item.enhancementLevel] / 100;
            const buff = initData_itemDetailMap[item.itemHrid].equipmentDetail.noncombatStats[buffName] || 0;
            totalBuff += buff * enhanceBonus;
        }
    }
    return Number(Number(totalBuff * 100).toFixed(1));
}

function getItemEffiBuffByActionHrid(actionHrid) {
    let buff = 0;
    const propertyName = initData_actionDetailMap[actionHrid].type.replace("/action_types/", "") + "Efficiency";
    for (const item of initData_characterItems) {
        if (item.itemLocationHrid === "/item_locations/inventory") {
            continue;
        }
        const itemDetail = initData_itemDetailMap[item.itemHrid];

        const specificStat = itemDetail?.equipmentDetail?.noncombatStats[propertyName];
        if (specificStat && specificStat > 0) {
            let enhanceBonus = 1;
            if (item.itemLocationHrid.includes("earrings") || item.itemLocationHrid.includes("ring") || item.itemLocationHrid.includes("neck")) {
                enhanceBonus = 1 + (itemEnhanceLevelToBuffBonusMap[item.enhancementLevel] * 5) / 100;
            } else {
                enhanceBonus = 1 + itemEnhanceLevelToBuffBonusMap[item.enhancementLevel] / 100;
            }
            buff += specificStat * enhanceBonus;
        }

        const skillingStat = itemDetail?.equipmentDetail?.noncombatStats["skillingEfficiency"];
        if (skillingStat && skillingStat > 0) {
            let enhanceBonus = 1;
            if (item.itemLocationHrid.includes("earrings") || item.itemLocationHrid.includes("ring") || item.itemLocationHrid.includes("neck")) {
                enhanceBonus = 1 + (itemEnhanceLevelToBuffBonusMap[item.enhancementLevel] * 5) / 100;
            } else {
                enhanceBonus = 1 + itemEnhanceLevelToBuffBonusMap[item.enhancementLevel] / 100;
            }
            buff += skillingStat * enhanceBonus;
        }
    }
    return Number(Number(buff * 100).toFixed(1));
}

function getHousesEffBuffByActionHrid(actionHrid) {
    const houseName = actionHridToHouseNamesMap[initData_actionDetailMap[actionHrid].type];
    if (!houseName) {
        return 0;
    }
    const house = initData_characterHouseRoomMap[houseName];
    if (!house) {
        return 0;
    }
    return house.level * 1.5;
}

function getTeaBuffsByActionHrid(actionHrid) {
    const teaBuffs = {
        efficiency: 0, // Efficiency tea, specific teas, -Artisan tea.
        quantity: 0, // Gathering tea, Gourmet tea.
        lessResource: 0, // Artisan tea.
        extraExp: 0, // Wisdom tea. Not used.
        upgradedProduct: 0, // Processing tea. Not used.
    };

    const actionTypeId = initData_actionDetailMap[actionHrid].type;
    const teaList = initData_actionTypeDrinkSlotsMap[actionTypeId];
    for (const tea of teaList) {
        if (!tea || !tea.itemHrid) {
            continue;
        }

        for (const buff of initData_itemDetailMap[tea.itemHrid].consumableDetail.buffs) {
            if (buff.typeHrid === "/buff_types/artisan") {
                teaBuffs.lessResource += buff.flatBoost * 100;
            } else if (buff.typeHrid === "/buff_types/action_level") {
                teaBuffs.efficiency -= buff.flatBoost;
            } else if (buff.typeHrid === "/buff_types/gathering") {
                teaBuffs.quantity += buff.flatBoost * 100;
            } else if (buff.typeHrid === "/buff_types/gourmet") {
                teaBuffs.quantity += buff.flatBoost * 100;
            } else if (buff.typeHrid === "/buff_types/wisdom") {
                teaBuffs.extraExp += buff.flatBoost * 100;
            } else if (buff.typeHrid === "/buff_types/processing") {
                teaBuffs.upgradedProduct += buff.flatBoost * 100;
            } else if (buff.typeHrid === "/buff_types/efficiency") {
                teaBuffs.efficiency += buff.flatBoost * 100;
            } else if (buff.typeHrid === `/buff_types/${actionTypeId.replace("/action_types/", "")}_level`) {
                teaBuffs.efficiency += buff.flatBoost;
            }
        }
    }

    return teaBuffs;
}
