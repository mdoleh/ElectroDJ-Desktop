// BASE SETUP
// =============================================================================

// call the packages we need
var express    = require('express'); 		// call express
var app        = express(); 				// define our app using express
var bodyParser = require('body-parser');
var prompt = require('prompt');
var fs = require('fs');
var Player = require('player');
var musicDirectory;

// configure app to use bodyParser()
// this will let us get the data from a POST
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

var port = process.env.PORT || 8080; 		// set our port

// ROUTES FOR OUR API
// =============================================================================
var router = express.Router(); 				// get an instance of the express Router

// test route to make sure everything is working (accessed at GET http://localhost:8080/api)
router.get('/', function(req, res) {
	res.json({ message: 'hooray! welcome to our api!' });	
});

router.get('/request', function(req, res) {
	var music = fs.readdirSync(musicDirectory);
	var matches = [];
	for (var i = 0; i < music.length; ++i)
	{
		if (music[i].match(new RegExp(req.query.song, 'i')))
		{
			matches.push(music[i]);
		}
	}
	
	var song = matches.pop();
	res.json({ request: song, query: req.query.song });
	player = new Player(musicDirectory + '\\' + song);
	player.play(function(err, player){
	  console.log('playend!');
	});
});

// more routes for our API will happen here

// REGISTER OUR ROUTES -------------------------------
// all of our routes will be prefixed with /api
app.use('/api', router);

// START THE SERVER
// =============================================================================
prompt.start();
prompt.get(['musicDirectory'], function (err, result) {
	app.listen(port);
	console.log('Magic happens on port ' + port);
	
	var os=require('os');
	var ifaces=os.networkInterfaces();
	for (var dev in ifaces) {
	  var alias=0;
	  ifaces[dev].forEach(function(details){
		if (details.family=='IPv4') {
		  console.log(dev+(alias?':'+alias:''),details.address);
		  ++alias;
		}
	  });
	}

	result.musicDirectory = 'C:\\Users\\Mohammad Doleh\\Music';
	musicDirectory = result.musicDirectory;
});