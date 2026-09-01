declare function GM_addStyle(css: string): unknown;

declare interface GMXmlHttpRequestDetails {
    url: string;
    method?: string;
    synchronous?: boolean;
    timeout?: number;
    onload?: (response: any) => void;
    onabort?: () => void;
    onerror?: () => void;
    ontimeout?: () => void;
}

declare type GMXmlHttpRequest = (details: GMXmlHttpRequestDetails) => any;

declare const GM: {
    xmlHttpRequest?: GMXmlHttpRequest;
};

declare const GM_xmlhttpRequest: GMXmlHttpRequest;
declare function GM_getValue<T>(key: string, defaultValue: T): T;
declare function GM_setValue(key: string, value: unknown): void;
declare function GM_notification(options: { text: string; title: string }): void;

declare const localStorageUtil: {
    getInitClientData(): any;
};

declare const math: any;
declare const Chart: any;
declare const ChartDataLabels: any;

declare module "virtual:mwitools-userscript";

interface ObjectConstructor {
    entries(value: any): [string, any][];
    values(value: any): any[];
}

interface Node {
    readonly classList: DOMTokenList;
    querySelector<E extends Element = Element>(selectors: string): E | null;
}

interface Element {
    checked: boolean;
    innerText: string;
    options: HTMLOptionsCollection;
    readonly style: CSSStyleDeclaration;
    value: string;
    click(): void;
    getContext(contextId: string): any;
}

interface ParentNode {
    insertAdjacentHTML(position: InsertPosition, text: string): void;
}

interface EventTarget {
    id: string;
}

interface Event {
    simulated?: boolean;
}

interface TouchEvent {
    readonly clientX: number;
    readonly clientY: number;
}

interface HTMLInputElement {
    _valueTracker?: {
        setValue(value: string): void;
    };
}
