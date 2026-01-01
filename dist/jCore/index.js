"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.jCore = void 0;
const jNotify_1 = require("./jNotify");
const jSysTray_1 = require("./jSysTray");
const jUrlHandler_1 = require("./jUrlHandler");
exports.jCore = {
    notify: jNotify_1.jNotify,
    sysTray: jSysTray_1.jSysTray,
    urlHandler: jUrlHandler_1.jUrlHandler,
};
//# sourceMappingURL=index.js.map