/* 为 shykai 战斗模拟器添加导入按钮 */
// Parts of code regarding group export are by Ratatatata (https://greasyfork.org/en/scripts/507255)。
function addCombatSimulatorImportButton() {
    const checkElem = () => {
        const selectedElement = document.querySelector(`button#buttonImportExport`);
        if (selectedElement) {
            clearInterval(timer);
            let button = document.createElement("button");
            selectedElement.parentNode!.parentElement!.parentElement!.insertBefore(button, selectedElement.parentElement!.parentElement!.nextSibling);
            button.textContent = isZH
                ? "单人/组队导入(刷新游戏网页更新人物数据)"
                : "Import solo/group (Refresh game page to update character set)";
            button.style.backgroundColor = SCRIPT_COLOR_MAIN;
            button.style.padding = "5px";
            button.onclick = function () {
                const getPriceButton = document.querySelector(`button#buttonGetPrices`);
                if (getPriceButton) {
                    getPriceButton.click();
                }
                importDataToCombatSimulator(button);
                return false;
            };
        }
    };
    let timer = setInterval(checkElem, 200);
}

async function importDataToCombatSimulator(button) {
    const result = constructGroupExportObj();
    if (!result) {
        button.textContent = isZH ? "错误：请先打开游戏页面" : "Error: Open game page first";
        return;
    }
    const [exportObj, playerIDs, importedPlayerPositions, zone, difficultyTier, isZoneDungeon, isParty] = result;

    document.querySelector(`a#group-combat-tab`)!.click();
    const importInputElem = document.querySelector(`input#inputSetGroupCombatAll`)!;
    importInputElem.value = JSON.stringify(exportObj);
    document.querySelector(`button#buttonImportSet`)!.click();

    document.querySelector(`a#player1-tab`)!.textContent = playerIDs[0];
    document.querySelector(`a#player2-tab`)!.textContent = playerIDs[1];
    document.querySelector(`a#player3-tab`)!.textContent = playerIDs[2];
    document.querySelector(`a#player4-tab`)!.textContent = playerIDs[3];
    document.querySelector(`a#player5-tab`)!.textContent = playerIDs[4];

    // Select zone or dungeon
    if (zone) {
        if (isZoneDungeon) {
            document.querySelector(`input#simDungeonToggle`)!.checked = true;
            document.querySelector(`input#simDungeonToggle`)!.dispatchEvent(new Event("change"));
            const selectDungeon = document.querySelector(`select#selectDungeon`)!;
            for (let i = 0; i < selectDungeon.options.length; i++) {
                if (selectDungeon.options[i].value === zone) {
                    selectDungeon.options[i].selected = true;
                    break;
                }
            }
        } else {
            document.querySelector(`input#simDungeonToggle`)!.checked = false;
            document.querySelector(`input#simDungeonToggle`)!.dispatchEvent(new Event("change"));
            const selectZone = document.querySelector(`select#selectZone`)!;
            for (let i = 0; i < selectZone.options.length; i++) {
                if (selectZone.options[i].value === zone) {
                    selectZone.options[i].selected = true;
                    break;
                }
            }
        }

        if (difficultyTier) {
            const selectDifficulty = document.querySelector(`select#selectDifficulty`)!;
            for (let i = 0; i < selectDifficulty.options.length; i++) {
                if (Number(selectDifficulty.options[i].value) === difficultyTier) {
                    selectDifficulty.options[i].selected = true;
                    break;
                }
            }
        }
    }

    // Select sim players
    for (let i = 0; i < 5; i++) {
        const playerCheckbox = document.querySelector(`input#player${i + 1}.form-check-input.player-checkbox`);
        if (playerCheckbox) {
            playerCheckbox.checked = Boolean(importedPlayerPositions[i]);
            playerCheckbox.dispatchEvent(new Event("change"));
        }
    }

    // Input simulation time
    document.querySelector(`input#inputSimulationTime`)!.value = String(24);

    button.textContent = isZH ? "已导入" : "Imported";
    if (!isParty) {
        setTimeout(() => {
            document.querySelector(`button#buttonStartSimulation`)!.click();
        }, 500);
    }
}

function constructGroupExportObj() {
    const characterObj = JSON.parse(GM_getValue("init_character_data", "null"));
    const clientObj = JSON.parse(GM_getValue("init_client_data", "null"));
    if (!characterObj || !clientObj) {
        console.error("constructGroupExportObj: missing stored game data. Open the game page first.");
        return null;
    }
    let battleObj: any = null;
    if (GM_getValue("new_battle", "")) {
        battleObj = JSON.parse(GM_getValue("new_battle", ""));
    }
    const storedProfileList = JSON.parse(GM_getValue("profile_export_list", "[]"));

    const BLANK_PLAYER_JSON = `{\"player\":{\"attackLevel\":1,\"magicLevel\":1,\"meleeLevel\":1,\"rangedLevel\":1,\"defenseLevel\":1,\"staminaLevel\":1,\"intelligenceLevel\":1,\"equipment\":[]},\"food\":{\"/action_types/combat\":[{\"itemHrid\":\"\"},{\"itemHrid\":\"\"},{\"itemHrid\":\"\"}]},\"drinks\":{\"/action_types/combat\":[{\"itemHrid\":\"\"},{\"itemHrid\":\"\"},{\"itemHrid\":\"\"}]},\"abilities\":[{\"abilityHrid\":\"\",\"level\":\"1\"},{\"abilityHrid\":\"\",\"level\":\"1\"},{\"abilityHrid\":\"\",\"level\":\"1\"},{\"abilityHrid\":\"\",\"level\":\"1\"},{\"abilityHrid\":\"\",\"level\":\"1\"}],\"triggerMap\":{},\"zone\":\"/actions/combat/fly\",\"simulationTime\":\"100\",\"houseRooms\":{\"/house_rooms/dairy_barn\":0,\"/house_rooms/garden\":0,\"/house_rooms/log_shed\":0,\"/house_rooms/forge\":0,\"/house_rooms/workshop\":0,\"/house_rooms/sewing_parlor\":0,\"/house_rooms/kitchen\":0,\"/house_rooms/brewery\":0,\"/house_rooms/laboratory\":0,\"/house_rooms/observatory\":0,\"/house_rooms/dining_room\":0,\"/house_rooms/library\":0,\"/house_rooms/dojo\":0,\"/house_rooms/gym\":0,\"/house_rooms/armory\":0,\"/house_rooms/archery_range\":0,\"/house_rooms/mystical_study\":0}}`;

    const exportObj = {};
    exportObj[1] = BLANK_PLAYER_JSON;
    exportObj[2] = BLANK_PLAYER_JSON;
    exportObj[3] = BLANK_PLAYER_JSON;
    exportObj[4] = BLANK_PLAYER_JSON;
    exportObj[5] = BLANK_PLAYER_JSON;

    let isParty = false;
    const playerIDs = ["Player 1", "Player 2", "Player 3", "Player 4", "Player 5"];
    const importedPlayerPositions = [false, false, false, false, false];
    let zone = "/actions/combat/fly";
    let isZoneDungeon = false;
    let difficultyTier = 0;

    if (!characterObj?.partyInfo?.partySlotMap) {
        exportObj[1] = JSON.stringify(constructSelfPlayerExportObjFromInitCharacterData(characterObj, clientObj));
        playerIDs[0] = characterObj.character.name;
        importedPlayerPositions[0] = true;
        // Zone
        for (const action of characterObj.characterActions ?? []) {
            if (action && action.actionHrid.includes("/actions/combat/")) {
                zone = action.actionHrid;
                difficultyTier = action.difficultyTier;
                isZoneDungeon = clientObj.actionDetailMap?.[action.actionHrid]?.combatZoneInfo?.isDungeon;
                break;
            }
        }
    } else {
        isParty = true;
        let i = 1;
        for (const member of Object.values(characterObj.partyInfo.partySlotMap)) {
            if (member.characterID) {
                if (member.characterID === characterObj.character.id) {
                    exportObj[i] = JSON.stringify(constructSelfPlayerExportObjFromInitCharacterData(characterObj, clientObj));
                    playerIDs[i - 1] = characterObj.character.name;
                    importedPlayerPositions[i - 1] = true;
                } else {
                    const profileList = storedProfileList.filter((item) => item.characterID === member.characterID);
                    if (profileList.length !== 1) {
                        console.log("Can not find stored profile for " + member.characterID);
                        playerIDs[i - 1] = isZH ? "需要点开资料" : "Open profile in game";
                        i++;
                        continue;
                    }
                    const profile = profileList[0];

                    const battlePlayerList = battleObj?.players?.filter((item) => item.character.id === member.characterID) ?? [];
                    let battlePlayer = null;
                    if (battlePlayerList.length === 1) {
                        battlePlayer = battlePlayerList[0];
                    }

                    exportObj[i] = JSON.stringify(constructPlayerExportObjFromStoredProfile(profile, clientObj, battlePlayer));
                    playerIDs[i - 1] = profile.characterName;
                    importedPlayerPositions[i - 1] = true;
                }
            }
            i++;
        }

        // Zone
        zone = characterObj.partyInfo?.party?.actionHrid;
        difficultyTier = characterObj.partyInfo?.party?.difficultyTier;
        isZoneDungeon = clientObj.actionDetailMap?.[zone]?.combatZoneInfo?.isDungeon;
    }

    return [exportObj, playerIDs, importedPlayerPositions, zone, difficultyTier, isZoneDungeon, isParty];
}

async function observeCombatSimulatorResults() {
    let resultDiv = document.querySelector(`div.row`)?.querySelectorAll(`div.col-md-5`)?.[2]?.querySelector(`div.row > div.col-md-5`);
    while (!resultDiv) {
        await new Promise((resolve) => setTimeout(resolve, 100));
        resultDiv = document.querySelector(`div.row`)?.querySelectorAll(`div.col-md-5`)?.[2]?.querySelector(`div.row > div.col-md-5`);
    }

    const deathDiv = document.querySelector(`div#simulationResultPlayerDeaths`)!;
    const expDiv = document.querySelector(`div#simulationResultExperienceGain`)!;
    const consumeDiv = document.querySelector(`div#simulationResultConsumablesUsed`)!;
    deathDiv.style.backgroundColor = "#FFEAE9";
    deathDiv.style.color = "black";
    expDiv.style.backgroundColor = "#CDFFDD";
    expDiv.style.color = "black";
    consumeDiv.style.backgroundColor = "#F0F8FF";
    consumeDiv.style.color = "black";

    let div = document.createElement("div");
    div.id = "tillLevel";
    div.style.backgroundColor = "#FFFFE0";
    div.style.color = "black";
    div.textContent = "";
    resultDiv.append(div);

    new MutationObserver((mutationsList) => {
        mutationsList.forEach((mutation) => {
            if (mutation.addedNodes.length >= 3) {
                handleCombatSimulatorResult(mutation.addedNodes, div);
            }
        });
    }).observe(expDiv, { childList: true, subtree: true });
}

function getStoredLevelExperienceTable(): Record<number, number> {
    let table: any = {};
    try {
        const clientObj = JSON.parse(GM_getValue("init_client_data", "null"));
        table = clientObj?.levelExperienceTable ?? {};
    } catch {
        table = {};
    }
    return table;
}

function handleCombatSimulatorResult(expNodes, parentDiv) {
    const isZHIn3rdPartyWebsites = localStorage.getItem("i18nextLng")?.toLowerCase()?.startsWith("zh");

    let perHourGainExp: Record<string, number> = {
        stamina: 0,
        intelligence: 0,
        attack: 0,
        melee: 0,
        defense: 0,
        ranged: 0,
        magic: 0,
    };

    for (const expNode of expNodes) {
        if (getOriTextFromElement(expNode.children[0]).includes("Stamina") || getOriTextFromElement(expNode.children[0]).includes("耐力")) {
            perHourGainExp.stamina = Number(expNode.children[1].textContent);
        } else if (getOriTextFromElement(expNode.children[0]).includes("Intelligence") || getOriTextFromElement(expNode.children[0]).includes("智力")) {
            perHourGainExp.intelligence = Number(expNode.children[1].textContent);
        } else if (getOriTextFromElement(expNode.children[0]).includes("Attack") || getOriTextFromElement(expNode.children[0]).includes("攻击")) {
            perHourGainExp.attack = Number(expNode.children[1].textContent);
        } else if (getOriTextFromElement(expNode.children[0]).includes("Melee") || getOriTextFromElement(expNode.children[0]).includes("近战")) {
            perHourGainExp.melee = Number(expNode.children[1].textContent);
        } else if (getOriTextFromElement(expNode.children[0]).includes("Defense") || getOriTextFromElement(expNode.children[0]).includes("防御")) {
            perHourGainExp.defense = Number(expNode.children[1].textContent);
        } else if (getOriTextFromElement(expNode.children[0]).includes("Ranged") || getOriTextFromElement(expNode.children[0]).includes("远程")) {
            perHourGainExp.ranged = Number(expNode.children[1].textContent);
        } else if (getOriTextFromElement(expNode.children[0]).includes("Magic") || getOriTextFromElement(expNode.children[0]).includes("魔法")) {
            perHourGainExp.magic = Number(expNode.children[1].textContent);
        }
    }

    let obj = JSON.parse(GM_getValue("init_character_data", "null"));
    if (!obj || !obj.characterSkills) {
        console.error("handleResult no character localstorage");
        return;
    }

    const skillLevels = buildCombatSkillLevels(obj.characterSkills);

    let hTMLStr = "";
    for (const skill of COMBAT_SKILL_HRIDS) {
        const skillInfo = skillLevels[skill];
        if (!skillInfo) {
            continue;
        }
        hTMLStr += `<div id="${"inputDiv_" + skill}" style="display: flex; justify-content: flex-end">${
            isZHIn3rdPartyWebsites ? skillInfo.skillZhName : skillInfo.skillName
        }${isZHIn3rdPartyWebsites ? "到" : " to level "}<input id="${"input_" + skill}" type="number" value="${
            skillInfo.currentLevel + 1
        }" min="${skillInfo.currentLevel + 1}" max="200">${isZHIn3rdPartyWebsites ? "级" : ""}</div>`;
    }

    hTMLStr += `<div id="script_afterDays" style="display: flex; justify-content: flex-end"><input id="script_afterDays_input" type="number" value="1" min="0" max="200">${
        isZHIn3rdPartyWebsites ? "天后" : "days after"
    }</div>`;

    hTMLStr += `<div id="needDiv"></div>`;
    hTMLStr += `<div id="needListDiv"></div>`;
    parentDiv.innerHTML = hTMLStr;

    for (const skill of COMBAT_SKILL_HRIDS) {
        const skillInfo = skillLevels[skill];
        if (!skillInfo) {
            continue;
        }
        const skillDiv = parentDiv.querySelector(`div#${"inputDiv_" + skill}`);
        const skillInput = parentDiv.querySelector(`input#${"input_" + skill}`);
        skillInput.onchange = () => {
            calculateTill(skill, skillInput, skillLevels, parentDiv, perHourGainExp, isZHIn3rdPartyWebsites);
        };
        skillInput.addEventListener("keyup", function (evt) {
            calculateTill(skill, skillInput, skillLevels, parentDiv, perHourGainExp, isZHIn3rdPartyWebsites);
        });
        skillDiv.onclick = () => {
            calculateTill(skill, skillInput, skillLevels, parentDiv, perHourGainExp, isZHIn3rdPartyWebsites);
        };
    }

    const daysAfterDiv = parentDiv.querySelector(`div#script_afterDays`);
    const daysAfterInput = parentDiv.querySelector(`input#script_afterDays_input`);
    daysAfterInput.onchange = () => {
        calculateAfterDays(daysAfterInput, skillLevels, parentDiv, perHourGainExp, isZHIn3rdPartyWebsites);
    };
    daysAfterInput.addEventListener("keyup", function (evt) {
        calculateAfterDays(daysAfterInput, skillLevels, parentDiv, perHourGainExp, isZHIn3rdPartyWebsites);
    });
    daysAfterDiv.onclick = () => {
        calculateAfterDays(daysAfterInput, skillLevels, parentDiv, perHourGainExp, isZHIn3rdPartyWebsites);
    };

    // 提取成本和收益
    const expensesSpan = document.querySelector(`span#expensesSpan`)!;
    const revenueSpan = document.querySelector(`span#revenueSpan`)!;
    const profitSpan = document.querySelector(`span#profitPreview`)!;
    const expenseDiv = document.querySelector(`div#script_expense`);
    const revenueDiv = document.querySelector(`div#script_revenue`);
    if (expenseDiv && revenueDiv) {
        expenseDiv.textContent = expensesSpan.parentNode!.textContent;
        revenueDiv.textContent = revenueSpan.parentNode!.textContent;
    } else {
        profitSpan.parentNode!.insertAdjacentHTML(
            "beforeend",
            `<div id="script_expense" style="background-color: #DCDCDC; color: black;">${expensesSpan.parentNode!.textContent}</div><div id="script_revenue" style="background-color: #DCDCDC; color: black;">${revenueSpan.parentNode!.textContent}</div>`
        );
    }
}

function calculateAfterDays(daysAfterInput, skillLevels, parentDiv, perHourGainExp, isZHIn3rdPartyWebsites) {
    const initData_levelExperienceTable = getStoredLevelExperienceTable();
    const days = Number(daysAfterInput.value);
    parentDiv.querySelector(`div#needDiv`).textContent = `${isZHIn3rdPartyWebsites ? "" : "After"} ${days} ${
        isZHIn3rdPartyWebsites ? "天后：" : "days: "
    }`;
    const listDiv = parentDiv.querySelector(`div#needListDiv`);
    if (!Object.keys(initData_levelExperienceTable).length) {
        listDiv.innerHTML = isZHIn3rdPartyWebsites ? "缺少游戏数据" : "Missing game data";
        return;
    }

    let html = "";
    let resultLevels: any = {};
    for (const skillName of COMBAT_SKILL_HRIDS) {
        const skill = skillLevels[skillName];
        if (!skill) {
            continue;
        }
        const exp = skill.currentExp + perHourGainExp[skillName] * days * 24;
        let level = 1;
        while (initData_levelExperienceTable[level] < exp) {
            level++;
        }
        level--;
        const minExpAtLevel = initData_levelExperienceTable[level];
        const maxExpAtLevel = initData_levelExperienceTable[level + 1] - 1;
        const expSpanInLevel = maxExpAtLevel - minExpAtLevel;
        const levelPercentage = Number(((exp - minExpAtLevel) / expSpanInLevel) * 100).toFixed(1);
        resultLevels[skillName] = level;
        html += `<div>${isZHIn3rdPartyWebsites ? skill.skillZhName : skill.skillName} ${isZHIn3rdPartyWebsites ? "" : "level"} ${level} ${
            isZHIn3rdPartyWebsites ? "级" : ""
        } ${levelPercentage}%</div>`;
    }
    const combatLevel =
        0.1 * (resultLevels.stamina + resultLevels.intelligence + resultLevels.defense + resultLevels.attack + Math.max(resultLevels.melee, resultLevels.ranged, resultLevels.magic)) +
        0.5 * Math.max(resultLevels.attack, resultLevels.defense, resultLevels.melee, resultLevels.ranged, resultLevels.magic);
    html += `<div>${isZHIn3rdPartyWebsites ? "战斗等级：" : "Combat level: "} ${Number.isFinite(combatLevel) ? combatLevel.toFixed(1) : "N/A"}</div>`;
    listDiv.innerHTML = html;
}

function calculateTill(skillName, skillInputElem, skillLevels, parentDiv, perHourGainExp, isZHIn3rdPartyWebsites) {
    const initData_levelExperienceTable = getStoredLevelExperienceTable();
    const targetLevel = Number(skillInputElem.value);
    const skillInfo = skillLevels[skillName];
    if (!skillInfo) {
        return;
    }
    parentDiv.querySelector(`div#needDiv`).textContent = `${
        isZHIn3rdPartyWebsites ? skillInfo.skillZhName : skillInfo.skillName
    } ${isZHIn3rdPartyWebsites ? "到" : "to level"} ${targetLevel} ${isZHIn3rdPartyWebsites ? "级 还需：" : " takes: "}`;
    const listDiv = parentDiv.querySelector(`div#needListDiv`);
    if (!Object.keys(initData_levelExperienceTable).length) {
        listDiv.innerHTML = isZHIn3rdPartyWebsites ? "缺少游戏数据" : "Missing game data";
        return;
    }

    const currentLevel = Number(skillInfo.currentLevel);
    const currentExp = Number(skillInfo.currentExp);
    if (targetLevel > currentLevel && targetLevel <= 200) {
        if (perHourGainExp[skillName] === 0) {
            listDiv.innerHTML = isZHIn3rdPartyWebsites ? "永远" : "Forever";
        } else {
            let needExp = initData_levelExperienceTable[targetLevel] - currentExp;
            let needHours = needExp / perHourGainExp[skillName];
            let html = "";
            html += `<div>[${formatDuration(needHours * 3600)}]</div>`;

            const consumeDivs = document.querySelectorAll(`div#simulationResultConsumablesUsed div.row`);
            for (const elem of consumeDivs) {
                const conName = elem.children[0].textContent;
                const conPerHour = Number(elem.children[1].textContent);
                html += `<div>${conName} ${Number(conPerHour * needHours).toFixed(0)}</div>`;
            }

            listDiv.innerHTML = html;
        }
    } else {
        listDiv.innerHTML = isZHIn3rdPartyWebsites ? "输入错误" : "Input error";
    }
}
