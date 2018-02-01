var dbclient = require('pomelo').app.get("dbclient");
var PartnerDao = require("../../../dao/PartnerDao")
var utils = require("../../../util/utils");

var PartnerCtrl = module.exports;

PartnerCtrl.getPartner = function (uid, cb) {
    
    PartnerDao.getPartner(uid, cb);
}