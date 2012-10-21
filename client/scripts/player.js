

var Player = function( model, startX, startY ) {

	var
		destX, destY,
		moveX,
		moving = false,
		autopilot = false,
		distance = -1,
		direction = 0,
		frame = 0,
		nextFrame = true,
		points = 0;

	this.model = model;
	this.x = startX;
	this.y = startY;
	this.message = "";

	this.getX = function() { return this.x; }
	this.getY = function() { return this.y; }
	this.getFrame = function() { return frame; }
	this.getDirection = function() { return direction; }
	this.getPoints = function() { return points; }
	this.setPoints = function( value ) { points = value; }

	this.stopAnimation = function() { moving = false } // Lame workaround.

	this.say = function( message ) {

		if( typeof message !== "string" )
			return;
		if( message === "" )
			setTimeout( arguments.callee.bind( this ), 5000, "" );
		else
			this.message = message;

	}

	this.move = function( x, y ) {

		if( x && y )
			return;

		if( x && this.x + x >= 0 && this.x + x + PLAYER_WIDTH <= MAP_WIDTH )
			this.x += x;
		if( y && this.y + y >= 0 && this.y + y + PLAYER_HEIGHT <= MAP_HEIGHT )
			this.y += y;

		if( x < 0 )
			direction = 1;
		if( x > 0 )
			direction = 2;
		if( y < 0 )
			direction = 3;
		if( y > 0 )
			direction = 0;

		if( x || y ) {
			distance++;
			moving = true;
		} else { // Isn't it bad?
			frame = 0;
			moving = false;
		}

	}

	this.goTo = function( x, y ) {

		if( x < 0 )
			x = 0;
		if( y < 0 )
			y = 0;
		if( x + PLAYER_WIDTH > MAP_WIDTH )
			x = MAP_WIDTH - PLAYER_WIDTH;
		if( y + PLAYER_HEIGHT > MAP_HEIGHT )
			y = MAP_HEIGHT - PLAYER_HEIGHT;

		destX = x;
		destY = y;
		autopilot = true;

		// Resolve on which axis move first. '>' takes longer path first.
		moveX = Math.abs( this.x - destX ) > Math.abs( this.y - destY );

	}

	this.autopilotStep = function() {

		// Disable autopilot if destination is rached.
		// There is no need to check float values...
		// if( Math.abs( this.x - destX ) | 0 && Math.abs( this.y - destY ) | 0 )
		if( this.x === destX && this.y === destY ) {

			autopilot = false;
			moving = false;
			// frame = 0;
			this.move( 0, 0 ); // D:

		} else {

			if( moveX ) {
				x = ( this.x < destX )? 1: -1;
				this.move( x, 0 );
				if( this.x === destX )
					moveX = false;
			} else {
				y = ( this.y < destY )? 1: -1;
				this.move( 0, y );
				if( this.y === destY )
					moveX = true;
			}

		}

	}

	this.animate = function() {

		// Change frame every 140ms.
		if( moving && nextFrame ) {
			nextFrame = false;
			// Should be setInterval for better animation experience. xD
			setTimeout( function() {
				if( ++frame > 3 )
					frame = 0;
				nextFrame = true;
			}, 140 );
		}

	}

	this.tick = function() {

		if( autopilot )
			this.autopilotStep();

		this.animate();

	}

}