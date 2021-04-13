let linkLeftSpritesheet,
	linkRightSpritesheet,
	linkDownSpritesheet,
	linkUpSpritesheet;

let linkAnimLeft,
	linkAnimRight,
	linkAnimDown,
	linkAnimUp;

let enemySpriteSheetClose,
	enemySpriteSheetFar;

let enemyAnimFar,
	enemyAnimClose;

let followerSpriteSheet;

let followerAnim;

let playerSprite;

let enemySprites;

let followerSprite;

let leftWall,
	rightWall,
	bottomWall,
	topWall;

let directionStack = [];

let directionAngles = {
	up: -90,
	down: 90,
	left: 180,
	right: 0
};

let bg;

function preload() {
	linkLeftSpritesheet = loadSpriteSheet("assets/link-left.png", 24, 32, 24);
	linkRightSpritesheet = loadSpriteSheet("assets/link-right.png", 24, 32, 24);
	linkDownSpritesheet = loadSpriteSheet("assets/link-down.png", 24, 32, 24);
	linkUpSpritesheet = loadSpriteSheet("assets/link-up.png", 24, 32, 24);

	enemySpriteSheetClose = loadSpriteSheet("assets/enemy-close.png", 32, 32, 8);
	enemySpriteSheetFar = loadSpriteSheet("assets/enemy-far.png", 32, 32, 1);

	followerSpriteSheet = loadSpriteSheet("assets/follower.png", 21, 28, 4);

	linkAnimLeft = loadAnimation(linkLeftSpritesheet);
	linkAnimRight = loadAnimation(linkRightSpritesheet);
	linkAnimDown = loadAnimation(linkDownSpritesheet);
	linkAnimUp = loadAnimation(linkUpSpritesheet);

	enemyAnimFar = loadAnimation(enemySpriteSheetFar);
	enemyAnimClose = loadAnimation(enemySpriteSheetClose);

	followerAnim = loadAnimation(followerSpriteSheet);


	linkAnimLeft.frameDelay = 1;
	linkAnimRight.frameDelay = 1;
	linkAnimDown.frameDelay = 1;
	linkAnimUp.frameDelay = 1;

	enemyAnimClose.frameDelay = 1;

	followerAnim.frameDelay = 30;

	bg = loadImage("assets/background.png");
}

function setup() {
	frameRate(30);
	const cnv = createCanvas(1000, 600);
	cnv.parent('sketch');
	background(100);

	playerSprite = createSprite(500, 300, 24, 32);
	playerSprite.addAnimation("left", linkAnimLeft);
	playerSprite.addAnimation("right", linkAnimRight);
	playerSprite.addAnimation("down", linkAnimDown);
	playerSprite.addAnimation("up", linkAnimUp);

	followerSprite = createSprite(500, -100, 21, 28);

	followerSprite.addAnimation("default", followerAnim);

	followerSprite.friction = 0.57;

	playerSprite.friction = 0.2;

	topWall = createSprite(500, -25, 1050, 50);
	bottomWall = createSprite(500, 625, 1050, 50);
	leftWall = createSprite(-25, 300, 50, 650);
	rightWall = createSprite(1025, 300, 50, 650);

	topWall.visible = false;
	bottomWall.visible = false;
	leftWall.visible = false;
	rightWall.visible = false;

	topWall.immovable = true;
	bottomWall.immovable = true;
	leftWall.immovable = true;
	rightWall.immovable = true;

	enemySprites = new Group();
	spawnEnemies(15);
}

function draw() {
	clear();
	background(bg);
	getInput();
	movePlayer();
	animatePlayer();
	animateEnemies();
	bounceEnemiesOffWalls();
	moveFollower();
	checkCollision();
	drawSprites();
}

function getInput() {
	handleKey(87, "up");
	handleKey(83, "down");
	handleKey(65, "left");
	handleKey(68, "right");
}

function handleKey(keycode, direction) {
	if (keyIsDown(keycode) && !directionStack.includes(direction)) {
		directionStack.push(direction);
	} else if (!keyIsDown(keycode) && directionStack.includes(direction)) {
		const pos = directionStack.indexOf(direction);
		directionStack.splice(pos, 1);
	}
}

function movePlayer() {
	const direction = directionStack[directionStack.length - 1];
	const directionAngle = directionAngles[direction];
	if (direction) {
		playerSprite.addSpeed(2, directionAngle);
	}
	playerSprite.bounce(topWall);
	playerSprite.bounce(bottomWall);
	playerSprite.bounce(leftWall);
	playerSprite.bounce(rightWall);
}

function animatePlayer() {
	const direction = directionStack[directionStack.length - 1];
	if (direction) {
		playerSprite.changeAnimation(direction);
		playerSprite.animation.play();
	} else {
		playerSprite.animation.goToFrame(0);
	}
}

function spawnEnemies(n) {
	for (let i = 0; i < n; i++) {
		createEnemy();
	}
}


function createEnemy() {
	const distance = 250;
	const angle = radians(Math.random() * 360);
	const x = distance * Math.cos(angle) + 500;
	const y = distance * Math.sin(angle) + 300;
	const enemy = createSprite(x, y, 32, 32);
	enemySprites.add(enemy);
	enemy.addAnimation("enemy close", enemyAnimClose);
	enemy.addAnimation("enemy far", enemyAnimFar);
	enemy.addSpeed(4, Math.random() * 360);
}

function animateEnemies() {
	for (let enemy of enemySprites) {
		if (playerSprite.position.dist(enemy.position) < 75) {
			enemy.changeAnimation("enemy close");
		} else {
			enemy.changeAnimation("enemy far");
		}
	}
}

function bounceEnemiesOffWalls() {
	for (let enemy of enemySprites) {
		enemy.bounce(topWall);
		enemy.bounce(bottomWall);
		enemy.bounce(rightWall);
		enemy.bounce(leftWall);
	}
}

function checkCollision() {
	if (playerSprite.overlap(enemySprites) || playerSprite.overlap(followerSprite)) {
		enemySprites.removeSprites();
		playerSprite.remove();

		followerSprite.remove();

		noLoop();
		background(bg);
		textAlign(CENTER, CENTER);
		fill("white");
		textSize(100);
		text("Game Over", 500, 300);
		textSize(40);
		const score = Math.floor(millis() / 1000);
		text("Score: " + score, 500, 400);
	}
}

function moveFollower() {
	followerSprite.attractionPoint(2, playerSprite.position.x, playerSprite.position.y);
	followerSprite.rotation = followerSprite.getDirection() + 90;
}