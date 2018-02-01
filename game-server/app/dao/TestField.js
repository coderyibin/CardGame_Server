var utils = require('../util/utils');
var UserData = require("./UserDao")
var dbclient = require('pomelo').app.get("dbclient");

var TestField = module.exports;

var channelServer = require('pomelo').app.get("channelService");

TestField.getTestList = function (uid) {
    if (first == 0) {
        var f = UserData.upDatePartner(uid);
        if (! f) {
            return false;
        }
    }
}

TestField.JoinTestField = function (msg, session, next) {
    var id = msg.id;
    if (!! id) {

    }
}