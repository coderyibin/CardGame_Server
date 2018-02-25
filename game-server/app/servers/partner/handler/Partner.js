var dbclient = require('pomelo').app.get("dbclient");
var PartnerDao = require("../../../dao/PartnerDao")
var utils = require("../../../util/utils");

var PartnerCtrl = module.exports;

PartnerCtrl.getPartner = function (rid, cb) {
    
    PartnerDao.getPlayerPartner(rid, function (res) {
        cb(res);
    });
}