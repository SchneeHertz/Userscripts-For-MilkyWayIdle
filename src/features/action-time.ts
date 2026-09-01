/* 显示当前动作总时间 */
const showTotalActionTime = () => {
    const targetNode = document.querySelector("div.Header_actionName__31-L2");
    if (targetNode) {
        calculateTotalTime();
        const observer = new MutationObserver(() => {
            if (!targetNode.isConnected) {
                observer.disconnect();
                setTimeout(showTotalActionTime, 200);
                return;
            }
            calculateTotalTime();
        });
        observer.observe(targetNode, { characterData: true, subtree: true, childList: true });
    } else {
        setTimeout(showTotalActionTime, 200);
    }
};

let lastTotalTimeStr = "";

function calculateTotalTime() {
    const targetNode = document.querySelector("div.Header_actionName__31-L2 > div.Header_displayName__1hN09");
    if (!targetNode) {
        return;
    }

    let span = targetNode.querySelector("span.script_actionTime");
    if (!span) {
        span = document.createElement("span");
        span.className = "script_actionTime";
        span.style.color = SCRIPT_COLOR_MAIN;
        targetNode.append(span);
        lastTotalTimeStr = ""; // 节点被重建后必须重新写入
    }

    let totalTimeStr = "Error";
    const content = targetNode.innerText;
    const match = content.match(/\((\d+)\)/);
    const progressBar = document.querySelector(".ProgressBar_text__102Yn");
    const progressBarMatch = progressBar && getOriTextFromElement(progressBar).match(/[\d\.]+/);
    const currentAction = currentActionsHridList[0];
    if (match && progressBarMatch && currentAction?.actionHrid) {
        const numOfTimes = +match[1];
        const timePerActionSec = +progressBarMatch[0];
        const actionHrid = currentAction.actionHrid;
        let effBuff = 1 + getTotalEffiPercentage(actionHrid) / 100;
        if (actionHrid.includes("enhanc")) {
            effBuff = 1;
        }
        const actualNumberOfTimes = Math.round(numOfTimes / effBuff);
        const totalTimeSeconds = actualNumberOfTimes * timePerActionSec;
        totalTimeStr = " [" + formatDuration(totalTimeSeconds) + "]";

        const currentTime = new Date();
        currentTime.setSeconds(currentTime.getSeconds() + totalTimeSeconds);
        totalTimeStr += ` ${String(currentTime.getHours()).padStart(2, "0")}:${String(currentTime.getMinutes()).padStart(2, "0")}:${String(
            currentTime.getSeconds()
        ).padStart(2, "0")}`;
    } else if (!match) {
        totalTimeStr = " [∞]";
    }

    if (totalTimeStr === lastTotalTimeStr) {
        return; // 避免设置相同文本触发自身 MutationObserver 造成循环
    }
    lastTotalTimeStr = totalTimeStr;
    span.textContent = totalTimeStr;
}

function installActionTimeStyles() {
    GM_addStyle(`div.Header_actionName__31-L2 {
        overflow: visible !important;
        white-space: normal !important;
        height: auto !important;
      }`);

    GM_addStyle(`span.NavigationBar_label__1uH-y {
        width: 10px !important;
      }`);
}

function initializeTotalActionTime() {
    if (settingsMap.totalActionTime.isTrue) {
        lastTotalTimeStr = "";
        showTotalActionTime();
    }
}

registerMessageHandler("init_character_data", initializeTotalActionTime);
