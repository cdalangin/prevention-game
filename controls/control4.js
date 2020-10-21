var can = document.getElementById('canvas1');
var ctx = can.getContext('2d');

// canvas dimensions
can.width = 1350;
can.height = 470;


function bla() {
    var img = new Image();
    img.src = "./assets/Spritesheet2.png";


    // Define the number of columns and rows in the sprite
    var numColumns = 4;
    var numRows = 3;

    // Define the size of a frame
    var frameWidth = 3000 / numColumns;
    var frameHeight = 2700 / numRows;

    // The sprite image frame starts from 0
    var currentFrame = 0;

    setInterval(function () {
        // Pick a new frame
        currentFrame++;

        // Make the frames loop
        var maxFrame = numColumns * numRows - 1;
        if (currentFrame > maxFrame) {
            currentFrame = 0;
        }

        // Update rows and columns
        var column = currentFrame % numColumns;
        var row = Math.floor(currentFrame / numColumns);

        // Clear and draw
        ctx.clearRect(0, 0, can.width, can.height);
        ctx.drawImage(img, column * frameWidth, row * frameHeight, frameWidth, frameHeight, 10, 30, frameWidth / 2, frameHeight / 2);
        //Wait for next step in the loop
    }, 100);

}

window.onload = bla;