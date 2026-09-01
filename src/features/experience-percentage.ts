/* 左侧栏显示技能百分比 */
function updateProgressBars() {
    const elements = document.querySelectorAll(".NavigationBar_currentExperience__3GDeX");
    for (const element of elements) {
        const pctText = Number((element.style.width || "").replace("%", "") || "0").toFixed(2) + "%";

        const levelLabel = element.parentNode?.parentNode?.querySelector("span.NavigationBar_level__3C7eR");
        if (levelLabel) {
            levelLabel.style.width = "auto";
        }

        const insertParent = element.parentNode?.parentNode?.children[0] ?? null;
        if (!insertParent) {
            continue;
        }
        let span = insertParent.querySelector<HTMLSpanElement>("span.insertedSpan");
        if (!span) {
            span = document.createElement("span");
            span.textContent = pctText;
            span.classList.add("insertedSpan");
            span.style.fontSize = "0.875rem";
            span.style.color = SCRIPT_COLOR_MAIN;
        } else if (span.textContent === pctText) {
            continue; // 数值未变，不触碰 DOM
        } else {
            span.textContent = pctText;
            continue;
        }
        insertParent.insertBefore(span, insertParent.children[1]);
    }
}

function initializeExperiencePercentage() {
    if (!settingsMap.expPercentage.isTrue) {
        return;
    }

    setInterval(updateProgressBars, 1000);
}
