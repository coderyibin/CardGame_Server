var utils = require('../util/utils');
var UserData = require("./UserDao")
var dbclient = require('pomelo').app.get("dbclient");

var PartnerDao = module.exports;

var channelServer = require('pomelo').app.get("channelService");

PartnerDao.getPartner = function (uid, first) {
    if (first == 0) {
        var f = UserData.upDatePartner(uid);
        if (! f) {
            return false;
        }
    }
}