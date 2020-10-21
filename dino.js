(function () {
    "use strict";

    const TILE_SIZE = 16;
    const WORLD_HEIGHT = 144;
    const WORLD_WIDTH = 256;

    //// CLASSES ////

    /* A Pool object manages objects. The objects array holds all objects that are
    currently in use, and the pool holds objects that are not in use. By storing objects
    that would otherwise be deleted, we can reuse them instead of creating totally new
    instances with the new operator. Recycling saves memory. Do it. */
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

    var TarPit = function (x, y) {

        this.alive = true;
        this.animation = new Animation(display.tile_sheet.frame_sets[0], 8);
        this.height = 30; this.width = Math.floor(Math.random() * 64 + 48);
        this.x = x; this.y = y;

    };

    TarPit.prototype = {

        constructor: TarPit,

        collideObject: function (player) {

        },

        collideObject: function (object) {

            if (!object.jumping && object.x + object.width * 0.5 > this.x + this.width * 0.2 && object.x + object.width * 0.5 < this.x + this.width * 0.8) {

                object.alive = false;
                object.animation.change(display.tile_sheet.frame_sets[4], 10);

            }

        },

        collideWorld: function () {

            if (this.x + this.width < 0) this.alive = false;

        },

        reset: function (parameters) {

            this.alive = true;
            this.width = Math.floor(Math.random() * 64 + 48);
            this.x = parameters.x;
            this.y = parameters.y;

        },

        update: function () {

            this.animation.update();
            this.x -= game.speed;

        }

    };

    var controller, display, game;

    /* This is awesome. I can use the same event handler for all mouseup, mousedown,
    touchstart, and touchend events. This controller works on everything! */
    controller = {

        active: false, state: false,

        onOff: function (event) {

            event.preventDefault();

            let key_state = (event.type == "mousedown" || event.type == "touchstart") ? true : false;

            if (controller.state != key_state) controller.active = key_state;
            controller.state = key_state;

        }

    };

    display = {

        buffer: document.createElement("canvas").getContext("2d"),
        context: document.querySelector("canvas").getContext("2d"),

        tint: 0,// The red tint value to add to the buffer's red channel when a meteor is on screen.

        tile_sheet: {

            image: new Image()// The tile sheet image is loaded at the bottom of this file.

        },

        render: function () {

            // Draw Tiles
            for (let index = game.area.map.length - 1; index > -1; --index) {

                let value = game.area.map[index];

                this.buffer.drawImage(this.tile_sheet.image, (value % this.tile_sheet.columns) * TILE_SIZE, Math.floor(value / this.tile_sheet.columns) * TILE_SIZE, TILE_SIZE, TILE_SIZE, (index % game.area.columns) * TILE_SIZE - game.area.offset, Math.floor(index / game.area.columns) * TILE_SIZE, TILE_SIZE, TILE_SIZE);

            }

            // Draw TarPits
            for (let index = game.object_manager.tarpit_pool.objects.length - 1; index > -1; --index) {

                let tarpit = game.object_manager.tarpit_pool.objects[index];

                let frame = this.tile_sheet.frames[tarpit.animation.frame_value];

                this.buffer.drawImage(this.tile_sheet.image, frame.x, frame.y, frame.width, frame.height, tarpit.x, tarpit.y, tarpit.width, tarpit.height);

            }

            // Draw Player
            let frame = this.tile_sheet.frames[game.player.animation.frame_value];

            this.buffer.drawImage(this.tile_sheet.image, frame.x, frame.y, frame.width, frame.height, game.player.x, game.player.y, game.player.width, game.player.height);


            this.context.drawImage(this.buffer.canvas, 0, 0, WORLD_WIDTH, WORLD_HEIGHT, 0, 0, this.context.canvas.width, this.context.canvas.height);

        },


    };

    game = {

        distance: 0,
        max_distance: 0,
        speed: 3,

        engine: {

            /* Fixed time step game loop!! */
            afrequest: undefined,// animation frame request reference
            accumulated_time: window.performance.now(),
            time_step: 1000 / 60,// update rate

            loop: function (time_stamp) {

                /* How easy does this look? This is a fixed step loop with frame dropping.
                Amazingly it's super simple and only a few lines. This will make your game
                run at the same speed on all devices. Now that I look at it, I think there
                may be a better way to implement this because entire frames can be dropped
                without updating or rendering. Rather than fixing this now, I will just leave it.
                Ideally, I would utilize the free time and not do both updates and renderings
                at the same time unless I have to... Another day... This does work fine, though. */
                if (time_stamp >= game.engine.accumulated_time + game.engine.time_step) {

                    if (time_stamp - game.engine.accumulated_time >= game.engine.time_step * 4) {

                        game.engine.accumulated_time = time_stamp;

                    }

                    while (game.engine.accumulated_time < time_stamp) {

                        game.engine.accumulated_time += game.engine.time_step;

                        game.engine.update();

                    }

                    display.render();

                }

                window.requestAnimationFrame(game.engine.loop);

            },

            start: function () {// Start the game loop.

                this.afrequest = window.requestAnimationFrame(this.loop);

            },

            update: function () {// Update the game logic.


                if (game.player.alive) {

                    if (controller.active && !game.player.jumping) {// Get user input

                        controller.active = false;
                        game.player.jumping = true;
                        game.player.y_velocity -= 15;
                        game.player.animation.change([10], 15);

                    }

                    if (game.player.jumping == false) {

                        game.player.animation.change(display.tile_sheet.frame_sets[3], Math.floor(TILE_SIZE - game.speed));

                    }

                    game.player.update();

                    if (game.player.y > TILE_SIZE * 6 - TILE_SIZE * 0.25) {// Collide with floor

                        controller.active = false;
                        game.player.y = TILE_SIZE * 6 - TILE_SIZE * 0.25;
                        game.player.y_velocity = 0;
                        game.player.jumping = false;

                    }

                } else {

                    game.player.x -= game.speed;
                    game.speed *= 0.9;

                    if (game.player.animation.frame_index == game.player.animation.frame_set.length - 1) game.reset();

                }

                game.player.animation.update();

                game.object_manager.spawn();
                game.object_manager.update();

            }

        },

        /* Manages all non player objects. */
        object_manager: {

            count: 0,
            delay: 100,

            tarpit_pool: new Pool(TarPit),

            spawn: function () {

                this.count++;

                if (this.count == this.delay) {

                    this.count = 0;
                    this.delay = 100;// + Math.floor(Math.random() * 200 - 10 * game.speed);

                    /* Pick randomly between tarpits and meteors */
                    if (Math.random() > 0.5) {

                        this.tarpit_pool.get({ x: WORLD_WIDTH, y: WORLD_HEIGHT - 30 });

                    } else {

                        this.meteor_pool.get({ x: WORLD_WIDTH * 0.2, y: -32 });

                    }

                }

            },

            update: function () {

                for (let index = this.meteor_pool.objects.length - 1; index > -1; --index) {

                    let meteor = this.meteor_pool.objects[index];

                    meteor.update();

                    meteor.collideObject(game.player);

                    meteor.collideWorld();

                    if (meteor.smoke) {

                        meteor.smoke = false;

                        let parameters = { x: meteor.x + Math.random() * meteor.width, y: undefined, x_velocity: undefined, y_velocity: undefined };

                        if (meteor.grounded) {

                            parameters.y = meteor.y + Math.random() * meteor.height * 0.5;
                            parameters.x_velocity = Math.random() * 2 - 1 - game.speed;
                            parameters.y_velocity = Math.random() * -1;

                        } else {

                            parameters.y = meteor.y + Math.random() * meteor.height;
                            parameters.x_velocity = meteor.x_velocity * Math.random();
                            parameters.y_velocity = meteor.y_velocity * Math.random();

                        }

                        this.smoke_pool.get(parameters);

                    }

                    if (!meteor.alive) {

                        this.meteor_pool.store(meteor);

                    };

                }

                for (let index = this.smoke_pool.objects.length - 1; index > -1; --index) {

                    let smoke = this.smoke_pool.objects[index];

                    smoke.update();

                    smoke.collideWorld();

                    if (!smoke.alive) this.smoke_pool.store(smoke);

                }

                for (let index = this.tarpit_pool.objects.length - 1; index > -1; --index) {

                    let tarpit = this.tarpit_pool.objects[index];

                    tarpit.update();

                    tarpit.collideObject(game.player);

                    tarpit.collideWorld();

                    if (!tarpit.alive) this.tarpit_pool.store(tarpit);

                }

            }

        },

        player: {

            alive: true,
            animation: new Animation([15], 10),
            jumping: false,
            height: 32, width: 56,
            x: 8, y: TILE_SIZE * 6 - TILE_SIZE * 0.25,
            y_velocity: 0,

            reset: function () {

                this.alive = true;
                this.x = 8;

            },

            update: function () {

                game.player.y_velocity += 0.5;
                game.player.y += game.player.y_velocity;
                game.player.y_velocity *= 0.9;

            }

        },

        reset: function () {

            this.distance = 0;
            this.player.reset();

            /* Put all of our objects away. */
            this.object_manager.tarpit_pool.storeAll();

            this.speed = 3;

        }

    };

    display.buffer.canvas.height = WORLD_HEIGHT;
    display.buffer.canvas.width = WORLD_WIDTH;

    display.tile_sheet.image.src = "dino.png";
    display.tile_sheet.image.addEventListener("load", function (event) {

        display.tile_sheet.columns = this.width / TILE_SIZE;

        game.engine.start();

    });

    window.addEventListener("mousedown", controller.onOff);
    window.addEventListener("mouseup", controller.onOff);
    window.addEventListener("touchstart", controller.onOff);
    window.addEventListener("touchend", controller.onOff);

})();