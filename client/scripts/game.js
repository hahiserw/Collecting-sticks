// ( function() {


	var log, server, canvas, ctx, buffer, bctx;

	// Constants.
	var
		MAP_WIDTH = 0,
		MAP_HEIGHT = 0,
		PLAYER_WIDTH = 0,
		PLAYER_HEIGTH = 0;


	var game = {

		graphics: {
			"player": "RemiliaScarlet.png",
			"background": "Space.jpg",
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
				( ss < 100? "0" + ( ss < 10? "0" + ss: ss ): ss );

			log.innerHTML = time + ": " + text + "\n" + log.innerHTML;

		},

		launch: function( canvasId, statusId ) {

			var handle;

			var that = this;

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
		},

		init: function( canvasId, statusId, done ) {

			log = document.getElementById( statusId );

			this.say( "Initializing game..." );
			this.say( "Creating game environment." );
			this.initCanvas( canvasId );
			this.say( "Connecting to server..." );
			this.connect( function( loadModel ) {
				this.say( "Connected to server." );
				this.say( "Loading resources..." );
				this.loadResources( loadModel, function() {
					this.say( "Done loading all resources." );
					this.say( "Preparing game environment." );
					this.setCanvas();
					this.say( "Environment prepared." );
					this.say( "Launching game." );
					done.call( this );
				} );
			} );

		},

		initCanvas: function( id ) {

			// buffer = document.createElement( "canvas" );
			// bctx = buffer.getContext( "2d" );
			canvas = document.getElementById( id );
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
				PLAYER_HEIGHT = variables["PLAYER_HEIGHT"];
				var modelFile = variables["modelFile"];

				gotInit.call( this, modelFile ); // Kinda lame.

			} ).bind( this ) );

		},

		// To do: Make this function awesome 'cause it's somehow lame now.
		loadResources: function( modelFile, doneLoading ) {

			function loadImage( name, fileName, loaded ) {

				var that = this;

				var image = new Image();
				image.addEventListener( "load", function() {
					that.say( "Loaded succesfuly: " + fileName + "." );
					that.graphics[name] = image;
					loaded.call( that, image );
				} );
				image.addEventListener( "error", function() {
					that.say( "Error loading image: " + fileName + "." );
				} );
				image.src = "graphics/" + fileName;

			}

			this.graphics["player"] = modelFile;

			var
				total = 0,
				loaded = 0;

			for( var name in this.graphics )
				total++;

			for( var name in this.graphics ) {

				loadImage.call( this, name, this.graphics[name], function( image ) {
					// this.graphics[name] = image;
					loaded++;
					if( loaded === total )
						doneLoading.call( this );
				} );

			}

		},

		setCanvas: function() {

			canvas.width = MAP_WIDTH;
			canvas.height = MAP_HEIGHT;
			// buffer.width = 32 * 4; // MAP_WIDTH;
			// buffer.height = 48 * 4; // MAP_HEIGHT;

			// bctx.clearRect( 0, 0, buffer.width, buffer.height );
			// bctx.drawImage( this.graphics["player"], 0, 0 );

		},

		players: [
			{
				move: { x: 0, y: 0 },
				x: 512 / 2 - 32 / 2,
				y: 384 / 2 - 48 / 2 + 24 / 2,
				walked: 0,
				direction: 0,
				frame: 0,
			}
		],


		render: function() {

			ctx.drawImage( this.graphics["background"], 0, 0 );

			// this.drawSticks();

			// Chceck position change.
			// 

			this.drawPlayers();

			this.drawPoints();

		},

		drawPlayers: function() {

			// Draw players with greater y first. For warstwy proper display.
			// Sort array every frame? D:
			// this.players.sort( function( a, b ) {
			// 	return a.y - b.y;
			// } );

			// Change frame every 12 pixels (or I should say frames).
			// That's not good, though.
			if( this.players[0].move.x || this.players[0].move.y ) {

				this.players[0].x += this.players[0].move.x;
				this.players[0].y += this.players[0].move.y;

				this.players[0].walked++;

				if( this.players[0].walked % 12 === 0 )
					if( ++this.players[0].frame > 3 )
						this.players[0].frame = 0;

			}

			for( var i in this.players ) {

				// If one players is COL_HEIGHT odległości from another chceck whom y is greater and draw him first.
				// Player visible area is 48x32, but collision area is 32xCOL_HEIGHT.
				// Let's say COL_HEIGHT is 24.

				var player = this.players[i];

				if( player.move.y === 1 )
					player.direction = 0;
				if( player.move.x === -1 )
					player.direction = 1;
				if( player.move.x === 1 )
					player.direction = 2;
				if( player.move.y === -1 )
					player.direction = 3;

				ctx.drawImage(
					this.graphics["player"],
					player.frame * PLAYER_WIDTH, player.direction * PLAYER_HEIGHT,
					PLAYER_WIDTH, PLAYER_HEIGHT,
					player.x, player.y,
					PLAYER_WIDTH, PLAYER_HEIGHT );

			}

		},

		drawPoints: function() {

			//

		}

	};


// } () );