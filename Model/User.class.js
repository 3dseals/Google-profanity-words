Date.prototype.formatD = function(fmt)
{ //author: meizz
    var days = Math.floor(this.getTime()/(60*60*24*1000));
    var hours = Math.floor((this.getTime()%(60*60*24*1000))/(60*60*1000));
    var o = {
        "D+" : days,                                    //天数
        "H+" : hours,                                   //小时
        "M+" : this.getMinutes(),                               //分
        "S+" : this.getSeconds(),                               //秒
    };
    for(var k in o)
        if(new RegExp("("+ k +")").test(fmt))
            fmt = fmt.replace(RegExp.$1, (RegExp.$1.length==1) ? (o[k]) : (("00"+ o[k]).substr((""+ o[k]).length)));
    return fmt;
};

class User {
    constructor(data) {
        this._data = data;
        this.name = data.name;
        this.loginTime = Date.now();
    }

    GetOnlineTime() {
        var online_time = Date.now() - this.loginTime;
        var date = new Date(online_time);
        var days = Math.floor(online_time/(60*60*24));
        return date.formatD("DDd HHh MMm SSs");
    }

    toString() {
        return '(' + this.name + ', ' + this.loginTime + ')';
    }
}
module.exports = User;