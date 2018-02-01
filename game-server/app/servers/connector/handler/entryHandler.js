var userDao = require("../../../dao/UserDao");
var Code = require("../../../util/code");

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
	if (! msg.account || ! msg.password) {
		next(null, {
			code : 500,
			contnet : "输入的账号或者密码不合法"
		});
		return;
	}
	var account = msg.account;
	var password = msg.password;
    userDao.Login(account, password, session, next);
};

//设置玩家名称
Handler.prototype.setName = function (msg, session, next) {
	var uid = msg.uid;
	var name = msg.name;
	if (!! uid && !! name) {
		userDao.setUserName(uid, name, next);
	} else {
		next(null, {code : Code.FAIL, content : "玩家uid和名称不能为空"});
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
