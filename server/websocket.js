const { WebSocket, WebSocketServer } = require('ws');
const http = require('http');
const uuidv4 = require('uuid').v4;

const server = http.createServer();
const wsServer = new WebSocketServer({ server });
const wsPort = 8000;
server.listen(wsPort, () => {
    console.log(`WebSocket server is running on port ${wsPort}`);
});

const clients = {};

wsServer.on('connection', function(connection) {
    const userId = uuidv4();
    clients[userId] = connection;
});

function broadcastMessage(messageType, json) {
    json.type = messageType;
    const data = JSON.stringify(json);

    for(let userId in clients) {
        let client = clients[userId];
        if(client.readyState === WebSocket.OPEN) {
            client.send(data);
        }
    };
}

module.exports = {
    broadcastMessage
};