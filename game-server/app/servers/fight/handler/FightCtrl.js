var utils = require("../../../util/utils");

var Fight = module.exports;

Fight.fightIng = function (monster, users, cb) {

}

//快速战斗
Fight.QuickFight = function (monsters, users, cb) {
    var f = [];
    while (true) {
        var len_u = users.length;
        var len_m = monsters.length;
        if (len_u == 0 || len_m == 0) {
            break;
        }
        for (var i = 0; i < len_u; i ++) {
            var m_id = utils.random(len_m - 1);
            var item = monsters[m_id];
            item.hp -= users[i].att - item.def;
            if (item.hp <= 0) {
                monsters.splice(m_id, 1);
            }
        }
        for (var j = 0; j < len_m; j ++) {
            var u_id = utils.random(len_u - 1);
            var item = users[u_id];
            item.hp -= monsters[i].att - item.def;
            if (item.hp <= 0) {
                users.splice(m_id, 1);
            }
        }
    }
    cb({
        user : users,
        monster : monsters
    });
}