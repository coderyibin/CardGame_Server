var userDao = require("../../../dao/UserDao");
var Code = require("../../../util/code")

module.exports = function(app) {
  return new Handler(app);
};

var Handler = function(app) {
  this.app = app;
};

/**
 * New client entry.
 *
 * @param  {Object}   msg     request message
 * @param  {Object}   session current session object
 * @param  {Function} next    next step callback
 * @return {Void}
 */
Handler.prototype.entry = function(msg, session, next) {
  next(null, {code: 200, msg: 'game server is ok.'});
};

Handler.prototype.login = function(msg, session, next) {
	if (! msg.uid || ! msg.password) {
		next(null, {
			code : 500,
			contnet : "输入的账号或者密码不合法"
		});
		return;
	}
	var uid = msg.uid;
	var password = msg.password;
	var session = this.app.get("sessionService");
	var ssion = session.getByUid(uid);
	if (!! ssion) {
		next(null, {code : 500, content : "您的账号已经在其他设备登录！"});
		return;
	}
	//将当前的session绑定一个uid
	session.bind(uid);
	// var mysql = this.app.get("mysql");
	var self = this;
	userDao.Login(uid, password, function () {
		next(null, {
			code : Code.OK,
			uid : uid
		});
        // var channelServer = self.app.get("channelService");
        // var channel = channelServer.getChannel("fu1", true);
        // var sid = self.app.getServerId();
        // channel.add(uid, sid);
        // console.log("**********");
        // console.log(sid);
        // var uids = [{uid : uid, sid : sid}];
        // console.log("**********");
        // console.log(uids);
        // //推送客户端进入房间
        // channelServer.pushMessageByUids("onSys", {uid : uid}, uids, null, function (rs) {});
	});
};

//设置玩家名称
Handler.prototype.setName = function (msg, session, next) {
	var uid = msg.uid;
	var name = msg.name;
	if (!! uid && !! name) {
		userDao.setUserName(uid, name, next);
	}
}

/**
 * Publish route for mqtt connector.
 *
 * @param  {Object}   msg     request message
 * @param  {Object}   session current session object
 * @param  {Function} next    next step callback
 * @return {Void}
 */
Handler.prototype.publish = function(msg, session, next) {
	var result = {
		topic: 'publish',
		payload: JSON.stringify({code: 200, msg: 'publish message is ok.'})
	};
  next(null, result);
};

/**
 * Subscribe route for mqtt connector.
 *
 * @param  {Object}   msg     request message
 * @param  {Object}   session current session object
 * @param  {Function} next    next step callback
 * @return {Void}
 */
Handler.prototype.subscribe = function(msg, session, next) {
	var result = {
		topic: 'subscribe',
		payload: JSON.stringify({code: 200, msg: 'subscribe message is ok.'})
	};
  next(null, result);
};
