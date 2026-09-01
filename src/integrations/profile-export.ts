function constructSelfPlayerExportObjFromInitCharacterData(characterObj, clientObj) {
    const playerObj: any = {};
    playerObj.player = {};

    // Levels
    const skillInfo = getCombatSkillInfo(characterObj.characterSkills);
    for (const skillName of COMBAT_SKILL_HRIDS) {
        const level = skillInfo[skillName]?.level;
        if (level !== undefined) {
            playerObj.player[`${skillName}Level`] = level;
        }
    }

    // Items
    playerObj.player.equipment = [];
    for (const item of characterObj.characterItems ?? []) {
        if (!item.itemLocationHrid.includes("/item_locations/inventory")) {
            playerObj.player.equipment.push({
                itemLocationHrid: item.itemLocationHrid,
                itemHrid: item.itemHrid,
                enhancementLevel: item.enhancementLevel,
            });
        }
    }

    // Food
    playerObj.food = {};
    playerObj.food["/action_types/combat"] = [];
    for (const food of characterObj.actionTypeFoodSlotsMap?.["/action_types/combat"] ?? []) {
        playerObj.food["/action_types/combat"].push({
            itemHrid: food?.itemHrid ?? "",
        });
    }

    // Drinks
    playerObj.drinks = {};
    playerObj.drinks["/action_types/combat"] = [];
    for (const drink of characterObj.actionTypeDrinkSlotsMap?.["/action_types/combat"] ?? []) {
        playerObj.drinks["/action_types/combat"].push({
            itemHrid: drink?.itemHrid ?? "",
        });
    }

    // Abilities
    playerObj.abilities = [];
    for (let i = 0; i < 5; i++) {
        playerObj.abilities.push({ abilityHrid: "", level: "1" });
    }
    let normalAbillityIndex = 1;
    for (const ability of characterObj.combatUnit?.combatAbilities ?? []) {
        if (ability && clientObj?.abilityDetailMap?.[ability.abilityHrid]?.isSpecialAbility) {
            playerObj.abilities[0] = {
                abilityHrid: ability.abilityHrid,
                level: ability.level,
            };
        } else if (ability) {
            playerObj.abilities[normalAbillityIndex++] = {
                abilityHrid: ability.abilityHrid,
                level: ability.level,
            };
        }
    }

    // TriggerMap
    playerObj.triggerMap = { ...characterObj.abilityCombatTriggersMap, ...characterObj.consumableCombatTriggersMap };

    // HouseRooms
    playerObj.houseRooms = {};
    for (const house of Object.values(characterObj.characterHouseRoomMap ?? {})) {
        playerObj.houseRooms[house.houseRoomHrid] = house.level;
    }

    // Achievements
    playerObj.achievements = {};
    for (const achievement of Object.values(characterObj.characterAchievements ?? {})) {
        playerObj.achievements[achievement.achievementHrid] = achievement.isCompleted;
    }

    return playerObj;
}

function constructPlayerExportObjFromStoredProfile(profile, clientObj, battlePlayer) {
    const playerObj: any = {};
    playerObj.player = {};

    // Levels
    const skillInfo = getCombatSkillInfo(profile.profile.characterSkills);
    for (const skillName of COMBAT_SKILL_HRIDS) {
        const level = skillInfo[skillName]?.level;
        if (level !== undefined) {
            playerObj.player[`${skillName}Level`] = level;
        }
    }

    // Items
    playerObj.player.equipment = [];
    if (profile.profile.wearableItemMap) {
        for (const key in profile.profile.wearableItemMap) {
            const item = profile.profile.wearableItemMap[key];
            playerObj.player.equipment.push({
                itemLocationHrid: item.itemLocationHrid,
                itemHrid: item.itemHrid,
                enhancementLevel: item.enhancementLevel,
            });
        }
    }

    // Food and drinks
    playerObj.food = {};
    playerObj.food["/action_types/combat"] = [];
    playerObj.drinks = {};
    playerObj.drinks["/action_types/combat"] = [];

    if (battlePlayer?.combatConsumables) {
        for (const foodOrDrink of battlePlayer.combatConsumables) {
            if (foodOrDrink.itemHrid.includes("coffee")) {
                playerObj.drinks["/action_types/combat"].push({
                    itemHrid: foodOrDrink.itemHrid,
                });
            } else {
                playerObj.food["/action_types/combat"].push({
                    itemHrid: foodOrDrink.itemHrid,
                });
            }
        }
    } else {
        // Assume food and drinks based on equipted weapon
        const weapon =
            profile.profile.wearableItemMap &&
            (profile.profile.wearableItemMap["/item_locations/main_hand"]?.itemHrid ||
                profile.profile.wearableItemMap["/item_locations/two_hand"]?.itemHrid);
        if (weapon) {
            if (weapon.includes("shooter") || weapon.includes("bow")) {
                // 远程
                // xp,超远,暴击
                playerObj.drinks["/action_types/combat"].push({
                    itemHrid: "/items/wisdom_coffee",
                });
                playerObj.drinks["/action_types/combat"].push({
                    itemHrid: "/items/super_ranged_coffee",
                });
                playerObj.drinks["/action_types/combat"].push({
                    itemHrid: "/items/critical_coffee",
                });
                // 2红1蓝
                playerObj.food["/action_types/combat"].push({
                    itemHrid: "/items/spaceberry_donut",
                });
                playerObj.food["/action_types/combat"].push({
                    itemHrid: "/items/spaceberry_cake",
                });
                playerObj.food["/action_types/combat"].push({
                    itemHrid: "/items/star_fruit_yogurt",
                });
            } else if (weapon.includes("boomstick") || weapon.includes("staff") || weapon.includes("trident")) {
                // 法师
                // xp,超魔,吟唱
                playerObj.drinks["/action_types/combat"].push({
                    itemHrid: "/items/wisdom_coffee",
                });
                playerObj.drinks["/action_types/combat"].push({
                    itemHrid: "/items/super_magic_coffee",
                });
                playerObj.drinks["/action_types/combat"].push({
                    itemHrid: "/items/channeling_coffee",
                });
                // 1红2蓝
                playerObj.food["/action_types/combat"].push({
                    itemHrid: "/items/spaceberry_cake",
                });
                playerObj.food["/action_types/combat"].push({
                    itemHrid: "/items/star_fruit_gummy",
                });
                playerObj.food["/action_types/combat"].push({
                    itemHrid: "/items/star_fruit_yogurt",
                });
            } else if (weapon.includes("bulwark")) {
                // 双手盾 精暮光
                // xp,超防,超耐
                playerObj.drinks["/action_types/combat"].push({
                    itemHrid: "/items/wisdom_coffee",
                });
                playerObj.drinks["/action_types/combat"].push({
                    itemHrid: "/items/super_defense_coffee",
                });
                playerObj.drinks["/action_types/combat"].push({
                    itemHrid: "/items/super_stamina_coffee",
                });
                // 2红1蓝
                playerObj.food["/action_types/combat"].push({
                    itemHrid: "/items/spaceberry_donut",
                });
                playerObj.food["/action_types/combat"].push({
                    itemHrid: "/items/spaceberry_cake",
                });
                playerObj.food["/action_types/combat"].push({
                    itemHrid: "/items/star_fruit_yogurt",
                });
            } else {
                // 战士
                // xp,超力,迅捷
                playerObj.drinks["/action_types/combat"].push({
                    itemHrid: "/items/wisdom_coffee",
                });
                playerObj.drinks["/action_types/combat"].push({
                    itemHrid: "/items/super_melee_coffee",
                });
                playerObj.drinks["/action_types/combat"].push({
                    itemHrid: "/items/swiftness_coffee",
                });
                // 2红1蓝
                playerObj.food["/action_types/combat"].push({
                    itemHrid: "/items/spaceberry_donut",
                });
                playerObj.food["/action_types/combat"].push({
                    itemHrid: "/items/spaceberry_cake",
                });
                playerObj.food["/action_types/combat"].push({
                    itemHrid: "/items/star_fruit_yogurt",
                });
            }
        }
    }

    // Abilities
    playerObj.abilities = [];
    for (let i = 0; i < 5; i++) {
        playerObj.abilities.push({ abilityHrid: "", level: "1" });
    }
    if (profile.profile.equippedAbilities) {
        let normalAbillityIndex = 1;
        for (const ability of profile.profile.equippedAbilities) {
            if (ability && clientObj?.abilityDetailMap?.[ability.abilityHrid]?.isSpecialAbility) {
                playerObj.abilities[0] = {
                    abilityHrid: ability.abilityHrid,
                    level: ability.level,
                };
            } else if (ability) {
                playerObj.abilities[normalAbillityIndex++] = {
                    abilityHrid: ability.abilityHrid,
                    level: ability.level,
                };
            }
        }
    }

    // TriggerMap
    if (profile.profile.abilityCombatTriggersMap && profile.profile.consumableCombatTriggersMap) {
        playerObj.triggerMap = {
            ...profile.profile.abilityCombatTriggersMap,
            ...profile.profile.consumableCombatTriggersMap,
        };
    }

    // HouseRooms
    playerObj.houseRooms = {};
    for (const house of Object.values(profile.profile.characterHouseRoomMap ?? {})) {
        playerObj.houseRooms[house.houseRoomHrid] = house.level;
    }

    // Achievements
    playerObj.achievements = {};
    for (const achievement of Object.values(profile.profile.characterAchievements ?? {})) {
        playerObj.achievements[achievement.achievementHrid] = achievement.isCompleted;
    }

    return playerObj;
}

let latestProfileExportObj: any = null;
let exportButtonTimer: number | null = null;

function checkExportButtonElem() {
    const selectedElement = document.querySelector(`div.SharableProfile_overviewTab__W4dCV`);
    if (!selectedElement) {
        return;
    }
    if (selectedElement.querySelector("button#script_exportButton")) {
        return;
    }

    const button = document.createElement("button");
    button.id = "script_exportButton";
    selectedElement.appendChild(button);
    button.textContent = isZH ? "导出人物到剪贴板" : "Export to clipboard";
    button.style.borderRadius = "5px";
    button.style.height = "30px";
    button.style.backgroundColor = SCRIPT_COLOR_MAIN;
    button.style.color = "black";
    button.style.boxShadow = "none";
    button.style.border = "0px";
    button.onclick = function () {
        const obj = latestProfileExportObj;
        if (!obj?.profile?.characterSkills?.[0]?.characterID) {
            return;
        }
        let exportString = "";
        const playerID = obj.profile.characterSkills[0].characterID;
        const clientObj = JSON.parse(GM_getValue("init_client_data", "null"));
        const characterObj = JSON.parse(GM_getValue("init_character_data", "null"));
        if (!clientObj || !characterObj) {
            button.textContent = "Error";
            return;
        }

        if (playerID === characterObj.character?.id) {
            exportString = JSON.stringify(constructSelfPlayerExportObjFromInitCharacterData(characterObj, clientObj));
        } else {
            const storedProfileList = JSON.parse(GM_getValue("profile_export_list", "[]"));
            const profileList = storedProfileList.filter((item) => item.characterID === playerID);
            let profile = null;
            if (profileList.length !== 1) {
                console.log("Can not find stored profile for " + playerID);
                return;
            }
            profile = profileList[0];

            let battlePlayer = null;
            if (GM_getValue("new_battle", "")) {
                const battleObj = JSON.parse(GM_getValue("new_battle", ""));
                const battlePlayerList = battleObj.players.filter((item) => item.character.id === playerID);
                if (battlePlayerList.length === 1) {
                    battlePlayer = battlePlayerList[0];
                }
            }

            exportString = JSON.stringify(constructPlayerExportObjFromStoredProfile(profile, clientObj, battlePlayer));
        }

        navigator.clipboard.writeText(exportString);
        button.textContent = isZH ? "已复制" : "Copied";
        return false;
    };
}

function addExportButton(obj) {
    latestProfileExportObj = obj;
    if (exportButtonTimer === null) {
        exportButtonTimer = setInterval(checkExportButtonElem, 200);
    }
}

function handleProfileShared(obj) {
    let profileExportList: any[] = [];
    const profileExportListString = GM_getValue("profile_export_list", null);
    if (profileExportListString) {
        try {
            const storedProfiles = JSON.parse(profileExportListString);
            if (Array.isArray(storedProfiles)) {
                profileExportList = storedProfiles;
            } else {
                console.error("Found invalid profileExportList in store. profileExportList cleared.");
            }
        } catch {
            console.error("Found invalid profileExportList in store. profileExportList cleared.");
        }
    }

    obj.characterID = obj.profile.characterSkills[0].characterID;
    obj.characterName = obj.profile.sharableCharacter.name;
    obj.timestamp = Date.now();

    profileExportList = profileExportList.filter((item) => item.characterID !== obj.characterID);
    profileExportList.unshift(obj);
    if (profileExportList.length > 20) {
        profileExportList.pop();
    }
    GM_setValue("profile_export_list", JSON.stringify(profileExportList));

    addExportButton(obj);
}

registerMessageHandler("profile_shared", handleProfileShared);
