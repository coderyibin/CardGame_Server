
module.exports = function (app) {
    return fightRemote(app);
}
var fightRemote = function (app) {
    this.app = app;
    this.channelService = app.get("channelService");
}

var remote = fightRemote.prototype;

remote.createChannel = function (rid, sid) {
    console.log(rid);
}