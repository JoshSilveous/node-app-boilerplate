"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jCore_1 = require("./jCore");
console.log("Application starting...");
// Initialize URL handler
jCore_1.jCore.urlHandler.init("node-app-boilerplate");
// Register action handlers
jCore_1.jCore.urlHandler.addAction("console_log", (msg) => {
    console.log("URL received:", msg);
});
/**
 * Send notification
 */
function sendTimestampNotification() {
    const time = new Date().toLocaleTimeString();
    jCore_1.jCore.notify({
        title: "Node Notifier Test",
        message: `Heartbeat @ ${time}`,
        clickUrl: "https://www.google.com",
    });
}
// Initialize the system tray
jCore_1.jCore.sysTray.init({
    title: "Node Notifier",
    tooltip: "Node Notifier Running",
    items: [
        {
            title: "Send Notification Now",
            tooltip: "Trigger a heartbeat",
            onclick: sendTimestampNotification,
        },
        {
            title: "Exit",
            tooltip: "Quit application",
            onclick: () => {
                console.log("Exiting via tray...");
                process.exit(0);
            },
        },
    ],
});
// Fire immediately
sendTimestampNotification();
// Repeat every minute
setInterval(sendTimestampNotification, 60 * 1000);
// Keep process alive
process.stdin.resume();
//# sourceMappingURL=index.js.map