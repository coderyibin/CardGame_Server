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
    var sql = "select * from game_role where userId = ?";
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

db.getIsFirstPartner = function (rid, cb) {
    var sql = "select firstId from game_role where id = ?";
    var args = [rid];
    dbclient.query(sql, args, function (err, msg) {
        if (err) {
            console.warn("db:getIsFirstPartner:", err);
        } else {
            cb(msg[0]);
        }
    })
}

//获取关卡怪物
db.getCheckPointMonster = function (map, cb) {
    var sql = "select * from game_monster";
    var args = [];
    db._mysqlQuery(sql, args, cb, "getCheckPointMonster");
}

//获取玩家第一只随从
db.getPlayerFirstPartner = function (uid, cb) {
    // var sql = "select * from game_partner where first = 1";
    // var args = [];
    // db._mysqlQuery(sql, args, cb, "getPlayerFirstPartner");
    var sql = "select * from game_role where id = ?";
    var args = [uid];
    db._mysqlQuery(sql, args, cb, "getPlayerFirstPartner");
}
//更新玩家第一只随从信息
db.updateFirstPartner = function (rid, partnerId, cb) {
    db.getFirstPartner(function (res) {
        res = res[0];
        var sql = "update game_role set firstId = ? where id = ?";
        var args = [res.id, rid];
        db._mysqlQuery(sql, args, function (r) {
            res["userId"] = rid;
            db.insertUserPartner(res, function () {
                cb(res);
            });
        }, "updateFirstPartner");

    });
}
//插入玩家随从表
db.insertUserPartner = function (msg, cb) {
    console.log(msg);
    var sql = "insert into game_user_partner (name, userId, partnerId, equipment, hp, mp, strength, wakan, agile, armor, level)" +
        "values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
    var args = [msg.name, msg.userId, msg.id, "{}", msg.hp, msg.mp, msg.strength, msg.wakan, msg.agile, msg.armor, 1];
    db._mysqlQuery(sql, args, cb, "insertUserPartner");
}
//获取第一只随从
db.getFirstPartner = function (cb) {
    var sql = "select * from game_partner where first=1";
    var args = [];
    db._mysqlQuery(sql, args, cb, "getFirstPartner");
}

//获取玩家随从
db.getUserPartner = function (rid, cb) {
    var sql = "select * from game_user_partner where userId = ?";
    var args = [rid];
    db._mysqlQuery(sql, args, cb, "getUserPartner");
}

//获取随从数据
db.getPartnerData = function (id, cb) {
    var sql = "select * from game_partner where 1";
    var args = [];
    db._mysqlQuery(sql, args, function (res) {
        cb(res);
    }, "getPartnerData");
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