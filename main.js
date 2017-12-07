
// Initialize game
var game = new Game();

function init() {
	if(game.init())
		game.start();
}

// Holds all the images and loads it
var imageRepository = new function() {

	// Define images
	this.background = new Image();
	this.hero = new Image();
	this.bullet = new Image();
	this.enemy = new Image();
	this.enemyBullet = new Image();

	// Ensure all images have loaded before starting the game
	var numImages = 5;
	var numLoaded = 0;
	function imageLoaded() {
		numLoaded++;
		if (numLoaded === numImages) {
			window.init();
		}
	}
	this.background.onload = function() {
		imageLoaded();
	}
	this.hero.onload = function() {
		imageLoaded();
	}
	this.bullet.onload = function() {
		imageLoaded();
	}
	this.enemy.onload = function() {
		imageLoaded();
	}
	this.enemyBullet.onload = function() {
		imageLoaded();
	}
	
	// Set images src
	this.background.src = "imgs/bg.png";
	this.hero.src = "imgs/hero.png";
	this.bullet.src = "imgs/bullet.png";
	this.enemy.src = "imgs/enemy.png";
	this.enemyBullet.src = "imgs/bullet_enemy.png";
}


// Creates all drawable objects
function Drawable() {
	this.init = function(x, y, width, height) {
		// Defualt variables
		this.x = x;
		this.y = y;
		this.width = width;
		this.height = height;
	}
	
	this.speed = 0;
	this.canvasWidth = 0;
	this.canvasHeight = 0;
	this.collidableWith = "";
	this.isColliding = false;
	this.type = "";
	
	// Define abstract function to be implemented in child objects
	this.draw = function() {
	};
	this.move = function() {
	};
	this.isCollidableWith = function(object) {
		return (this.collidableWith === object.type);
	};
}

// Creates background object
function Background() {
	this.speed = 1; // Redefine speed of the background for panning
	
	// Implement abstract function
	this.draw = function() {
		// Pan background
		this.x -= this.speed;
		this.context.drawImage(imageRepository.background, this.x - this.canvasWidth, this.y);
		
		// Draw another image at the left edge of the first image
		this.context.drawImage(imageRepository.background, this.x, this.y);

		// If the image scrolled off the screen, reset
		if (this.x <= 0)
			this.x = this.canvasWidth;
	};
}

// Set Background to inherit properties from Drawable
Background.prototype = new Drawable();

// Creates hero
function Hero() {
	this.speed = 3;
	this.bulletPool = new Pool(3);
	var fireRate = 15;
	var counter = 0;
	this.collidableWith = "enemyBullet";
	this.type = "hero";

	this.init = function(x, y, width, height) {
		// Defualt variables
		this.x = x;
		this.y = y;
		this.width = width;
		this.height = height;
		this.alive = true;
		this.isColliding = false;
		this.bulletPool.init("bullet");
	}

	this.draw = function() {
		this.context.drawImage(imageRepository.hero, this.x, this.y);
	};
	this.move = function() {	
		counter++;
		// Determine if the action is move action
		if (KEY_STATUS.left || KEY_STATUS.right ||
			KEY_STATUS.down || KEY_STATUS.up) {

			// The hero moved, so erase it's current image so it can
			// be redrawn in it's new location
			this.context.clearRect(this.x, this.y, this.width, this.height);
			
			// Update x and y according to the direction to move and
			// redraw the hero. Change the else if's to if statements
			// to have diagonal movement.
			if (KEY_STATUS.left) {
				this.x -= this.speed
				if (this.x <= 0) // Keep player within the screen
					this.x = 0;
			} else if (KEY_STATUS.right) {
				this.x += this.speed
				if (this.x >= this.canvasWidth)
					this.x = this.canvasWidth;
			} else if (KEY_STATUS.up) {
				this.y -= this.speed
				if (this.y <= 0)
					this.y = 0;
			} else if (KEY_STATUS.down) {
				this.y += this.speed
				if (this.y >= this.canvasHeight)
					this.y = this.canvasHeight;
			}
		}
			
			// Finish by redrawing the hero (if still in the game)
			if (!this.isColliding) {
				this.draw();
			}
		else {
			this.alive = false;
			game.gameOver();
		}

		if (KEY_STATUS.space && counter >= fireRate && !this.isColliding) {
			this.fire();
			counter = 0;
		}
		
		if (KEY_STATUS.space && counter >= fireRate && !this.isColliding) {
			this.fire();
			counter = 0;
		}
	};
	
	// Fires bullet
	this.fire = function() {
		this.bulletPool.get(this.x, this.y, 3);
		game.laser.get();
	};
}

// Sets hero to inherit properties from Drawable
Hero.prototype = new Drawable();

// Create the Enemy object. 
function Enemy() {
	var percentFire = .01;
	var chance = 0;
	this.alive = false;
	this.collidableWith = "bullet";
	this.type = "enemy";
	
	// Sets the Enemy values
	this.spawn = function(x, y, speed) {
		this.x = x + this.canvasWidth/1.5;
		this.y = y + 300;
		this.speed = -speed/2;
		this.speedX = this.speed;
		this.speedY = 0;
		this.alive = true;
		this.leftEdge = this.x - 130;
		this.topEdge = this.y - 40;
		this.bottomEdge = this.y + 40;
	};

	
	// Move the enemy
	this.draw = function() {
		this.context.clearRect(this.x-1, this.y, this.width+1, this.height);
		this.x += this.speedX;
		this.y += this.speedY;

		if (this.speedX != 0 && this.x <= this.leftEdge) { // Hits left boundary
			this.speedX = 0; // Stop going left
			this.speedY = this.speed; // Start going up 
		}
		else if (this.speedY < 0 && this.y <= this.topEdge) { // Hits top boundary
			this.speedY = -this.speed; // Goes downward (reverse speed)
		}
		else if (this.speedY > 0 && this.y >= this.bottomEdge) { // Hits bottom boundary
			this.speedY = this.speed; // Goes upward (reverse speed)
		}

		if (!this.isColliding) {
			this.context.drawImage(imageRepository.enemy, this.x, this.y);

			// Enemy has a chance to shoot every movement
			chance = Math.floor(Math.random()*101);
			if (chance/100 < percentFire) {
				this.fire();
			}

			return false;
		}
		else {
			game.playerScore += 10;
			game.explosion.get();
			return true;
		}
	};
		
	// Fires a bullet
	this.fire = function() {
		game.enemyBulletPool.get(this.x+this.width/2, this.y+this.height, -2.5);
	}
	
	// Resets the enemy values
	this.clear = function() {
		this.x = 0;
		this.y = 0;
		this.speed = 0;
		this.speedX = 0;
		this.speedY = 0;
		this.alive = false;
		this.isColliding = false;
	};
}

// Set enemy to inherit properties from Drawable
Enemy.prototype = new Drawable();

// Creates the game
function Game() {
	
	// Gets canvas information and context and sets up all game objects. 
	this.init = function() {

		// Get the canvas elements
		this.bgCanvas = document.getElementById('background');
		this.heroCanvas = document.getElementById('hero');
		this.mainCanvas = document.getElementById('main');
		
		// Test to see if canvas is supported. Only need to
		// check one canvas
		if (this.bgCanvas.getContext) {
			this.bgContext = this.bgCanvas.getContext('2d');
			this.heroContext = this.heroCanvas.getContext('2d');
			this.mainContext = this.mainCanvas.getContext('2d');
		
			// Initialize objects to contain their context and canvas
			// information
			Background.prototype.context = this.bgContext;
			Background.prototype.canvasWidth = this.bgCanvas.width;
			Background.prototype.canvasHeight = this.bgCanvas.height;
			
			Hero.prototype.context = this.heroContext;
			Hero.prototype.canvasWidth = this.heroCanvas.width;
			Hero.prototype.canvasHeight = this.heroCanvas.height;
			
			Bullet.prototype.context = this.mainContext;
			Bullet.prototype.canvasWidth = this.mainCanvas.width;
			Bullet.prototype.canvasHeight = this.mainCanvas.height;

			Enemy.prototype.context = this.mainContext;
			Enemy.prototype.canvasWidth = this.mainCanvas.width;
			Enemy.prototype.canvasHeight = this.mainCanvas.height;
			
			// Initialize the background object
			this.background = new Background();
			this.background.init(0,0); // Set draw point to 0,0
			
			// Initialize the hero object
			this.hero = new Hero();
			// Set the hero to start near the bottom middle of the canvas
			var heroStartY = this.heroCanvas.height/2 - imageRepository.hero.height;
			var heroStartX = this.heroCanvas.width/10 - imageRepository.hero.width*2;
			this.hero.init(heroStartX, heroStartY, imageRepository.hero.width,
			               imageRepository.hero.height);

			// Initialize the enemy pool object
			this.enemyPool = new Pool(9);
			this.enemyPool.init("enemy");
			this.spawnWave();

			this.enemyBulletPool = new Pool(9);
			this.enemyBulletPool.init("enemyBullet");

			// Start QuadTree
			this.quadTree = new QuadTree({x:0,y:0,width:this.mainCanvas.width,height:this.mainCanvas.height});

			this.playerScore = 0;

			// Audio files
			this.laser = new SoundPool(10);
			this.laser.init("laser");

			this.explosion = new SoundPool(20);
			this.explosion.init("explosion");

			this.backgroundAudio = new Audio("sounds/kick_shock.wav");
			this.backgroundAudio.loop = true;
			this.backgroundAudio.volume = .20;
			this.backgroundAudio.load();

			this.gameOverAudio = new Audio("sounds/game_over.mp3");
			this.gameOverAudio.loop = true;
			this.gameOverAudio.volume = 1;
			this.gameOverAudio.load();

			this.checkAudio = window.setInterval(function(){checkReadyState()},1000);
		}
	};

	// Spawn a new wave of enemies	
	this.spawnWave = function() {
		var height = imageRepository.enemy.height;
		var width = imageRepository.enemy.width;
		var x = 100;
		var y = -height;
		var spacer = y * 1.5;
		for (var i = 1; i <= 9; i++) {
			this.enemyPool.get(x,y,2);
			x += width + 25;
			if (i % 3 == 0) {
				x = 100;
				y += spacer
			}
		}	
	}

	// Start the animation loop
	this.start = function() {
		this.hero.draw();
		this.backgroundAudio.play();
		animate();
	};

	// Restart the game
	this.restart = function() {
		// Pause game over audio
		this.gameOverAudio.pause();

		// Clear up game over sign
		document.getElementById('game-over').style.display = "none";
		this.bgContext.clearRect(0, 0, this.bgCanvas.width, this.bgCanvas.height);
		this.heroContext.clearRect(0, 0, this.heroCanvas.width, this.heroCanvas.height);
		this.mainContext.clearRect(0, 0, this.mainCanvas.width, this.mainCanvas.height);

		// Initialize everything
		this.quadTree.clear();

		this.background.init(0,0);

		// Set the hero to start near the bottom middle of the canvas
		var heroStartY = this.heroCanvas.height/2 - imageRepository.hero.height;
		var heroStartX = this.heroCanvas.width/10 - imageRepository.hero.width*2;
		this.hero.init(heroStartX, heroStartY, imageRepository.hero.width,
		               imageRepository.hero.height);

		this.enemyPool.init("enemy");
		this.spawnWave();
		this.enemyBulletPool.init("enemyBullet");

		this.playerScore = 0;

		this.backgroundAudio.currentTime = 0;
		this.backgroundAudio.play();

		this.start();
	};

	// Stops the background audio and starts game over audio
	this.gameOver = function() {
		this.backgroundAudio.pause();
		this.gameOverAudio.currentTime = 0;
		this.gameOverAudio.play();
		// Display game-over text
		document.getElementById('game-over').style.display = "block";
	};

	// Stops the background audio and starts game over audio
	this.mute = function() {
		if (this.backgroundAudio.volume != 0)
		{
			this.backgroundAudio.volume = 0;
			this.gameOverAudio.volume = 0;
		} else {
			this.backgroundAudio.volume = 1;
			this.gameOverAudio.volume = 1;	

		}
	};
}

/**
 * The animation loop. Calls the requestAnimationFrame shim to
 * optimize the game loop and draws all game objects. This
 * function must be a gobal function and cannot be within an
 * object.
 */
function animate() {
	document.getElementById('score').innerHTML = game.playerScore;

	// Insert objects into quadtree
	game.quadTree.clear();
	game.quadTree.insert(game.hero);
	game.quadTree.insert(game.hero.bulletPool.getPool());
	game.quadTree.insert(game.enemyPool.getPool());
	game.quadTree.insert(game.enemyBulletPool.getPool());

	detectCollision();

	// No more enemies
	if (game.enemyPool.getPool().length === 0) {
		game.spawnWave();
	}

	// Animate game objects
	if (game.hero.alive) {
		requestAnimFrame( animate );

		game.background.draw();
		game.hero.move();
		game.hero.bulletPool.animate();
		game.enemyPool.animate();
		game.enemyBulletPool.animate();
	}
}

