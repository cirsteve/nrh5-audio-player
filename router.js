var fs = require("fs"),
    redis = require("redis");

var html = fs.readFileSync('index.html', 'utf8');

function route(path, request, response) {
    console.log('routing '+path);
    //home route, serves up the index.html file
    if (path === '/') {
        response.writeHead(200, {"Content-Type":"text/html"});
        response.write(html);
        response.end();
    }
    //server side event subscrition url, called on inde.html page load
    else if (path === '/stream') {
        console.log('/stream handler called');
        request.socket.setTimeout(Infinity);
        var userClient = redis.createClient(),
            sessionTracks = 0,
            playlistUpdate = 0;

        userClient.on('error', function(err) {
            console.log(err);
        });

        userClient.on('message', function(channel, message) {
            if (channel === 'hubox:playing') {
                ++sessionTracks;
                response.write('event: new-track\n');
                response.write('id: ' + sessionTracks + '\n');
                response.write('data: ' + message + '\n\n');
            }
            else if (channel === 'hubox:playlist') {
                ++playlistUpdate;
                response.write('event: playlist\n');
                response.write('id: ' + playlistUpdate + '\n');
                response.write('data: ' + message + '\n\n');
            }
        });
        userClient.subscribe('hubox:playlist');
        userClient.subscribe('hubox:playing');

        response.writeHead(200, {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive'
        });
        response.write('\n');
    }
    //skip track target url, client make get request here to trigger skip track routine
    else if (path === '/advance-track') {
        console.log('/advance-track being handled');
        var redisAdvance = redis.createClient();
        console.log(redisAdvance.publish);
        redisAdvance.publish("hubox:skip", "Advance the track");
        redisAdvance.quit();
        response.writeHead(200, {"Content-Type":"text/html"});
        response.write("OK");
        response.end();
    }
};

exports.route = route;
