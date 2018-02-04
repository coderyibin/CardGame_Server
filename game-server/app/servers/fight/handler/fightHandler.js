var  Code = require("../../../util/code");
var dbclient = require('pomelo').app.get("dbclient");
var FightCtrl = require("./FightCtrl");

module.exports = function (app) {
    return new fightHandler(app);
}

var fightHandler = function (app) {

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
                            for (var i in monster) {
                                monster[i]["camp"] = "monster"
                            }
                            // sql = "select * from user_partner where fight = 1 and userId = ?";
                            sql = "select b.id, a.name, a.att, a.def, a.hp, a.mp, b.level " +
                                "from partner a inner join user_partner b on a.id = b.partnerId and b.fight = 1";
                            args = [session.uid];
                            dbclient.query(sql, args, function (err, partner) {
                                if (! err) {
                                    var u_data = [];
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
                                        })
                                    }
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