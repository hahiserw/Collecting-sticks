

var Player = function( model, startX, startY ) {

	var
		destX, destY,
		moveX,
		autopilot = false,
		distance = -1,
		frame = 0,
		direction = 0,
		points = 0;

	this.model = model;
	this.x = startX;
	this.y = startY;
	// this.points = 0;

	this.getX = function() { return this.x; }
	this.getY = function() { return this.y; }
	this.getFrame = function() { return frame; }
	this.getDirection = function() { return direction; }
	this.getPoints = function() { return points; }
	this.setPoints = function( value ) { points = value; }

	this.move = function( x, y ) {

		if( this.x && this.x + x > 0 && this.x + x + PLAYER_WIDTH < MAP_WIDTH )
			this.x += x;
		if( this.y && this.y + y > 0 && this.y + y + PLAYER_HEIGHT < MAP_HEIGHT )
			this.y += y;

		if( x < 0 )
			direction = 1;
		if( x > 0 )
			direction = 2;
		if( y < 0 )
			direction = 3;
		if( y > 0 )
			direction = 0;

		if( x || y )
			distance++;
		else
			frame = 0;

	}

	this.goTo = function( x, y ) {

		autopilot = true;
		destX = x;// - PLAYER_WIDTH / 2;
		destY = y;// - PLAYER_HEIGHT / 2;
		// Resolve on which axis move first.
		// '>' takes longer path first.
		moveX = Math.abs( this.x - destX ) > Math.abs( this.y - destY );

	}

	this.autopilotMove = function() {

		// Disable autopilot if destination is rached.
		// Imagine there is no floats or doubles.
		if( this.x === destX && this.y === destY ) {

			autopilot = false;

		} else {

			if( moveX ) {
				x = ( this.x < destX )? 1: -1;
				this.move( x, 0 );
				// this.x += x;
				if( this.x === destX )
					moveX = false;
			} else {
				y = ( this.y < destY )? 1: -1;
				this.move( 0, y );
				// this.y += y;
				if( this.y === destY )
					moveX = true;
			}

			// distance++;

		}

	}

	this.animate = function() {

		// Change frame every 12 pixels (or I should say frames).
		if( distance % 12 === 0 )
			if( ++frame > 3 )
				frame = 0;

	}

	this.tick = function() {

		if( autopilot )
			this.autopilotMove();

		this.animate();

	}

}