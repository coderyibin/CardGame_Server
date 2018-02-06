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
            db.getPlayerRole(exits.id, function (msg) {
                if (msg.length == 0) {//玩家未创建角色，前往创建
                    console.log("玩家未创建角色，前往创建");
                    utils.invokeCallback(cb, null, {
                        code : Code.OK,
                        create : false,
                        uid : exits.id
                    });
                    var sid = require('pomelo').app.getServerId();
                    //推送消息进入设置名称界面
                    channelService.pushMessageByUids("onSys", {
                        key : PushKey.SET_NAME
                    }, [{uid : exits.id, sid : sid}], null, function () {});
                } else {
                    utils.invokeCallback(cb, null, {
                        code : Code.OK
                    })
                    UserDao.JoinGame(session, msg[0]);
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

//登录成功后进去游戏
UserDao.JoinGame = function (session, userInfo) {
    session.bind(userInfo.id);
    session.on('closed', onUserLeave.bind(null, self.app));
    var channel = channelService.getChannel("fuwu1", true);
    var sid = require('pomelo').app.getServerId();
    channel.add(userInfo.id, sid);
    var uids = [{uid : userInfo.id, sid : sid}];
    //进入游戏界面
    channelService.pushMessageByUids("onSys", {
        key : PushKey.JOIN_MAIN,
    }, uids, null, function(){});
    //推送玩家数据
    channelService.pushMessageByUids("onSys", {
        key : PushKey.UPDATE_USER_INFO,
        data : userInfo
    }, uids, null, function(){});
    UserDao.UserInfo = userInfo;
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

//设置玩家名称
UserDao.setUserName = function (uid, name, session, cb) {
    // var sql = 'update game_user set name = ? where id = ?';
    // var args = [name, uid];
    // dbclient.query(sql, args, function (err, res) {
    //     if (err) {
    //         console.log(err);
    //     } else {
    //         sql = "select * from game_user where id = ?";
    //         dbclient.query(sql, [uid], function (err, s) {
    //             if (! err) {
    //                 UserDao.JoinMain(session, s[0]);
    //             }
    //         })
    //     }
    // })
    db.updateUserName(uid, name, function (msg) {
        if (UserDao.UserInfo == null) {
            db.getUserInfo(uid, function (msg) {
                UserDao.JoinMain(session, msg[0]);
            })
        } else {
            UserDao.JoinMain(session, UserDao.UserInfo);
        }
    });
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
    // var sql = 'insert into user (account, password, name, lastlogintime, firstpartner, att, def, att_bouns, def_penetrate, agile, hp, mp) ' +
    //     'values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
    // var args = [account, md5(password), "", new Date(), 0, Config.player.Base_Att, Config.player.Base_Def, Config.player.Base_Att_Bouns,
    //     Config.player.Base_Hp, Config.player.Base_Mp, Config.player.Base_Def_Penetrate, 10];
    // dbclient.insert(sql, args, function (err, res) {
    //     if (err) {
    //         console.log("玩家创建失败");
    //         console.log(err);
    //     } else {
    //         console.log("玩家创建成功");
    //         var data = {
    //             code : 200,
    //             content : "账号创建成功，请创建角色名称！",
    //             uid : res.insertId,
    //         }
    //         session.bind(res.insertId);
    //         var channel = channelService.getChannel("fuwu1", true);
    //         channel.add(res.insertId, pomelo.app.getServerId());
    //         utils.invokeCallback(cb, null, data);
    //     }
    // });
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

    // var sql = "select * from user where account = ?";
    // var args = [account];
    // dbclient.query(sql, args, function (err, res) {
    //     if (err) {
    //         console.warn("err:UserData:QueryUserExits",err);
    //     } else {
    //         if (res.length == 0) {
    //             console.log("不存在当前用户，可以注册");
    //             UserDao.Register(account, password, session, cb);
    //         } else {
    //             console.log("用户存在，直接登陆");
    //             UserDao.Login(account, password, session, cb, res[0]);
    //         }
    //     }
    // });
    db.exitsUser({
        account : account
    }, function (msg) {
        if (msg.length == 0) {
            console.log("不存在当前用户，可以注册");
            UserDao.Register(account, password, session, cb);
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