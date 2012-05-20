/*
 * Author: Maurycy Skier
 * Description: Collecting-sticks server.
 *
 */


var http = require( "http" ),
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

httpd.listen( 20800 );


var base = "/storage/www/htdocs/"

var socketd = io.listen( httpd );

socketd.sockets.on( "connection", function( socket ) {
//https://github.com/mozilla/BrowserQuest/blob/master/server/js/mob.js
	socket.on( "move", function( positions ) {
		socketd.sockets.broadcast( "positions", positions );
	} );

} );
