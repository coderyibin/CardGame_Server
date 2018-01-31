var utils = require('../util/utils');
var logger = require('pomelo-logger').getLogger('pomelo');
var pomelo = require('pomelo').app.get("dbclient");
var md5 = require("MD5");
var Code = require("../util/code");
var PushKey = require("../util/pushKey");
var channelService = require("pomelo").app.get("channelService");
var UserDao = module.exports;

var channelServer = require('pomelo').app.get("channelService");

//玩家登陆
UserDao.Login = function (account, password, session, cb, exits) {

    if (! exits) {
        this.QueryUserExits(account, password, session, cb);
    } else {
        var passmd5 = md5(password);
        var sql = "select * from user where account = ?";
        var args = [account];
        pomelo.query(sql, args, function (err, res) {
            if (! err) {
                res = res[0];
                if (res.password == passmd5) {//密码正确，进入游戏
                    session.bind(res.id);
                    var uids = [{uid : account, sid : require('pomelo').app.getServerId()}];
                    if (res.name == "") {
                        utils.invokeCallback(cb, null, {code : Code.OK, uid : res.id});
                        // channelServer.pushMessageByUids("onSys",
                        //     {key : PushKey.SET_NAME}, uids, null, function (err) {});
                    } else {
                        channelServer.pushMessageByUids("onSys",
                            {key: PushKey.JOIN_MAIN, data: res[0]}, uids, null, function (err) {
                            });
                    }
                } else {
                    utils.invokeCallback(cb, null, {
                        code : Code.PASSWORD_ERR,
                        content : "密码错误！"
                    })
                }
            }
        })
    }
};

//设置玩家名称
UserDao.setUserName = function (uid, name, cb) {
    if (! uid || ! name) {
        utils.invokeCallback(cb, null, {
            code : Code.FAIL,
            content : "uid或者name不能为空！"
        });
        return;
    }
    var sql = 'update user set name = ? where id = ?';
    var args = [name, uid];
    pomelo.query(sql, args, function (err, res) {
        if (err) {
            console.log(err);
        } else {
            sql = "select * from user where id=?";
            pomelo.query(sql, [uid], function (err, s) {
                if (! err) {
                    var data = {
                        key : PushKey.UPDATE_USER_INFO,
                        data : s
                    }
                    UserDao.PushMsg(s[0].account, require("pomelo").app.getServerId(), data);
                    UserDao.PushMsg(s[0].account, require("pomelo").app.getServerId(), {key : PushKey.JOIN_MAIN});
                }
            })
        }
    })
}

//推送消息
UserDao.PushMsg = function (uid, sid, msg) {
    var uids = [{uid : uid, sid : sid}];
    channelServer.pushMessageByUids("onSys",
        msg, uids, null, function (err) {
        });
}



//玩家注册
UserDao.Register = function (account, password, cb) {
    var sql = 'insert into user (account, password, name, lastlogintime, firstpartner) values (?, ?, ?, ?, ?)';
    var args = [account, md5(password), "", new Date(), 0];
    pomelo.insert(sql, args, function (err, res) {
        if (err) {
            console.log("玩家创建失败");
            console.log(err);
        } else {
            console.log("玩家创建成功");
            var data = {
                code : 200,
                content : "账号创建成功，请创建角色名称！",
                uid : res.insertId,
            }
            utils.invokeCallback(cb, null, data);
            // cb();
        }
    });

};

//查询是否已经注册
UserDao.QueryUserExits = function (account, password, session, cb) {
    if (! account || ! password) {
        utils.invokeCallback(cb, null, {code : Code.FAIL, content : "参数有误！"});
        return;
    }
    console.log(account, password);
    var sql = "select * from user where account = ?";
    var args = [account];
    pomelo.query(sql, args, function (err, res) {
        if (err) {
            console.warn("err:UserData:QueryUserExits",err);
        } else {
            if (res.length == 0) {
                console.log("不存在当前用户，可以注册");
                UserDao.Register(account, password, cb);
            } else {
                console.log("用户存在，直接登陆");
                UserDao.Login(account, password, session, cb, true);
            }
        }
    });
}

//更新玩家第一只随从伙伴信息
UserDao.upDatePartner = function (uid) {
    var sql = "select firstpartner from user where id = ?";
    var agrs = [uid];
    pomelo.query(sql, agrs, function (err, res) {
        if (err) {
            console.log("err:UserData:upDatePartner", err);
        } else {
            if (res == 0) {
                sql = "update user set firstpartner = ? where id = ?";
                agrs = [1, uid];
                pomelo.query(sql, agrs, function (err, res) {
                    if (err) {
                        console.log("err:UserData:upDatePartner-", err);
                    } else {
                        console.log("第一只随从更新成功");
                        return true;
                    }
                })
            } else  {
                return false;
            }
        }
    })
}