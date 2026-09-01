/* 空闲时弹窗通知 */
function notificate() {
    if (typeof GM_notification === "undefined" || !GM_notification) {
        console.error("notificate null GM_notification");
        return;
    }
    if (currentActionsHridList.length > 0) {
        return;
    }
    GM_notification({
        text: isZH ? "动作队列为空" : "Action queue is empty.",
        title: "MWITools-Lite",
    });
}

function initializeIdleNotification() {
    if (settingsMap.notifiEmptyAction.isTrue) {
        notificate();
    }
}

function handleActionUpdateNotification() {
    if (settingsMap.notifiEmptyAction.isTrue) {
        setTimeout(notificate, 1000);
    }
}

registerMessageHandler("init_character_data", initializeIdleNotification);
registerMessageHandler("actions_updated", handleActionUpdateNotification);

