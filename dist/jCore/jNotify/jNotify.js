"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.jNotify = jNotify;
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const child_process_1 = require("child_process");
const node_notifier_1 = __importDefault(require("node-notifier"));
/**
 * Open a URL in the default browser
 */
function openBrowser(url) {
    const command = process.platform === "win32"
        ? `start "" "${url}"`
        : process.platform === "darwin"
            ? `open "${url}"`
            : `xdg-open "${url}"`;
    (0, child_process_1.exec)(command);
}
/**
 * Resolve notifier binary path (DEV vs PKG)
 */
function getSnoretoastPath() {
    const isPkg = typeof process.pkg !== "undefined";
    const baseDir = isPkg
        ? path_1.default.dirname(process.execPath)
        : path_1.default.join(__dirname, "..", ".."); // from dist/jNotify to project root
    return path_1.default.join(baseDir, "notifier-executables", "snoretoast-x64.exe");
}
/**
 * Resolve icon path (DEV vs PKG)
 */
function getIconPath() {
    const isPkg = typeof process.pkg !== "undefined";
    const baseDir = isPkg
        ? path_1.default.dirname(process.execPath)
        : path_1.default.join(__dirname, "..", ".."); // from dist/jNotify to project root
    // Use .ico for Windows, .png for other platforms
    const iconFile = process.platform === "win32" ? "icon.ico" : "icon.png";
    return path_1.default.join(baseDir, "media", iconFile);
}
// Initialize notifier once
let notifier;
function initializeNotifier() {
    if (notifier)
        return notifier;
    if (process.platform === "win32") {
        const snoretoastPath = getSnoretoastPath();
        if (!fs_1.default.existsSync(snoretoastPath)) {
            console.error("❌ snoretoast binary not found:");
            console.error(snoretoastPath);
            process.exit(1);
        }
        console.log("Using snoretoast:", snoretoastPath);
        const WindowsToaster = node_notifier_1.default.WindowsToaster;
        notifier = new WindowsToaster({
            withFallback: false,
            customPath: snoretoastPath,
        });
    }
    else {
        // macOS / Linux (dev only)
        notifier = node_notifier_1.default;
    }
    return notifier;
}
/**
 * Send a notification
 */
function jNotify(options) {
    const notifierInstance = initializeNotifier();
    notifierInstance.notify({
        title: options.title,
        message: options.message,
        icon: getIconPath(),
        wait: true,
        appID: "com.joshsilveous.nodeappboilerplate",
    }, (err, response) => {
        if (err) {
            console.error("Notification error:", err);
            return;
        }
        if (response === "click" || response === "activate") {
            if (options.onClickCallback) {
                options.onClickCallback();
            }
            else if (options.clickUrl) {
                openBrowser(options.clickUrl);
            }
        }
    });
}
//# sourceMappingURL=jNotify.js.map