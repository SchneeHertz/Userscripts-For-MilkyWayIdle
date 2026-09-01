/* 图标上显示装备等级 */
const keyInfoMap = new Map();
keyInfoMap.set("/items/blue_key_fragment", isZH ? "图3" : "Z3");
keyInfoMap.set("/items/green_key_fragment", isZH ? "图4" : "Z4");
keyInfoMap.set("/items/purple_key_fragment", isZH ? "图5" : "Z5");
keyInfoMap.set("/items/white_key_fragment", isZH ? "图6" : "Z6");
keyInfoMap.set("/items/orange_key_fragment", isZH ? "图7" : "Z7");
keyInfoMap.set("/items/brown_key_fragment", isZH ? "图8" : "Z8");
keyInfoMap.set("/items/stone_key_fragment", isZH ? "图9" : "Z9");
keyInfoMap.set("/items/dark_key_fragment", isZH ? "图10" : "Z10");
keyInfoMap.set("/items/burning_key_fragment", isZH ? "图11" : "Z11");

keyInfoMap.set("/items/chimerical_entry_key", isZH ? "牢1" : "D1");
keyInfoMap.set("/items/sinister_entry_key", isZH ? "牢2" : "D2");
keyInfoMap.set("/items/enchanted_entry_key", isZH ? "牢3" : "D3");
keyInfoMap.set("/items/pirate_entry_key", isZH ? "牢4" : "D4");

keyInfoMap.set("/items/chimerical_chest_key", "3.4.5.6");
keyInfoMap.set("/items/sinister_chest_key", "5.7.8.10");
keyInfoMap.set("/items/enchanted_chest_key", "7.8.9.11");
keyInfoMap.set("/items/pirate_chest_key", "6.9.10.11");

function addItemLevels() {
    const iconDivs = document.querySelectorAll("div.Item_itemContainer__x7kH1 div.Item_item__2De2O.Item_clickable__3viV6");
    for (const div of iconDivs) {
        if (div.querySelector("div.Item_name__2C42x")) {
            continue;
        }
        if (div.querySelector("div.script_itemLevel, div.script_key")) {
            continue;
        }
        const href = div.querySelector("use")?.getAttribute("href");
        const hrefName = href?.split("#")[1];
        if (!hrefName) {
            continue;
        }
        const itemHrid = "/items/" + hrefName;
        const itemDetail = initData_itemDetailMap?.[itemHrid];
        const itemLevel = itemDetail?.itemLevel;
        const itemAbilityLevel = itemDetail?.abilityBookDetail?.levelRequirements?.[0]?.level;

        if (itemDetail?.equipmentDetail && itemLevel && itemLevel > 0) {
            div.style.position = "relative";
            div.insertAdjacentHTML(
                "beforeend",
                `<div class="script_itemLevel" style="z-index: 1; position: absolute; top: 2px; right: 2px; text-align: right; color: ${SCRIPT_COLOR_MAIN};">${itemLevel}</div>`
            );
        } else if (itemAbilityLevel && itemAbilityLevel > 0) {
            div.style.position = "relative";
            div.insertAdjacentHTML(
                "beforeend",
                `<div class="script_itemLevel" style="z-index: 1; position: absolute; top: 2px; right: 2px; text-align: right; color: ${SCRIPT_COLOR_MAIN};">${itemAbilityLevel}</div>`
            );
        } else if (settingsMap.showsKeyInfoInIcon.isTrue && (itemHrid.includes("_key_fragment") || itemHrid.includes("_key"))) {
            const keyInfo = keyInfoMap.get(itemHrid);
            if (keyInfo) {
                div.style.position = "relative";
                div.insertAdjacentHTML(
                    "beforeend",
                    `<div class="script_key" style="z-index: 1; position: absolute; top: 2px; right: 2px; text-align: right; color: ${SCRIPT_COLOR_MAIN};">${keyInfo}</div>`
                );
            }
        }
    }
}
function initializeItemIcons() {
    if (settingsMap.itemIconLevel.isTrue) {
        setInterval(() => {
            if (document.querySelector("div.Item_itemContainer__x7kH1")) {
                addItemLevels();
            }
        }, 1000);
    }
}

