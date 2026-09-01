/* 动作面板 */
const waitForActionPanelParent = () => {
    const targetNode = document.querySelector("div.GamePage_mainPanel__2njyb");
    if (targetNode) {
        console.log("start observe action panel");
        const actionPanelObserver = new MutationObserver(async function (mutations) {
            for (const mutation of mutations) {
                for (const added of mutation.addedNodes) {
                    if (
                        added?.classList?.contains("Modal_modalContainer__3B80m") &&
                        added.querySelector("div.SkillActionDetail_regularComponent__3oCgr")
                    ) {
                        handleActionPanel(added.querySelector("div.SkillActionDetail_regularComponent__3oCgr"));
                    }
                }
            }
        });
        actionPanelObserver.observe(targetNode, { attributes: false, childList: true, subtree: true });
    } else {
        setTimeout(waitForActionPanelParent, 200);
    }
};

async function handleActionPanel(panel) {
    if (!settingsMap.actionPanel_totalTime.isTrue) {
        return;
    }

    if (!panel.querySelector("div.SkillActionDetail_expGain__F5xHu")) {
        return; // 不处理战斗ActionPanel
    }
    let actionName = getOriTextFromElement(panel.querySelector("div.SkillActionDetail_name__3erHV"));
    if (isZHInGameSetting) {
        actionName = getActionEnNameFromZhName(actionName);
    }

    const exp = Number(
        getOriTextFromElement(panel.querySelector("div.SkillActionDetail_expGain__F5xHu"))
            .replaceAll(THOUSAND_SEPERATOR, "")
            .replaceAll(DECIMAL_SEPERATOR, ".")
    );

    const elems = panel.querySelectorAll("div.SkillActionDetail_value__dQjYH");
    const duration = Number(
        getOriTextFromElement(elems[elems.length - 2])
            .replaceAll(THOUSAND_SEPERATOR, "")
            .replaceAll(DECIMAL_SEPERATOR, ".")
            .replace("s", "")
    );
    const inputElem = panel.querySelector("div.SkillActionDetail_maxActionCountInput__1C0Pw input");

    const actionHrid = initData_actionDetailMap[getActionHridFromItemName(actionName)].hrid;
    const effBuff = 1 + getTotalEffiPercentage(actionHrid, false) / 100;

    // 显示总时间
    let hTMLStr = `<div id="showTotalTime" style="color: ${SCRIPT_COLOR_MAIN}; text-align: left;">${getTotalTimeStr(
        inputElem.value,
        duration,
        effBuff
    )}</div>`;
    const gatherDiv = inputElem.parentNode.parentNode.parentNode;
    gatherDiv.insertAdjacentHTML("afterend", hTMLStr);
    const showTotalTimeDiv = panel.querySelector("div#showTotalTime");

    panel.addEventListener("click", function (evt) {
        setTimeout(() => {
            showTotalTimeDiv.textContent = getTotalTimeStr(inputElem.value, duration, effBuff);
        }, 50);
    });
    inputElem.addEventListener("keyup", function (evt) {
        if (inputElem.value.toLowerCase().includes("k") || inputElem.value.toLowerCase().includes("m")) {
            reactInputTriggerHack(inputElem, inputElem.value.toLowerCase().replaceAll("k", "000").replaceAll("m", "000000"));
        }
        showTotalTimeDiv.textContent = getTotalTimeStr(inputElem.value, duration, effBuff);
    });

    let appendAfterElem = showTotalTimeDiv;

    // 显示快捷按钮
    if (settingsMap.actionPanel_totalTime_quickInputs.isTrue) {
        hTMLStr = `<div id="quickInputHourButtons" style="color: ${SCRIPT_COLOR_MAIN}; text-align: left; display:flex;">${isZH ? "做 " : "Do "}</div>`;
        showTotalTimeDiv.insertAdjacentHTML("afterend", hTMLStr);
        const quickInputHourButtonsDiv = panel.querySelector("div#quickInputHourButtons");

        const presetHours = [0.5, 1, 2, 3, 4, 5, 6, 10, 12, 24];
        for (const value of presetHours) {
            const btn = document.createElement("button");
            btn.className = "Button_button__1Fe9z Button_small__3fqC7";
            btn.style.backgroundColor = "white";
            btn.style.color = "black";
            btn.style.padding = "1px 6px 1px 6px";
            btn.style.margin = "1px";
            btn.innerText = value === 0.5 ? 0.5 : numberFormatter(value);
            btn.onclick = () => {
                reactInputTriggerHack(inputElem, Math.round((value * 60 * 60 * effBuff) / duration));
            };
            quickInputHourButtonsDiv.append(btn);
        }
        quickInputHourButtonsDiv.append(document.createTextNode(isZH ? " 小时" : " hours"));

        hTMLStr = `<div id="quickInputCountButtons" style="color: ${SCRIPT_COLOR_MAIN}; text-align: left; display:flex;">${isZH ? "做 " : "Do "}</div>`;
        quickInputHourButtonsDiv.insertAdjacentHTML("afterend", hTMLStr);
        const quickInputCountButtonsDiv = panel.querySelector("div#quickInputCountButtons");
        const presetTimes = [10, 100, 300, 500, 1000, 2000];
        for (const value of presetTimes) {
            const btn = document.createElement("button");
            btn.className = "Button_button__1Fe9z Button_small__3fqC7";
            btn.style.backgroundColor = "white";
            btn.style.color = "black";
            btn.style.padding = "1px 6px 1px 6px";
            btn.style.margin = "1px";
            btn.innerText = numberFormatter(value);
            btn.onclick = () => {
                reactInputTriggerHack(inputElem, value);
            };
            quickInputCountButtonsDiv.append(btn);
        }
        quickInputCountButtonsDiv.append(document.createTextNode(isZH ? " 次" : " times"));

        appendAfterElem = quickInputCountButtonsDiv;
    }

    // 还有多久到多少技能等级
    const skillHrid = initData_actionDetailMap[getActionHridFromItemName(actionName)].experienceGain.skillHrid;
    let currentExp = null;
    let currentLevel = null;
    for (const skill of initData_characterSkills) {
        if (skill.skillHrid === skillHrid) {
            currentExp = skill.experience;
            currentLevel = skill.level;
            break;
        }
    }
    if (currentExp && currentLevel) {
        const calculateNeedToLevel = (currentLevel, targetLevel, effBuff, duration, exp) => {
            let needTotalTimeSec = 0;
            let needTotalNumOfActions = 0;
            for (let level = currentLevel; level < targetLevel; level++) {
                let needExpToNextLevel = null;
                if (level === currentLevel) {
                    needExpToNextLevel = initData_levelExperienceTable[level + 1] - currentExp;
                } else {
                    needExpToNextLevel = initData_levelExperienceTable[level + 1] - initData_levelExperienceTable[level];
                }
                const extraLevelEffBuff = (level - currentLevel) * 0.01; // 升级过程中，每升一级，额外多1%效率
                const needNumOfActionsToNextLevel = Math.round(needExpToNextLevel / exp);
                needTotalNumOfActions += needNumOfActionsToNextLevel;
                needTotalTimeSec += (needNumOfActionsToNextLevel / (effBuff + extraLevelEffBuff)) * duration;
            }
            return { numOfActions: needTotalNumOfActions, timeSec: needTotalTimeSec };
        };

        const need = calculateNeedToLevel(currentLevel, currentLevel + 1, effBuff, duration, exp);
        hTMLStr = `<div id="tillLevel" style="color: ${SCRIPT_COLOR_MAIN}; text-align: left;">${
            isZH ? "到 " : "To reach level "
        }<input id="tillLevelInput" type="number" value="${currentLevel + 1}" min="${currentLevel + 1}" max="200">${
            isZH ? " 级还需做 " : ", need to do "
        }<span id="tillLevelNumber">${need.numOfActions}${isZH ? " 次" : " times "}[${timeReadable(need.timeSec)}]${
            isZH ? " (刷新网页更新当前等级)" : " (Refresh page to update current level)"
        }</span></div>`;

        appendAfterElem.insertAdjacentHTML("afterend", hTMLStr);
        const tillLevelInput = panel.querySelector("input#tillLevelInput");
        const tillLevelNumber = panel.querySelector("span#tillLevelNumber");
        tillLevelInput.onchange = () => {
            const targetLevel = Number(tillLevelInput.value);
            if (targetLevel > currentLevel && targetLevel <= 200) {
                const need = calculateNeedToLevel(currentLevel, targetLevel, effBuff, duration, exp);
                tillLevelNumber.textContent = `${need.numOfActions}${isZH ? " 次" : " times "}[${timeReadable(need.timeSec)}]${
                    isZH ? " (刷新网页更新当前等级)" : " (Refresh page to update current level)"
                }`;
            } else {
                tillLevelNumber.textContent = "Error";
            }
        };
        tillLevelInput.addEventListener("keyup", function (evt) {
            const targetLevel = Number(tillLevelInput.value);
            if (targetLevel > currentLevel && targetLevel <= 200) {
                const need = calculateNeedToLevel(currentLevel, targetLevel, effBuff, duration, exp);
                tillLevelNumber.textContent = `${need.numOfActions}${isZH ? " 次" : " times "}[${timeReadable(need.timeSec)}]${
                    isZH ? " (刷新网页更新当前等级)" : " (Refresh page to update current level)"
                }`;
            } else {
                tillLevelNumber.textContent = "Error";
            }
        });
    }

    // 显示每小时经验
    panel
        .querySelector("div#tillLevel")
        .insertAdjacentHTML(
            "afterend",
            `<div id="expPerHour" style="color: ${SCRIPT_COLOR_MAIN}; text-align: left;">${isZH ? "每小时经验: " : "Exp/hour: "}${numberFormatter(
                Math.round((3600 / duration) * exp * effBuff)
            )} (+${Number((effBuff - 1) * 100).toFixed(1)}%${isZH ? "效率" : " eff"})</div>`
        );

}

function getTotalEffiPercentage(actionHrid, debug = false) {
    if (debug) {
        console.log("----- getTotalEffiPercentage " + actionHrid);
    }
    // 等级碾压效率
    const requiredLevel = initData_actionDetailMap[actionHrid].levelRequirement.level;
    let currentLevel = requiredLevel;
    for (const skill of initData_characterSkills) {
        if (skill.skillHrid === initData_actionDetailMap[actionHrid].levelRequirement.skillHrid) {
            currentLevel = skill.level;
            break;
        }
    }
    const levelEffBuff = currentLevel - requiredLevel > 0 ? currentLevel - requiredLevel : 0;
    if (debug) {
        console.log("等级碾压 " + levelEffBuff);
    }
    // 房子效率
    const houseEffBuff = getHousesEffBuffByActionHrid(actionHrid);
    if (debug) {
        console.log("房子 " + houseEffBuff);
    }
    // 茶
    const teaBuffs = getTeaBuffsByActionHrid(actionHrid);
    if (debug) {
        console.log("茶 " + teaBuffs.efficiency);
    }
    // 特殊装备
    const itemEffiBuff = getItemEffiBuffByActionHrid(actionHrid);
    if (debug) {
        console.log("特殊装备 " + itemEffiBuff);
    }
    // 总效率
    const total = levelEffBuff + houseEffBuff + teaBuffs.efficiency + Number(itemEffiBuff);
    if (debug) {
        console.log("总计 " + total);
    }
    return total;
}

function getTotalTimeStr(input, duration, effBuff) {
    if (input === "∞") {
        return "[∞]";
    } else if (isNaN(input)) {
        return "Error";
    }
    return "[" + timeReadable(Math.round(input / effBuff) * duration) + "]";
}

function reactInputTriggerHack(inputElem, value) {
    let lastValue = inputElem.value;
    inputElem.value = value;
    let event = new Event("input", { bubbles: true });
    event.simulated = true;
    let tracker = inputElem._valueTracker;
    if (tracker) {
        tracker.setValue(lastValue);
    }
    inputElem.dispatchEvent(event);
}

registerMessageHandler("init_character_data", waitForActionPanelParent);

