var utils = require('../util/utils');

var pomelo = require('pomelo').app.get("dbclient");

var UserDao = module.exports;

//玩家登陆
UserDao.Login = function (account, password, cb) {

    this.QueryUserExits(account, password, cb);
};

//设置玩家名称
UserDao.setUserName = function (uid, name, cb) {
    var sql = 'update user set name = ? where id = ?';
    var args = [name, uid];
    pomelo.query(sql, args, function (err, res) {
        if (err) {
            console.log(err);
        } else {
            var data = {
                code : 200,
                content : "角色创建成功，进入游戏!"
            }
            utils.invokeCallback(cb, null, data);
        }
    })
}

//玩家注册
UserDao.Register = function (account, password, cb) {
    var sql = 'insert into user (account, password, name, lastlogintime) values (?, ?, ?, ?)';
    var args = [account, password, "test", new Date()];
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
                UserDao.Register(account, password, cb);
            } else {
                console.log("用户存在，直接登陆", cb);
                // UserDao.Login(account, password, cb);
            }
        }
    });
}