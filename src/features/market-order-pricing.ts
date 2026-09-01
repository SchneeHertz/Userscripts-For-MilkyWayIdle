/* 市场价格自动输入最小压价 */
const waitForMarketOrders = () => {
    const element = document.querySelector(".MarketplacePanel_marketListings__1GCyQ");
    if (element) {
        console.log("start observe market order");
        new MutationObserver((mutationsList) => {
            mutationsList.forEach((mutation) => {
                mutation.addedNodes.forEach((node) => {
                    if (node.classList.contains("Modal_modalContainer__3B80m")) {
                        handleMarketNewOrder(node);
                    }
                });
            });
        }).observe(element, {
            characterData: false,
            subtree: false,
            childList: true,
        });
    } else {
        setTimeout(waitForMarketOrders, 500);
    }
};

function initializeMarketOrderPricing() {
    if (settingsMap.fillMarketOrderPrice.isTrue) {
        waitForMarketOrders();
    }
}

registerMessageHandler("init_character_data", initializeMarketOrderPricing);

function handleMarketNewOrder(node) {
    const title = getOriTextFromElement(node.querySelector(".MarketplacePanel_header__yahJo"));
    if (!title || title.includes(" Now") || title.includes("立即")) {
        return;
    }
    const label = node.querySelector("span.MarketplacePanel_bestPrice__3bgKp");
    const inputDiv = node.querySelector(".MarketplacePanel_inputContainer__3xmB2 .MarketplacePanel_priceInputs__3iWxy");
    if (!label || !inputDiv) {
        console.error("handleMarketNewOrder can not find elements");
        return;
    }

    label.click();

    if (getOriTextFromElement(label.parentElement).toLowerCase().includes("best buy") || label.parentElement.textContent.includes("购买")) {
        inputDiv.querySelectorAll(".MarketplacePanel_buttonContainer__vJQud")[2]?.querySelector("div button")?.click();
    } else if (
        getOriTextFromElement(label.parentElement).toLowerCase().includes("best sell") ||
        label.parentElement.textContent.includes("出售")
    ) {
        inputDiv.querySelectorAll(".MarketplacePanel_buttonContainer__vJQud")[1]?.querySelector("div button")?.click();
    }
}

