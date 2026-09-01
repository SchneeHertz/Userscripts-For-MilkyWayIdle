/* 左侧栏显示技能百分比 */
const waitForProgressBar = () => {
    const elements = document.querySelectorAll(".NavigationBar_currentExperience__3GDeX");
    if (elements.length) {
        removeInsertedDivs();
        elements.forEach((element) => {
            let text = element.style.width;
            text = Number(text.replace("%", "")).toFixed(2) + "%";

            const span = document.createElement("span");
            span.textContent = text;
            span.classList.add("insertedSpan");
            span.style.fontSize = "0.875rem";
            span.style.color = SCRIPT_COLOR_MAIN;

            element.parentNode.parentNode.querySelector("span.NavigationBar_level__3C7eR").style.width = "auto";

            const insertParent = element.parentNode.parentNode.children[0];
            insertParent.insertBefore(span, insertParent.children[1]);
        });
    } else {
        setTimeout(waitForProgressBar, 200);
    }
};

const removeInsertedDivs = () => document.querySelectorAll("span.insertedSpan").forEach((div) => div.parentNode.removeChild(div));

function initializeExperiencePercentage() {
    if (!settingsMap.expPercentage.isTrue) {
        return;
    }

    window.setInterval(() => {
        removeInsertedDivs();
        waitForProgressBar();
    }, 1000);
}

