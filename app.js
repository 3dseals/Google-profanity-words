const WebSocket = require('ws');
const Log = require('./Utils/Log.class');
const ConnectController = require('./Controller/ConnectController.class');

const WebSocketServer = WebSocket.Server;

ConnectController.wss = new WebSocketServer({
    port: 3000
});

ConnectController.wss.on('connection', function (ws) {
    Log.Print('connection()');
    ConnectController.AddConnect(ws);
});

Log.Print('ws server started at port 3000...');