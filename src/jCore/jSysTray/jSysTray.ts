import path from "path";
import fs from "fs";
import { SysTray } from "node-systray-v2";

interface MenuItem {
    title: string;
    tooltip: string;
    onclick: () => void;
}

interface InitOptions {
    title?: string;
    tooltip?: string;
    items: MenuItem[];
    debug?: boolean;
}

class JSysTray {
    private systray: SysTray | null = null;
    private initialized = false;

    /**
     * Get the absolute path to a media file
     */
    private getMediaPath(filename: string) {
        const isPkg = typeof (process as any).pkg !== "undefined";

        const baseDir = isPkg
            ? path.dirname(process.execPath) // where the exe lives
            : path.join(__dirname, "..", "..", ".."); // in dev, go up from dist/util/jSysTray to project root

        return path.join(baseDir, "media", filename);
    }

    /**
     * Initialize the system tray
     */
    public init(options: InitOptions) {
        if (this.initialized) {
            console.warn("jSysTray already initialized");
            return;
        }

        // Use default icon file
        const trayIconBase64 = fs
            .readFileSync(this.getMediaPath("icon_32x32.ico"))
            .toString("base64");

        // Convert items to SysTray format
        const menuItems = options.items.map((item) => ({
            title: item.title,
            tooltip: item.tooltip,
            enabled: true,
            checked: false,
        }));

        this.systray = new SysTray({
            menu: {
                icon: trayIconBase64,
                title: options.title || "Node App",
                tooltip: options.tooltip || "Node App Running",
                items: menuItems,
            },
            debug: options.debug || false,
            copyDir: true, // IMPORTANT for pkg
        });

        // Set up click handler
        this.systray.onClick((action) => {
            const item = options.items[action.seq_id];
            if (item && item.onclick) {
                item.onclick();
            }
        });

        this.initialized = true;
    }
}

// Export singleton instance
export const jSysTray = new JSysTray();
