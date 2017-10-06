
// Creates bullets
function Bullet( object ) {	
	this.alive = false; // Is true if the bullet is currently in use
	var self = object; // Determines which bullet is being used
	
	// Sets the bullet values
	this.spawn = function(x, y, speed) {
		this.x = x;
		this.y = y;
		this.speed = speed;
		this.alive = true;
	};

	// Erases bullets when off-screen and resuses them
	this.draw = function() {
		// Changes status of bullets

		this.context.clearRect(this.x-1, this.y-1, this.width+2, this.height+2);
		this.x += this.speed;

		if (this.isColliding) {
			return true;
		}
		else if (self === "bullet" && this.x >= this.canvasWidth) {
			return true;
		}
		else if (self === "enemyBullet" && this.x <= 0 - this.width) {
			return true;
		}

		// Draws bullets
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
	
	// Clears all bullet values
	this.clear = function() {
		this.x = 0;
		this.y = 0;
		this.speed = 0;
		this.alive = false;
		this.isColliding = false;
	};
}

// Set Bullet to inherit properties from Drawable
Bullet.prototype = new Drawable();

// Pool of bullets
function Pool(maxSize) {
	var size = maxSize; // Max bullets allowed in the pool
	var pool = [];

	this.getPool = function() {
		var obj = [];
		for (var i = 0; i < size; i++) {
			if (pool[i].alive) {
				obj.push(pool[i]);
			}
		}
		return obj;
	}
	
	// Fills array with bullet objects
	this.init = function(object) {
		if (object == "bullet") {
			for (var i = 0; i < size; i++) {
				// Initalize the object
				var bullet = new Bullet("bullet");
				bullet.init(0,0, imageRepository.bullet.width, imageRepository.bullet.height);
				bullet.collidableWith = "enemy";
				bullet.type = "bullet";
				pool[i] = bullet;
			}
		}
		else if (object == "enemy") {
			for (var i = 0; i < size; i++) {
				var enemy = new Enemy();
				enemy.init(0,0, imageRepository.enemy.width, imageRepository.enemy.height);
				pool[i] = enemy;
			}
		}
		else if (object == "enemyBullet") {
			for (var i = 0; i < size; i++) {
				var bullet = new Bullet("enemyBullet");
				bullet.init(0,0, imageRepository.enemyBullet.width, imageRepository.enemyBullet.height);
				bullet.collidableWith = "hero";
				bullet.type = "enemyBullet";
				pool[i] = bullet;
			}
		}
	};
	
	// Grabs the last bullet in the list and pushes to front of array
	this.get = function(x, y, speed) {
		if(!pool[size - 1].alive) {
			pool[size - 1].spawn(x, y, speed);
			pool.unshift(pool.pop());
		}
	};

	// Draws Bullets. If a bullet goes off-screen, it clears it and pushes it to the front of the array.
	this.animate = function() {
		for (var i = 0; i < size; i++) {
			// Only draw until we find a bullet that is not alive
			if (pool[i].alive) {
				if (pool[i].draw()) {
					pool[i].clear();
					pool.push((pool.splice(i,1))[0]);
				}
			}
			else
				break;
		}
	};
}