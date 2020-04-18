const Log = require('../Utils/Log.class');

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
                    ConnectController.Broadcast(ws, {type:data.type, msg:data.msg});
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
        ConnectController.Users[data.name] = data;
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
            ConnectController.SendMsg(ws, {type:'msg', msg:''});
        }else if(cmd == '/stats')
        {
            if(params && params.length > 1)
            {
                var user = ConnectController.GetUserInfo(params[1]);
                ConnectController.SendMsg(ws, {type:'msg', msg:JSON.stringify(user, null, 4)});
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
}

ConnectController.wss;

//todo user controller for optimization
ConnectController.Users = {};
ConnectController.UserCount = 0;
module.exports = ConnectController;