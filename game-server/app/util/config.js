var config = module.exports;

config.player = {
    Base_Att : 10,//基础攻击
    Base_Def : 8,//基础防御
    Base_Att_Bouns : 0.00,//基础的攻击加成
    Base_Def_Penetrate : 0,//基础防御穿透
    Base_Hp : 500,
    Base_Mp : 50,
    Base_Strength : 50,
    Base_Wakan : 20,
    Base_Agile : 10,
    Base_Armor : 30,
    Base_Mp : 50,
    Base_HB : 0.8,//血量计算的基础数值
    Base_MB : 0.3//魔法计算的基础数值
}

/** 玩家血量计算公式  hp=bh * lv * 0.8    100 * 4 * 0.8 = 320*/
/** 玩家魔法计算公式  mp=bm * lv * 0.3    */