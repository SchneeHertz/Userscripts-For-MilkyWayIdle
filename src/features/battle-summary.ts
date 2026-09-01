/* 战斗总结 */
function handleBattleSummary(message) {
    let totalRawCoins = 0; // For IC

    if (message.unit.totalLootMap) {
        for (const loot of Object.values(message.unit.totalLootMap)) {
            if (loot.itemHrid === "/items/coin") {
                totalRawCoins += loot.count;
            }
        }
    }

    let totalSkillsExp = 0;
    if (message.unit.totalSkillExperienceMap) {
        for (const exp of Object.values(message.unit.totalSkillExperienceMap)) {
            totalSkillsExp += exp;
        }
    }

    let tryTimes = 0;
    findElem();
    function findElem() {
        tryTimes++;
        let elem = document.querySelector(".BattlePanel_gainedExp__3SaCa")?.parentElement;
        if (elem) {
            // 战斗时长和次数
            let battleDurationSec = null;
            const combatInfoElement = document.querySelector(".BattlePanel_combatInfo__sHGCe");
            if (combatInfoElement) {
                let matches = combatInfoElement.innerHTML.match(
                    /(战斗时间|战斗时长|Combat Duration): (?:(\d+)d\s*)?(?:(\d+)h\s*)?(?:(\d+)m\s*)?(?:(\d+)s).*?(交战|战斗|Battles): (\d+).*?(战败|死亡次数|Deaths): (\d+)/
                );
                if (matches) {
                    let days = parseInt(matches[2], 10) || 0;
                    let hours = parseInt(matches[3], 10) || 0;
                    let minutes = parseInt(matches[4], 10) || 0;
                    let seconds = parseInt(matches[5], 10) || 0;
                    let battles = parseInt(matches[7], 10) - 1; // 排除当前战斗
                    battleDurationSec = days * 86400 + hours * 3600 + minutes * 60 + seconds;
                    let efficiencyPerHour = ((battles / battleDurationSec) * 3600).toFixed(1);
                    elem.insertAdjacentHTML(
                        "beforeend",
                        `<div id="script_battleNumbers" style="color: ${SCRIPT_COLOR_MAIN};">${
                            isZH ? "每小时战斗: " : "Encounters/hour: "
                        }${efficiencyPerHour}${isZH ? " 次" : ""}</div>`
                    );
                }
            }
            // 金币收获
            if (battleDurationSec) {
                document
                    .querySelector("div#script_battleNumbers")
                    .insertAdjacentHTML(
                        "afterend",
                        `<div id="script_avgRawCoinHour" style="color: ${SCRIPT_COLOR_MAIN};">${
                            isZH ? "每小时金币收获: " : "Raw coins/hour: "
                        }${numberFormatter(totalRawCoins / (battleDurationSec / 60 / 60))}</div>`
                    );
            }
            // 总经验
            document
                .querySelector("div#script_battleNumbers")
                .insertAdjacentHTML(
                    "afterend",
                    `<div id="script_totalSkillsExp" style="color: ${SCRIPT_COLOR_MAIN};">${isZH ? "总经验: " : "Total exp: "}${numberFormatter(
                        totalSkillsExp
                    )}</div>`
                );
            // 平均经验
            if (battleDurationSec) {
                document
                    .querySelector("div#script_totalSkillsExp")
                    .insertAdjacentHTML(
                        "afterend",
                        `<div id="script_averageSkillsExp" style="color: ${SCRIPT_COLOR_MAIN};">${
                            isZH ? "每小时总经验: " : "Total exp/hour: "
                        }${numberFormatter(totalSkillsExp / (battleDurationSec / 60 / 60))}</div>`
                    );

                [
                    { skillHrid: "/skills/magic", zhName: "魔法", enName: "Magic" },
                    { skillHrid: "/skills/ranged", zhName: "远程", enName: "Ranged" },
                    { skillHrid: "/skills/defense", zhName: "防御", enName: "Defense" },
                    { skillHrid: "/skills/melee", zhName: "近战", enName: "Melee" },
                    { skillHrid: "/skills/attack", zhName: "攻击", enName: "Attack" },
                    { skillHrid: "/skills/intelligence", zhName: "智力", enName: "Intelligence" },
                    { skillHrid: "/skills/stamina", zhName: "耐力", enName: "Stamina" },
                ].forEach((skill) => {
                    const expGained = message.unit.totalSkillExperienceMap[skill.skillHrid];
                    if (expGained) {
                        document
                            .querySelector("div#script_totalSkillsExp")
                            .insertAdjacentHTML(
                                "afterend",
                                `<div style="color: ${SCRIPT_COLOR_MAIN};">${isZH ? "每小时" : ""}${isZH ? skill.zhName : skill.enName}${
                                    isZH ? "经验: " : " exp/hour: "
                                }${numberFormatter(expGained / (battleDurationSec / 60 / 60))}</div>`
                            );
                    }
                });
            } else {
                console.error("handleBattleSummary unable to display average exp due to null battleDurationSec");
            }
        } else if (tryTimes <= 10) {
            setTimeout(findElem, 200);
        } else {
            console.error("handleBattleSummary: Elem not found after 10 tries.");
        }
    }
}

function handleBattleUnitFetched(message) {
    if (settingsMap.battlePanel.isTrue) {
        handleBattleSummary(message);
    }
}

registerMessageHandler("battle_unit_fetched", handleBattleUnitFetched);

