let curve;

let c = 50;     // wave celerity
let dt = 1 / 60;   // time delta

let nb_point = 150;

function setup() {
  createCanvas(400, 400);
  frameRate(60);

  curve = new rope(nb_point);

  curve.add_wave(floor(random(20, 80)), 20);
}

function draw() {
  background(0);

  // text description
  textAlign(LEFT);
  fill(255);
  text("the 1D wave equation is :", 20, 25);
  text("d²u/dt² = c² (d²u/dx²)", 20, 40);
  textAlign(CENTER);
  text("press r to randomize", width / 2, height / 4);

  curve.update();
  curve.show();
}

function keyPressed() {
  if (key == 'r') {
    for (let i = 0; i < 5; i++) {
      curve.add_wave(floor(random(20, nb_point - 20)), random(-15, 15));
    }
  }
  return false;
}

class rope {
  constructor(nb_point) {
    this.nb_point = nb_point;

    this.u = [];
    this.du = [];
    this.d2u = [];
    this.d2udx2 = [];

    for (let i = 0; i < this.nb_point; i++) {
      this.u[i] = 0;
      this.du[i] = 0;
      this.d2u[i] = 0;
      this.d2udx2[i] = 0;
    }

    this.calculate_d2udx2 = function () {
      for (let i = 1; i < this.nb_point - 1; i++) {
        this.d2udx2[i] = this.u[i - 1] - 2 * this.u[i] + this.u[i + 1];
      }
      this.d2udx2[0] = this.u[0] - 2 * this.u[1] + this.u[2];
      this.d2udx2[this.nb_point - 1] = this.u[this.nb_point - 1] - 2 * this.u[this.nb_point - 2] + this.u[this.nb_point - 3];
    }

    this.calculate_d2u = function () {
      for (let i = 0; i < this.nb_point; i++) {
        this.d2u[i] = sq(dt) * sq(c) * this.d2udx2[i];
      }
    }

    this.integrate_d2u = function () {
      for (let i = 0; i < this.nb_point; i++) {
        this.du[i] += this.d2u[i];
        this.u[i] += this.du[i];
        this.u[i] *= 0.995;
        // this.du[i] *= 0.995;

        this.u[i] = constrain(this.u[i], -180, 180);
      }
    }

    /*
    the 1D wave equation is :
    d²u/dt² = c²(d²u/dx²)
    
    so we calculate :
    d²u = dt² c² (d²u/dx²)

    and integrate two time d²u to get du
    */

    this.update = function () {
      this.calculate_d2udx2();
      this.calculate_d2u();
      this.integrate_d2u();
    }

    this.add_wave = function (drop, force) {
      for (let i = drop - 10; i <= drop + 10; i++) {
        curve.u[i] += force * (cos(map(i, drop - 10, drop + 10, -PI, PI)) + 1);
      }
      this.update();
    }

    this.show = function () {
      push();
      let x = [];
      for (let i = 0; i < nb_point; i++) {
        x[i] = lerp(20, width - 20, i / (nb_point - 1));
      }

      // water
      noStroke();
      fill(50, 100, 200);
      beginShape();
      vertex(20, height - 20);
      for (let i = 0; i < nb_point; i++) {
        vertex(x[i], height / 2 - this.u[i]);
      }
      vertex(width - 20, height - 20);
      endShape();

      let alpha;
      strokeWeight(2)
      for (let i = 0; i < nb_point - 1; i++) {
        alpha = map(this.u[i] - this.u[i + 1], -1, 1, 0, 255);
        stroke(75, 150, 225, alpha);
        strokeWeight(2)
        if (alpha < 225 & alpha > 200) {
          stroke(255);
        }

        line(x[i], height / 2 - this.u[i], x[i + 1], height / 2 - this.u[i + 1]);

      }


      for (let i = height - 20; i > height / 2; i--) {
        alpha = map(i, height - 20, height / 2, 255, 0);
        stroke(0, 0, 50, alpha);
        line(20, i, width - 20, i);
      }
      pop();
    }
  }
}