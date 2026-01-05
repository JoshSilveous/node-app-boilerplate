import path from "path";
import fs from "fs";
import { exec } from "child_process";
import notifierModule from "node-notifier";

/**
 * Open a URL in the default browser
 */
function openBrowser(url: string) {
    const command =
        process.platform === "win32"
            ? `start "" "${url}"`
            : process.platform === "darwin"
            ? `open "${url}"`
            : `xdg-open "${url}"`;

    exec(command);
}

/**
 * Resolve notifier binary path (DEV vs PKG)
 */
function getSnoretoastPath() {
    const isPkg = typeof (process as any).pkg !== "undefined";

    const baseDir = isPkg
        ? path.dirname(process.execPath)
        : path.join(__dirname, "..", ".."); // from dist/jNotify to project root

    return path.join(baseDir, "notifier-executables", "snoretoast-x64.exe");
}

/**
 * Resolve icon path (DEV vs PKG)
 */
function getIconPath() {
    const isPkg = typeof (process as any).pkg !== "undefined";

    const baseDir = isPkg
        ? path.dirname(process.execPath)
        : path.join(__dirname, "..", ".."); // from dist/jNotify to project root

    // Use .ico for Windows, .png for other platforms
    const iconFile = process.platform === "win32" ? "icon.ico" : "icon.png";
    return path.join(baseDir, "media", iconFile);
}

// Initialize notifier once
let notifier: any;

function initializeNotifier() {
    if (notifier) return notifier;

    if (process.platform === "win32") {
        const snoretoastPath = getSnoretoastPath();

        if (!fs.existsSync(snoretoastPath)) {
            console.error("❌ snoretoast binary not found:");
            console.error(snoretoastPath);
            process.exit(1);
        }

        console.log("Using snoretoast:", snoretoastPath);

        const WindowsToaster = notifierModule.WindowsToaster;

        notifier = new WindowsToaster({
            withFallback: false,
            customPath: snoretoastPath,
        });
    } else {
        // macOS / Linux (dev only)
        notifier = notifierModule;
    }

    return notifier;
}

export interface NotificationOptions {
    title: string;
    message: string;
    clickUrl?: string;
    onClickCallback?: () => void;
}

/**
 * Send a notification
 */
export function jNotify(options: NotificationOptions) {
    const notifierInstance = initializeNotifier();

    notifierInstance.notify(
        {
            title: options.title,
            message: options.message,
            icon: getIconPath(),
            wait: true,
            appID: "com.joshsilveous.nodeappboilerplate",
        },
        (err: Error | null, response: string) => {
            if (err) {
                console.error("Notification error:", err);
                return;
            }

            if (response === "click" || response === "activate") {
                if (options.onClickCallback) {
                    options.onClickCallback();
                } else if (options.clickUrl) {
                    openBrowser(options.clickUrl);
                }
            }
        }
    );
}
