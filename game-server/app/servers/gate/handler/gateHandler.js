var dispatcher = require('../../../util/dispatcher');

module.exports = function(app) {
    return new Handler(app);
};

var Handler = function(app) {
    this.app = app;
};

var handler = Handler.prototype;

/**
 * Gate handler that dispatch user to connectors.
 *
 * @param {Object} msg message from client
 * @param {Object} session
 * @param {Function} next next stemp callback
 *
 */
handler.queryEntry = function(msg, session, next) {
    var uid = msg.uid;
    if(!uid) {
        next(null, {
            code: 500

        });
        return;
    }
    // get all connectors
    var connectors = this.app.getServersByType('connector');
    if(!connectors || connectors.length === 0) {
        next(null, {
            code: 500
        });
        return;
    }
    // select connector
    var res = dispatcher.dispatch(uid, connectors);
    next(null, {
        code: 200,
        host: res.host,
        port: res.clientPort
    });
};

handler.Test = function (msg, session, next) {
    var uid = msg.uid;
    var sid = this.app.getServerId();
    var channelServer = this.app.get("channelService");
    var channel = channelServer.getChannel("ss", true);
    channel.add(uid, sid)
    // channel.pushMessageByUids("onJoinRoom", {roomId : "456"}, uids, null, function (rs) {});
    next(null, {code:200, content : "456132"});

    session.bind(uid)
    session.set("roomId", 66);
    session.push("roomId", function (err) {
        if (err) {
            console.error('set rid for session service failed! error is : %j', err.stack);
        }
    });

    var uids = [{uid : uid, sid : sid}];
    channelServer.pushMessageByUids("onJoinRoom", {roomId : 88, main : uid, uid : uid}, uids, null, function (rs) {});
}
