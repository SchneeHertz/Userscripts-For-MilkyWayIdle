/* 动作列表菜单计算时间 */
const actionQueueMenuObserver = new MutationObserver(function (mutations) {
    for (const mutation of mutations) {
        for (const added of mutation.addedNodes) {
            if (added.classList?.contains("MuiTooltip-popper")) {
                const menu = added.querySelector("div.QueuedActions_queuedActionsEditMenu__3OoQH");
                if (menu) {
                    handleActionQueueMenue(menu);
                }
            }
        }
    }
});

function initializeActionQueueObserver() {
    actionQueueMenuObserver.observe(document.body, { attributes: false, childList: true, characterData: false });
}

function handleActionQueueMenue(added) {
    if (!settingsMap.actionQueue.isTrue) {
        return;
    }

    handleActionQueueMenueCalculateTime(added);

    const listDiv = added.querySelector(".QueuedActions_actions__2Lur6");
    new MutationObserver((mutationsList) => {
        handleActionQueueMenueCalculateTime(added);
    }).observe(listDiv, { characterData: false, subtree: false, childList: true });
}

function handleActionQueueMenueCalculateTime(added) {
    const actionDivList = added.querySelectorAll("div.QueuedActions_action__r3HlD");
    if (!actionDivList || actionDivList.length === 0) {
        return;
    }
    if (actionDivList.length !== currentActionsHridList.length - 1) {
        console.error("handleActionQueueTooltip action queue length inconsistency");
        return;
    }

    let actionDivListIndex = 0;
    let hasSkippedfirstActionObj = false;
    let accumulatedTimeSec = 0;
    let isAccumulatedTimeInfinite = false;
    for (const actionObj of currentActionsHridList) {
        const actionHrid = actionObj.actionHrid;
        const count = actionObj.maxCount - actionObj.currentCount;
        let isInfinit = false;
        if (count === 0 || actionHrid.includes("/combat/")) {
            isInfinit = true;
            isAccumulatedTimeInfinite = true;
        }

        const baseTimePerActionSec = initData_actionDetailMap[actionHrid].baseTimeCost / 1000000000;
        const totalEffBuff = getTotalEffiPercentage(actionHrid);
        const toolSpeedBuff = getToolsSpeedBuffByActionHrid(actionHrid);

        let timePerActionSec = baseTimePerActionSec / (1 + toolSpeedBuff / 100);
        timePerActionSec /= 1 + totalEffBuff / 100;
        let totalTimeSec = count * timePerActionSec;

        let str = isZH ? "到 ∞ " : "Complete at ∞ ";
        if (!isAccumulatedTimeInfinite) {
            accumulatedTimeSec += totalTimeSec;
            const currentTime = new Date();
            currentTime.setSeconds(currentTime.getSeconds() + accumulatedTimeSec);
            str = `${isZH ? "到 " : "Complete at "}${String(currentTime.getHours()).padStart(2, "0")}:${String(currentTime.getMinutes()).padStart(
                2,
                "0"
            )}:${String(currentTime.getSeconds()).padStart(2, "0")}`;
        }

        if (hasSkippedfirstActionObj) {
            const html = `<div class="script_actionTime" style="color: ${SCRIPT_COLOR_MAIN};">${
                isInfinit ? "[ ∞ ] " : `[${timeReadable(totalTimeSec)}]`
            } ${str}</div>`;
            if (actionDivList[actionDivListIndex].querySelector("div div.script_actionTime")) {
                actionDivList[actionDivListIndex].querySelector("div div.script_actionTime").innerHTML = html;
            } else {
                actionDivList[actionDivListIndex].querySelector("div").insertAdjacentHTML("beforeend", html);
            }
            actionDivListIndex++;
        }
        hasSkippedfirstActionObj = true;
    }
    const html = `<div id="script_queueTotalTime" style="color: ${SCRIPT_COLOR_MAIN};">${isZH ? "总时间：" : "Total time: "}${
        isAccumulatedTimeInfinite ? "[ ∞ ] " : `[${timeReadable(accumulatedTimeSec)}]`
    }</div>`;
    if (document.querySelector("div#script_queueTotalTime")) {
        document.querySelector("div#script_queueTotalTime").innerHTML = html;
    } else {
        document.querySelector("div.QueuedActions_queuedActionsEditMenu__3OoQH").insertAdjacentHTML("afterend", html);
    }
}

