
let player;
let platforms = [];
let camX = 0;

function setup() {
  createCanvas(windowWidth, windowHeight);
  player = new Player(100, 300, 15);
  platforms.push(new Platform(-320, height - 40, 520, 40, 0));
  platforms.push(new Platform(300, height - 150, 90, 40, 0));
  platforms.push(new Platform(600, height - 290, 120, 60, 0));
  platforms.push(new Platform(1000, height - 200, 200, 20, 0));
  platforms.push(new Platform(1400, height - 300, 200, 2000, 0));
  platforms.push(new Platform(1590, height - 40, 200, 40, 0));
}

function draw() {
  player.vel.x *= 0.9;
  noStroke();
  background(230, 255, 255);
  translate(-camX, 0);

  player.update();
  player.show();


  for (let plat of platforms) {
    plat.show();
    plat.checkCollision(player);
  }
  
    if (keyIsDown(32) || keyIsDown(38) || keyIsDown(87)) {
      player.jump();
    }
  
  camX = player.pos.x - 200;
  camX = constrain(camX, 0, 6000 - width);
}


class Player {
  constructor(x, y, r) {
    this.pos = createVector(x, y);
    this.vel = createVector(0, 0);
    this.acc = createVector(0, 0.65);
    this.w = 40;
    this.h = 40;
    this.r = r;
    this.onGround = false;
    this.onWall = false;
    this.wallDir = 0; // -1 left, 1 right
  }

  update() {
    if (keyIsDown(RIGHT_ARROW) || keyIsDown(68)) this.vel.x += 1;
    if (keyIsDown(LEFT_ARROW) || keyIsDown(65)) this.vel.x -= 1;

    this.vel.add(this.acc);
    this.pos.add(this.vel);

    this.onGround = false;
    this.onWall = false;

    if (this.pos.y > height) {
      this.pos.y = height;
      this.vel.y = 0;
      this.onGround = true;
    }
  }

  jump() {
    if (this.onGround) {
      this.vel.y = -15;
    } else if (this.onWall) {
      this.vel.y = -12;
      this.vel.x = this.wallDir * 12; // push away
    }
  }

  show() {
    fill(127);
    rect(this.pos.x, this.pos.y, this.w, this.h, this.r);
  }
}

class Platform {
  constructor(x, y, w, h, r) {
    this.pos = createVector(x, y);
    this.w = w;
    this.h = h;
    this.r = r;
  }

  show() {
    fill(20);
    rect(this.pos.x, this.pos.y, this.w, this.h, this.r);
  }

  checkCollision(player) {
    // aabb collision
    if (player.pos.x < this.pos.x + this.w &&
        player.pos.x + player.w > this.pos.x &&
        player.pos.y < this.pos.y + this.h &&
        player.pos.y + player.h > this.pos.y) {
          
      // centre points
      let p_centerX = player.pos.x + player.w / 2;
      let plat_centerX = this.pos.x + this.w / 2;
      let p_centerY = player.pos.y + player.h / 2;
      let plat_centerY = this.pos.y + this.h / 2;

      // centre point difference
      let diffX = p_centerX - plat_centerX;
      let diffY = p_centerY - plat_centerY;

      // min separation dist
      const minXDist = player.w / 2 + this.w / 2;
      const minYDist = player.h / 2 + this.h / 2;

      // depth on axis
      let penetrationX = minXDist - Math.abs(diffX);
      let penetrationY = minYDist - Math.abs(diffY);
      

      if (penetrationX < penetrationY) {
        player.onWall = true;
        if (player.vel.y > 1) {
            player.vel.y = 1;
        }

        if (diffX > 0) {
          player.pos.x += penetrationX;
          player.wallDir = 1;
        } else {
          player.pos.x -= penetrationX;
          player.wallDir = -1;
        }
        player.vel.x = 0;
        
      } else {
        if (diffY > 0) {
           player.pos.y += penetrationY;
           player.vel.y = 0;
        } else {
          player.pos.y -= penetrationY;
          player.vel.y = 0;
          player.onGround = true;
        }
      }
    }
  }
}
