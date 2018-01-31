var utils = require('../util/utils');
var logger = require('pomelo-logger').getLogger('pomelo');
var pomelo = require('pomelo').app.get("dbclient");
var md5 = require("MD5");

var UserDao = module.exports;

var channelServer = require('pomelo').app.get("channelService");

//玩家登陆
UserDao.Login = function (account, password, cb) {

    var exits = this.QueryUserExits(account, password, cb);
    if (exits) {
        var passmd5 = md5(password);
        var sql = "select password from user where account = ?";
        var args = [account];
        pomelo.query(sql, args, function (err, res) {
            if (! err) {
                if (passmd5 == res) {//密码正确
                    cb({
                        ok : true
                    });
                } else {
                    cb({
                        ok : false
                    });
                }
            }
        })
    } else {
        UserDao.Register(account, password, cb);
    }
};

//设置玩家名称
UserDao.setUserName = function (uid, name, cb) {
    var sql = 'update user set name = ? where account = ?';
    var args = [name, uid];
    pomelo.query(sql, args, function (err, res) {
        if (err) {
            console.log(err);
        } else {
            sql = "select * from user where account=?";
            pomelo.query(sql, [uid], function (err, s) {
                if (! err) {
                    var data = {
                        code : 200,
                        content : "角色创建成功，进入游戏!",
                        player : s
                    }
                    utils.invokeCallback(cb, null, data);
                }
            })
        }
    })
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
            // utils.invokeCallback(cb, null, data);
            cb();
        }
    });

};

//查询是否已经注册
UserDao.QueryUserExits = function (account, password, cb) {
    var sql = "select * from user where account = ?";
    var args = [account];
    pomelo.query(sql, args, function (err, res) {
        if (err) {
            console.log(err);
            console.log("查询错误");
        } else {
            if (res.length == 0) {
                console.log("不存在当前用户，可以注册");
                return false;
            } else {
                console.log("用户存在，直接登陆");
                return true;
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