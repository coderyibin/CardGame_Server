var PartnerDao = require("../../../dao/PartnerDao");
var Code = require("../../../util/code")

module.exports = function(app) {
  return new Handler(app);
};

var Handler = function(app) {
  this.app = app;
};

var handler = Handler.prototype;

handler.getPartner = function (msg, session, next) {
	var uid = msg.uid;
	var first = msg.first;
	if (!! uid) {
		var part = PartnerDao.getPartner(uid, first);
		if (! part) {
			next(null, {
				code : Code.FAIL,
				content : "系统异常- " + Code.PARTNER.FIRST
			});
		}
	} else {
		next(null, {
			code : Code.FAIL,
			content : "系统异常- " + Code.PARTNER.UID
		});
	}
}


