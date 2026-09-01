function initializeExternalTools() {
    const url = document.URL;

    if (url.includes("amvoidguy.github.io") || url.includes("shykai.github.io/MWICombatSimulatorTest/")) {
        addImportButtonForAmvoidguy();
        observeResultsForAmvoidguy();
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
    console.log(window.location.href);

    if (initializeExternalTools()) {
        return;
    }

    initializeGameRuntime();
    initializeGameFeatures();
}

startMWITools();
