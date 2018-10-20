const WebSocket = require('ws');
const NUM_LEDS = 30;

let ws281x;
try {
    ws281x = require('rpi-ws281x-native');
} catch (e) {
    ws281x = {
        init: ledCount => console.log(`Initiate with ${ledCount} leds`),
        render: data => console.log(`Rendering ${JSON.stringify(data)}`),
        reset: () => console.log("Received shut down command")
    }
    console.log("Running without the light strip")
}
const ws = new WebSocket('wss://jeganathan.co.uk/automation');
const pixelData = new Uint32Array(NUM_LEDS);

ws.on('open', () => setInterval(() => ws.send(JSON.stringify({ type: "KEEP-ALIVE" })), 5000));

ws281x.init(NUM_LEDS);
ws.on('message', data => {
    const message = JSON.parse(data);
    console.log("UPDATING")
    switch (message.type) {
        case "SET_LIGHTS":
            pixelData.forEach((_, i) => {
                pixelData[i] = message.colour;
            });
            ws281x.render(pixelData);
        default:
            break;
    }
});

process.on("uncaughtException", e => {
    ws281x.reset();
    console.log(e);
    process.nextTick(() => process.exit(0));
})

process.on('SIGINT', () => {
    ws281x.reset();
    process.nextTick(() => process.exit(0));
});