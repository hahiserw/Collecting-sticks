( function() {


	var status, server, canvas, ctx, buffer, bctx;

	// Constants.
	var
		MAP_WIDTH = 0,
		MAP_HEIGHT = 0,
		PLAYER_WIDTH = 0,
		PLAYER_HEIGTH = 0;


	var game = {

		graphics: {
			"player": "RemiliaScarlet.png",
			"background": "Background.png",
			"sticks": "Sticks.png"
		},

		say: function( text ) {

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
				( ss < 100? "0" +
					( ss < 10? "0" + ss: ss ): ss );
			
			console.log( status.innerHTML = time + ": " + text );

		},

		init: function() {

			status = document.getElementById( "status" );

			this.say( "Initializing game..." );
			this.say( "Creating game environment." );
			this.initCanvas();
			this.say( "Connecting to server..." );
			this.connect( function( loadModel ) {
				this.say( "Connected to server." );
				this.say( "Loading resources..." );
				this.loadResources( loadModel, function() {
					this.say( "Done loading all resources." );
					this.say( "Preparing game environment." );
					this.setCanvas();
				} );
			} );

		},

		initCanvas: function() {

			buffer = document.createElement( "canvas" );
			bctx = buffer.getContext( "2d" );
			canvas = document.getElementById( "canvas" );
			ctx = canvas.getContext( "2d" );

			if( !ctx )
				throw "Won't work in 100 years! Fire up browser supporting HTML5!";

		},

		connect: function( gotInit ) {

			server = io.connect( document.location.origin );

			if( !server )
				throw "Can't load socket.io.";

			server.on( "init", ( function( variables ) {

				for( var i in variables ) {
					var variable = variables[i];
					if( typeof variable === "number" && isNaN( variable ) || variable == 0 ) 
						throw "Init: Wrong variable.";
				}

				MAP_WIDTH = variables["MAP_WIDTH"];
				MAP_HEIGHT = variables["MAP_HEIGHT"];
				PLAYER_WIDTH = variables["PLAYER_WIDTH"];
				PLAYER_HEIGTH = variables["PLAYER_HEIGHT"];
				var modelFile = variables["modelFile"];

				gotInit.call( this, modelFile ); // Kinda lame.

			} ).bind( this ) );

		},

		// To do: Make this function awesome 'cause it's extreme lame now.
		loadResources: function( modelFile, doneLoading ) {

			function event( name, error ) {
				console.log( this.toString(), name, error );
				// this.say( "Image " + name + ( error? " NOT": "" ) + " loaded." );
			}

			this.graphics["player"] = modelFile;

			// var total = this.graphics.length; // Lol, not an array.
			// var element = 1;
			var
				total = 3,
				loaded = 0;

			for( var name in this.graphics ) {

				var file = this.graphics[name];
				this.graphics[name] = new Image();
				// this.graphics[name].addEventListener( "load", ( function( stuff ) {
				// 	event.call( stuff["this"], stuff["name"] );
				// } ).bind( { this: this, name: name } ), false );
				// this.graphics[name].addEventListener( "error", event.call( this, name, true ), false );
				// this.graphics[name].onerror = event;//.call( this, name, true );
				this.graphics[name].onload = function() {
					loaded++;
					console.log( "Done loading image " + loaded + " out of " + total );
					if( loaded === total )
						doneLoading.call( game );
				}
				this.graphics[name].onerror = function() {
					console.log( "Can't load an image." );
				}
				this.graphics[name].src = "graphics/" + file;
				// console.log( "element", element, "file", file );
				// if( element++ === total )
				// 	this.say( "Done loading images." );

			}

		},

		setCanvas: function() {

			canvas.width = MAP_WIDTH;
			canvas.height = MAP_HEIGHT;
			buffer.width = MAP_WIDTH;
			buffer.height = MAP_HEIGHT;

			bctx.drawImage( this.graphics["player"], 0, 0/*, 32 * 4, 48 * 4*/ );

		},

		players: [
			{
				move: { x: 0, y: 0 },
				x: 256,
				y: 192,
				walked: 0,
				direction: 0,
				frame: 0,
			}
		],


		render: function() {

			ctx.drawImage( this.graphics["background"], 0, 0 );

			this.drawPlayers();

		},

		drawPlayers: function() {

			// Draw players with greater y first. For warstwy proper display.

			// Change frame every 8 pixels(?).
			if( this.players[0].move.x || this.players[0].move.y ) {

				this.players[0].x += this.players[0].move.x;
				this.players[0].y += this.players[0].move.y;

				this.players[0].walked++;

				if( this.players[0].walked % 12 === 0 )
					if( ++this.players[0].frame > 3 ) // 0, 1, 2, 3
						this.players[0].frame = 0;
			}

			for( var i in this.players ) {

				// If one players is COL_HEIGHT odległości from another chceck whom y is greater and draw him first.
				// Player visible area is 48x32, but collision area is 32xCOL_HEIGHT.

				var player = this.players[i];

				if( player.move.y === 1 )
					player.direction = 0;
				if( player.move.x === -1 )
					player.direction = 1;
				if( player.move.x === 1 )
					player.direction = 2;
				if( player.move.y === -1 )
					player.direction = 3;

				var character = bctx.getImageData( player.frame * 32, player.direction * 48, 32, 48 );
				// console.log( player.frame, player.direction );
				// ctx.drawImage( this.graphics["player"], player.x, player.y );
				ctx.putImageData( character, player.x, player.y );
				// ctx.putImageData( bctx.getImageData( 0, 0, 32, 48 ), 0, 0 );

			}

		}

	};

	document.addEventListener( "DOMContentLoaded", function() {

		var handle;

		game.init();

		function update() {

			handle = requestAnimationFrame( update );

			// try {
				game.render();
			// } catch( error ) {
			// 	throw error.message;
			// 	cancelAnimationFrame( handle );
			// }

		}

		update();

	}, false );


	function key( event ) {

		var
			x = 0,
			y = 0;

		// Up, down, left, right. WSAD.
		switch( event.keyCode ) {
			case 38:
			case 87:
				y = -1;
				break;
			case 40:
			case 83:
				y = 1
				break;
			case 37:
			case 65:
				x = -1;
				break;
			case 39:
			case 68:
				x = 1;
				break;
		}

		return { x: x, y: y };

	}

	window.addEventListener( "keydown", function( e ) {
		game.players[0].move.x = key( e ).x;
		game.players[0].move.y = key( e ).y;
	}, false );
	window.addEventListener( "keyup", function() {
		game.players[0].move.x = 0;
		game.players[0].move.y = 0;
	}, false );


} () );