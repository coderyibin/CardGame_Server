var dbclient = require('pomelo').app.get("dbclient");
var md5 = require("MD5");
var Config = require("../util/config");

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
    var agrs = [account, md5(password), new Date() + ""];
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

db.getUserInfo = function (uid, cb) {
    var sql = "select * from game_user where id = ?";
    var args = [uid];
    db._mysqlQuery(sql, args, function (msg) {
        cb(msg);
    }, "getUserInfo");
}
//获取玩家角色
db.getPlayerRole = function (uid, cb) {
    var sql = "select * from game_role where id = ?";
    var args = [uid];
    db._mysqlQuery(sql, args, function (msg) {
        cb(msg);
    }, "getPlayerRole");
}

db.createRole = function (uid, name, cb) {
    var hp = Config.player.Base_Hp;
    var mp = Config.player.Base_MB;
    var strength = Config.player.Base_Strength;
    var wakan = Config.player.Base_Wakan;
    var agile = Config.player.Base_Agile;
    var armor = Config.player.Base_Armor;
    var sql = "insert into game_role (nickName, sex, userId, hp, mp, strength, wakan, agile, equipment, armor, firstId) values " +
        "(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
    var args = [name, 0, uid, hp, mp, strength, wakan, agile, "{}", armor, 0];
    db._mysqlQuery(sql, args, function (msg) {
        var _data = {
            rid : msg.insertId,
            nickName : name,
            sex : 0,
            uid : uid,
            hp : hp,
            mp : mp,
            strength : strength,
            wakan : wakan,
            agile : agile,
            armor : armor,
        }
        cb(_data);
    }, "updateUserName");
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

db._mysqlQuery = function (sql, args, cb, fname) {
    dbclient.query(sql, args, function (err, res) {
        if (err) {
            console.warn("db:"+fname+":", err);
        } else {
            cb(res);
        }
    })
}