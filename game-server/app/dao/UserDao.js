var utils = require('../util/utils');
var dbclient = require('pomelo').app.get("dbclient");
var pomelo = require('pomelo');
var md5 = require("MD5");
var Code = require("../util/code");
var PushKey = require("../util/pushKey");
var channelService = require("pomelo").app.get("channelService");
var Config = require("../util/config");
var db = require('../dao/dbClient');
var UserDao = module.exports;
UserDao.UserInfo = null;

//玩家登陆
UserDao.Login = function (account, password, session, cb, exits) {

    // this.QueryUserExits(account, password, function (exits) {
    //     if (! exits) {
    //         //前往注册
    //         UserDao.Register(account, password, function (uid) {
    //             cb({uid : uid, key : PushKey.SET_NAME});
    //         });
    //     } else {
    //         //前往判断是否有角色，是否需要创建角色
    //
    //     }
    // });
    if (! exits) {
        this.QueryUserExits(account, password, session, cb);
    } else {
        var passmd5 = md5(password);
        var password = exits.password;
        if (password == passmd5) {
            //密码正确
            var sessionService = pomelo.app.get("sessionService");
            var sess = sessionService.getByUid(exits.id);
            if (!! sess) {//强制下线
                sess.kick(exits.id, function(){});
            }
            var sid = require('pomelo').app.getServerId();
            db.getPlayerRole(exits.id, function (msg) {
                if (msg.length == 0) {//玩家未创建角色，前往创建
                    console.log("玩家未创建角色，前往创建");
                    utils.invokeCallback(cb, null, {
                        code : Code.OK,
                        create : false,
                        uid : exits.id
                    });
                    //推送消息进入设置名称界面
                    channelService.pushMessageByUids("onSys", {
                        key : PushKey.SET_NAME
                    }, [{uid : exits.id, sid : sid}], null, function () {});
                } else {
                    utils.invokeCallback(cb, null, {
                        code : Code.OK
                    })
                    var rid = msg[0].rid;
                    session.bind(rid);//绑定角色id
                    session.on('closed', onUserLeave.bind(null, this.app));
                    var channel = channelService.getChannel(sid, true);
                    channel.add(rid, sid);
                    // UserDao.JoinGame(session, msg[0]);
                    //推送消息进入设置名称界面
                    channelService.pushMessageByUids("onSys", {
                        key : PushKey.JOIN_MAIN
                    }, [{uid : rid, sid : sid}], null, function () {});
                    //推送玩家数据
                    channelService.pushMessageByUids("onSys", {
                        key : PushKey.UPDATE_USER_INFO,
                        data : msg[0]
                    }, [{uid : rid, sid : sid}], null, function(){});
                    UserDao.UserInfo = msg[0];//角色信息
                }
            })
        } else {
            //密码错误
            utils.invokeCallback(cb, null, {
               code : Code.PASSWORD_ERR,
               content : "密码错误！"
            });
        }
    }
};

UserDao.CreateRole = function (uid, name, cb) {
    // db.createRole(uid, name, function (msg) {
        // UserDao.JoinGame(session, msg);
    // });
    db.createRole(uid, name, function (msg) {
        UserDao.UserInfo = msg;//角色信息
        cb(msg);
    });
}

//登录成功后进去游戏
UserDao.JoinGame = function (session, userInfo) {
    var rid = userInfo.rid;
    session.bind(rid);//绑定角色id
    session.on('closed', onUserLeave.bind(null, this.app));
    var sid = require('pomelo').app.getServerId();
    var channel = channelService.getChannel(sid, true);
    channel.add(rid, sid);
    var uids = [{uid : rid, sid : sid}];
    //进入游戏界面
    channelService.pushMessageByUids("onSys", {
        key : PushKey.JOIN_MAIN,
    }, uids, null, function(){});
    //推送玩家数据
    channelService.pushMessageByUids("onSys", {
        key : PushKey.UPDATE_USER_INFO,
        data : userInfo
    }, uids, null, function(){});
    UserDao.UserInfo = userInfo;//角色信息
}

//登录成功进去游戏主界面
UserDao.JoinMain = function (session, exits) {
    console.log(exits);
    var self = this;
    session.bind(exits.id);
    session.on('closed', onUserLeave.bind(null, self.app));
    var channel = channelService.getChannel("fuwu1", true);
    var sid = require('pomelo').app.getServerId();
    channel.add(exits.id, sid);
    var uids = [{uid : exits.id, sid : sid}];
    if (exits.name == "") {
        //推送消息进入设置名称界面
        channelService.pushMessageByUids("onSys", {
            key : PushKey.SET_NAME
        }, uids, null, function () {});
    } else {
        //进入游戏界面
        channelService.pushMessageByUids("onSys", {
            key : PushKey.JOIN_MAIN,
        }, uids, null, function(){});
        //推送玩家数据
        channelService.pushMessageByUids("onSys", {
            key : PushKey.UPDATE_USER_INFO,
            data : exits
        }, uids, null, function(){});
        UserDao.UserInfo = exits;
    }
}

//推送消息
UserDao.PushMsg = function (uid, sid, msg) {
    var uids = [{uid : uid, sid : sid}];
    channelService.pushMessageByUids("onSys",
        msg, uids, null, function (err) {
        });
}



//玩家注册
UserDao.Register = function (account, password, session, cb) {
    db.insertUserData({
        account : account,
        password : password
    }, function (msg) {
        console.log("玩家创建成功");
        var data = {
            code : 200,
            content : "账号创建成功，请创建角色名称！",
            uid : msg.insertId,
        }
        session.bind(msg.insertId);
        var channel = channelService.getChannel("fuwu1", true);
        channel.add(msg.insertId, pomelo.app.getServerId());
        utils.invokeCallback(cb, null, data);
    });
};

//查询是否已经注册
UserDao.QueryUserExits = function (account, password, session, cb) {
    db.exitsUser({
        account : account
    }, function (msg) {
        if (msg.length == 0) {
            console.log("不存在当前用户，可以注册");
            UserDao.Register(account, password, session, cb);
            // cb(false);
        } else {
            console.log("用户存在，直接登陆");
            UserDao.Login(account, password, session, cb, msg[0]);
        }
    })
}

//更新玩家第一只随从伙伴信息
UserDao.upDatePartner = function (uid, cb) {
    var sql = "update user set firstpartner = 1 where id = ?";
    var args = [uid];
    dbclient.query(sql, args, function (err, res) {
        if (! err) {
            cb();
        }
    })
}

//玩家升级
UserDao.UpdateLevel = function () {
    
}
/**
 * User log out handler
 *
 * @param {Object} app current application
 * @param {Object} session current session object
 *
 */
var onUserLeave = function(app, session) {
    if(!session || !session.uid) {
        return;
    }
    console.log("to kick player");
    // app.rpc.fight.roomRemote.kick(session, session.uid,app.get('serverId'), null);
    // app.rpc.game.friendRemote.delInviteFriendMsg(session, session.uid,null);
};

var Log = function (cbName) {
    return "log:UserDao:"+cbName;
}
var Err = function (cbName) {
    return "err:UserDao:"+cbName;
}