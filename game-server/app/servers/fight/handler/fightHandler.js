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
        var sql = "select * from monster where checkpoint = 1";
        var args = [];
        dbclient.query(sql, args, function (err, monster) {
            if (! err) {
                monster = monster;
                sql = "select * from user_partner where fight = 1 and userId = ?";
                args = [session.uid];
                dbclient.query(sql, args, function (err, partner) {
                    if (! err) {
                        partner = partner;
                        FightCtrl.QuickFight(monster, partner, function (data) {
                            next(null, {code : 1, data : data});
                        });
                    } else {
                        console.log(err);
                    }
                })
            } else {
                console.log(err);
            }
        })

    } else {
        next(null, {
            code : Code.FAIL,
            content : "地图id，参数错误"
        });
    }
}