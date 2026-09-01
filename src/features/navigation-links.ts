/* 添加第三方网站链接 */
function add3rdPartyLinks() {
    const waitForNavi = () => {
        const targetNode = document.querySelector("div.NavigationBar_minorNavigationLinks__dbxh7");
        if (targetNode) {
            let div = document.createElement("div");
            div.setAttribute("class", "NavigationBar_minorNavigationLink__31K7Y");
            div.style.color = SCRIPT_COLOR_MAIN;
            div.innerHTML = isZH ? "插件设置" : "Script settings";
            div.addEventListener("click", () => {
                const array = document.querySelectorAll(".NavigationBar_navigationLink__3eAHA");
                array[array.length - 1]?.click();
            });
            targetNode.insertAdjacentElement("afterbegin", div);

            if (isZH) {
                div = document.createElement("div");
                div.setAttribute("class", "NavigationBar_minorNavigationLink__31K7Y");
                div.style.color = SCRIPT_COLOR_MAIN;
                div.innerHTML = isZH ? "牛牛手册" : "牛牛手册";
                div.addEventListener("click", () => {
                    window.open("https://test-ctmd6jnzo6t9.feishu.cn/docx/KG9ddER6Eo2uPoxJFkicsvbEnCe", "_blank");
                });
                targetNode.insertAdjacentElement("afterbegin", div);
            }

            div = document.createElement("div");
            div.setAttribute("class", "NavigationBar_minorNavigationLink__31K7Y");
            div.style.color = SCRIPT_COLOR_MAIN;
            div.innerHTML = isZH ? "强化模拟 Enhancelator" : "Enhancement sim Enhancelator";
            div.addEventListener("click", () => {
                window.open("https://doh-nuts.github.io/Enhancelator/", "_blank");
            });
            targetNode.insertAdjacentElement("afterbegin", div);

            div = document.createElement("div");
            div.setAttribute("class", "NavigationBar_minorNavigationLink__31K7Y");
            div.style.color = SCRIPT_COLOR_MAIN;
            div.innerHTML = isZH ? "战斗榜 socko" : "Combat Tracker socko";
            div.addEventListener("click", () => {
                window.open("https://sockosnewcombattracker.pages.dev/", "_blank");
            });
            targetNode.insertAdjacentElement("afterbegin", div);

            div = document.createElement("div");
            div.setAttribute("class", "NavigationBar_minorNavigationLink__31K7Y");
            div.style.color = SCRIPT_COLOR_MAIN;
            div.innerHTML = isZH ? "战斗模拟 shykai" : "Combat sim shykai";
            div.addEventListener("click", () => {
                window.open("https://shykai.github.io/MWICombatSimulatorTest/dist/", "_blank");
            });
            targetNode.insertAdjacentElement("afterbegin", div);
        } else {
            setTimeout(add3rdPartyLinks, 200);
        }
    };
    waitForNavi();
}

function initializeThirdPartyLinks() {
    if (settingsMap.ThirdPartyLinks.isTrue) {
        add3rdPartyLinks();
    }
}

registerMessageHandler("init_character_data", initializeThirdPartyLinks);

