/*
 * Author: Maurycy Skier
 * Description: Collecting-sticks server.
 *
 * Unit size: 32x32
 * Player size: 1x1.5u
 * Board size: 16x12 (512x384)
 * 
 */


var
	http = require( "http" ),
	fs = require( "fs" ),
	io = require( "socket.io" ),
	__clientdir = __dirname + "/../client";


var httpd = http.createServer( function( request, response ) {

	fs.readFile( __clientdir + "/index.html", function( error, data ) {
		if( error ) {
			response.writeHead( 500 );
			response.end( "Error loading file." );
		} else {
			response.writeHead( 200, { "Content-Type": "text/html" } );
			response.end( data );
		}
	} );

} );

httpd.listen( 40010 );



var
	MAP_WIDTH: 512,
	MAP_HEIGHT: 384,
	PLAYER_WIDTH: 32,
	PLAYER_HEIGHT: 48,
	rangeX = MAP_WIDTH - PLAYER_WIDTH,
	rangeY = MAP_HEIGHT - PLAYER_HEIGHT;

var data = {
	files: {
		players: [ "Remilia", "Remilia2", "Asuka", "FunkyPencil", "Milonar", "Wesker" ],
		backgrounds: [ "Grass": "" ],
		items:  [ "Sticks" ]
	},
	players: {},
	sticks: [] // { model: number, x: x, y: y }
};


var server = io.listen( httpd ).sockets;

server.on( "connection", function( client ) {

	// Create player with random positions and character.
	data.players[client.id] = {
		model: files.players[ Math.random() * files.players.length | 0 ],
		// To do: Check if something is at this position first.
		x: Math.random() * rangeX | 0,
		y: Math.random() * rangeY | 0,
		points: 0
	};

	// Send initial data.
	var initData = {
		files: data.files,
		player: data.players[client.id],
		background: "Grass"
	};
	client.emit( "init", initData );

	// Bind some events to its functions.

	client.on( "move", function( positions ) {
		// server.broadcast( "positions", positions ); // Totaly nope.
		data.players[client.id].x = positions.x;
		data.players[client.id].y = positions.y;
	} );

	// Remove player from list on disconnect event.
	client.on( "disconnect", function() {
		delete data.players[client.id];
	} );

} );



function sendPositions() {

	var positions = {};
	for( var id in data.players )
		positions[id] = { x: data.players.x, y: data.players.y };

	server.broadcast( "positions", positions )

}

setInterval( sendPositions, 1000 );


function randomPosition() {

	for( var i in data.players ) {

	}

	for( var i in data.sticks ) {

	}

	return { x, y };

}