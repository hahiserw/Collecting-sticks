// ( function() {


	var log, server, canvas, ctx, you;

	// Constants.
	var
		MAP_WIDTH = 512,
		MAP_HEIGHT = 384,
		PLAYER_WIDTH = 32,
		PLAYER_HEIGHT = 48;


	var game = {

		files: {},

		graphics: {
			set: {},
			players: {},
			backgrounds: {},
			items: {}
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
			this.connect( function() {
				this.say( "Connected to server." );
				this.say( "Loading resources..." );
				this.loadResources( function() {
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

			canvas = document.getElementById( id );
			ctx = canvas.getContext( "2d" );

			if( !ctx )
				throw "Won't work in 100 years! Fire up browser supporting HTML5!";

		},

		connect: function( gotInit ) {

			server = io.connect( document.location.origin );

			if( !server )
				throw "Can't load socket.io.";

			server.on( "init", ( function( data ) {

				this.files = data.files;
				var player = data.player;

				you = new Player( player.model, player.x, player.y );
				
				this.players.push( you );
				// First one.
				this.graphics.set["background"] = this.files.backgrounds[0];
				this.graphics.set["sticks"] = this.files.items[0];

				gotInit.call( this );

			} ).bind( this ) );

		},

		// To do: Make this function awesome 'cause it's somehow lame now.
		loadResources: function( doneLoading ) {

			function loadImage( type, fileName, loaded ) {

				var that = this;

				var extension = "";

				if( fileName.indexOf( "." ) === -1 )
					extension = ".png";

				var image = new Image();

				image.addEventListener( "load", function() {
					that.say( "Loaded succesfuly: " + fileName + extension + "." );
					loaded.call( that, type, fileName, image );
				} );

				image.addEventListener( "error", function() {
					that.say( "Error loading image: " + fileName + extension + "." );
				} );

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
						// console.log( type, fileName );
						this.graphics[type][fileName] = resource;
						if( loaded === total )
							doneLoading.call( this );
					} );
				}
			}

		},

		setCanvas: function() {

			canvas.width = MAP_WIDTH;
			canvas.height = MAP_HEIGHT;

			ctx.font = "20px monospace";

			canvas.addEventListener( "click", function( event ) {
				var
					x = event.pageX - this.offsetLeft,
					y = event.pageY - this.offsetTop;
				you.goTo( x, y );
			}, false );

		},

		players: [
		],

		keys: [],

		render: function() {

			ctx.drawImage( this.graphics["backgrounds"]["Grass"], 0, 0 );

			// this.drawSticks();

			this.playerMove();

			this.drawPlayers();

			this.drawPoints();

		},

		playerMove: function() {

			// One key at the time.
			var key = this.keys.indexOf( true );
			
			if( key !== -1 ) {

				switch( key ) {
					case 0:
						you.move( -1, 0 );
						break;
					case 1:
						you.move( 0, -1 );
						break;
					case 2:
						you.move( 1, 0 );
						break;
					case 3:
						you.move( 0, 1 );
						break;
				}

			}

		},

		drawPlayers: function() {

			// Draw players with greater y first.
			// Sort array every frame? D:
			// this.players.sort( function( a, b ) {
			// 	return a.y - b.y;
			// } );

			for( var i in this.players ) {

				// If one players is COL_HEIGHT odległości from another chceck whom y is greater and draw him first.
				// Player visible area is 48x32, but collision area is 32xCOL_HEIGHT.
				// Let's say COL_HEIGHT is 24.
				// Collision will be checking on server. Right?

				var player = this.players[i];

				player.tick();

				ctx.drawImage(
					this.graphics["players"][player.model],
					player.getFrame() * PLAYER_WIDTH, player.getDirection() * PLAYER_HEIGHT,
					PLAYER_WIDTH, PLAYER_HEIGHT,
					player.getX(), player.getY(),
					PLAYER_WIDTH, PLAYER_HEIGHT );

			}

		},

		drawPoints: function() {

			var
				y = 0,
				spaceX = PLAYER_WIDTH / 3,
				spaceY = PLAYER_HEIGHT / 3 + 10;

			// Icon of character or thumbnail followed by a number.
			for( var i in this.players ) {

				var player = this.players[i];

				y += spaceY;

				ctx.drawImage(
					this.graphics["players"][player.model],
					player.getFrame() * PLAYER_WIDTH, player.getDirection() * PLAYER_HEIGHT,
					PLAYER_WIDTH, PLAYER_HEIGHT,
					spaceX, y,
					PLAYER_WIDTH / 2, PLAYER_HEIGHT / 2 );

				// No style is set.
				ctx.fillText( player.getPoints(), 3 * spaceX, y + 20/*, width*/ );

			}

		}

	};


// } () );


// Perhaps it is not good to create all players every position change.
// Perhaps it will create player only when he connect.


function sendPositions() {

	var positions = { x: you.getX(), y: you.getY() };
	client.emit( "positions", positions );

}

// setInterval( sendPositions, 1000 );