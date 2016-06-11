'use strict';

var THREE = require('three');
var glslify = require('glslify');

var ParticleEmitter = require('./ParticleEmitter');
var Trail = require('./Trail');

function createDefaultClock_ (particleSystem) {
  return function () {
    var now = particleSystem.now_;
    var base = particleSystem.timeBase_;
    return (now.getTime() - base.getTime()) / 1000.0;
  };
}

function ParticleSystem (opt_clock, opt_randomFunction) {
  // Entities which can be drawn -- emitters or OneShots
  this.drawables_ = [];

  var pixelBase = [0, 0.20, 0.70, 1, 0.70, 0.20, 0, 0];
  var pixels = [];
  for (var yy = 0; yy < 8; ++yy) {
    for (var xx = 0; xx < 8; ++xx) {
      var pixel = pixelBase[xx] * pixelBase[yy];
      pixels.push(pixel, pixel, pixel, pixel);
    }
  }
  var colorTexture = this.createTextureFromFloats(8, 8, pixels);
  var rampTexture = this.createTextureFromFloats(2, 1, [1, 1, 1, 1,
    1, 1, 1, 0]);

  this.now_ = new Date();
  this.timeBase_ = new Date();
  if (opt_clock) {
    this.timeSource_ = opt_clock;
  } else {
    this.timeSource_ = createDefaultClock_(this);
  }

  this.randomFunction_ = opt_randomFunction || function () {
    return Math.random();
  };

  this.defaultColorTexture = colorTexture;
  this.defaultRampTexture = rampTexture;
}

ParticleSystem.prototype.POSITION_START_TIME_IDX = 0;
ParticleSystem.prototype.UV_LIFE_TIME_FRAME_START_IDX = 4;
ParticleSystem.prototype.VELOCITY_START_SIZE_IDX = 8;
ParticleSystem.prototype.ACCELERATION_END_SIZE_IDX = 12;
ParticleSystem.prototype.SPIN_START_SPIN_SPEED_IDX = 16;
ParticleSystem.prototype.ORIENTATION_IDX = 20;
ParticleSystem.prototype.COLOR_MULT_IDX = 24;
ParticleSystem.prototype.LAST_IDX = 28;
ParticleSystem.prototype.singleParticleArray_ = new Float32Array(4 * ParticleSystem.prototype.LAST_IDX);

ParticleSystem.prototype.createTextureFromFloats = function (width, height, pixels, opt_texture) {
  var texture = null;
  if (opt_texture != null) {
    texture = opt_texture;
  } else {
    var data = new Uint8Array(pixels.length);
    for (var i = 0; i < pixels.length; i++) {
      var t = pixels[i] * 255.;
      data[i] = t;
    }

    var texture = new THREE.DataTexture(data, width, height, THREE.RGBAFormat);
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;
    texture.needsUpdate = true;

    return texture;

  }

  return texture;
};

var ParticleSpec = function () {
  this.numParticles = 1;

  this.numFrames = 1;

  this.frameDuration = 1;

  this.frameStart = 0;

  this.frameStartRange = 0;

  this.timeRange = 99999999;

  this.startTime = null;
  // TODO: Describe what happens if this is not set. I still have some
  //     work to do there.

  this.lifeTime = 1;

  this.lifeTimeRange = 0;

  this.startSize = 1;

  this.startSizeRange = 0;

  this.endSize = 1;

  this.endSizeRange = 0;

  /**
   * The starting position of a particle in local space.
   * @type {tdl.math.Vector3}
   */
  this.position = [0, 0, 0];

  /**
   * The starting position range.
   * @type {tdl.math.Vector3}
   */
  this.positionRange = [0, 0, 0];

  /**
   * The velocity of a paritcle in local space.
   * @type {tdl.math.Vector3}
   */
  this.velocity = [0, 0, 0];

  /**
   * The velocity range.
   * @type {tdl.math.Vector3}
   */
  this.velocityRange = [0, 0, 0];

  /**
   * The acceleration of a particle in local space.
   * @type {tdl.math.Vector3}
   */
  this.acceleration = [0, 0, 0];

  /**
   * The accleration range.
   * @type {tdl.math.Vector3}
   */
  this.accelerationRange = [0, 0, 0];

  this.spinStart = 0;

  this.spinStartRange = 0;

  this.spinSpeed = 0;

  this.spinSpeedRange = 0;

  this.colorMult = [1, 1, 1, 1];

  /**
   * The color multiplier range.
   * @type {tdl.math.Vector4}
   */
  this.colorMultRange = [0, 0, 0, 0];

  /**
   * The velocity of all paritcles in world space.
   * @type {tdl.math.Vector3}
   */
  this.worldVelocity = [0, 0, 0];

  /**
   * The acceleration of all paritcles in world space.
   * @type {tdl.math.Vector3}
   */
  this.worldAcceleration = [0, 0, 0];

  /**
   * Whether these particles are oriented in 2d or 3d. true = 2d, false = 3d.
   * @type {boolean}
   */
  this.billboard = true;

  /**
   * The orientation of a particle. This is only used if billboard is false.
   * @type {tdl.quaternions.Quaternion}
   */
  this.orientation = [0, 0, 0, 1];
};

ParticleSystem.prototype.createParticleEmitter = function (opt_texture, opt_clock) {
  var emitter = new ParticleEmitter(this, opt_texture, opt_clock);
  this.drawables_.push(emitter);
  return emitter;
};

ParticleSystem.prototype.createTrail = function (
  maxParticles,
  parameters,
  opt_texture,
  opt_perParticleParamSetter,
  opt_clock) {
  var trail = new Trail(
    this,
    maxParticles,
    parameters,
    opt_texture,
    opt_perParticleParamSetter,
    opt_clock);
  this.drawables_.push(trail);
  return trail;
};

ParticleSystem.prototype.draw = function (camera, viewProjection, world, viewInverse) {
  // Update notion of current time
  this.now_ = new Date();

  for (var ii = 0; ii < this.drawables_.length; ++ii) {
    this.drawables_[ii].draw(camera, world, viewProjection, 0);
  }
};

module.exports = ParticleSystem;
