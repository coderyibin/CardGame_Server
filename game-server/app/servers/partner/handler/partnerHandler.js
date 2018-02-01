var PartnerCtrl = require("./Partner")
var Code = require("../../../util/code")


module.exports = function(app) {
  return new Handler(app);
};

var Handler = function(app) {
  this.app = app;
};

var handler = Handler.prototype;

//获取随从
handler.getPartner = function (msg, session, next) {
    var uid = msg.uid;
    if (uid) {
        PartnerCtrl.getPartner(uid, next);
    }
}


