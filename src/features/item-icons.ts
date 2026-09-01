/* 图标上显示装备等级 */
function addItemLevels() {
    const iconDivs = document.querySelectorAll("div.Item_itemContainer__x7kH1 div.Item_item__2De2O.Item_clickable__3viV6");
    for (const div of iconDivs) {
        if (div.querySelector("div.Item_name__2C42x")) {
            continue;
        }
        const href = div.querySelector("use").getAttribute("href");
        const hrefName = href.split("#")[1];
        const itemHrid = "/items/" + hrefName;
        const itemLevel = initData_itemDetailMap[itemHrid]?.itemLevel;
        const itemAbilityLevel = initData_itemDetailMap[itemHrid]?.abilityBookDetail?.levelRequirements?.[0]?.level;

        if (initData_itemDetailMap[itemHrid]?.equipmentDetail && itemLevel && itemLevel > 0) {
            if (!div.querySelector("div.script_itemLevel")) {
                div.style.position = "relative";
                div.insertAdjacentHTML(
                    "beforeend",
                    `<div class="script_itemLevel" style="z-index: 1; position: absolute; top: 2px; right: 2px; text-align: right; color: ${SCRIPT_COLOR_MAIN};">${itemLevel}</div>`
                );
            }
        } else if (itemAbilityLevel && itemAbilityLevel > 0) {
            if (!div.querySelector("div.script_itemLevel")) {
                div.style.position = "relative";
                div.insertAdjacentHTML(
                    "beforeend",
                    `<div class="script_itemLevel" style="z-index: 1; position: absolute; top: 2px; right: 2px; text-align: right; color: ${SCRIPT_COLOR_MAIN};">${itemAbilityLevel}</div>`
                );
            }
        } else if (settingsMap.showsKeyInfoInIcon.isTrue && (itemHrid.includes("_key_fragment") || itemHrid.includes("_key"))) {
            const map = new Map();
            map.set("/items/blue_key_fragment", isZH ? "图3" : "Z3");
            map.set("/items/green_key_fragment", isZH ? "图4" : "Z4");
            map.set("/items/purple_key_fragment", isZH ? "图5" : "Z5");
            map.set("/items/white_key_fragment", isZH ? "图6" : "Z6");
            map.set("/items/orange_key_fragment", isZH ? "图7" : "Z7");
            map.set("/items/brown_key_fragment", isZH ? "图8" : "Z8");
            map.set("/items/stone_key_fragment", isZH ? "图9" : "Z9");
            map.set("/items/dark_key_fragment", isZH ? "图10" : "Z10");
            map.set("/items/burning_key_fragment", isZH ? "图11" : "Z11");

            map.set("/items/chimerical_entry_key", isZH ? "牢1" : "D1");
            map.set("/items/sinister_entry_key", isZH ? "牢2" : "D2");
            map.set("/items/enchanted_entry_key", isZH ? "牢3" : "D3");
            map.set("/items/pirate_entry_key", isZH ? "牢4" : "D4");

            map.set("/items/chimerical_chest_key", "3.4.5.6");
            map.set("/items/sinister_chest_key", "5.7.8.10");
            map.set("/items/enchanted_chest_key", "7.8.9.11");
            map.set("/items/pirate_chest_key", "6.9.10.11");

            if (!div.querySelector("div.script_key")) {
                div.style.position = "relative";
                div.insertAdjacentHTML(
                    "beforeend",
                    `<div class="script_key" style="z-index: 1; position: absolute; top: 2px; right: 2px; text-align: right; color: ${SCRIPT_COLOR_MAIN};">${map.get(
                        itemHrid
                    )}</div>`
                );
            }
        }
    }
}
function initializeItemIcons() {
    if (settingsMap.itemIconLevel.isTrue) {
        setInterval(addItemLevels, 500);
    }
}

