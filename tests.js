
function isEven(val) {
    return val % 2 === 0;
}

test('isEven()', function() {
    ok(isEven(0), 'Zero is an even number');
    ok(isEven(2), 'So is two');
    ok(isEven(-4), 'So is negative four');
    ok(!isEven(1), 'One is not an even number');
    ok(!isEven(-7), 'Neither is negative seven');
});

test('page load properly', function() {
    ok(audio, 'audio element exists');
    ok(song, 'song element exists');
    ok(artist, 'artist element exists');
    ok(album, 'album element exists');
    ok(playlist, 'playlist element exists');
});

test('advanceTrack', function() {
    advanceTrack({song:"A Song Title",artist:"Artist Name",album:"Album Name", url:"http://path/to/file.ogg"});
    equal(audio.src, 'http://path/to/file.ogg', 'audio.src attribute is correctly set');
    equal(song.innerHTML, "A Song Title", 'song.innerHTML is correctly set');
    equal(artist.innerHTML, "Artist Name", 'artist.innerHTML is correctly set');
    equal(album.innerHTML, "Album Name", 'album.innerHTML is correctly set');
});

test('renderPlaylist', function() {
    renderPlaylist([{"song":"The Next Song","artist":"Upcoming Artist","album":"From the Album","url":"http://path/to/next-file.ogg"}]);
    ok(playlist, 'upcoming track appended to playlist element');
    equal(playlist.firstChild.firstChild.innerHTML.split(" "), "The Next Song", "Upcoming song title is set correctly");
});
