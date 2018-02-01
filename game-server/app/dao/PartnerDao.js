var utils = require('../util/utils');
var UserData = require("./UserDao")
var dbclient = require('pomelo').app.get("dbclient");
var Code = require("../util/code");

var PartnerDao = module.exports;

var channelServer = require('pomelo').app.get("channelService");

//获取玩家随从
PartnerDao.getPartner = function (uid, cb) {
    var sql = "select firstpartner from user where id = ?";
    var args = [uid];
    dbclient.query(sql, args, function (err, first) {
        if (err) {
            console.log("获取第一只随从失败", err);
        } else {
            if (first[0].firstpartner == 0) {
                sql = "select id from partner where first = 1";
                dbclient.query(sql, [], function (err, res) {
                    //获取随从表属于玩家第一只随从的id
                    if (! err) {
                        sql = "insert into user_partner (partnerId, userId, level, equipment) values (?, ?, ? ,?)";
                        args = [res[0].id, uid, 1, "{}"];
                        dbclient.query(sql, args, function (err, insert) {
                            if (! err) {
                                //更新玩家数据
                                UserData.upDatePartner(uid, function () {
                                    var part = {
                                        id : insert.insertId,
                                        partnerId : res[0].id,
                                        level : 1,
                                        equipment : {}
                                    }
                                    sql = "select * from partner where id = ?";
                                    args = [res[0].id];
                                    dbclient.query(sql, args, function (err, all) {
                                        if (! err) {
                                            var _a = all[0];
                                            part["property"] = _a;
                                            utils.invokeCallback(cb, null, {
                                                code : Code.OK,
                                                data : part
                                            });
                                        }
                                    })
                                })
                            }
                        })
                    }
                })
            } else {
                console.log("已经拥有第一只随从");
            }
        }
    })
}