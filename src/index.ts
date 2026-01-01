import { jCore } from "./jCore";

console.log("Application starting...");

// Initialize URL handler
jCore.urlHandler.init("node-app-boilerplate");

// Register action handlers
jCore.urlHandler.addAction("console_log", (msg: string) => {
    console.log("URL received:", msg);
});

/**
 * Send notification
 */
function sendTimestampNotification() {
    const time = new Date().toLocaleTimeString();

    jCore.notify({
        title: "Node Notifier Test",
        message: `Heartbeat @ ${time}`,
        clickUrl: "https://www.google.com",
    });
}

// Initialize the system tray
jCore.sysTray.init({
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
