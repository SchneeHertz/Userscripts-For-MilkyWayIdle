/* 显示当前动作总时间 */
const showTotalActionTime = () => {
    const targetNode = document.querySelector("div.Header_actionName__31-L2");
    if (targetNode) {
        console.log("start observe action progress bar");
        calculateTotalTime();
        new MutationObserver((mutationsList) =>
            mutationsList.forEach((mutation) => {
                calculateTotalTime();
            })
        ).observe(targetNode, { characterData: true, subtree: true, childList: true });
    } else {
        setTimeout(showTotalActionTime, 200);
    }
};

function calculateTotalTime() {
    const targetNode = document.querySelector("div.Header_actionName__31-L2 > div.Header_displayName__1hN09");
    if (targetNode.textContent.includes("[")) {
        return;
    }

    let totalTimeStr = "Error";
    const content = targetNode.innerText;
    const match = content.match(/\((\d+)\)/);
    if (match) {
        const numOfTimes = +match[1];
        const timePerActionSec = +getOriTextFromElement(document.querySelector(".ProgressBar_text__102Yn")).match(/[\d\.]+/)[0];
        const actionHrid = currentActionsHridList[0].actionHrid;
        let effBuff = 1 + getTotalEffiPercentage(actionHrid) / 100;
        if (actionHrid.includes("enhanc")) {
            effBuff = 1;
        }
        const actualNumberOfTimes = Math.round(numOfTimes / effBuff);
        const totalTimeSeconds = actualNumberOfTimes * timePerActionSec;
        totalTimeStr = " [" + timeReadable(totalTimeSeconds) + "]";

        const currentTime = new Date();
        currentTime.setSeconds(currentTime.getSeconds() + totalTimeSeconds);
        totalTimeStr += ` ${String(currentTime.getHours()).padStart(2, "0")}:${String(currentTime.getMinutes()).padStart(2, "0")}:${String(
            currentTime.getSeconds()
        ).padStart(2, "0")}`;
    } else {
        totalTimeStr = " [∞]";
    }

    targetNode.textContent += totalTimeStr;
}

function timeReadable(sec) {
    if (sec >= 86400) {
        return Number(sec / 86400).toFixed(1) + (isZH ? " 天" : " days");
    }
    const d = new Date(Math.round(sec * 1000));
    function pad(i) {
        return ("0" + i).slice(-2);
    }
    let str = d.getUTCHours() + "h " + pad(d.getUTCMinutes()) + "m " + pad(d.getUTCSeconds()) + "s";
    return str;
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
        showTotalActionTime();
    }
}

registerMessageHandler("init_character_data", initializeTotalActionTime);

