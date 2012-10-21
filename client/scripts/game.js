/*

game
	init
		loadResources
	players
	environment
		hud
		draw
	render

*/
// ( function() {


var log, server, canvas, ctx, that; // OMG

// Constants.
var
	MAP_WIDTH = 512,
	MAP_HEIGHT = 384,
	PLAYER_WIDTH = 32,
	PLAYER_HEIGHT = 48;


var Game = {};

Game.say = function( text ) {

	var now = new Date();
	var
		h = now.getHours(),
		m = now.getMinutes(),
		s = now.getSeconds(),
		ss = now.getMilliseconds();
	var time =
		( h < 10? "0" + h: h ) + ":" +
		( m < 10? "0" + m: m ) + ":" +
		( s < 10? "0" + s: s ) + ":" +
		( ss < 100? "0" + ( ss < 10? "0" + ss: ss ): ss );

	log.innerHTML = time + ": " + text + "\n" + log.innerHTML;

}

Game.launch = function( canvasId, statusId ) {

	var handle;

	function update() {

		handle = requestAnimationFrame( update );

		// try {
			that.render();
		// } catch( error ) {
		// 	cancelAnimationFrame( handle );
		// 	throw error.message
		// }

	}

	this.init( canvasId, statusId, update );

}

Game.init = function( canvasId, statusId, done ) {

	that = this; // LAME

	log = document.getElementById( statusId );

	this.say( "Initializing Game..." );
	this.say( "Creating Game environment." );
	this.initCanvas( canvasId );
	this.say( "Connecting to server..." );
	this.connect( function() {
		this.say( "Connected." );
		this.say( "Starting listening for players data change." );
		this.dataListener();
		this.say( "Loading resources..." );
		this.loadResources( function() {
			this.say( "Done loading all resources." );
			this.say( "Preparing Game environment." );
			this.setCanvas();
			this.say( "Environment prepared." );
			this.say( "Starting update function." );
			this.postman();
			this.say( "Launching Game." );
			done.call( this );
		} );
	}, function( error ) {
		switch( error.number ) {
			case 1:
				this.say( "Server is on. Yet cannot connect." );
				break;
			case 2:
				this.say( "Server is probably down." );
				break;
			default:
				this.say( "Unknown server error." );
		}
	} );

}

Game.files = {};

Game.graphics = {
	set: {},
	players: {},
	backgrounds: {},
	items: {}
};

Game.initCanvas = function( id ) {

	canvas = document.getElementById( id );
	ctx = canvas.getContext( "2d" );

	if( !canvas )
		this.say( "Lol, canvas problem? What noob did let it happen?" );

	if( !ctx )
		this.say( "Cannot create canvas context. Try another browser." );

}

Game.connect = function( gotInit, gotError ) {

	var tryNumber = 0;
	var error = setInterval( function() {
		if( tryNumber++ === 3 ) {
			gotError.call( that, 1 );
			clearTimeout( error );
		} else {
			that.say( "Trying to connect..." );
		}
	}, 1000 );

	server = io.connect( document.location.origin );

	if( !server )
		gotError.call( this, 2 );

	server.on( "init", function( data ) {

		clearTimeout( error );

		that.files = data.files;
		var player = data.player;

		that.you = new Player( player.model, player.x, player.y );
		
		// that.players.push( that.you );
		that.players[player.model] = that.you;

		// First one.
		that.graphics.set["background"] = that.files.backgrounds[0];
		that.graphics.set["sticks"] = that.files.items[0];

		gotInit.call( that );

	} );

}

// To do: Make this function awesome 'cause it's somehow not to good now.
Game.loadResources = function( doneLoading ) {

	function loadImage( type, fileName, loaded ) {

		var extension = "";

		if( fileName.indexOf( "." ) === -1 )
			extension = ".png";

		var image = new Image();

		image.addEventListener( "load", function() {
			that.say( "Loaded succesfuly: " + fileName + extension + "." );
			loaded.call( that, type, fileName, image );
		}, false );

		image.addEventListener( "error", function() {
			that.say( "Error loading image: " + fileName + extension + "." );
		}, false );

		image.src = "graphics/" + fileName + extension;

	}

	var
		total = 0,
		loaded = 0;

	for( var type in this.files )
		for( var name in this.files[type] )
			total++;

	for( var type in this.files ) {
		if( !this.graphics[type] )
			this.graphics[type] = {};
		for( var name in this.files[type] ) {
			var fileName = this.files[type][name];
			loadImage.call( this, type, fileName, function( type, fileName, resource ) {
				loaded++;
				this.graphics[type][fileName] = resource;
				if( loaded === total )
					doneLoading.call( this );
			} );
		}
	}

}

Game.dataListener = function() {

	server.on( "data", function( data ) {
		for( var model in data ) {
			if( model === that.model )
				continue;
			// Playes exists, so just get actual positions.
			if( that.players[model] && data[model] ) {
				that.players[model].goTo( data[model].x, data[model].y );
				that.players[model].setPoints( data[model].points );
				// that.players[model].message = data[model].message;
			} else if( !that.players[model] && data[model] ) { // Player connected.
				that.players[model] = new Player( model, data[model].x, data[model].y );
				that.say( "Player " + model + " connected." );
			} else if( that.players[model] && !data[model] ) { // Player disconnected.
				delete that.players[model];
				that.say( "Player " + model + " disconnected." );
			}
		}
	} );

	server.on( "join", function( data ) {

	}, false );

}

Game.setCanvas = function() {

	canvas.width = MAP_WIDTH;
	canvas.height = MAP_HEIGHT;

	ctx.font = "20px monospace";

	canvas.addEventListener( "click", function( event ) {
		var
			x = event.pageX - this.offsetLeft,
			y = event.pageY - this.offsetTop;
		that.you.goTo( x, y );
	}, false );

}

Game.postman = function( stop ) {

	// Just for testing.
	if( server.fake )
		return;

	var updating;

	if( stop ) {
		clearTimeout( updating );
		return;
	}

	var send = false;
	var message;

	updating = setInterval( function() {
		// Message system is not ready.
		server.emit( "update", {
			x: that.you.getX(),
			y: that.you.getY()
		} );
	}, 1000 );

}

Game.you = undefined;

Game.players = {};

Game.keys = [],

Game.render = function() {

	ctx.drawImage( this.graphics["backgrounds"]["Grass"], 0, 0 );

	// this.drawSticks();

	this.playerMove();

	this.drawPlayers();

	this.drawPoints();

}

Game.drawSticks = function() {

	// Damn, nothing.

}

Game.playerMove = function() {

	// One key at the time.
	var key = this.keys.indexOf( true );
	
	if( key !== -1 ) {

		// Switch takes more time.
		if( key === 0 )
			this.you.move( -1, 0 );
		if( key === 1 )
			this.you.move( 0, -1 );
		if( key === 2 )
			this.you.move( 1, 0 );
		if( key === 3 )
			this.you.move( 0, 1 );

	} else {

		// Lame!
		this.you.stopAnimation();
		// this.you.move( 0, 0 );

	}

}

Game.drawPlayers = function() { // And chat messages.

	// Draw players with greater y first.
	// Sort array every frame? D:
	// Or if one players is COL_HEIGHT odległości from another chceck whom y is greater and draw him first.
	// this.players.sort( function( a, b ) {
	// 	return a.y - b.y;
	// } );

	for( var id in this.players ) {

		var player = this.players[id];
		var
			x = player.getX(),
			y = player.getY();

		player.tick();

		ctx.drawImage(
			this.graphics["players"][player.model],
			player.getFrame() * PLAYER_WIDTH, player.getDirection() * PLAYER_HEIGHT,
			PLAYER_WIDTH, PLAYER_HEIGHT,
			x, y,
			PLAYER_WIDTH, PLAYER_HEIGHT );

		if( player.message ) {
			var recentFont = ctx.font;
			ctx.font = "14px courier";
			ctx.fillText(
				player.message,
				x + PLAYER_WIDTH / 2 - ctx.measureText( player.message ).width / 2,
				y - 5 );
			ctx.font = recentFont;
		}

	}

}

Game.drawPoints = function() {

	// Sort by points... It will take ages to render.
	// this.players.sort( function( a, b ) {
	// 	return b.getPoints() - a.getPoints();
	// } );

	var
		x = 0,
		y = 0,
		spaceX = PLAYER_WIDTH * 2,
		spaceY = PLAYER_HEIGHT / 2;

	// Icon of character or thumbnail followed by a number.
	for( var id in this.players ) {

		var player = this.players[id];

		// Awesome thumbnail. :D
		ctx.drawImage(
			this.graphics["players"][player.model],
			player.getFrame() * PLAYER_WIDTH, player.getDirection() * PLAYER_HEIGHT,
			PLAYER_WIDTH, PLAYER_HEIGHT,
			x + 10, y + 10,
			PLAYER_WIDTH / 2, PLAYER_HEIGHT / 2 );

		// No style is set.
		ctx.fillText( player.getPoints(), x + 40, y + 30/*, width*/ );

		// In case too many players plays.
		if( y + 2 * spaceY > MAP_HEIGHT - spaceY ) {
			x += spaceX;
			y = 0;
		} else {
			y += spaceY;
		}

	}

}


// } () );