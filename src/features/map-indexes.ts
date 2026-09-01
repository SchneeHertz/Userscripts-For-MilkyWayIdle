/* 任务卡片显示战斗地图序号 */
function handleTaskCard() {
    const taskNameDivs = document.querySelectorAll("div.RandomTask_randomTask__3B9fA div.RandomTask_name__1hl1b");
    for (const div of taskNameDivs) {
        if (div.querySelector("span.script_taskMapIndex")) {
            continue;
        }

        const taskStr = getOriTextFromElement(div);
        if (!taskStr.startsWith("Defeat - ") && !taskStr.startsWith("击败 - ")) {
            continue;
        }

        let monsterName = taskStr.replace("Defeat - ", "").replace("击败 - ", "");
        let actionHrid = null;
        if (isZHInGameSetting) {
            actionHrid = (
                getOthersFromZhName(monsterName) ? getOthersFromZhName(monsterName) : getActionEnNameFromZhName(monsterName)
            )?.replaceAll("/monsters/", "/actions/combat/");
        }

        let actionObj = null;
        for (const action of Object.values(initData_actionDetailMap)) {
            if (action.hrid.includes("/combat/")) {
                if (action.hrid === actionHrid || action.name.toLowerCase() === monsterName.toLowerCase()) {
                    actionObj = action;
                    break;
                } else if (action.combatZoneInfo.fightInfo.battlesPerBoss === 10) {
                    if (
                        actionHrid?.replaceAll("/actions/combat/", "/monsters/") ===
                            action.combatZoneInfo.fightInfo.bossSpawns[0].combatMonsterHrid ||
                        "/monsters/" + monsterName.toLowerCase().replaceAll(" ", "_") ===
                            action.combatZoneInfo.fightInfo.bossSpawns[0].combatMonsterHrid
                    ) {
                        actionObj = action;
                        break;
                    }
                }
            }
        }
        const actionCategoryHrid = actionObj?.category;
        const index = initData_actionCategoryDetailMap?.[actionCategoryHrid]?.sortIndex;
        if (index) {
            div.insertAdjacentHTML(
                "beforeend",
                `<span class="script_taskMapIndex" style="text-align: right; color: ${SCRIPT_COLOR_MAIN};"> ${isZH ? "图" : "Z"}${index}</span>`
            );
        }
    }
}
/* 显示战斗地图序号 */
function addIndexToMaps() {
    const buttons = document.querySelectorAll(
        "div.MainPanel_subPanelContainer__1i-H9 div.CombatPanel_tabsComponentContainer__GsQlg div.MuiTabs-root.MuiTabs-vertical.css-6x4ics button.MuiButtonBase-root.MuiTab-root.MuiTab-textColorPrimary.css-1q2h7u5 span.MuiBadge-root.TabsComponent_badge__1Du26.css-1rzb3uu"
    );
    let index = 1;
    for (const button of buttons) {
        if (!button.querySelector("span.script_mapIndex")) {
            button.insertAdjacentHTML("afterbegin", `<span class="script_mapIndex" style="color: ${SCRIPT_COLOR_MAIN};">${index++}. </span>`);
        }
    }
}
function initializeMapIndexes() {
    if (settingsMap.taskMapIndex.isTrue) {
        setInterval(handleTaskCard, 500);
    }
    if (settingsMap.mapIndex.isTrue) {
        setInterval(addIndexToMaps, 500);
    }
}

