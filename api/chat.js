const WebSocket = require('ws');

let clients = [];

export default function handler(req, res) {
    if (!res.socket.server.wss) {
        const wss = new WebSocket.Server({ server: res.socket.server });

        wss.on('connection', (ws) => {
            clients.push(ws);

            ws.on('message', (message) => {
                const data = JSON.parse(message);

                clients.forEach((client) => {
                    if (client.readyState === WebSocket.OPEN) {
                        client.send(JSON.stringify(data));
                    }
                });
            });

            ws.on('close', () => {
                clients = clients.filter((client) => client !== ws);
            });
        });

        res.socket.server.wss = wss;
    }
    res.end();
}
