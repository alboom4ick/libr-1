const WebSocket = require('ws')
const chokidar = require('chokidar')
const fs = require('fs')
const path = require('path')

const wss = new WebSocket.Server({ port: 8080});
let clients = [];

wss.on('connection', (ws) => {
    clients.push(ws);
    ws.on('close', () => {
        clients = clients.filter(client => client !== ws);

    });
});

const projectDir = '/home/alibeks/Documents/projis/libr/demo-file';

chokidar.watch(projectDir, {ignoreInitial: true}).on('change', filePath => {
    const ext = path.extname(filePath).slice(1);
    const code = fs.readFileSync(filePath, 'utf8');
    const msg = JSON.stringify({
        file: path.relative(projectDir, filePath), code, ext
    });
    clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(msg);
        }
    });
});

console.log('WebSocket host ws://localhost:8080');

