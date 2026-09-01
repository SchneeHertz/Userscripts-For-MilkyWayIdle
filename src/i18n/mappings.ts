function inverseKV(obj: Record<string, string>): Record<string, string> {
    const retobj: Record<string, string> = {};
    for (const key in obj) {
        retobj[obj[key]] = key;
    }
    return retobj;
}

const ZHToItemHridMap = inverseKV(ZHItemNames);
const ZHToActionHridMap = inverseKV(ZHActionNames);
const ZHToOthersMap = inverseKV(ZHOthersDic);

function getItemEnNameFromZhName(zhName: string): string {
    const itemHrid = ZHToItemHridMap[zhName];
    if (!itemHrid) {
        console.log("Can not find EN name for item " + zhName);
        return "";
    }
    const enName = initData_itemDetailMap[itemHrid]?.name;
    if (!enName) {
        console.log("Can not find EN name for itemHrid " + itemHrid);
        return "";
    }
    return enName;
}

function getActionEnNameFromZhName(zhName: string): string {
    const actionHrid = ZHToActionHridMap[zhName];
    if (!actionHrid) {
        console.log("Can not find EN name for action " + zhName);
        return "";
    }
    const enName = initData_actionDetailMap[actionHrid]?.name;
    if (!enName) {
        console.log("Can not find EN name for actionHrid " + actionHrid);
        return "";
    }
    return enName;
}

function getOthersFromZhName(zhName: string): string {
    const key = ZHToOthersMap[zhName];
    if (!key) {
        // console.log("Can not find EN key for " + zhName);
        return "";
    }
    return key;
}

const itemEnNameToHridMap: Record<string, string> = {};

