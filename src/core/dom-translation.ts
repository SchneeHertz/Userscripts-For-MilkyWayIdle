/* 支持修改版汉化插件 */
function getOriTextFromElement(elem) {
    if (!elem) {
        console.error("getTextFromElement null elem");
        return "";
    }
    const translatedfrom = elem.getAttribute("script_translatedfrom");
    if (translatedfrom) {
        return translatedfrom;
    }
    return elem.textContent;
}

