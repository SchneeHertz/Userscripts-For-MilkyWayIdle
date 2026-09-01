const THOUSAND_SEPERATOR = new Intl.NumberFormat().format(1111).replaceAll("1", "").charAt(0) || "";
const DECIMAL_SEPERATOR = new Intl.NumberFormat().format(1.1).replaceAll("1", "").charAt(0);

const isZHInGameSetting = Boolean(localStorage.getItem("i18nextLng")?.toLowerCase()?.startsWith("zh")); // 获取游戏内设置语言
let isZH: boolean = isZHInGameSetting; // MWITools-Lite 本身显示的语言默认由游戏内设置语言决定

/* 自定义插件字体颜色 */
/* 找颜色自行网上搜索"CSS颜色" */
/* 可以是颜色名称，比如"red"；也可以是颜色Hex，比如"#ED694D" */
// Customization
let SCRIPT_COLOR_MAIN = "green"; // 脚本主要字体颜色
let SCRIPT_COLOR_TOOLTIP = "darkgreen"; // 物品悬浮窗的字体颜色
const SCRIPT_COLOR_ALERT = "red"; // 警告字体颜色

interface ScriptSetting {
    id: string;
    desc: string;
    isTrue: boolean;
}

const settingsMap: Record<string, ScriptSetting> = {
    useOrangeAsMainColor: {
        id: "useOrangeAsMainColor",
        desc: isZH ? "使用橙色字体" : "Use orange as the main color for the script.",
        isTrue: true,
    },
    displayCapMM: {
        id: "displayCapMM",
        desc: isZH ? "限制最高支持M量级（之前最高B量级）" : "Values are capped at the million level, which used to be billion.",
        isTrue: false,
    },
    totalActionTime: {
        id: "totalActionTime",
        desc: isZH
            ? "左上角显示：当前动作预计总耗时、预计何时完成"
            : "Top left: Estimated total time of the current action, estimated complete time.",
        isTrue: true,
    },
    actionPanel_totalTime: {
        id: "actionPanel_totalTime",
        desc: isZH
            ? "动作面板显示：动作预计总耗时、到多少级还需做多少次、每小时经验"
            : "Action panel: Estimated total time of the action, times needed to reach a target skill level, exp/hour.",
        isTrue: true,
    },
    actionPanel_totalTime_quickInputs: {
        id: "actionPanel_totalTime_quickInputs",
        desc: isZH ? "动作面板显示：快速输入次数 [依赖上一项]" : "Action panel: Quick input numbers. [Depends on the previous selection]",
        isTrue: true,
    },
    expPercentage: {
        id: "expPercentage",
        desc: isZH ? "左侧栏显示：技能经验百分比" : "Left sidebar: Percentages of exp of the skill levels.",
        isTrue: true,
    },
    battlePanel: {
        id: "battlePanel",
        desc: isZH
            ? "战斗总结面板（战斗时点击玩家头像）显示：平均每小时战斗次数、收入、经验"
            : "Battle info panel(click on player avatar during combat): Encounters/hour, revenue, exp.",
        isTrue: true,
    },
    itemIconLevel: {
        id: "itemIconLevel",
        desc: isZH ? "装备图标右上角显示：装备等级" : "Top right corner of equipment icons: Equipment level.",
        isTrue: true,
    },
    showsKeyInfoInIcon: {
        id: "showsKeyInfoInIcon",
        desc: isZH
            ? "钥匙和钥匙碎片图标右上角显示：对应的地图序号 [依赖上一项]"
            : "Top right corner of key/fragment icons: Corresponding combat zone index number. [Depends on the previous selection]",
        isTrue: true,
    },
    taskMapIndex: {
        id: "taskMapIndex",
        desc: isZH ? "任务页面显示：目标战斗地图序号" : "Tasks page: Combat zone index number.",
        isTrue: true,
    },
    mapIndex: {
        id: "mapIndex",
        desc: isZH ? "战斗地图选择页面显示：地图序号" : "Combat zones page: Combat zone index number.",
        isTrue: true,
    },
    ThirdPartyLinks: {
        id: "ThirdPartyLinks",
        desc: isZH ? "左侧菜单栏显示：第三方工具网站链接、脚本设置链接" : "Left sidebar: Links to 3rd-party websites, script settings.",
        isTrue: true,
    },
    actionQueue: {
        id: "actionQueue",
        desc: isZH
            ? "上方动作队列菜单显示：队列中每个动作预计总时间、到何时完成"
            : "Queued actions panel at the top: Estimated total time and complete time of each queued action.",
        isTrue: true,
    },
    notifiEmptyAction: {
        id: "notifiEmptyAction",
        desc: isZH
            ? "弹窗通知：正在空闲（游戏网页打开时才有效）"
            : "Browser notification: Action queue is empty. (Works only when the game page is open.)",
        isTrue: false,
    },
    fillMarketOrderPrice: {
        id: "fillMarketOrderPrice",
        desc: isZH
            ? "发布市场订单时自动填写为最小压价"
            : "Automatically input price with the smallest increasement/decreasement when posting marketplace bid/sell orders.",
        isTrue: true,
    },
    showDamage: {
        id: "showDamage",
        desc: isZH ? "战斗时，人物头像下方显示：伤害统计数字" : "Bottom of player avatar during combat: DPS.",
        isTrue: true,
    },
    showDamageGraph: {
        id: "showDamageGraph",
        desc: isZH
            ? "战斗时，悬浮窗显示：伤害统计图表 [依赖上一项]"
            : "Floating window during combat: DPS chart. [Depends on the previous selection]",
        isTrue: true,
    },
    damageGraphTransparentBackground: {
        id: "damageGraphTransparentBackground",
        desc: isZH ? "伤害统计图表背景透明 [依赖上一项]" : "DPS chart transparent and blur background. [Depends on the previous selection]",
        isTrue: true,
    },
    forceMWIToolsDisplayZH: {
        id: "forceMWIToolsDisplayZH",
        desc: isZH ? "MWITools-Lite 本身强制显示中文 MWITools-Lite always in Chinese" : "MWITools-Lite 本身强制显示中文 MWITools-Lite always in Chinese",
        isTrue: false,
    },
};
readSettings();

/* 脚本设置面板 */
function tryInsertSettingsPanel(): boolean {
    const targetNode = document.querySelector("div.SettingsPanel_profileTab__214Bj");
    if (!targetNode) {
        return false;
    }
    if (targetNode.querySelector("#script_settings")) {
        return true;
    }
    targetNode.insertAdjacentHTML("beforeend", `<div id="script_settings"></div>`);
    const insertElem = targetNode.querySelector("div#script_settings")!;
    insertElem.insertAdjacentHTML(
        "beforeend",
        `<div style="float: left; color: ${SCRIPT_COLOR_MAIN}">${
            isZH ? "MWITools-Lite 设置 （刷新生效）：" : "MWITools-Lite Settings (refresh page to apply): "
        }</div></br>`
    );

    for (const setting of Object.values(settingsMap)) {
        insertElem.insertAdjacentHTML(
            "beforeend",
            `<div style="float: left;"><input type="checkbox" id="${setting.id}" ${setting.isTrue ? "checked" : ""}></input>${
                setting.desc
            }</div></br>`
        );
    }

    insertElem.insertAdjacentHTML(
        "beforeend",
        `<div style="float: left;">${
            isZH
                ? "代码里搜索“自定义”可以手动修改字体颜色"
                : `Search "Customization" in code to customize font colors.`
        }</div></br>`
    );
    insertElem.addEventListener("change", saveSettings);
    return true;
}

const waitForSettings = () => {
    if (tryInsertSettingsPanel()) {
        return;
    }
    const observer = new MutationObserver(() => {
        if (tryInsertSettingsPanel()) {
            observer.disconnect();
        }
    });
    observer.observe(document.body, { childList: true, subtree: true });
};

function saveSettings() {
    for (const checkbox of document.querySelectorAll<HTMLInputElement>("div#script_settings input")) {
        settingsMap[checkbox.id].isTrue = checkbox.checked;
    }
    localStorage.setItem("script_settingsMap", JSON.stringify(settingsMap));
}

function readSettings() {
    const ls = localStorage.getItem("script_settingsMap");
    if (ls) {
        const lsObj: Record<string, ScriptSetting> = JSON.parse(ls);
        for (const option of Object.values(lsObj)) {
            if (settingsMap.hasOwnProperty(option.id)) {
                settingsMap[option.id].isTrue = option.isTrue;
            }
        }
    }

    if (settingsMap.forceMWIToolsDisplayZH.isTrue) {
        isZH = true; // For Traditional Chinese users.
    }

    if (settingsMap.useOrangeAsMainColor.isTrue && SCRIPT_COLOR_MAIN === "green") {
        SCRIPT_COLOR_MAIN = "orange";
    }
    if (settingsMap.useOrangeAsMainColor.isTrue && SCRIPT_COLOR_TOOLTIP === "darkgreen") {
        SCRIPT_COLOR_TOOLTIP = "#804600";
    }
}

function numberFormatter(num, digits = 1) {
    if (num === null || num === undefined) {
        return null;
    }
    if (num < 0) {
        return "-" + numberFormatter(-num);
    }
    const lookup = [
        { value: 1, symbol: "" },
        { value: 1e3, symbol: "k" },
        { value: 1e6, symbol: "M" },
    ];
    if (!settingsMap.displayCapMM.isTrue) {
        lookup.push({ value: 1e9, symbol: "B" });
    }
    const rx = /\.0+$|(\.[0-9]*[1-9])0+$/;
    var item = lookup
        .slice()
        .reverse()
        .find(function (item) {
            return num >= item.value;
        });
    return item ? (num / item.value).toFixed(digits).replace(rx, "$1") + item.symbol : "0";
}

