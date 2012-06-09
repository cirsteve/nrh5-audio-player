First pass at limited functionality for an html5 media player and node web server. Start the app by enterting the command "node app.js" in the parents directory. As of now the app displays the currently playing track info as well as track info for upcoming tracks on the playlist and includes a skip button to remove the current track from the playlist and advance to the next track. The playlist is currently generated on server start by manually saving several song objects to the redis database in the format {"song":"song title","artist":"song artist","album":"song album", "url":"/path/to/song/file.ogg"}.

The app.js file contains all of the logic needed to load an initial playlist into redis and the redis client listeners required to responsd to user input. The router.js file contains all of the logic needed to respond to requests including serving static files, serving media files, instantiating client connectons for users, and sending out server side events to subscribed clients. On the client side templates/index.html contains the html client.js contains all the javascript logic needed to initiate the eventSource connection and respond to new tracks and playlist updates.

DEPENDENCIES:

node 0.6.X
redis 2.0.1
node_redis 0.7.2

INSTALLATION:
Install node and redis and then install node_redis with the command "npm install node". To run the app call the app.js file with node, such as "node app.js" from the app directory, Once running navigate to localhost:8000 in your browser. The Skip button can be used to start playing the first track, subsequent skips will start the next track.
