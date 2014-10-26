// BASE SETUP
// ===================================================================================================================

// call the packages we need
var express    = require('express'); 		// call express
var app        = express(); 				// define our app using express
var bodyParser = require('body-parser');
var prompt = require('prompt');
var fs = require('fs');
var Player = require('player');
var mm = require('audio-metadata');

// app globals
var musicDirectory, musicFiles, music, currentlyPlaying;
var songQueue = [];

// directories
var routes = require('./routes');

// view engine setup
app.set('views', './views');
app.set('view engine', 'jade');

// configure app to use bodyParser()
// this will let us get the data from a POST
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(__dirname, '/public'));

var port = process.env.PORT || 8080; 		// set our port

// ROUTES FOR OUR API
// ===================================================================================================================
var router = express.Router(); 				// get an instance of the express Router

// test route to make sure everything is working (accessed at GET http://localhost:8080/)
router.get('/', routes.index);

router.get('/request', function(req, res) {
	// var matches = [];
	// for (var i = 0; i < music.length; ++i)
	// {
		// if (music[i].match(new RegExp(req.query.song, 'i')))
		// {
			// matches.push(music[i]);
		// }
	// }
	var checkArtist = function (artistList) {
		for (var i = 0; i < artistList.length; ++i)
		{
			if (artistList[i].match(songArtistRegEx)) return true;
		}
		return false;
	};
	
	var playSong = function (filename) {
		player = new Player(musicDirectory + '\\' + filename);
		player.play(function (err, player) {
			currentlyPlaying = false;
			if (songQueue.length > 0 || currentlyPlaying) {
				songQueue.push(filename);
				var file = songQueue.shift();
				playSong(file);
			}
		})
		currentlyPlaying = true;
	};
	
	var matches = [];
	var songTitleRegEx = new RegExp(req.query.songTitle, 'i');
	var songArtistRegEx = new RegExp(req.query.songArtist, 'i');
	if (req.query.songTitle !== "" && req.query.songArtist !== "") {
		matches = music.filter(function(item){ return item.title.match(songTitleRegEx)
						&& checkArtist(item.artist); });
	} else if (req.query.songTitle !== "" && req.query.songArtist === "") {
		matches = music.filter(function(item){ return item.title.match(songTitleRegEx); });
	} else if (req.query.songTitle === "" && req.query.songArtist !== "") {
		matches = music.filter(function(item){ return checkArtist(item.artist); });
	} else {
		// do nothing
	}
	
	if (matches.length < 1)
	{
		if (req.query.songTitle !== "" && req.query.songArtist !== "") {
		matches = musicFiles.filter(function(item){ return item.match(songTitleRegEx)
						&& checkArtist(item); });
		} else if (req.query.songTitle !== "" && req.query.songArtist === "") {
			matches = musicFiles.filter(function(item){ return item.match(songTitleRegEx); });
		} else if (req.query.songTitle === "" && req.query.songArtist !== "") {
			matches = musicFiles.filter(function(item){ return checkArtist(item); });
		} else {
			// do nothing
		}
	}
	
	if (matches.length < 1) {
		res.json( { message: "No songs found. There are currently " + songQueue.length + " song(s) on the list." } );
		return;
	}
	
	var index = 0;
	var song = matches.shift();
	if (!song.filename)
	{
		var temp = song;
		song = {};
		song.filename = temp;
	}
	
	if (currentlyPlaying || songQueue.length > 0) {
		var index = songQueue.indexOf(song.filename); 
		if (index > -1)
		{
			if (index !== 0) {
				var temp = songQueue[index];
				songQueue = songQueue.slice(index, 1);
				songQueue.splice(index - 1, 0, temp);
			}
		}
		else {
			songQueue.push(song.filename);
		}
		res.json({ message: "Your request has been successfully submitted! There are currently " + songQueue.length + " song(s) on the list. " + JSON.stringify(songQueue) });
		return;
	}
	
	playSong(song.filename);
	res.json({ message: "Your request has been successfully submitted! There are currently " + songQueue.length + " song(s) on the list. " + JSON.stringify(songQueue) });
});

// more routes for our API will happen here

// REGISTER OUR ROUTES -------------------------------
app.use('/', router);

// START THE SERVER
// ===================================================================================================================
prompt.start();
prompt.get(['musicDirectory'], function (err, result) {
	app.listen(port);
	console.log('Magic happens on port ' + port);
	
	var os=require('os');
	var ifaces=os.networkInterfaces();
	for (var dev in ifaces) {
	  var alias=0;
	  ifaces[dev].forEach(function(details){
		if (details.family==='IPv4') {
		  console.log(dev+(alias?':'+alias:''),details.address);
		  ++alias;
		}
	  });
	}

	result.musicDirectory = 'C:\\Users\\Mohammad Doleh\\Music';
	musicDirectory = result.musicDirectory;
	
	musicFiles = fs.readdirSync(musicDirectory);
	music = [];
	for (var i = 0; i < musicFiles.length; ++i)
	{
		// create a new parser from a node ReadStream
		var metadata = mm.ogg(fs.readFileSync(musicDirectory + '\\' + musicFiles[i]));
		if (metadata) metadata.filename = musicFiles[i];
		else { 
			metadata = {};
			metadata.title = "";
			metadata.artist = "";
			metadata.filename = musicFiles[i];
		}
		music.push(metadata);
		// listen for the metadata event
		// parser.on('metadata', function (result) {
			// music.push(result);
		// });
	}
});