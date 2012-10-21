/*
 * Author: Maurycy Skier
 * Description: Collecting sticks server.
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
	__clientdir = __dirname + "/../client",
	__port = 40010;


var httpd = http.createServer( function( request, response ) {

	var url = request.url.replace( /\.\.\//g, "" );
	if( url === "/" )
		url += "index.html";
	fs.readFile( __clientdir + url, function( error, data ) {
		if( error ) {
			response.writeHead( 500 );
			response.end( "Error loading file." );
		} else {
			var extension = url.substr( url.lastIndexOf( "." ) );
			var mimeType;
			switch( extension ) {
				case "js":
					mimeType = "application/javascript";
					break;
				case "png":
				case "jpg":
					mimeType = "image/" + extension;
					break;
				case "html":
					mimeType = "text/html";
					break;
			}
			response.writeHead( 200, { "Content-Type": mimeType } );
			response.end( data );
		}
	} );

} );

httpd.listen( __port );



var
	MAP_WIDTH = 512,
	MAP_HEIGHT = 384,
	PLAYER_WIDTH = 32,
	PLAYER_HEIGHT = 48,
	rangeX = MAP_WIDTH - PLAYER_WIDTH,
	rangeY = MAP_HEIGHT - PLAYER_HEIGHT;

var data = {
	files: {
		players: [ "Remilia", "Remilia2", "Asuka", "FunkyPencil", "Milonar", "Wesker" ],
		backgrounds: [ "Grass" ],
		items:  [ "Sticks" ]
	},
	players: {}, // x, y, model, points
	sticks: [] // x, y, model
};


var server = io.listen( httpd ).sockets;

server.on( "connection", function( client ) {

	// Create player with random positions and character.
	data.players[client.id] = {
		model: data.files.players[ Math.random() * data.files.players.length | 0 ],
		// To do: Check if something is at this position first.
		x: Math.random() * rangeX | 0,
		y: Math.random() * rangeY | 0,
		points: 0
	};

	// Send initial data.
	client.emit( "init", {
		id: client.id,
		files: data.files,
		player: data.players[client.id],
		background: "Grass"
	} );

	client.on( "update", function( info ) {
		function checkPoints() {
			var stick;
			if( stick )
				player.points++;
		}
		var player = data.players[client.id];
		var values = [ "x", "y", "message" ];
		for( var i in values )
			player[value] = info[value];
		// checkPoints();
	} );

	// Remove player from list on disconnect.
	client.on( "disconnect", function() {
		delete data.players[client.id];
		server.emit( "")
	} );

} );



function sendList() {

	var list = {};
	for( var id in data.players ) {
		var player = data.players[id];
		list[player.model] = {
			x: player.x,
			y: player.y,
			points: player.points
		};
	}

	server.emit( "data", list );

}

setInterval( sendList, 1000 );



console.log( "Collecting sticks server started at port " + __port );