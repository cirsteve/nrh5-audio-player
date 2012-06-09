var fs = require("fs"),
    redis = require("redis");

var html = fs.readFileSync('templates/index.html', 'utf8');
var testHtml = fs.readFileSync('templates/test-index.html', 'utf8');
var clientjs = fs.readFileSync('client.js', 'utf8');
var testsjs = fs.readFileSync('tests.js', 'utf8');

function route(path, request, response, query) {
    console.log('routing '+path);
    if (query  === '?test') {
        response.writeHead(200, {"Content-Type":"text/html"});
        response.write(testHtml);
        response.end();
    }
    //serve static tests.js file
    else if (path === '/tests.js') {
        response.writeHead(200, {"Content-Type":"text/javascript"});
        response.write(testsjs);
        response.end();
    }
    //serve static client.js file
    else if (path === '/client.js') {
        response.writeHead(200, {"Content-Type":"text/javascript"});
        response.write(clientjs);
        response.end();
    }
    //handle request for steaming .ogg file
    else if (path === '/music') {
        console.log('.ogg file requested');
        //get the song file name by slicing first character off of query
        var songFile = query.slice(1);
        response.writeHead(200, {"Content-Type":"audio/ogg","Transfer-Encoding":"chunked"});
        //create file stream and set callbacks for streaming the data
        var audioStream = fs.createReadStream('tracks/'+songFile);
        audioStream.on("error", function(exception) {
           console.error("Error reading file: ", exception);
         });
         audioStream.on("data", function(data) {
           response.write(data);
         });
         audioStream.on("close", function() {
           response.end();
         });
    }
    //home route, serves up the index.html file
    else if (path === '/') {
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

        //redis user client, listens for messages on hubox:playing and hubox:playlist and relays them to clients via server side events
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
                console.log('lranges'+message);
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
        response.writeHead(200, {"Content-Type":"text/plain"});
        response.write("OK");
        response.end();
    }
};

exports.route = route;
