import { jNotify } from "./jNotify";
import { jSysTray } from "./jSysTray";
import { jUrlHandler } from "./jUrlHandler";

export const jCore: {
    notify: typeof jNotify;
    sysTray: typeof jSysTray;
    urlHandler: typeof jUrlHandler;
} = {
    notify: jNotify,
    sysTray: jSysTray,
    urlHandler: jUrlHandler,
};
