var userDao = require("../../../dao/UserDao");
var Code = require("../../../util/code");
var db = require('../../../dao/dbClient');
var PushKey = require("../../../util/pushKey");

module.exports = function(app) {
  return new Handler(app);
};

var Handler = function(app) {
  this.app = app;
  this.channelService = require("pomelo").app.get("channelService");
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
		userDao.setUserName(uid, name, session, next);
	} else {
		next(null, {code : Code.FAIL, content : "玩家uid和名称不能为空"});
	}
}

//创建角色
Handler.prototype.createRole = function (msg, session) {
	var uid = msg.uid;
	var name = msg.name;
	var self = this;
	if (!! uid && !! name) {
		userDao.CreateRole(uid, name, function (msg) {
			console.log(msg);
			var rid = msg.rid;
			var sid = self.app.getServerId();
			session.bind(rid);
            session.on('closed', onUserLeave.bind(null, self.app));
			var channel = self.channelService.getChannel(sid, true);
			console.log(rid, sid);
            channel.add(rid, sid);
            var uids = [{uid : rid, sid : sid}];
            //进入游戏界面
            self.channelService.pushMessageByUids("onSys", {
                key : PushKey.JOIN_MAIN,
            }, uids, null, function(){});
            //推送玩家数据
            self.channelService.pushMessageByUids("onSys", {
                key : PushKey.UPDATE_USER_INFO,
                data : msg
            }, uids, null, function(){})
        });
	} else {
		console.warn("参数错误");
	}
}

//玩家升级
Handler.prototype.UpLevel = function (msg, session, next) {
    
}

//获取服务器列表
Handler.prototype.getServer = function (msg, session, next) {
	db.getServerList(function (msg) {
		next(null, {
			code : Code.OK,
			list : msg
		});
    }.bind(this))
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
 * User log out handler
 *
 * @param {Object} app current application
 * @param {Object} session current session object
 *
 */
var onUserLeave = function(app, session) {
    if(!session || !session.uid) {
        return;
    }
    console.log("to kick player");
    // app.rpc.fight.roomRemote.kick(session, session.uid,app.get('serverId'), null);
    // app.rpc.game.friendRemote.delInviteFriendMsg(session, session.uid,null);
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
