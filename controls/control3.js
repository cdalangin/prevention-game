var can = document.getElementById('canvas1');
var ctx = can.getContext('2d');

// canvas dimensions
can.width = 1350;
can.height = 470;

/* ----------- Images ---------------- */

// building source
var img = new Image();
img.src = "./assets/buildings.jpg";
// sprite source
var sprite = new Image();
sprite.src = "./assets/Spritesheet2.png";
// mask source
var mask = new Image();
mask.src = "./assets/mask.png";
//tp source
var tp = new Image();
tp.src = "./assets/tp.png"
//spray source
var spray = new Image();
spray.src = "./assets/spray.png"


// drawing the canvas

var scrollSpeed = 5;
var imgXPos = 0;

var counter = 0;

function loop() {
    //looping background
    ctx.drawImage(img, imgXPos, 0, can.width, can.height);

    ctx.drawImage(img, imgXPos + can.width, 0, can.width, can.height);

    imgXPos -= scrollSpeed;
    counter += scrollSpeed

    if (imgXPos == -can.width)
        imgXPos = 0;

    window.requestAnimationFrame(loop);
}

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

function SpriteSheet(path, frameWidth, frameHeight) {
    this.image = new Image();
    this.frameWidth = frameWidth;
    this.frameHeight = frameHeight;

    // calculate the number of frames in a row after the image loads
    var self = this;
    this.image.onload = function () {
        self.framesPerRow = Math.floor(self.image.width / self.frameWidth);
    };

    this.image.src = path;
}

function Animation(spritesheet, frameSpeed, startFrame, endFrame) {


    var animationSequence = [];  // array holding the order of the animation
    var currentFrame = 0;        // the current frame to draw
    var counts = 0;             // keep track of frame rate

    // start and end range for frames
    for (var frameNumber = startFrame; frameNumber <= endFrame; frameNumber++) {
        animationSequence.push(frameNumber);
    }
    /**
     * Update the animation
     */
    this.update = function () {

        // update to the next frame if it is time
        if (counts == (frameSpeed - 1)) {
            currentFrame = (currentFrame + 1) % animationSequence.length;
        }
        // update the counter
        counts = (counts + 1) % frameSpeed;

    };

    this.draw = function () {
        // get the row and col of the frame
        var row = Math.floor(animationSequence[currentFrame] / spritesheet.framesPerRow);
        var col = Math.floor(animationSequence[currentFrame] % spritesheet.framesPerRow);

        ctx.drawImage(
            spritesheet.image,
            col * spritesheet.frameWidth, row * spritesheet.frameHeight,
            spritesheet.frameWidth, spritesheet.frameHeight,
            player.x, player.y,
            spritesheet.frameWidth, spritesheet.frameHeight);
    };
}


var player = (function (player) {
    player.height = 160;
    player.jumping = true;
    player.width = 120;
    player.x = 50;
    player.x_vel = 0;
    player.y = 0;
    player.y_velocity = 0;
    player.masked = false;

    // spritesheets
    player.sheet = new SpriteSheet('./assets/Spritesheet2.png', player.width, player.height)
    player.walking = new Animation(player.sheet, 4, 1, 2);
    player.crouching = new Animation(player.sheet, 4, 3, 3);
    player.wmasked = new Animation(player.sheet, 4, 5, 6);
    player.cmasked = new Animation(player.sheet, 4, 7, 7);
    player.anim = player.walking;



    player.update = function () {
        if (controller.up && player.jumping == false) {
            player.y_velocity -= 40;
            player.jumping = true;
        }

        player.y_velocity += 1; //gravity
        player.y += player.y_velocity;
        player.y_velocity *= 0.9;

        if (player.y > 290) {
            player.jumping = false;
            player.y = 290
        }


        if (controller.down && player.jumping == false) {
            player.anim = player.crouching
        }

        player.anim.update();
    }

    player.draw = function () {
        player.anim.draw(player.x, player.y);
    };

    return player
})

function updatePlayer() {
    player.update();
    player.draw();
}



window.requestAnimationFrame(loop);
window.requestAnimationFrame(player);
window.requestAnimationFrame(updatePlayer);
window.addEventListener("keydown", controller.keyListener)
window.addEventListener("keyup", controller.keyListener)