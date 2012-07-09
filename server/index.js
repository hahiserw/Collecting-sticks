/*
 * Author: Maurycy Skier
 * Description: Collecting-sticks server.
 *
 * Unit size: 32x48
 * Player size: 1x1u
 * Board size: 16x8 (512x384)
 * 
 */


var
	http = require( "http" ),
	fs = require( "fs" ),
	io = require( "socket.io" );


var httpd = http.createServer( function( request, response ) {

	fs.readFile( __dirname + "/index.html", function( error, data ) {
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


var data = {
	players: {}, // "id": { x: x, y: y, points: 0 }
	sticks: [] // { x: x, y: y }
};

var
	MAP_WIDTH: 512,
	MAP_HEIGHT: 384,
	PLAYER_WIDTH: 32,
	PLAYER_HEIGTH: 32;

var
	rangeX = MAP_WIDTH - PLAYER_WIDTH,
	rangeY = MAP_HEIGHT - PLAYER_HEIGHT;

var server = io.listen( httpd ).sockets;

server.on( "connection", function( client ) {

	// Create player with random positions.
	data.players[client.id] = {
		modelFile: "RemiliaScarlet.png", // More comming soon. xD
		x: Math.random() * rangeX | 0,
		y: Math.random() * rangeY | 0,
		points: 0
	};

	// Send initial data.
	var variables = constants;
	variables.x = data.players[client.id].x;
	variables.y = data.players[client.id].y;
	client.emit( "init", variables );

	// Bind some events to its functions.

	client.on( "move", function( positions ) {
		server.broadcast( "positions", positions );
	} );

	// Remove player from list on disconnect event.
	client.on( "disconnect", function() {
		delete data.players[client.id];
	} );

} );
