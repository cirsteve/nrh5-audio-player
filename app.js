var util = require("util"),
    http = require("http"),
    route = require("./router"),
    redis = require("redis"),
    url = require("url");

var track = '{"song":"Cakewalk","artist":"Lyrics Born","album":"Same Stuff","url":"http://localhost/myhome/df/Cakewalk.ogg"}';
var track2 = '{"song":"The World","artist":"Lyrics Born","album":"Party Stuff","url":"http://localhost/myhome/df/the-world.ogg"}';
var track3 = '{"song":"Top Shelf","artist":"Lyrics Born","album":"Rock Out","url":"http://localhost/myhome/df/top-shelf.ogg"}';

var redisInit = redis.createClient();
//clear playlist
redisInit.ltrim('playlist', 2, 1);

//populate playlist
redisInit.rpush('playlist', track);
redisInit.rpush('playlist', track2);
redisInit.rpush('playlist', track3);
redisInit.quit();

//redis clients to listen for and respond to the hubox:skip channel
var skipClient = redis.createClient();
var rc = redis.createClient();
var rc2 = redis.createClient();
skipClient.on('message', function(channel,  message) {
    console.log('redisCLient fired: '+channel);
    rc.lpop('playlist', function(err, data) {
        if (err) {
            console.log('err is '+err);
        }
        console.log('lpop: '+data);
        rc.publish('hubox:playing', data);
    });
    rc2.lrange('playlist', 0, -1, function(err, data) {
        if (err) {
            console.log('err is '+err);
        }
        console.log('lrange: '+data);
        rc2.publish('hubox:playlist',JSON.stringify(data));
    });
});
skipClient.subscribe("hubox:skip");
var start = function() {
    function onRequest(request, response) {
        var path = url.parse(request.url).pathname;
        console.log(typeof(route));
        route.route(path, request, response);
    }
    var server = http.createServer(onRequest);
    server.listen(8000);
    console.log('listening on 8000');
};

start();
