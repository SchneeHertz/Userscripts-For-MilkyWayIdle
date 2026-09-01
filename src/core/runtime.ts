let initData_characterSkills: any[] | null = null;
let initData_characterItems: any[] | null = null;
let initData_characterHouseRoomMap: Record<string, any> | null = null;
let initData_actionTypeDrinkSlotsMap: Record<string, any> | null = null;
let initData_actionDetailMap: Record<string, any> | null = null;
let initData_levelExperienceTable: any[] | null = null;
let initData_itemDetailMap: Record<string, any> | null = null;
let initData_actionCategoryDetailMap: Record<string, any> | null = null;
let initData_abilityDetailMap: Record<string, any> | null = null;

let currentActionsHridList: any[] = [];

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
    const json = JSON.stringify(obj);
    if (GM_getValue("init_client_data", null) !== json) {
        GM_setValue("init_client_data", json);
    }
    applyClientData(obj);
}

function hookWebSocketMessages() {
    const dataProperty = Object.getOwnPropertyDescriptor(MessageEvent.prototype, "data");
    const originalGetter = dataProperty?.get;
    if (!dataProperty || !originalGetter) {
        return;
    }

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
    let obj: any = null;
    try {
        obj = JSON.parse(message);
    } catch (error) {
        console.warn("MWITools: unable to parse WS message", error);
        return message;
    }
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
    GM_setValue("init_character_data", message);

    initData_characterSkills = obj.characterSkills;
    initData_characterItems = obj.characterItems;
    initData_characterHouseRoomMap = obj.characterHouseRoomMap;
    initData_actionTypeDrinkSlotsMap = obj.actionTypeDrinkSlotsMap;
    currentActionsHridList = [...obj.characterActions];
}

function handleInitClientData(obj: any, message: string) {
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

registerMessageHandler("init_character_data", handleInitCharacterData);
registerMessageHandler("init_client_data", handleInitClientData);
registerMessageHandler("actions_updated", handleActionsUpdated);
registerMessageHandler("action_completed", handleActionCompleted);
