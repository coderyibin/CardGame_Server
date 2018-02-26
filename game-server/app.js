var pomelo = require('pomelo');
var routeUtil = require("./app/util/routeUtil");
/**
 * Init app for client.
 */
var app = pomelo.createApp();
app.set('name', 'CardGame_Server');
var base = app.getBase();
app.loadConfig("mysql", app.getBase() + "/config/mysql.json");//添加配置
var serverId = app.getServerId();
// require('pomelo-logger').configure( base + '/config/log4js.json' , {serverId: serverId, base: base} );


app.configure('production|development', 'gate', function () {
    app.set('connectorConfig', {
        connector: pomelo.connectors.hybridconnector,
        useProtobuf : true
    })
})
app.configure('production|development', 'partner | testField | fight', function () {
    // app.set('connectorConfig', {
    //     connector: pomelo.connectors.hybridconnector,
    //     useProtobuf : true
    // })
});

// app configuration
app.configure('production|development', 'connector', function(){

    app.set('connectorConfig',
        {
          connector : pomelo.connectors.hybridconnector,
          heartbeat : 3,
          useDict : true,
          useProtobuf : true
        });
});

app.configure('production|development', function() {
    var dbclient = require('./app/dao/mysql/mysql.js').init(app);
    app.set('dbclient', dbclient);
    app.route('fight', routeUtil.fight);
    // app.route('fight', routeUtil.fight);//被踢下线原因注释
    // app.route('connector', routeUtil.connector);
    // app.filter(pomelo.timeout());
    // app.enable('systemMonitor');
    // if(app.serverType !== 'master'){
    //     var fightList = app.get("servers").fight;
    //     var fightMap = {};
    //     for(var id in fightList){
    //         fightMap[fightList[id].fight] = fightList[id].id;
    //     }
    //     app.set('fightMap',fightMap);
    // }
});

// start app
app.start();

process.on('uncaughtException', function (err) {
  console.error(' Caught exception: ' + err.stack);
});
