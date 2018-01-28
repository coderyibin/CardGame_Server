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
	var mysql = this.app.get("mysql");



  	next(null, {code: 200, msg: 'game server is ok.'+mysql.host});
};

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
