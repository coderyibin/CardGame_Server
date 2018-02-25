var Code = require("../../../util/code");
var dbclient = require('pomelo').app.get("dbclient");
var FightCtrl = require("./FightCtrl");
var util = require("../../../util/utils");
var db = require('../../../dao/dbClient');

module.exports = function (app) {
    return new fightHandler(app);
}

var fightHandler = function (app) {
    this._oFightUsers = [];
    this._oFightMonsters = [];

}

var fight = fightHandler.prototype;

fight.startFight = function (msg, session, next) {
    var mapId  = msg.mapId;
    var rid = msg.rid;
    if (!! mapId && rid) {
        db.getIsFirstPartner(rid, function (msg) {
            if (msg.firstId == 0) {//没有随从，不可进试炼场
                next(null, {
                    code : Code.PARTNER.NONE,
                    content : "没有随从，不能进试炼场"
                });
            } else {
                db.getCheckPointMonster(mapId, function (res) {
                    // console.log(res);
                    next(null, {
                        code : Code.OK,
                        monster : res
                    });
                })
            }
        })
        // var sql = "select firstpartner from user where id = ?";
        // var args = [session.uid];
        // dbclient.query(sql, args, function (err, first) {
        //     if (err) {
        //         console.warn(err)
        //     } else {
        //         if (first[0].firstpartner != 0) {
        //             sql = "select * from monster where checkpoint = 1";
        //             args = [];
        //             dbclient.query(sql, args, function (err, monster) {
        //                 if (! err) {
        //                     var monsterAgiel = 0;//敌方先手值
        //                     for (var i in monster) {
        //                         monster[i]["camp"] = "monster"
        //                         monsterAgiel += monster[i].agile;
        //                     }
        //                     FightCtrl.FightMonster = monster;
        //                     // sql = "select * from user_partner where fight = 1 and userId = ?";
        //                     sql = "select b.id, a.name, a.att, a.def, a.hp, a.mp, b.level, a.agile " +
        //                         "from partner a inner join user_partner b on a.id = b.partnerId and b.fight = 1";
        //                     args = [session.uid];
        //                     dbclient.query(sql, args, function (err, partner) {
        //                         if (! err) {
        //                             var u_data = [];
        //                             var userAgile = 0;//我方先手值
        //                             for (var i in partner) {
        //                                 u_data.push({
        //                                     id : partner[i].id,
        //                                     name : partner[i].name,
        //                                     def : partner[i].def,
        //                                     hp : partner[i].hp,
        //                                     mp : partner[i].mp,
        //                                     level : partner[i].level,
        //                                     agile : partner[i].agile,
        //                                     camp : "user",
        //                                     att : partner[i].att
        //                                 });
        //                                 userAgile += partner[i].agile;
        //                             }
        //                             FightCtrl.FightUsers = u_data;
        //                             //返回玩家对阵数据
        //                             next(null, {
        //                                 code : Code.OK,
        //                                 monsters : monster,
        //                                 users : u_data
        //                             });
        //                             //快速战斗计算
        //                             // FightCtrl.QuickFight(monster, partner, function (data) {
        //                             //     next(null, {code : 1, data : data});
        //                             // });
        //                         } else {
        //                             console.log(err);
        //                         }
        //                     })
        //                 } else {
        //                     console.log(err);
        //                 }
        //             })
        //         } else {
        //             next(null, {code : Code.FAIL, content : "请先前往客栈获取一直随从"});
        //         }
        //     }
        // })
    } else {
        next(null, {
            code : Code.FAIL,
            content : "地图id，参数错误"
        });
    }
}

//请求战斗
fight.reqFight = function (msg, session, next) {
    var auto = msg.auto;
    var monsters = msg.monsters;
    var users = msg.users;
    if (! monsters || ! users) {
        next(
            null,
            {
                code : Code.FAIL,
                centent : "参数错误"
            }
        );
        return;
    }
    if (monsters.length == 0) {
        next(
            null,
            {
                code : Code.FIGHT.RESULT
            }
        ); return;
    }
    if (! auto) {//手动战斗
        next(
            null, {
                code : Code.OK,
                content : "手动战斗"
            }
        );
    } else {//自动战斗
        var u_agile = 0;//我方先手值
        var m_agile = 0;//敌方先手值
        for (var i = 0; i < users.length; i ++) {
            u_agile += users[i].agile;
        }
        for (var i = 0; i < monsters.length; i ++) {
            m_agile += monsters[i].agile;
        }
        if (m_agile > u_agile) {//敌方先手值
            var data = FightCtrl.reqAutoFight(monsters, users);
            monsters = data.att;
            users = data.tar;
            var f = data.f;
            data = FightCtrl.reqAutoFight(users, monsters);
            monsters = data.tar;
            users = data.att;
            f = f.concat(data.f);
            next(null, {
                code : Code.OK,
                bout : f,
                monsters : monsters,
                users : users
            });
        } else {
            //我方先手值
            var data = FightCtrl.reqAutoFight(users, monsters);
            users = data.att;
            monsters = data.tar;
            var f = data.f;
            data = FightCtrl.reqAutoFight(monsters, users);
            users = data.tar;
            monsters = data.att;
            f = f.concat(data.f);
            next(null, {
                code : Code.OK,
                bout : f,
                monsters : monsters,
                users : users
            });
        }
        // var result = FightCtrl.FightResult(users, monsters);
        // if (result === true) {//胜利
        //
        // } else if (result === false) {//失败
        //
        // }
    }
}
