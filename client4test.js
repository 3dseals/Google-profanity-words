const WebSocket = require('ws');

// client test:

let index = 0;

let ws = new WebSocket('ws://localhost:3000');

function send(data)
{
    ws.send(JSON.stringify(data));
}

ws.on('open', function () {
    console.log(`[CLIENT] open()`);
    send({type:'login', name:'test'+index});
});

ws.on('message', function (message) {
    console.log(`[CLIENT] Received: ${message}`);
});

setInterval(()=>{
    //send({type:'ping'});
}, 1000);

// setTimeout(()=>{
//     send({type:'msg', msg:'/stats test'+index});
// }, 5000);

setInterval(()=>{
    send({type:'msg', msg:'test'+(index++) + ' hello' + index});
}, 1000);

setTimeout(()=>{
    send({type:'msg', msg:'/popular'});
}, 3000);