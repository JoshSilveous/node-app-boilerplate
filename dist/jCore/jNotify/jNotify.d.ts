export interface NotificationOptions {
    title: string;
    message: string;
    clickUrl?: string;
    onClickCallback?: () => void;
}
/**
 * Send a notification
 */
export declare function jNotify(options: NotificationOptions): void;
//# sourceMappingURL=jNotify.d.ts.map