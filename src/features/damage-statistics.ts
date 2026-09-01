/* 伤害统计 */
// 此功能基于以下作者的代码：
// 伤害统计 by ponchain
// 图表 by Stella
// 头像下方显示数字 by Truth_Light
const lang = {
    toggleButtonHide: isZH ? "收起" : "Hide",
    toggleButtonShow: isZH ? "展开" : "Show",
    players: isZH ? "玩家" : "Players",
    dpsTextDPS: isZH ? "DPS" : "DPS",
    dpsTextTotalDamage: isZH ? "总伤害" : "Total Damage",
    totalRuntime: isZH ? "运行时间" : "Runtime",
    totalTeamDPS: isZH ? "团队DPS" : "Total Team DPS",
    totalTeamDamage: isZH ? "团队总伤害" : "Total Team Damage",
    damagePercentage: isZH ? "伤害占比" : "Damage %",
    monstername: isZH ? "怪物" : "Monster",
    encountertimes: isZH ? "遭遇数" : "Encounter",
    hitChance: isZH ? "命中率" : "Hit Chance",
    aura: isZH ? "光环" : "Aura",
};

let totalDamage: any[] = [];
let totalDuration = 0;
let startTime: number | null = null;
let endTime: number | null = null;
let monstersHP: any[] = [];
let playersMP: any[] = [];
let players: any[] = [];
let monsters: any[] = [];
let dragging = false;
let chart: any = null;
let monsterCounts: any = {}; // Object to store monster counts
let monsterEvasion: any = {}; // Object to store monster evasion ratings by combat style
let monsterHrids: any = {};
const calculateHitChance = (accuracy, evasion) => {
    const hitChance = (Math.pow(accuracy, 1.4) / (Math.pow(accuracy, 1.4) + Math.pow(evasion, 1.4))) * 100;
    return hitChance;
};

const getStatisticsDom = () => {
    const numPlayers = players.length;
    const chartHeight = numPlayers * 35 + 20;

    if (!document.querySelector(".script_dps_panel")) {
        let panel = document.createElement("div");
        panel.style.position = "fixed";
        panel.style.top = "50px";
        panel.style.left = "50px";
        panel.style.zIndex = "9999";
        panel.style.fontSize = "0.875rem";
        panel.style.padding = "10px";
        panel.style.borderRadius = "16px";
        panel.style.boxShadow = "0 4px 12px rgba(0, 0, 0, 0.3)";
        panel.style.overflow = "auto";
        panel.style.width = "auto";
        panel.style.height = "auto";
        panel.style.backdropFilter = "blur(8px)";
        if (settingsMap.damageGraphTransparentBackground.isTrue) {
            panel.style.background = "rgba(0, 0, 0, 0.5)";
            panel.style.border = "1px solid rgba(255, 255, 255, 0.2)";
            panel.style.boxShadow = "0 4px 12px rgba(0, 0, 0, 0.3)";
            panel.style.backdropFilter = "blur(8px)";
        } else {
            panel.style.background = "rgba(0, 0, 0)";
            panel.style.border = "1px solid rgba(255, 255, 255)";
            panel.style.boxShadow = "0 4px 12px rgba(0, 0, 0)";
        }

        panel.innerHTML = `
        <div id="panelHeader" style="display: flex; justify-content: space-between; align-items: center; cursor: move; width: auto; height: auto;">
            <span style="font-weight: bold; font-size: 1rem; color: #0078d4;">DPS</span>
            <button id="script_toggleButton" style="background-color: #0078d4; color: white; border: none; padding: 5px 10px; margin-left: 10px; border-radius: 8px; cursor: pointer;">${lang.toggleButtonHide}</button>
        </div>
        <div id="script_panelContent">
            <div id="script_dpsChart_div" style="width: 400px; height: ${chartHeight}px;">
                <canvas id="script_dpsChart"></canvas></div>
            <div id="script_dpsText"></div>
            <div id="script_hitChanceTable" style="margin-top: 10px;"></div>
        </div>`;
        panel.className = "script_dps_panel";

        let offsetX, offsetY;

        const panelHeader = panel.querySelector<HTMLElement>("#panelHeader")!;

        // 鼠标拖动面板
        panelHeader.addEventListener("mousedown", function (e) {
            const rect = panel.getBoundingClientRect();
            const isResizing = e.clientX > rect.right - 10 || e.clientY > rect.bottom - 10;
            if (isResizing || (e.target as Element)?.id === "script_toggleButton") return;
            dragging = true;
            offsetX = e.clientX - panel.offsetLeft;
            offsetY = e.clientY - panel.offsetTop;
            e.preventDefault(); // 阻止默认行为，防止选择文本
        });

        let dragStartTime = 0;

        document.addEventListener("mousemove", function (e) {
            if (dragging) {
                const now = Date.now();
                if (now - dragStartTime < 16) return; // 限制每16毫秒更新一次
                dragStartTime = now;

                var newX = e.clientX - offsetX;
                var newY = e.clientY - offsetY;
                panel.style.left = newX + "px";
                panel.style.top = newY + "px";
            }
        });

        document.addEventListener("mouseup", function () {
            dragging = false;
        });

        panel.addEventListener("touchstart", function (e) {
            const rect = panel.getBoundingClientRect();
            const touch = e.touches[0];
            const isResizing = touch.clientX > rect.right - 10 || touch.clientY > rect.bottom - 10;
            if (isResizing || (e.target as Element)?.id === "script_toggleButton") return;
            dragging = true;
            offsetX = touch.clientX - panel.offsetLeft;
            offsetY = touch.clientY - panel.offsetTop;
            e.preventDefault();
        });

        document.addEventListener("touchmove", function (e) {
            if (dragging) {
                const now = Date.now();
                if (now - dragStartTime < 16) return; // 限制每16毫秒更新一次
                dragStartTime = now;

                let touch = e.touches[0];
                var newX = touch.clientX - offsetX;
                var newY = touch.clientY - offsetY;
                panel.style.left = newX + "px";
                panel.style.top = newY + "px";
            }
        });

        document.addEventListener("touchend", function () {
            dragging = false;
        });

        document.body.appendChild(panel);

        // Toggle button functionality
        if (!localStorage.getItem("script_dpsPanel_isExpanded")) {
            localStorage.setItem("script_dpsPanel_isExpanded", "true");
        }
        if (localStorage.getItem("script_dpsPanel_isExpanded") !== "true") {
            document.getElementById("script_panelContent")!.style.display = "none";
            document.getElementById("script_toggleButton")!.textContent = lang.toggleButtonShow;
        }

        document.getElementById("script_toggleButton")!.addEventListener("click", function () {
            let isExpanded = localStorage.getItem("script_dpsPanel_isExpanded") === "true";
            isExpanded = !isExpanded;
            localStorage.setItem("script_dpsPanel_isExpanded", String(isExpanded));
            this.textContent = isExpanded ? lang.toggleButtonHide : lang.toggleButtonShow;
            const panelContent = document.getElementById("script_panelContent")!;
            if (isExpanded) {
                panelContent.style.display = "block";
                this.textContent = lang.toggleButtonHide;
            } else {
                panelContent.style.display = "none";
                this.textContent = lang.toggleButtonShow;
            }
        });

        // Create chart
        const ctx = document.getElementById("script_dpsChart")!.getContext("2d")!;
        chart = new Chart(ctx, {
            type: "bar",
            data: {
                labels: [],
                datasets: [
                    {
                        data: [],
                        backgroundColor: [
                            "rgba(255, 99, 132, 0.6)", // 浅粉色
                            "rgba(54, 162, 235, 0.6)", // 浅蓝色
                            "rgba(255, 206, 86, 0.6)", // 浅黄色
                            "rgba(75, 192, 192, 0.6)", // 浅绿色
                            "rgba(153, 102, 255, 0.6)", // 浅紫色
                            "rgba(255, 159, 64, 0.6)", // 浅橙色
                        ],
                        borderColor: [
                            "rgba(255, 99, 132, 1)", // 浅粉色边框
                            "rgba(54, 162, 235, 1)", // 浅蓝色边框
                            "rgba(255, 206, 86, 1)", // 浅黄色边框
                            "rgba(75, 192, 192, 1)", // 浅绿色边框
                            "rgba(153, 102, 255, 1)", // 浅紫色边框
                            "rgba(255, 159, 64, 1)", // 浅橙色边框
                        ],
                        borderWidth: 1,
                        barPercentage: 0.9,
                        categoryPercentage: 1.0,
                    },
                ],
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                indexAxis: "y",
                scales: {
                    x: {
                        beginAtZero: true,
                        grace: "20%",
                        display: false,
                        grid: {
                            display: false,
                        },
                    },
                    y: {
                        grid: {
                            display: false,
                        },
                        ticks: {
                            font: {
                                size: 12, // 字体大小
                                weight: "bold", // 加粗字体
                            },
                            color: "rgba(255, 255, 255, 0.7)", // 浅色字体（你可以根据背景调整颜色）
                        },
                    },
                },
                layout: {
                    padding: {
                        left: 0,
                        right: 0,
                        top: 0,
                        bottom: 0,
                    },
                },
                plugins: {
                    legend: {
                        display: false,
                    },
                    tooltip: {
                        enabled: false,
                    },
                    datalabels: {
                        anchor: "end",
                        align: "right",
                        color: function (context) {
                            const value = context.dataset.data[context.dataIndex];
                            return value > 0 ? "white" : "transparent";
                        },
                        font: {
                            weight: "bold",
                            size: 12,
                        },
                        formatter: function (value) {
                            return `${value.toLocaleString()}`;
                        },
                        clip: false,
                        display: true,
                    },
                },
            },

            plugins: [ChartDataLabels],
        });
    } else if (document.getElementById("script_dpsChart_div")) {
        document.getElementById("script_dpsChart_div")!.style.height = `${chartHeight}px`;
    }
    return document.querySelector(".script_dps_panel")!;
};

const updateStatisticsPanel = () => {
    const totalTime = totalDuration + ((endTime ?? 0) - (startTime ?? 0)) / 1000;
    const dps = totalDamage.map((damage) => (totalTime ? Math.round(damage / totalTime) : 0));
    const totalTeamDamage = totalDamage.reduce((acc, damage) => acc + damage, 0);
    const totalTeamDPS = totalTime ? Math.round(totalTeamDamage / totalTime) : 0;

    // 人物头像下方显示数字
    const playersContainer = document.querySelector(".BattlePanel_combatUnitGrid__2hTAM");
    if (playersContainer) {
        players.forEach((player, index) => {
            const playerElement = playersContainer.children[index];
            if (playerElement) {
                const statusElement = playerElement.querySelector(".CombatUnit_status__3bH7W");
                if (statusElement) {
                    let dpsElement = statusElement.querySelector(".dps-info");
                    if (!dpsElement) {
                        dpsElement = document.createElement("div");
                        dpsElement.className = "dps-info";
                        statusElement.appendChild(dpsElement);
                    }
                    dpsElement.textContent = `DPS: ${dps[index].toLocaleString()} (${totalDamage[index].toLocaleString()})`;
                }
            }
        });
    }

    // 显示图表
    if (settingsMap.showDamageGraph.isTrue && !dragging) {
        const panel = getStatisticsDom();
        chart.data.labels = players.map((player) => player?.name);
        chart.data.datasets[0].data = dps;
        chart.update();

        // Update text information
        const days = Math.floor(totalTime / (24 * 3600));
        const hours = Math.floor((totalTime % (24 * 3600)) / 3600);
        const minutes = Math.floor((totalTime % 3600) / 60);
        const seconds = Math.floor(totalTime % 60);
        const formattedTime = `${days}d ${hours}h ${minutes}m ${seconds}s`;

        const dpsText = document.getElementById("script_dpsText")!;
        const playerRows = players
            .map((player, index) => {
                const dpsFormatted = dps[index].toLocaleString();
                const totalDamageFormatted = totalDamage[index].toLocaleString();
                const damagePercentage = totalTeamDamage ? ((totalDamage[index] / totalTeamDamage) * 100).toFixed(2) : 0;

                // Get auraskill for the current player
                let auraskill = "N/A";
                let auraskillHrid = null;
                if (player.combatAbilities && Array.isArray(player.combatAbilities)) {
                    const firstAbility = player.combatAbilities[0];
                    if (firstAbility && firstAbility.abilityHrid) {
                        auraskillHrid = firstAbility.abilityHrid;
                        auraskill = firstAbility.abilityHrid.split("/").pop().replace(/_/g, " ");
                        const validSkills = [
                            "revive",
                            "insanity",
                            "invincible",
                            "fierce aura",
                            "aqua aura",
                            "sylvan aura",
                            "flame aura",
                            "speed aura",
                            "critical aura",
                        ];
                        if (!validSkills.includes(auraskill)) {
                            auraskill = "N/A";
                        }
                    }
                }

                // Capitalize the first letter of each word in aura skill
                auraskill = auraskill
                    .split(" ")
                    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                    .join(" ");

                // Highlight the player with the highest DPS
                const isHighestDPS = dps[index] === Math.max(...dps);
                const dpsPrefix = isHighestDPS ? "🔥" : "";

                return `
        <tr style="color: white;">
            <td style="font-weight: bold;">${dpsPrefix} ${player.name}</td>
            <td>${isZH ? (auraskillHrid ? ZHOthersDic[auraskillHrid] : "无") : auraskill}</td>
            <td>${dpsFormatted}</td>
            <td>${totalDamageFormatted}</td>
            <td>${damagePercentage}%</td>
        </tr>`;
            })
            .join("");

        dpsText.innerHTML = `
<table style="width: 100%; border-collapse: collapse; font-size: smaller;">
    <thead>
        <tr style="text-align: left; color: white;">
            <th style="font-weight: bold;">${lang.players}</th>
            <th style="font-weight: bold;">${lang.aura}</th>
            <th style="font-weight: bold;">${lang.dpsTextDPS}</th>
            <th style="font-weight: bold;">${lang.dpsTextTotalDamage}</th>
            <th style="font-weight: bold;">${lang.damagePercentage}</th>
        </tr>
    </thead>
    <tbody>
        ${playerRows}
    </tbody>
    <tbody>
        <tr style="border-top: 2px solid white; font-weight: bold; text-align: left; color: white;">
            <td>${formattedTime}</td>
            <td></td>
            <td>${totalTeamDPS.toLocaleString()}</td>
            <td>${totalTeamDamage.toLocaleString()}</td>
            <td>100%</td>
        </tr>
    </tbody>
</table>`;

        // Update hit chance table
        const hitChanceTable = document.getElementById("script_hitChanceTable")!;
        const hitChanceRows = players
            .map((player) => {
                const playerName = player.name;
                const playerHitChances = Object.entries(monsterCounts)
                    .map(([monsterName, count]) => {
                        const styles = player.combatDetails?.combatStats?.combatStyleHrids ?? [];
                        const styleHitChances = styles
                            .map((styleHrid: string) => {
                                const style = styleHrid.split("/").pop();
                                const evasionRating = monsterEvasion[monsterName]?.[`${player.name}-${style}`];
                                const accuracy = player.combatDetails?.[`${style}AccuracyRating`];
                                if (evasionRating == null || accuracy == null) {
                                    return null;
                                }
                                return calculateHitChance(accuracy, evasionRating);
                            })
                            .filter((hitChance: number | null) => hitChance != null);
                        const bestHitChance = styleHitChances.length ? Math.max(...styleHitChances) : null;
                        return `<td style="color: white;">${bestHitChance == null ? "N/A" : bestHitChance.toFixed(0) + "%"}</td>`;
                    })
                    .join("");
                return `<tr><td style="color: white;">${playerName}</td>${playerHitChances}</tr>`;
            })
            .join("");

        hitChanceTable.innerHTML = `
<table style="width: 100%; border-collapse: collapse; font-size: smaller;">
    <thead>
        <tr>
            <th style="font-size: smaller; white-space: normal; text-align: left; color: white;">${lang.hitChance}</th>
            ${Object.entries(monsterCounts)
                .map(
                    ([monsterName, count]) =>
                        `<th style="font-size: smaller; white-space: normal; text-align: left; color: white;">${
                            isZH ? ZHOthersDic[monsterHrids[monsterName]] : monsterName
                        } (${count})</th>`
                )
                .join("")}
        </tr>
    </thead>
    <tbody>
        ${hitChanceRows}
    </tbody>
</table>`;
    }
};

function resetDamageStatisticsAfterActionUpdate() {
    if (
        !settingsMap.showDamage.isTrue ||
        (currentActionsHridList.length > 0 && currentActionsHridList[0].actionHrid.startsWith("/actions/combat/"))
    ) {
        return;
    }

    players = [];
    monsters = [];
    monstersHP = [];
    playersMP = [];
    startTime = null;
    endTime = null;
    totalDuration = 0;
    totalDamage = [];
    monsterCounts = {};
    monsterEvasion = {};
    monsterHrids = {};
}

function handleNewBattle(obj, message) {
    GM_setValue("new_battle", message); // This is the only place to get other party members' equipped consumables.
    if (!settingsMap.showDamage.isTrue) {
        return;
    }

    if (startTime && endTime) {
        totalDuration += (endTime - startTime) / 1000;
    }
    startTime = Date.now();
    endTime = null;
    monstersHP = obj.monsters.map((monster) => monster.currentHitpoints);
    playersMP = obj.players.map((player) => player.currentManapoints);
    if (!players || players.length === 0) {
        players = obj.players;
    }

    for (const player of players) {
        player.currentAction = player.preparingAbilityHrid ? player.preparingAbilityHrid : player.isPreparingAutoAttack ? "auto" : "idle";
    }

    monsters = obj.monsters;
    if (!totalDamage.length) {
        totalDamage = new Array(players.length).fill(0);
    }

    for (const monster of obj.monsters) {
        const name = monster.name;
        monsterHrids[name] = monster.hrid;
        monsterCounts[name] = (monsterCounts[name] || 0) + 1;
        monsterEvasion[name] ||= {};

        for (const player of players) {
            if (!player.combatDetails?.combatStats?.combatStyleHrids) {
                continue;
            }
            for (const styleHrid of player.combatDetails.combatStats.combatStyleHrids) {
                const style = styleHrid.split("/").pop();
                monsterEvasion[name][`${player.name}-${style}`] = monster.combatDetails[`${style}EvasionRating`];
            }
        }
    }
}

function addPlayerDamage(playerIndex, damage) {
    const player = players[playerIndex];
    if (!player.damageMap) {
        player.damageMap = new Map();
    }
    player.damageMap.set(player.currentAction, (player.damageMap.get(player.currentAction) || 0) + damage);
    totalDamage[playerIndex] += damage;
}

function handleBattleUpdated(obj) {
    if (!settingsMap.showDamage.isTrue || !monstersHP.length) {
        return;
    }

    const { mMap, pMap } = obj;
    const playerIndices = Object.keys(pMap);

    // Decide which player cast a spell by MP decrease.
    let castPlayer: string | null = null;
    for (const playerIndex of playerIndices) {
        if (pMap[playerIndex].cMP < playersMP[playerIndex]) {
            castPlayer = playerIndex;
        }
        playersMP[playerIndex] = pMap[playerIndex].cMP;
    }

    monstersHP.forEach((previousHP, monsterIndex) => {
        const monster = mMap[monsterIndex];
        if (!monster) {
            return;
        }

        const damage = previousHP - monster.cHP;
        monstersHP[monsterIndex] = monster.cHP;
        if (damage <= 0) {
            return;
        }

        if (playerIndices.length > 1) {
            // Damage is resulted by ManaSpring or Bloom from one of the players.
            if (castPlayer !== null) {
                addPlayerDamage(castPlayer, damage);
            }
        } else {
            addPlayerDamage(playerIndices[0], damage);
        }
    });

    for (const playerIndex of playerIndices) {
        players[playerIndex].currentAction = pMap[playerIndex].abilityHrid ? pMap[playerIndex].abilityHrid : pMap[playerIndex].isAutoAtk ? "auto" : "idle";
    }
    endTime = Date.now();
    updateStatisticsPanel();
}

registerMessageHandler("actions_updated", resetDamageStatisticsAfterActionUpdate);
registerMessageHandler("new_battle", handleNewBattle);
registerMessageHandler("battle_updated", handleBattleUpdated);

