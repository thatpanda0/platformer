let player;
let platforms = [];
let spikes = [];
let camX = 0;

function setup() {
  createCanvas(windowWidth, windowHeight);
  player = new Player(100, 300, 15);

  platforms.push(new Platform(-320, height - 40, 520, 40, 0));
  platforms.push(new Platform(300, height - 150, 40, 40, 0));
  platforms.push(new Platform(600, height - 290, 120, 60, 0));
  platforms.push(new Platform(1000, height - 200, 200, 40, 0));
  platforms.push(new Platform(1400, height - 300, 200, 2000, 0));
  platforms.push(new Platform(1590, height - 50, 660, 50, 0));
  platforms.push(new Platform(1810, height - 460, 200, 200, 0));
  platforms.push(new Platform(2249, height - 201, 200, 2000, 0));

  spikes.push(new Spike(2000, height - 50, 50));
  spikes.push(new Spike(690, height - 290, 30));
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

  for (let sp of spikes) {
    sp.show();
    sp.checkCollision(player);
  }

  if (keyIsDown(32) || keyIsDown(38) || keyIsDown(87)) {
    player.jump();
  }

  camX = player.pos.x - 400;
  camX = constrain(camX, 0, 6000 - width);
}


class Player {
  constructor(x, y, r) {
    this.spawn = createVector(x, y);
    this.pos = createVector(x, y);
    this.vel = createVector(0, 0);
    this.acc = createVector(0, 0.65);
    this.w = 40;
    this.h = 40;
    this.r = r;
    this.onGround = false;
  }

  reset() {
    this.pos.set(this.spawn);
    this.vel.set(0, 0);
  }

  update() {
    if (keyIsDown(RIGHT_ARROW) || keyIsDown(68)) this.vel.x += 1;
    if (keyIsDown(LEFT_ARROW)  || keyIsDown(65)) this.vel.x -= 1;

    this.vel.add(this.acc);
    this.pos.add(this.vel);
    this.onGround = false;

    if (this.pos.y > height) {
      player.reset();
    }
  }

  jump() {
    if (this.onGround) {
      this.vel.y = -15;
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
    if (player.pos.x < this.pos.x + this.w &&
        player.pos.x + player.w > this.pos.x &&
        player.pos.y < this.pos.y + this.h &&
        player.pos.y + player.h > this.pos.y) {
          
      let p_centerX = player.pos.x + player.w / 2;
      let plat_centerX = this.pos.x + this.w / 2;
      let p_centerY = player.pos.y + player.h / 2;
      let plat_centerY = this.pos.y + this.h / 2;

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
        if (player.vel.y > 0.75) {
            player.vel.y = 0.75;
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


class Spike {
  constructor(x, baseY, size) {
    this.x = x;
    this.size = size;
    this.h = size * sqrt(3) / 2;
    this.y = baseY;
    this.verts = [
      createVector(x, baseY),
      createVector(x + size, baseY),
      createVector(x + size/2, baseY - this.h)
    ];
  }

  show() {
    fill(0);
    noStroke();
    triangle(
      this.verts[0].x, this.verts[0].y,
      this.verts[1].x, this.verts[1].y,
      this.verts[2].x, this.verts[2].y
    );
  }

  checkCollision(player) {
    // are corners inside triangle?
    let corners = [
      createVector(player.pos.x, player.pos.y),
      createVector(player.pos.x + player.w, player.pos.y),
      createVector(player.pos.x, player.pos.y + player.h),
      createVector(player.pos.x + player.w, player.pos.y + player.h)
    ];
    for (let c of corners) {
      if (this.pointInTriangle(c, this.verts[0], this.verts[1], this.verts[2])) {
        player.reset();
        return;
      }
    }
  }

  // barybashing
  pointInTriangle(p, a, b, c) {
    let v0 = p5.Vector.sub(c, a);
    let v1 = p5.Vector.sub(b, a);
    let v2 = p5.Vector.sub(p, a);

    let dot00 = v0.dot(v0);
    let dot01 = v0.dot(v1);
    let dot02 = v0.dot(v2);
    let dot11 = v1.dot(v1);
    let dot12 = v1.dot(v2);

    let invDenom = 1 / (dot00 * dot11 - dot01 * dot01);
    let u = (dot11 * dot02 - dot01 * dot12) * invDenom;
    let v = (dot00 * dot12 - dot01 * dot02) * invDenom;

    return (u >= 0) && (v >= 0) && (u + v < 1);
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
