const Log = require('../Utils/Log.class');
const MaskWord = require('../Utils/MaskWord.class');
const User = require('../Model/User.class');

class ConnectController {

    static AddConnect(ws){
        ws.on('message', function (message) {
            Log.Print(`Received: ${message}`);
            var data = JSON.parse(message);

            if(data.type == 'msg')
            {
                //todo asterisk * character
                if(data.msg && data.msg.charAt(0) == "/")
                {
                    var command = data.msg.split(' ')[0];
                    ConnectController.Command(ws, command, data.msg.split(' '));
                    return;
                }
            }

            switch(data.type){
                case 'login' :
                    if(!ConnectController.GetUserInfo(data.name))
                    {
                        ConnectController.AddUser(data);
                        ws.__user_name = data.name; // for close conn
                        ConnectController.SendMsg(ws, {type:data.type, code:0});
                        ConnectController.Broadcast(ws, {type:'msg', msg:'newuser ' + data.name});
                    }else
                    {
                        ConnectController.SendMsg(ws, {type:data.type, code:1, msg:'err for duplicate name'})
                    }
                    break;
                case 'msg' :
                    ConnectController.AddPopular(data.msg);
                    ConnectController.Broadcast(ws, {type:data.type, msg:MaskWord.Check(data.msg)});
                    break;
                case 'ping' :
                    ConnectController.SendMsg(ws, {type:data.type});
                    break
            }
        });

        ws.on('close', function (close) {
            ConnectController.DelUser(ws.__user_name);
            ConnectController.Broadcast(ws, {type:'msg', msg:'exit ' + ws.__user_name});
        });
    }

    static AddUser(data)
    {
        ConnectController.Users[data.name] = new User(data);
        ConnectController.UserCount++;

        Log.Print(`AddUser: ${data.name} , online: ${ConnectController.UserCount}`);
    }

    static DelUser(name)
    {
        delete ConnectController.Users[name];
        ConnectController.UserCount--;

        Log.Print(`DelUser: ${name} , online: ${ConnectController.UserCount}`);
    }

    static GetUserInfo(name)
    {
        return ConnectController.Users[name];
    }

    static SendMsg(ws, data)
    {
        ws.send(JSON.stringify(data), (err) => {
            if (err) {
                console.log('error: ${err}');
            }
        });
    }

    static Broadcast(ws, data)
    {
        ConnectController.wss.clients.forEach(function each(client) {
            client.send(JSON.stringify(data));
        });
    }

    static Command(ws, cmd, params)
    {
        if(cmd == '/popular')
        {
            var word = '';
            var count = 0;
            for (var key in ConnectController.Words)
            {
                if(count < ConnectController.Words[key].count)
                {
                    word = key;
                    count = ConnectController.Words[key].count;
                }
            }
            ConnectController.SendMsg(ws, {type:'msg', msg:word});
        }else if(cmd == '/stats')
        {
            if(params && params.length > 1)
            {
                var user = ConnectController.GetUserInfo(params[1]);
                ConnectController.SendMsg(ws, {type:'msg', msg:user.GetOnlineTime()});
            }else
            {
                ConnectController.SendMsg(ws, {type:'msg', msg:'/stats params error'});
            }
        }else
        {
            //no command define
            ConnectController.SendMsg(ws, {type:'msg', msg:'no command define'});
        }
    }

    static Update()
    {
        ConnectController.CleanPopular();
    }

    static AddPopular(msg)
    {
        var time = Date.now();
        var words = msg.split(' ');
        for(var i in words)
        {
            var key = words[i];
            var word = ConnectController.Words[key];
            if(word)
            {
                word.time = time;
                word.count++;
                ConnectController.Words[key] = word;
            }else
            {
                ConnectController.Words[key] = {time:time, count:1};
            }
        }
    }

    static CleanPopular()
    {
        var time = Date.now();
        var delKey = [];
        for(var key in ConnectController.Words)
        {
            if(time - ConnectController.Words[key].time > 5000)
            {
                delKey.push(key);
            }
        }
        for(var i in delKey)
        {
            delete ConnectController.Words[delKey[i]];
        }
    }
}

ConnectController.wss;

//todo user controller for optimization
ConnectController.Users = {};
ConnectController.UserCount = 0;

//for /popular
ConnectController.Words = {};

setInterval(()=>{
    ConnectController.Update();
}, 1000);

module.exports = ConnectController;