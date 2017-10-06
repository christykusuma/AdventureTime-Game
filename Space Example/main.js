
// MAIN CONSTRUCTORS

// Initialize the Game and start it
var game = new Game();

function init() {
	if(game.init())
		game.start();
}

// Creates a constructor to hold all our images for the game
var imageRepository = new function() {
	// Define images
	this.background = new Image(); 
	this.spaceship = new Image();
	this.bullet = new Image();
	this.enemy = new Image();
	this.enemyBullet = new Image();

	// Ensure all images have loaded before starting the game
	var numImages = 5;
	var numLoaded = 0;
	function imageLoaded() {
		numLoaded += 1;
		if (numLoaded === numImages) {
			window.init();
		}
	}

	// Loads images
	this.background.onload = function() {
		imageLoaded();
	}
	this.spaceship.onload = function() {
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

	// Set image sources
	this.background.src = "imgs/bg.png"; 
	this.spaceship.src = "imgs/ship.png";
	this.bullet.src = "imgs/bullet.png";
	this.enemy.src = "imgs/enemy.png";
	this.enemyBullet.src = "imgs/bullet_enemy.png";
}

// Creates a constructor for all drawable objects in the game
function Drawable() {
	// Sets default variables
	this.init = function(x, y, width, height) {
		this.x = x; 
		this.y = y;
		this.width = width;
		this.height = height;
	}

	this.speed = 0; // Default speed
	this.canvasWidth = 0; // Default canvas width and height
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

// Creates a constructor that will handle entire game 
function Game() {
	this.init = function() {
		// Get the canvas elements
		this.bgCanvas = document.getElementById('background');
		this.shipCanvas = document.getElementById('ship');
		this.mainCanvas = document.getElementById('main');

		// Test to see if canvas is supported 
		// getContext() is built-in for drawing
		if (this.bgCanvas.getContext) {
			this.bgContext = this.bgCanvas.getContext('2d');
			this.shipContext = this.shipCanvas.getContext('2d');
			this.mainContext = this.mainCanvas.getContext('2d');

			// Initialize objects to contain their context and canvas information
			Background.prototype.context = this.bgContext;
			Background.prototype.canvasWidth = this.bgCanvas.width;
			Background.prototype.canvasHeight = this.bgCanvas.height;

			Ship.prototype.context = this.shipContext;
			Ship.prototype.canvasWidth = this.shipCanvas.width;
			Ship.prototype.canvasHeight = this.shipCanvas.height;

			Bullet.prototype.context = this.mainContext;
			Bullet.prototype.canvasWidth = this.mainCanvas.width;
			Bullet.prototype.canvasHeight = this.mainCanvas.height;

			Enemy.prototype.context = this.mainContext;
			Enemy.prototype.canvasWidth = this.mainCanvas.width;
			Enemy.prototype.canvasHeight = this.mainCanvas.height;

			// Initialize the background object
			this.background = new Background();
			this.background.init(0,0); // Set draw point to 0,0

			// Initializes the ship object
			this.ship = new Ship();

			// Set the ship to start near the bottom middle of the canvas
			var shipStartX = this.shipCanvas.width/2 - imageRepository.spaceship.width;
			var shipStartY = this.shipCanvas.height/4*3 + imageRepository.spaceship.height*2;
			this.ship.init(shipStartX, shipStartY, imageRepository.spaceship.width,
							imageRepository.spaceship.height);

			// Initialize the enemy pool object
			this.enemyPool = new Pool(30);
			this.enemyPool.init("enemy");
			var height = imageRepository.enemy.height;
			var width = imageRepository.enemy.width;
			var x = 100;
			var y = -height;
			var spacer = y * 1.5;

			// Draw 18 enemies
			for (var i = 1; i <= 18; i++) {
				this.enemyPool.get(x, y, 2);
				x += width + 25; // Each enemy is 25px apart from previous one in row
				if (i % 6 == 0) {
					// Every 6 enemies, we go up one row
					x = 100;
					y += spacer;
				}
			}
			this.enemyBulletPool = new Pool(50);
			this.enemyBulletPool.init("enemyBullet");

			// Start QuadTree
			this.quadTree = new QuadTree({x:0,y:0,width:this.mainCanvas.width,height:this.mainCanvas.height});
			return true;
		} else {
			return false;
		}
	};

	// Start the animation loop
	this.start = function() {
		this.ship.draw();
		animate();
	};
}

// Calls animation loop and draws background object
function animate() {
	// Insert objects into quadtree
	game.quadTree.clear();
	game.quadTree.insert(game.ship);
	game.quadTree.insert(game.ship.bulletPool.getPool());
	game.quadTree.insert(game.enemyPool.getPool());
	game.quadTree.insert(game.enemyBulletPool.getPool());
	detectCollision();
	// Animate game objects
	requestAnimFrame( animate );
	game.background.draw();
	game.ship.move();
	game.ship.bulletPool.animate();
	game.enemyPool.animate();
	game.enemyBulletPool.animate();
}




