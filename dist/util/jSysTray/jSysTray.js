"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.jSysTray = void 0;
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const node_systray_v2_1 = require("node-systray-v2");
class JSysTray {
    constructor() {
        this.systray = null;
        this.initialized = false;
    }
    /**
     * Get the absolute path to a media file
     */
    getMediaPath(filename) {
        const isPkg = typeof process.pkg !== 'undefined';
        const baseDir = isPkg
            ? path_1.default.dirname(process.execPath) // where the exe lives
            : path_1.default.join(__dirname, '..', '..', '..'); // in dev, go up from dist/util/jSysTray to project root
        return path_1.default.join(baseDir, 'media', filename);
    }
    /**
     * Initialize the system tray
     */
    init(options) {
        if (this.initialized) {
            console.warn('jSysTray already initialized');
            return;
        }
        // Use default icon file
        const trayIconBase64 = fs_1.default.readFileSync(this.getMediaPath('icon_32x32.ico')).toString('base64');
        // Convert items to SysTray format
        const menuItems = options.items.map((item) => ({
            title: item.title,
            tooltip: item.tooltip,
            enabled: true,
            checked: false,
        }));
        this.systray = new node_systray_v2_1.SysTray({
            menu: {
                icon: trayIconBase64,
                title: options.title || 'Node App',
                tooltip: options.tooltip || 'Node App Running',
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
exports.jSysTray = new JSysTray();
//# sourceMappingURL=jSysTray.js.map