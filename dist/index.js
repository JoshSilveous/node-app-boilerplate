"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jNotify_1 = require("./util/jNotify");
const jSysTray_1 = require("./util/jSysTray");
console.log('Notifier starting...');
/**
 * Send notification
 */
function sendNotification() {
    const time = new Date().toLocaleTimeString();
    (0, jNotify_1.jNotify)({
        title: 'Node Notifier Test',
        message: `Heartbeat @ ${time}`,
        clickUrl: 'https://www.google.com',
    });
}
// Initialize the system tray
jSysTray_1.jSysTray.init({
    title: 'Node Notifier',
    tooltip: 'Node Notifier Running',
    items: [
        {
            title: 'Send Notification Now',
            tooltip: 'Trigger a heartbeat',
            onclick: sendNotification,
        },
        {
            title: 'Exit',
            tooltip: 'Quit application',
            onclick: () => {
                console.log('Exiting via tray...');
                process.exit(0);
            },
        },
    ],
});
// Fire immediately
sendNotification();
// Repeat every minute
setInterval(sendNotification, 60 * 1000);
// Keep process alive
process.stdin.resume();
//# sourceMappingURL=index.js.map