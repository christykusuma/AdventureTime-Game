
// DRAWABLE CHILD OBJECTS

// Creates a constructor that will become a child of the Drawable object.
// This is for the background image of the game (panning effect)
function Background() {
	// Redefine speed of the background for panning (1px per frame)
	this.speed = 1;
	// Implement abstract function
	this.draw = function() {
		// Pan background
		this.y += this.speed;

		this.context.drawImage(imageRepository.background, this.x, this.y);
		// Draw another image at the top edge of the first image
		this.context.drawImage(imageRepository.background, this.x, this.y - this.canvasHeight);

		// If the image scrolled off the screen, reset
		if (this.y >= this.canvasHeight)
			this.y = 0;
	};
}

// Set Background to inherit properties from Drawable constructor
Background.prototype = new Drawable();

// Creates a Bullet object
function Bullet( object ) {
	this.alive = false; // Is true if the bullet is currently used
	var self = object;

	// Sets bullet values
	this.spawn = function(x, y, speed) {
		this.x = x;
		this.y = y;
		this.speed = speed;
		this.alive = true;
	};

	// Uses "dirty rectangle" to erase the bullet and moves it
	// Returns true if the bullet moved off screen
	// If bullet is ready, game draws the bullet
	this.draw = function() {
		this.context.clearRect(this.x-1, this.y-1, this.width+1, this.height+1);
		this.y -= this.speed;
		if (this.isColliding) {
			return true;
		}
		else if (self === "bullet" && this.y <= 0 - this.height) {
			return true;
		}

		else if (self === "enemyBullet" && this.y >= this.canvasHeight) {
			return true;
		}

		else {
			if (self === "bullet") {
				this.context.drawImage(imageRepository.bullet, this.x, this.y);
			}
			else if (self === "enemyBullet") {
				this.context.drawImage(imageRepository.enemyBullet, this.x, this.y);
			}
			return false;
		}
	};

	// Resets the bullet values
	this.clear = function() {
		this.x = 0;
		this.y = 0;
		this.speed = 0;
		this.alive = false;
		this.isColliding = false;
	};
}

// Set Bullet to inherit properties from Drawable constructor
Bullet.prototype = new Drawable();

// Creates a Ship object
function Ship() {
	this.speed = 3;
	this.bulletPool = new Pool(30);
	this.bulletPool.init("bullet");
	var fireRate = 9;
	var counter = 0;
	this.collidableWith = "enemyBullet";
	this.type = "ship";
	this.draw = function() {
		this.context.drawImage(imageRepository.spaceship, this.x, this.y);
	};
	this.move = function() {
		counter++;
		// Determine if the action is move action
		if (KEY_STATUS.left || KEY_STATUS.right || 
			KEY_STATUS.down || KEY_STATUS.up) {
			// This ship moved, so redraw ship in new location
			this.context.clearRect(this.x, this.y, this.width, this.height);
			// Update x and y according to direction
			if (KEY_STATUS.left) {
				this.x -= this.speed
				if (this.x <= 0) // Keep player within the screen
					this.x = 0;
			} else if (KEY_STATUS.right) {
				this.x += this.speed
				if (this.x >= this.canvasWidth - this.width)
					this.x = this.canvasWidth - this.width;
			} else if (KEY_STATUS.up) {
				this.y -= this.speed
				if (this.y <= this.canvasHeight/4*3)
					this.y = this.canvasHeight/4*3;
			} else if (KEY_STATUS.down) {
				this.y += this.speed
				if (this.y >= this.canvasHeight - this.height)
					this.y = this.canvasHeight - this.height;
			}

			// Finish by redrawing the ship
			if (!this.isColliding) {
				this.draw();
			}
		}
		if (KEY_STATUS.space && counter >= fireRate && !this.isColliding) {
			this.fire();
			counter = 0;
		}
	};

	// Fires two bullets
	this.fire = function() {
		this.bulletPool.getTwo(this.x + 6, this.y, 3,
								this.x + 33, this.y, 3);
	};
}

// Set Ship to inherit properties from Drawable constructor
Ship.prototype = new Drawable();

// Create an Enemy ship object
function Enemy() {
	var percentFire = .01;
	var chance = 0;
	this.alive = false;
	this.collidableWith = "bullet";
	this.type = "enemy";
	
	// Sets the Enemy values
	this.spawn = function(x, y, speed) {
		this.x = x;
		this.y = y;
		this.speed = speed;
		this.speedX = 0;
		this.speedY = speed;
		this.alive = true;
		this.leftEdge = this.x - 90;
		this.rightEdge = this.x + 90;
		this.bottomEdge = this.y + 140;
	};
	
	// Move the enemy
	this.draw = function() {
		this.context.clearRect(this.x-1, this.y, this.width+1, this.height);
		this.x += this.speedX;
		this.y += this.speedY;
		if (this.x <= this.leftEdge) {
			this.speedX = this.speed;
		}
		else if (this.x >= this.rightEdge + this.width) {
			this.speedX = -this.speed;
		}
		else if (this.y >= this.bottomEdge) {
			this.speed = 1.5;
			this.speedY = 0;
			this.y -= 5;
			this.speedX = -this.speed;
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

// Set Enemy ship to inherit properties from Drawable constructor
Enemy.prototype = new Drawable();




