const WebSocket = require('ws');

let clients = [];

export default function handler(req, res) {
    if (!res.socket.server.wss) {
        console.log('Iniciando servidor WebSocket...');
        const wss = new WebSocket.Server({ noServer: true });

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

        res.socket.server.on('upgrade', (request, socket, head) => {
            wss.handleUpgrade(request, socket, head, (ws) => {
                wss.emit('connection', ws, request);
            });
        });

        res.socket.server.wss = wss;
    }
    res.end();
}
