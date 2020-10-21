(function () {
	"use strict";

	var can = document.getElementById('canvas1');
	var ctx = can.getContext('2d');

	// canvas dimensions
	can.width = 1350;
	can.height = 470;

	/* ----------- Images ---------------- */

	// building source
	var imgReady = false;
	var img = new Image();
	img.onload = function () {
		imgReady = true;
	}
	img.src = "./assets/buildings.jpg";

	/*----- sprite sources -----*/
	var spriteReady = false;
	var sprite = new Image();
	sprite.onload = function () {
		spriteReady = true;
	}
	sprite.src = "./assets/sprite3.png";
	//masked sprite
	var sprmask = new Image();
	sprmask.src = "./assets/SPRITE6.png"
	// crouching sprite
	var sprcrouch = new Image();
	sprcrouch.src = "./assets/SPRITE7.png"
	// crouching sprite with mask
	var sprmcrouch = new Image();
	sprmcrouch.src = "./assets/SPRITE8.png"


	/*----- powerups sources -----*/
	// mask source
	var mask = new Image();
	mask.src = "./assets/mask.png";
	//tp source
	var tp = new Image();
	tp.src = "./assets/tp.png"
	//spray source
	var spray = new Image();
	spray.src = "./assets/spray.png"
	//spray source
	var sanitizer = new Image();
	sanitizer.src = "./assets/sanitizer.png"

	enemies = [];
	powers = [];

	counter = 0;

	// drawing the canvas

	var scrollSpeed = 5;
	var imgXPos = 0;

	function loop() {
		//looping background
		ctx.drawImage(img, imgXPos, 0, can.width, can.height);

		ctx.drawImage(img, imgXPos + can.width, 0, can.width, can.height);

		imgXPos -= scrollSpeed;

		if (imgXPos == -can.width)
			imgXPos = 0;

	}

	// Drawing Sprite
	character = {
		height: 160,
		jumping: true,
		width: 120,
		x: 50,
		// x_vel: 0,
		y: 0,
		y_velocity: 0,
		masked: false
	};

	controller = {
		up: false,
		down: false,
		keyListener: function (event) {
			var key_state = (event.type == "keydown") ? true : false;

			switch (event.keyCode) {
				case 38: //up key
					controller.up = key_state;
					break;
				case 40: //down key
					controller.down = key_state;
					break;

			}
		}
	};

	// Sprite
	var update = function (modifier) { // modifier is about 0.017

		if (controller.up && character.jumping == false) {
			character.y_velocity -= 2000 * modifier;
			character.jumping = true;
		}

		character.y_velocity += 58 * modifier; //gravity
		character.y += character.y_velocity;
		character.y_velocity *= 0.9;

		if (character.y > 290) {
			character.jumping = false;
			character.y = 290
		}

		if (smallItems.x == 120 || bigItems.x == 120 && character.y >= 200) {
			character.masked = true
		}

		if (controller.down && character.jumping == false) {
			if (character.masked == false) {
				ctx.drawImage(sprcrouch, character.x, character.y, character.width, character.height)
			}
			if (character.masked == true) {
				ctx.drawImage(sprmcrouch, character.x, character.y, character.width, character.height)
			}
		}

		else {
			if (character.masked == false) {
				ctx.drawImage(sprite, character.x, character.y, character.width, character.height)
			}
			else {
				ctx.drawImage(sprmask, character.x, character.y, character.width, character.height)
			}
		}



		// window.requestAnimationFrame(player);

	}

	/* This doesn't do anything yet 
	var PowerUp = function () {
		this.position = {
			x: 1360,
			y: 350
		};
	
		this.direction = {
			x: -1,
			y: 0
		};
	
		this.speed = 2;
	}
	
	*/

	var Frame = function (x, y, width, height) {

		this.height = height;
		this.width = width;
		this.x = x;
		this.y = y;

	};

	smallItems = {
		height: 60,
		width: 60,
		x: 1360,
		y: 370
	};

	bigItems = {
		height: 100,
		width: 100,
		x: 1360,
		y: 330
	};

	var Pool = function (object) {

		this.object = object;// The constructor of the object we are pooling.
		this.objects = [];// The array of objects in use.
		this.pool = [];// The array of objects not in use.

	};

	Pool.prototype = {

		/* Get an object from the pool or create a new object. Pool expects objects to
		have a few basic functions, like reset. */
		get: function (parameters) {
			if (this.pool.length != 0) {
				let object = this.pool.pop();
				object.reset(parameters);
				this.objects.push(object);
			} else {
				this.objects.push(new this.object(parameters.x, parameters.y));
			}

		},

		store: function (object) {
			let index = this.objects.indexOf(object);
			if (index != -1) {
				this.pool.push(this.objects.splice(index, 1)[0]);
			}

		},

		storeAll: function () {
			for (let index = this.objects.length - 1; index > -1; --index) {
				this.pool.push(this.objects.pop());
			}
		}

	};

	var Mask = function (x, y) {
		this.x = x;
		this.y = y;
		this.height = 60;
		this.width = 60;

	}

	Mask.prototype = {
		constructor: Mask,
		collideObject: function (player) {

		},

		collideObject: function (object) {
			if (!object.jumping && object.x == 120) {
				object.alive = false;
				gameOver();
			}
		},
		collideWorld: function () {
			if (this.x + this.width < 0) this.alive = false;

		},

		reset: function (parameters) {

			this.alive = true;
			this.x = parameters.x;
			this.y = parameters.y;

		},

		update: function () {

			this.animation.update();
			this.x -= game.speed;

		}
	}


	var listOfItems = [mask, spray, sanitizer, tp]
	var obj = listOfItems[Math.floor(Math.random() * listOfItems.length)]

	function facemask() {
		if (obj == mask || obj == tp) {
			ctx.drawImage(obj, smallItems.x, smallItems.y, smallItems.width, smallItems.height)
			smallItems.x -= scrollSpeed
		}

		else {
			ctx.drawImage(obj, bigItems.x, bigItems.y, bigItems.width, bigItems.height)
			bigItems.x -= scrollSpeed
		}

	}

	var render = function () {
		if (imgReady) {
			requestAnimationFrame(loop)
		}

		if (spriteReady) {
			requestAnimationFrame(facemask)
		}
	}


	// The main game loop
	var main = function () {
		var now = Date.now();
		var delta = now - then;

		update(delta / 1000);
		render();

		then = now;

		// Request to do this again ASAP
		requestAnimationFrame(main);
	};



	// Cross-browser support for requestAnimationFrame
	var w = window;
	requestAnimationFrame = w.requestAnimationFrame || w.webkitRequestAnimationFrame || w.msRequestAnimationFrame || w.mozRequestAnimationFrame;

	w.addEventListener("keydown", controller.keyListener)
	w.addEventListener("keyup", controller.keyListener)

	var then = Date.now();
	main();

})();