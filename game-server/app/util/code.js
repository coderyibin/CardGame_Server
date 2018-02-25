/**
 * Created by JustinLin on 2018/1/31.
 * code代码意义
 */
module.exports = {
    NONE: 200,
    OK: 200,
    FAIL: 500,
    PASSWORD_ERR : 201,
    PARTNER : {
        UID : 601,//获取随从传入的rid为空
        FIRST : 602,//已经拥有 第一只随从
        NONE : 603//身上没有随从
    },
    FIGHT : {
        RESULT : 611//战斗结算
    }
};