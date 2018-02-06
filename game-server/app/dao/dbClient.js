var dbclient = require('pomelo').app.get("dbclient");
var md5 = require("MD5");

var db = module.exports;

db.insertUserData = function (msg, cb) {
    var account = msg.account;
    var password = msg.password;
    if (! account || ! password) {
        console.warn("账号或密码错误");
        return;
    }
    var sql = "insert into game_user (account, password, lastLoginTime) values " +
        "(?, ?, ?)";
    var agrs = [account, md5(password), Date.parse(new Date()) + ""];
    dbclient.insert(sql, agrs, function (err, res) {
        if (err) {
            console.log("db:insertUserData:", err);
        } else {
            cb(res);
        }
    });
}

db.exitsUser = function (msg, cb) {
    var account = msg.account;
    if (! account) {
        console.log("账号为空");
        return;
    }
    var sql = "select * from game_user where account = ?";
    var args = [account];
    dbclient.query(sql, args, function (err, res) {
        if (err) {
            console.log("db:exitsUser:", err);
        } else {
            cb(res);
        }
    })
}

db.getServerList = function (cb) {
    var sql = "select * from game_server";
    var args = [];
    dbclient.query(sql, args, function (err, res) {
        if (err) {
            console.warn("db:exitsUser:", err);
        } else {
            cb(res);
        }
    })
}