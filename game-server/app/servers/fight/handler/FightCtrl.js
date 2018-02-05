var utils = require("../../../util/utils");

var Fight = module.exports;
Fight.FightUsers = null;
Fight.FightMonster = null;

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

//自动战斗
Fight.reqAutoFight = function (att, tar) {
    var f = [];
    for (var i = 0; i < att.length; i ++) {
        var index = utils.random(tar.length - 1);
        var subHp = att[i].att - tar[index].def;
        tar[index].hp -= subHp;
        var die = false;
        if (tar[index].hp <= 0) {
            tar.splice(index, 1);
            die = true;
        }
        f.push({
            attId : att[i].id,
            attName : att[i].name,
            attTag : tar[index].id,
            tarName : tar[index].name,
            sub : subHp,
            die : die
        });
    }
    return {
        f : f,
        att : att,
        tar : tar
    };
}