function initializeExternalTools() {
    const url = document.URL;

    if (url.includes("isosky.github.io/MWICombatSimulatorTest/")) {
        addCombatSimulatorImportButton();
        observeCombatSimulatorResults();
        return true;
    }

    return false;
}

function initializeGameFeatures() {
    installActionTimeStyles();
    initializeActionQueueObserver();
    initializeExperiencePercentage();
    initializeItemIcons();
    initializeMapIndexes();
    waitForSettings();
}

function startMWITools() {
    if (initializeExternalTools()) {
        return;
    }

    initializeGameRuntime();
    initializeGameFeatures();
}

startMWITools();
