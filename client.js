//create convenience references to dom elements
var audio = document.getElementById("audio-player"),
    song = document.getElementById("song"),
    artist = document.getElementById("artist"),
    album = document.getElementById("album"),
    playlist = document.getElementById("playlist");


//initiate the connection to listen to server sid events on
var trackEvent = new EventSource('stream');

//add new track listener onto SSE object to load new song
trackEvent.addEventListener('new-track',function(message) {
    advanceTrack(JSON.parse(message.data));
}, false);

//add new playlist listener to render new playlsit
trackEvent.addEventListener('playlist', function(message) {
    renderPlaylist(message.data);
}, false);

//utility function to render upcoming playlist
var renderPlaylist = function(list) {
    console.log(list);
    playlist.innerHTML = '';
    list = JSON.parse(list);
    console.log(list);
    list.forEach(function(track) {
            var t = JSON.parse(track),
                p = document.createElement("p"),
                li = document.createElement("li");
            console.log(t);
            p.innerHTML = t.song + ' by ' + t.artist + ' from ' + t.album;
            li.appendChild(p);
            playlist.appendChild(li);
        });
};

//set the audio src and html elements for new track
var advanceTrack = function(track) {
    audio.src = track.url;
    song.innerHTML = track.song;
    artist.innerHTML = track.artist;
    album.innerHTML = track.album;
};

//ajax get request to advance track url to initiate skip routine
var requestSkip = function() {
    var req = new XMLHttpRequest();
    req.open('GET', 'advance-track', false);
    req.send();
};

//bind request skip to button click hander
document.getElementById("skip").onclick=requestSkip;

