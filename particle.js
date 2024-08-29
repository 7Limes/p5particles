const DOUBLE_PI = 6.28318530718;
const HALF_PI = 1.57079632679;

function randomUniform(min, max) {
  return Math.random() * (max - min) + min;
}

function varyValue(value, variation) {
  return value + randomUniform(-variation, variation);
}

function varyVectorValue(vec, vecVar) {
  let vx = varyValue(vec.x, vecVar.x);
  let vy = varyValue(vec.y, vecVar.y);
  return createVector(vx, vy);
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
};

class Particle {
  constructor(position, velocity, friction, duration, size, color, fade) {
    this.position = position;
    this.velocity = velocity;
    this.friction = friction;
    this.duration = duration;
    this.size = size;
    this.color = color;
    if (fade) {
      this.fade = true;
      this.alphaRatio = 255/duration;
    }
  }

  _apply_friction() {
    if (this.friction == 0)
      return;
    let invVelocity = createVector(-this.velocity.x, -this.velocity.y);
    invVelocity.mult(this.friction);
    this.velocity.add(invVelocity);
  }

  tickdraw() {
    this._apply_friction();
    this.position.add(this.velocity);
    if (this.position.x < 0 || this.position.x > windowWidth || this.position.y < 0 || this.position.y > windowHeight) {
      return true;
    }
    this.duration -= 1;
    if (this.fade) {
      let alpha = this.alphaRatio*this.duration;
      this.color[3] = alpha;
    }
    fill(this.color);
    ellipse(this.position.x, this.position.y, this.size, this.size);
    return this.duration <= 0;
  }
}

class ParticleEffect {
  constructor(type, position, amount,
             spread, duration, durationVar, velocity, velocityVar, friction,
             size, sizeVar, color, colorVar, fade
  ) {
    this.particles = [];
    for (let i = 0; i < amount; i++) {
      let pPosition = this._calculate_position(position, spread);
      let pDuration = Math.round(varyValue(duration, durationVar));
      let pVelocity = this._calculate_velocity(type, velocity, velocityVar);
      let pSize = clamp(Math.round(varyValue(size, sizeVar)), 1, 9999);
      let pColor = this._calculate_color(color, colorVar);
      let par = new Particle(pPosition, pVelocity, friction, pDuration, pSize, pColor, fade);
      this.particles.push(par);
    }
  }

  _calculate_position(position, spread) {
    let phi = randomUniform(0, DOUBLE_PI);
    let x = Math.sqrt(randomUniform(0, 1)) * Math.cos(phi);
    let y = Math.sqrt(randomUniform(0, 1)) * Math.sin(phi);
    x *= spread.x/2;
    y *= spread.y/2;
    return createVector(x+position.x, y+position.y);
  }

  _calculate_velocity(type, velocity, velocityVar) {
    switch (type) {
      case 0:
        return varyVectorValue(velocity, velocityVar);
      case 1:
        let angle = randomUniform(0, DOUBLE_PI);
        let velocityVec = createVector(Math.cos(angle), Math.sin(angle))
        velocityVec.normalize();
        let velocityVarVec = varyVectorValue(velocity, velocityVar);
        velocityVec.mult(velocityVarVec);
        return velocityVec;
      default:
        throw "particle motion type error.";
    }
  }

  _calculate_color(color, colorVar) {
    let newColor = color.slice(0);
    if (Number.isInteger(colorVar)) {
      let r = Math.floor(varyValue(-colorVar, colorVar))
      newColor.forEach((n) => {n += r;});
      return newColor;
    }
    newColor[0] = clamp(Math.floor(varyValue(newColor[0], colorVar[0])), 0, 255);
    newColor[1] = clamp(Math.floor(varyValue(newColor[1], colorVar[1])), 0, 255);
    newColor[2] = clamp(Math.floor(varyValue(newColor[2], colorVar[2])), 0, 255);
    return newColor;
  }

  tickdraw() {
    let amountDestroyed = 0;
    for (let i = 0; i < this.particles.length; i++) {
      let par = this.particles[i];
      let destroy = par.tickdraw();
      if (destroy) {
        this.particles.splice(i, 1);
        i -= 1;
        amountDestroyed += 1;
      }
    }
    return [this.particles.length == 0, amountDestroyed];
  }
}