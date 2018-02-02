
module.exports = function (app) {
    return partnerRemote(app);
}
var partnerRemote = function (app) {
    this.app = app;
    this.channelService = app.get("channelService");
}

var remote = partnerRemote.prototype;

remote.getPartnerList = function () {
    
}