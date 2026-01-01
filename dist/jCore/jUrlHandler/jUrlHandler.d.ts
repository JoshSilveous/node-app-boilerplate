type ActionCallback = (...args: any[]) => void;
/**
 * Initialize the URL handler with a custom protocol
 * @param protocolName - The protocol name (e.g., 'node-app-boilerplate')
 */
declare function init(protocolName: string): Promise<void>;
/**
 * Register an action handler
 * @param actionName - The action name (e.g., 'console_log')
 * @param callback - Function to call with parameters
 */
declare function addAction(actionName: string, callback: ActionCallback): void;
export declare const jUrlHandler: {
    init: typeof init;
    addAction: typeof addAction;
};
export {};
//# sourceMappingURL=jUrlHandler.d.ts.map