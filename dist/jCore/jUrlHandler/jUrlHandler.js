"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.jUrlHandler = void 0;
const child_process_1 = require("child_process");
const net_1 = __importDefault(require("net"));
const SINGLE_INSTANCE_PORT = 34567; // Port for single-instance communication
let protocol = "";
let isInitialized = false;
const actionHandlers = new Map();
/**
 * Try to send URL to existing instance
 * @returns true if sent to existing instance, false if no instance running
 */
function sendToExistingInstance(url) {
    return new Promise((resolve) => {
        const client = net_1.default.connect(SINGLE_INSTANCE_PORT, "localhost", () => {
            client.write(url);
            client.end();
            resolve(true);
        });
        client.on("error", () => {
            resolve(false); // No existing instance
        });
    });
}
/**
 * Parse a custom protocol URL into its components
 * @param url - The full URL (e.g., "NODE-APP-BOILERPLATE://console_log?msg=Hello")
 * @returns Object with action name and parameters array
 */
function parseProtocolUrl(url) {
    try {
        const urlObj = new URL(url.toLowerCase());
        const action = (urlObj.hostname + urlObj.pathname).replace(/\//g, "");
        const params = [];
        // Get query parameters in order
        urlObj.searchParams.forEach((value) => {
            params.push(decodeURIComponent(value));
        });
        return { action, params };
    }
    catch (error) {
        console.error("Failed to parse protocol URL:", error);
        return { action: "", params: [] };
    }
}
/**
 * Handle incoming URL
 */
function handleUrl(url) {
    console.log("Received protocol URL:", url);
    const { action, params } = parseProtocolUrl(url);
    console.log("Action:", action);
    console.log("Params:", params);
    const handler = actionHandlers.get(action);
    if (handler) {
        handler(...params);
    }
    else {
        console.warn(`No handler registered for action: ${action}`);
    }
}
/**
 * Start listening for URLs from new instances
 */
function startSingleInstanceServer() {
    const server = net_1.default.createServer((socket) => {
        // Handle errors on the socket (suppress ECONNRESET as it's expected)
        socket.on("error", (err) => {
            if (err.code !== "ECONNRESET") {
                console.error("Socket error:", err.message);
            }
        });
        socket.on("data", (data) => {
            const url = data.toString();
            console.log("Received URL from new instance:", url);
            handleUrl(url);
        });
        socket.on("end", () => {
            socket.destroy();
        });
    });
    server.listen(SINGLE_INSTANCE_PORT, "localhost", () => {
        console.log("Single-instance server listening");
    });
    server.on("error", (err) => {
        if (err.code === "EADDRINUSE") {
            console.error("Another instance is already running");
        }
    });
    return server;
}
/**
 * Initialize the URL handler with a custom protocol
 * @param protocolName - The protocol name (e.g., 'node-app-boilerplate')
 */
async function init(protocolName) {
    if (isInitialized) {
        console.warn("jUrlHandler already initialized");
        return;
    }
    protocol = protocolName;
    isInitialized = true;
    // Check if the app was opened with a protocol URL
    const args = process.argv;
    const url = args.find((arg) => arg.toLowerCase().startsWith(`${protocol.toLowerCase()}://`));
    // If launched with URL, try to send to existing instance
    if (url) {
        console.log("Launched with URL:", url);
        const sentToExisting = await sendToExistingInstance(url);
        if (sentToExisting) {
            console.log("Sent URL to existing instance, exiting...");
            process.exit(0);
        }
        // If no existing instance, continue and handle URL below
    }
    // Start single-instance server
    startSingleInstanceServer();
    // Register the protocol handler in Windows registry
    if (process.platform === "win32") {
        const exePath = process.execPath.replace(/\\/g, "\\\\");
        const protocolKey = protocol.toLowerCase();
        // Create registry entries to handle the custom protocol
        const regCommands = [
            `reg add "HKCU\\Software\\Classes\\${protocolKey}" /ve /d "URL:${protocol} Protocol" /f`,
            `reg add "HKCU\\Software\\Classes\\${protocolKey}" /v "URL Protocol" /t REG_SZ /d "" /f`,
            `reg add "HKCU\\Software\\Classes\\${protocolKey}\\shell\\open\\command" /ve /d "\\"${exePath}\\" \\"%1\\"" /f`,
        ].join(" && ");
        (0, child_process_1.exec)(regCommands, (error, stdout, stderr) => {
            if (error) {
                console.error("Failed to register protocol handler:", error);
                console.error("stderr:", stderr);
            }
            else {
                console.log(`✅ Registered protocol handler: ${protocol}://`);
                console.log("Registry entries created successfully");
            }
        });
    }
    // If launched with URL, handle it now
    if (url) {
        setTimeout(() => {
            handleUrl(url);
        }, 100);
    }
}
/**
 * Register an action handler
 * @param actionName - The action name (e.g., 'console_log')
 * @param callback - Function to call with parameters
 */
function addAction(actionName, callback) {
    actionHandlers.set(actionName.toLowerCase(), callback);
    console.log(`✅ Registered action handler: ${actionName}`);
}
exports.jUrlHandler = {
    init,
    addAction,
};
//# sourceMappingURL=jUrlHandler.js.map