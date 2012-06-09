var util = require("util"),
    http = require("http"),
    route = require("./router"),
    redis = require("redis"),
    url = require("url");

var track = {song:"The Only Place",artist:"Best Coast",album:"Dont Ask Me",url:"http://localhost:8000/music?the-only-place.ogg"};
var track2 = {song:"Baby Missiles",artist:"The War On Drugs",album:"Dont Know",url:"http://localhost:8000/music?baby-missiles.ogg"};
var track3 = {song:"Live It Up",artist:"Kid Ink",album:"Who Knows",url:"http://localhost:8000/music?live-it-up.ogg"};
var track4 = {song:"Choose Up",artist:"Dom Kennedy",album:"Not Sure",url:"http://localhost:8000/music?choose-up.ogg"};

var redisInit = redis.createClient();
//clear playlist
redisInit.ltrim('playlist', 2, 1);

//populate playlist
redisInit.rpush('playlist', JSON.stringify(track));
redisInit.rpush('playlist', JSON.stringify(track2));
redisInit.rpush('playlist', JSON.stringify(track3));
redisInit.rpush('playlist', JSON.stringify(track4));
redisInit.quit();

//redis clients to listen for and respond to the hubox:skip channel by publishing to hubox:playing and hubox:playlist
var skipClient = redis.createClient();
var rc = redis.createClient();
var rc2 = redis.createClient();

//when message is broadcast over hubox:skip channel this handles the relay to user clients
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
        var path = url.parse(request.url).pathname,
            query = url.parse(request.url).search;
        console.log(typeof(route));
        route.route(path, request, response, query);
    }
    var server = http.createServer(onRequest);
    server.listen(8000);
    console.log('listening on 8000');
};

start();
