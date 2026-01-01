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
declare class JSysTray {
    private systray;
    private initialized;
    /**
     * Get the absolute path to a media file
     */
    private getMediaPath;
    /**
     * Initialize the system tray
     */
    init(options: InitOptions): void;
}
export declare const jSysTray: JSysTray;
export {};
//# sourceMappingURL=jSysTray.d.ts.map