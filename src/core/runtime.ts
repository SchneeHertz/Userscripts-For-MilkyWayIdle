let initData_characterSkills: any[] | null = null;
let initData_characterItems: any[] | null = null;
let initData_combatAbilities: any[] | null = null;
let initData_characterHouseRoomMap: Record<string, any> | null = null;
let initData_actionTypeDrinkSlotsMap: Record<string, any> | null = null;
let initData_actionDetailMap: Record<string, any> | null = null;
let initData_levelExperienceTable: any[] | null = null;
let initData_itemDetailMap: Record<string, any> | null = null;
let initData_actionCategoryDetailMap: Record<string, any> | null = null;
let initData_abilityDetailMap: Record<string, any> | null = null;
let initData_characterAbilities: any[] | null = null;
let initData_myMarketListings: any[] | null = null;

let currentActionsHridList: any[] = [];
let currentEquipmentMap: Record<string, any> = {};

type MessageHandler = (payload: any, rawMessage: string) => void;

const messageHandlers = new Map<string, MessageHandler[]>();

function registerMessageHandler(type: string, handler: MessageHandler) {
    const handlers = messageHandlers.get(type) || [];
    handlers.push(handler);
    messageHandlers.set(type, handlers);
}

function initializeGameRuntime() {
    restoreInitialClientData();
    hookWebSocketMessages();
}

function restoreInitialClientData() {
    if (!localStorage.getItem("initClientData")) {
        return;
    }

    const obj = localStorageUtil.getInitClientData();
    console.log(obj);
    GM_setValue("init_client_data", JSON.stringify(obj));
    applyClientData(obj);
}

function hookWebSocketMessages() {
    const dataProperty = Object.getOwnPropertyDescriptor(MessageEvent.prototype, "data");
    const originalGetter = dataProperty.get;

    dataProperty.get = function hookedGet() {
        const socket = this.currentTarget;
        if (!(socket instanceof WebSocket) || !isGameWebSocket(socket.url)) {
            return originalGetter.call(this);
        }

        const message = originalGetter.call(this);
        Object.defineProperty(this, "data", { value: message }); // Anti-loop
        return handleMessage(message);
    };

    Object.defineProperty(MessageEvent.prototype, "data", dataProperty);
}

function isGameWebSocket(url: string) {
    return [
        "api.milkywayidle.com/ws",
        "api-test.milkywayidle.com/ws",
        "api.milkywayidlecn.com/ws",
        "api-test.milkywayidlecn.com/ws",
    ].some((host) => url.includes(host));
}

function handleMessage(message: string) {
    const obj: any = JSON.parse(message);
    const handlers = messageHandlers.get(obj?.type) || [];
    for (const handler of handlers) {
        handler(obj, message);
    }
    return message;
}

function applyClientData(obj: any) {
    initData_actionDetailMap = obj.actionDetailMap;
    initData_levelExperienceTable = obj.levelExperienceTable;
    initData_itemDetailMap = obj.itemDetailMap;
    initData_actionCategoryDetailMap = obj.actionCategoryDetailMap;
    initData_abilityDetailMap = obj.abilityDetailMap;

    for (const [key, value] of Object.entries(initData_itemDetailMap)) {
        itemEnNameToHridMap[value.name] = key;
    }
}

function handleInitCharacterData(obj: any, message: string) {
    console.log(obj);
    GM_setValue("init_character_data", message);

    initData_characterSkills = obj.characterSkills;
    initData_characterItems = obj.characterItems;
    initData_characterHouseRoomMap = obj.characterHouseRoomMap;
    initData_actionTypeDrinkSlotsMap = obj.actionTypeDrinkSlotsMap;
    initData_characterAbilities = obj.characterAbilities;
    initData_myMarketListings = obj.myMarketListings;
    initData_combatAbilities = obj.combatUnit.combatAbilities;
    currentActionsHridList = [...obj.characterActions];

    for (const item of obj.characterItems) {
        if (item.itemLocationHrid !== "/item_locations/inventory") {
            currentEquipmentMap[item.itemLocationHrid] = item;
        }
    }
}

function handleInitClientData(obj: any, message: string) {
    console.log(obj);
    GM_setValue("init_client_data", message);
    applyClientData(obj);
}

function handleActionsUpdated(obj: any) {
    for (const action of obj.endCharacterActions) {
        if (action.isDone === false) {
            currentActionsHridList.push(action);
        } else {
            currentActionsHridList = currentActionsHridList.filter((queuedAction) => queuedAction.id !== action.id);
        }
    }
}

function handleActionCompleted(obj: any) {
    const action = obj.endCharacterAction;
    if (action.isDone !== false) {
        return;
    }

    for (const queuedAction of currentActionsHridList) {
        if (queuedAction.id === action.id) {
            queuedAction.currentCount = action.currentCount;
        }
    }
}

function handleItemsUpdated(obj: any) {
    if (!obj.endCharacterItems) {
        return;
    }

    for (const item of obj.endCharacterItems) {
        if (item.itemLocationHrid === "/item_locations/inventory") {
            continue;
        }
        currentEquipmentMap[item.itemLocationHrid] = item.count === 0 ? null : item;
    }
}

registerMessageHandler("init_character_data", handleInitCharacterData);
registerMessageHandler("init_client_data", handleInitClientData);
registerMessageHandler("actions_updated", handleActionsUpdated);
registerMessageHandler("action_completed", handleActionCompleted);
registerMessageHandler("items_updated", handleItemsUpdated);
