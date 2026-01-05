// This script forwards protocol URLs to the running dev instance
const net = require("net");

const url = process.argv[2];
if (!url) {
    console.log("No URL provided");
    process.exit(1);
}

const SINGLE_INSTANCE_PORT = 34567;

const client = net.connect(SINGLE_INSTANCE_PORT, "localhost", () => {
    client.write(url);
    client.end();
});

client.on("error", (err) => {
    console.error("Could not connect to running instance:", err.message);
    process.exit(1);
});
