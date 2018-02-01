var userDao = require("../../../dao/UserDao");
var Code = require("../../../util/code")

module.exports = function(app) {
  return new Handler(app);
};

var Handler = function(app) {
  this.app = app;
};

var handler = Handler.prototype;

handler.testList = function (msg, session, next) {
	var uid = msg.uid;
	if (!! uid) {

	} else {
		next(null, {
			code : Code.FAIL,
			content : "err:testList参数错误"
		});
	}
}

//获取试炼场信息
handler.getTestFieldInfo = function (msg, session, next) {
	var id = msg.id;
	if (!! id) {

	}
}
