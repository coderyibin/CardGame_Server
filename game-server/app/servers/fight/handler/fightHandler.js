var Code = require("../../../util/code");
var dbclient = require('pomelo').app.get("dbclient");
var FightCtrl = require("./FightCtrl");
var util = require("../../../util/utils");

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
    if (!! mapId) {
        var sql = "select firstpartner from user where id = ?";
        var args = [session.uid];
        dbclient.query(sql, args, function (err, first) {
            if (err) {
                console.warn(err)
            } else {
                if (first[0].firstpartner != 0) {
                    sql = "select * from monster where checkpoint = 1";
                    args = [];
                    dbclient.query(sql, args, function (err, monster) {
                        if (! err) {
                            var monsterAgiel = 0;//敌方先手值
                            for (var i in monster) {
                                monster[i]["camp"] = "monster"
                                monsterAgiel += monster[i].agile;
                            }
                            this._oFightMonsters = monster;
                            // sql = "select * from user_partner where fight = 1 and userId = ?";
                            sql = "select b.id, a.name, a.att, a.def, a.hp, a.mp, b.level, a.agile " +
                                "from partner a inner join user_partner b on a.id = b.partnerId and b.fight = 1";
                            args = [session.uid];
                            dbclient.query(sql, args, function (err, partner) {
                                if (! err) {
                                    var u_data = [];
                                    var userAgile = 0;//我方先手值
                                    for (var i in partner) {
                                        u_data.push({
                                            id : partner[i].id,
                                            name : partner[i].name,
                                            def : partner[i].def,
                                            hp : partner[i].hp,
                                            mp : partner[i].mp,
                                            level : partner[i].level,
                                            camp : "user",
                                            att : partner[i].att
                                        });
                                        userAgile += partner[i].agile;
                                    }
                                    this._oFightUsers = u_data;
                                    //返回玩家对阵数据
                                    next(null, {
                                        code : Code.OK,
                                        monsters : monster,
                                        users : u_data
                                    });
                                    //快速战斗计算
                                    // FightCtrl.QuickFight(monster, partner, function (data) {
                                    //     next(null, {code : 1, data : data});
                                    // });
                                } else {
                                    console.log(err);
                                }
                            })
                        } else {
                            console.log(err);
                        }
                    })
                } else {
                    next(null, {code : Code.FAIL, content : "请先前往客栈获取一直随从"});
                }
            }
        })
    } else {
        next(null, {
            code : Code.FAIL,
            content : "地图id，参数错误"
        });
    }
}

//请求战斗
fight.reqFight = function (msg, session, next) {
    var attId = msg.attId;
    if (!! attId) {//手动战斗

    } else {//自动战斗
        var users = this._oFightUsers;
        var userAgile = 0;
        var monsterAgile = 0;
        var monsters = this._oFightMonsters;
        console.log(users)
        for (var i = 0; i < users.length; i ++) {
            userAgile += users[i].agile;
        }
        for (var i = 0; i < monsters.length; i ++) {
            monsterAgile += monsters[i].agile;
        }
        if (monsterAgile > userAgile) {//敌方优先动手
            // var f = [];
            // for (var i = 0; i < monsters.length; i ++) {
            //     var index = util.random(users.length);
            //     var subHp = monsters[i].att - users[index].def;
            //     users[index].hp -= subHp;
            //     var die = false;
            //     if (users[index].hp <= 0) {
            //         users.splice(index, 1);
            //         die = true;
            //     }
            //     f.push({
            //         attId : monsters[i].id,
            //         attTag : users[index].id,
            //         sub : subHp,
            //         die : die
            //     })
            // }
            var data = FightCtrl.reqAutoFight(monsters, users);
            monsters = data.att;
            users = data.tar;
            var f = data.f;
            data = FightCtrl.reqAutoFight(users, monsters);
            users = data.att;
            monsters = data.tar;
            f.concat(data.f);
            next(null, {
                code : Code.OK,
                data : f
            });
        } else {
            next(null, {
                code : Code.OK,
                data : ""
            });
        }
    }
}
