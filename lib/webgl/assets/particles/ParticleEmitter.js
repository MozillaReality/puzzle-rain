'use strict';

var THREE = require('three');

var State = require('../../../state/State');

var ParticleSystem = require('./ParticleSystem');
var ParticleSpec = require('./ParticleSpec');
var glslify = require('glslify');

var CORNERS_ = [
  [-0.5, -0.5],
  [+0.5, -0.5],
  [+0.5, +0.5],
  [-0.5, +0.5]
];

function ParticleEmitter (particleSystem, opt_texture, opt_clock) {
  opt_clock = opt_clock || particleSystem.timeSource_;

  THREE.Mesh.call(this);

  this.camera = State.get('camera');
  this.tmpWorld_ = new Float32Array(16);

  // The VBO holding the particles' data, (re-)allocated in
  // allocateParticles_().
  this.particleBuffer_ = new THREE.InstancedBufferGeometry();
  this.interleavedBuffer = new THREE.InterleavedBuffer();

  // The buffer object holding the particles' indices, (re-)allocated
  // in allocateParticles_().
  this.indexBuffer_ = [];

  // The number of particles that are stored in the particle buffer.
  this.numParticles_ = 0;

  this.rampTexture_ = particleSystem.defaultRampTexture;
  this.colorTexture_ = opt_texture || particleSystem.defaultColorTexture;

  this.particleSystem = particleSystem;

  this.timeSource_ = opt_clock;

  this.translation_ = [0, 0, 0];

  this.setState(THREE.NormalBlending);
}

ParticleEmitter.prototype = Object.create(THREE.Mesh.prototype);

ParticleEmitter.prototype.clone = function (object) {
  if (object === undefined) object = this.particleSystem.createParticleEmitter(this.colorTexture_, this.timeSource_); // new ParticleEmitter(this.particleSystem,this.colorTexture_,this.timeSource_);
  object.geometry = this.geometry;
  object.material = this.material.clone();
  object.material.uniforms.world.value = object.matrixWorld;
  object.material.uniforms.viewInverse.value = camera.matrixWorld;
  object.material.uniforms.rampSampler.value = this.rampTexture_;
  object.material.uniforms.colorSampler.value = this.colorTexture_;
  THREE.Mesh.prototype.clone.call(this, object);
  return object;

};

/**
 * Sets the world translation for this ParticleEmitter.
 * @param {tdl.math.Vector3} translation The translation for this emitter.
 */
ParticleEmitter.prototype.setTranslation = function (x, y, z) {
  // this.translation_[0] = x;
  // this.translation_[1] = y;
  // this.translation_[2] = z;

  // this.mesh.position.x=x;
  // this.mesh.position.y=y;
  // this.mesh.position.z=z;
  this.position.x = x;
  this.position.y = y;
  this.position.z = z;

};

ParticleEmitter.prototype.setState = function (stateId) {
  this.blendFunc_ = stateId;
};

/**
 * Sets the colorRamp for the particles.
 * The colorRamp is used as a multiplier for the texture. When a particle
 * starts it is multiplied by the first color, as it ages to progressed
 * through the colors in the ramp.
 *
 *     particleEmitter.setColorRamp([
 *       1, 0, 0, 1,    // red
 *       0, 1, 0, 1,    // green
 *       1, 0, 1, 0,    // purple but with zero alpha
 *     ]);
 *
 * The code above sets the particle to start red, change to green then
 * fade out while changing to purple.
 *
 * @param {number[]} colorRamp An array of color values in
 *     the form RGBA.
 */
ParticleEmitter.prototype.setColorRamp = function (colorRamp) {
  var width = colorRamp.length / 4;
  if (width % 1 != 0) {
    throw 'colorRamp must have multiple of 4 entries';
  }

  if (this.rampTexture_ == this.particleSystem.defaultRampTexture) {
    this.rampTexture_ = null;
  }
  this.rampTexture_ = this.particleSystem.createTextureFromFloats(width, 1, colorRamp, this.rampTexture_);
};

/**
 * Validates and adds missing particle parameters.
 * @param {tdl.particles.ParticleSpec} parameters The parameters to validate.
 */
ParticleEmitter.prototype.validateParameters = function (
  parameters) {
  var defaults = new ParticleSpec();
  for (var key in parameters) {
    if (typeof defaults[key] === 'undefined') {
      throw 'unknown particle parameter "' + key + '"';
    }
  }
  for (var key in defaults) {
    if (typeof parameters[key] === 'undefined') {
      parameters[key] = defaults[key];
    }
  }
};

/**
 * Creates particles.
 * @private
 * @param {number} firstParticleIndex Index of first particle to create.
 * @param {number} numParticles The number of particles to create.
 * @param {tdl.particles.ParticleSpec} parameters The parameters for the
 *     emitters.
 * @param {tdl.particles.Particle~Setup?} opt_perParticleParamSetter function
 *        to setup particles.
 */
ParticleEmitter.prototype.createParticles_ = function (firstParticleIndex, numParticles, parameters, opt_perParticleParamSetter) {
  var interleaveBufferData = this.interleavedBuffer.array;

  // Set the globals.
  this.billboard_ = parameters.billboard;

  var random = this.particleSystem.randomFunction_;

  var plusMinus = function (range) {
    return (random() - 0.5) * range * 2;
  };

  // TODO: change to not allocate.
  var plusMinusVector = function (range) {
    var v = [];
    for (var ii = 0; ii < range.length; ++ii) {
      v.push(plusMinus(range[ii]));
    }
    return v;
  };

  for (var ii = 0; ii < numParticles; ++ii) {
    if (opt_perParticleParamSetter) {
      opt_perParticleParamSetter(ii, parameters);
    }
    var pLifeTime = parameters.lifeTime;
    var pStartTime = (parameters.startTime === null) ?
      (ii * parameters.lifeTime / numParticles) : parameters.startTime;
    var pFrameStart =
    parameters.frameStart + plusMinus(parameters.frameStartRange);

    var pPosition = new THREE.Vector3().addVectors(
      new THREE.Vector3().fromArray(parameters.position), new THREE.Vector3().fromArray(plusMinusVector(parameters.positionRange)));

    var pVelocity = new THREE.Vector3().addVectors(
      new THREE.Vector3().fromArray(parameters.velocity), new THREE.Vector3().fromArray(plusMinusVector(parameters.velocityRange)));
    var pAcceleration = new THREE.Vector3().addVectors(
      new THREE.Vector3().fromArray(parameters.acceleration),
      new THREE.Vector3().fromArray(plusMinusVector(parameters.accelerationRange)));
    var pColorMult = new THREE.Vector4().addVectors(
      new THREE.Vector4().fromArray(parameters.colorMult), new THREE.Vector4().fromArray(plusMinusVector(parameters.colorMultRange)));
    var pSpinStart =
    parameters.spinStart + plusMinus(parameters.spinStartRange);
    var pSpinSpeed =
    parameters.spinSpeed + plusMinus(parameters.spinSpeedRange);
    var pStartSize =
    parameters.startSize + plusMinus(parameters.startSizeRange);
    var pEndSize = parameters.endSize + plusMinus(parameters.endSizeRange);
    var pOrientation = new THREE.Vector4().fromArray(parameters.orientation);
    // make each corner of the particle.
    for (var jj = 0; jj < 1; ++jj) {
      var offset0 = this.particleSystem.LAST_IDX * jj + (ii * this.particleSystem.LAST_IDX * 4) + (firstParticleIndex * this.particleSystem.LAST_IDX * 4);
      var offset1 = offset0 + 1;
      var offset2 = offset0 + 2;
      var offset3 = offset0 + 3;

      interleaveBufferData[ this.particleSystem.POSITION_START_TIME_IDX + offset0 ] = pPosition.x;
      interleaveBufferData[ this.particleSystem.POSITION_START_TIME_IDX + offset1 ] = pPosition.y;
      interleaveBufferData[ this.particleSystem.POSITION_START_TIME_IDX + offset2 ] = pPosition.z;
      interleaveBufferData[ this.particleSystem.POSITION_START_TIME_IDX + offset3] = pStartTime;

      interleaveBufferData[this.particleSystem.UV_LIFE_TIME_FRAME_START_IDX + offset0] = CORNERS_[jj][0];
      interleaveBufferData[this.particleSystem.UV_LIFE_TIME_FRAME_START_IDX + offset1] = CORNERS_[jj][1];
      interleaveBufferData[this.particleSystem.UV_LIFE_TIME_FRAME_START_IDX + offset2] = pLifeTime;
      interleaveBufferData[this.particleSystem.UV_LIFE_TIME_FRAME_START_IDX + offset3] = pFrameStart;

      interleaveBufferData[this.particleSystem.VELOCITY_START_SIZE_IDX + offset0] = pVelocity.x;
      interleaveBufferData[this.particleSystem.VELOCITY_START_SIZE_IDX + offset1] = pVelocity.y;
      interleaveBufferData[this.particleSystem.VELOCITY_START_SIZE_IDX + offset2] = pVelocity.z;
      interleaveBufferData[this.particleSystem.VELOCITY_START_SIZE_IDX + offset3] = pStartSize;

      interleaveBufferData[this.particleSystem.ACCELERATION_END_SIZE_IDX + offset0] = pAcceleration.x;
      interleaveBufferData[this.particleSystem.ACCELERATION_END_SIZE_IDX + offset1] = pAcceleration.y;
      interleaveBufferData[this.particleSystem.ACCELERATION_END_SIZE_IDX + offset2] = pAcceleration.z;
      interleaveBufferData[this.particleSystem.ACCELERATION_END_SIZE_IDX + offset3] = pEndSize;

      interleaveBufferData[this.particleSystem.SPIN_START_SPIN_SPEED_IDX + offset0] = pSpinStart;
      interleaveBufferData[this.particleSystem.SPIN_START_SPIN_SPEED_IDX + offset1] = pSpinSpeed;
      interleaveBufferData[this.particleSystem.SPIN_START_SPIN_SPEED_IDX + offset2] = 0;
      interleaveBufferData[this.particleSystem.SPIN_START_SPIN_SPEED_IDX + offset3] = 0;

      interleaveBufferData[this.particleSystem.ORIENTATION_IDX + offset0] = pOrientation.x;
      interleaveBufferData[this.particleSystem.ORIENTATION_IDX + offset1] = pOrientation.y;
      interleaveBufferData[this.particleSystem.ORIENTATION_IDX + offset2] = pOrientation.z;
      interleaveBufferData[this.particleSystem.ORIENTATION_IDX + offset3] = pOrientation.w;

      interleaveBufferData[this.particleSystem.COLOR_MULT_IDX + offset0] = pColorMult.x;
      interleaveBufferData[this.particleSystem.COLOR_MULT_IDX + offset1] = pColorMult.y;
      interleaveBufferData[this.particleSystem.COLOR_MULT_IDX + offset2] = pColorMult.z;
      interleaveBufferData[this.particleSystem.COLOR_MULT_IDX + offset3] = pColorMult.w;

    }
  }

  this.interleavedBuffer.needsUpdate = true;

  this.material.uniforms.worldVelocity.value = new THREE.Vector3(parameters.worldVelocity[0], parameters.worldVelocity[1], parameters.worldVelocity[2]);
  this.material.uniforms.worldAcceleration.value = new THREE.Vector3(parameters.worldAcceleration[0], parameters.worldAcceleration[1], parameters.worldAcceleration[2]);
  this.material.uniforms.timeRange.value = parameters.timeRange;
  this.material.uniforms.frameDuration.value = parameters.frameDuration;
  this.material.uniforms.numFrames.value = parameters.numFrames;
  this.material.uniforms.rampSampler.value = this.rampTexture_;
  this.material.uniforms.colorSampler.value = this.colorTexture_;

  this.material.blending = this.blendFunc_;

};

/**
 * Allocates particles.
 * @private
 * @param {number} numParticles Number of particles to allocate.
 */
ParticleEmitter.prototype.allocateParticles_ = function (numParticles, parameters) {
  if (this.numParticles_ != numParticles) {
    var numIndices = 6 * numParticles;
    if (numIndices > 65536) {
      throw "can't have more than 10922 particles per emitter";
    }

    var vertexBuffer = new THREE.InterleavedBuffer(new Float32Array([
      // Front
      0, 0, 0, 0, -0.5, -0.5, 0, 0,
      0, 0, 0, 0, 0.5, -0.5, 0, 0,
      0, 0, 0, 0, 0.5, 0.5, 0, 0,
      0, 0, 0, 0, -0.5, 0.5, 0, 0
    ]), 8);

    // Use vertexBuffer, starting at offset 0, 3 items in position attribute
    var positions = new THREE.InterleavedBufferAttribute(vertexBuffer, 3, 0);
    this.particleBuffer_.addAttribute('position', positions);
    // Use vertexBuffer, starting at offset 4, 2 items in uv attribute
    var uvs = new THREE.InterleavedBufferAttribute(vertexBuffer, 2, 4);
    this.particleBuffer_.addAttribute('uv', uvs);

    var indices = new Uint16Array([
      0, 1, 2,
      0, 2, 3

    ]);

    this.particleBuffer_.setIndex(new THREE.BufferAttribute(indices, 1));

    this.numParticles_ = numParticles;

    this.interleavedBuffer = new THREE.InstancedInterleavedBuffer(new Float32Array(numParticles * this.particleSystem.singleParticleArray_.byteLength), this.particleSystem.LAST_IDX, 1).setDynamic(true);

    this.particleBuffer_.addAttribute('offset', new THREE.InterleavedBufferAttribute(this.interleavedBuffer, 3, this.particleSystem.POSITION_START_TIME_IDX));
    this.particleBuffer_.addAttribute('startTime', new THREE.InterleavedBufferAttribute(this.interleavedBuffer, 1, 3));
    this.particleBuffer_.addAttribute('uvLifeTimeFrameStart', new THREE.InterleavedBufferAttribute(this.interleavedBuffer, 4, this.particleSystem.UV_LIFE_TIME_FRAME_START_IDX));
    this.particleBuffer_.addAttribute('velocityStartSize', new THREE.InterleavedBufferAttribute(this.interleavedBuffer, 4, this.particleSystem.VELOCITY_START_SIZE_IDX));
    this.particleBuffer_.addAttribute('accelerationEndSize', new THREE.InterleavedBufferAttribute(this.interleavedBuffer, 4, this.particleSystem.ACCELERATION_END_SIZE_IDX));
    this.particleBuffer_.addAttribute('spinStartSpinSpeed', new THREE.InterleavedBufferAttribute(this.interleavedBuffer, 4, this.particleSystem.SPIN_START_SPIN_SPEED_IDX));
    this.particleBuffer_.addAttribute('orientation', new THREE.InterleavedBufferAttribute(this.interleavedBuffer, 4, this.particleSystem.ORIENTATION_IDX));
    this.particleBuffer_.addAttribute('colorMult', new THREE.InterleavedBufferAttribute(this.interleavedBuffer, 4, this.particleSystem.COLOR_MULT_IDX));

    var uniforms = {
      world: { type: 'm4', value: this.matrixWorld },
      viewInverse: { type: 'm4', value: this.camera.matrixWorld },
      worldVelocity: { type: 'v3', value: null },
      worldAcceleration: { type: 'v3', value: null },
      timeRange: { type: 'f', value: null },
      time: { type: 'f', value: null },
      timeOffset: { type: 'f', value: null },
      frameDuration: { type: 'f', value: null },
      numFrames: { type: 'f', value: null },
      rampSampler: { type: 't', value: this.rampTexture_ }, // regular texture;
      colorSampler: { type: 't', value: this.colorTexture_ } // regular texture;

    };

    var material = new THREE.ShaderMaterial({
      uniforms: uniforms,
      vertexShader: (parameters.billboard) ? glslify('../../shaders/particlesBillboard.vert') : glslify('../../shaders/particles.vert'),
      fragmentShader: glslify('../../shaders/particles.frag'),
      side: THREE.DoubleSide, // (this.billboard_)? THREE.DoubleSide:THREE.FrontSide,
      blending: this.blendFunc_,
      depthTest: true,
      depthWrite: false,
      transparent: true
    });

    this.geometry = this.particleBuffer_;
    this.material = material;

  }
};

/**
 * Sets the parameters of the particle emitter.
 *
 * Each of these parameters are in pairs. The used to create a table
 * of particle parameters. For each particle a specfic value is
 * set like this
 *
 *     particle.field = value + Math.random() - 0.5 * valueRange * 2;
 *
 * or in English
 *
 *     particle.field = value plus or minus valueRange.
 *
 * So for example, if you wanted a value from 10 to 20 you'd pass 15 for value
 * and 5 for valueRange because
 *
 *     15 + or - 5  = (10 to 20)
 *
 * @param {tdl.particles.ParticleSpec} parameters The parameters for the
 *     emitters.
 * @param {tdl.particles.Particle~Setup?} opt_perParticleParamSetter function
 *        to setup particles.
 */
ParticleEmitter.prototype.setParameters = function (parameters, opt_perParticleParamSetter) {
  this.validateParameters(parameters);

  var numParticles = parameters.numParticles;

  this.allocateParticles_(numParticles, parameters);
  this.createParticles_(
    0,
    numParticles,
    parameters,
    opt_perParticleParamSetter);
};

/**
 * Draws the particles for this ParticleEmitter
 * @param {tdl.math.Matrix4|tdl.fast.Matrix4} world The world
 *        matrix.
 * @param {tdl.math.Matrix4|tdl.fast.Matrix4} viewProjection The
 *        viewProjection matrix.
 * @param {number} timeOffset time offset to compute state of
 *        particles.
 */
var dope = false;
ParticleEmitter.prototype.draw = function (world, viewProjection, timeOffset) {
  // var uniforms = this.mesh.material.uniforms;
  var uniforms = this.material.uniforms;
  if (world !== undefined) {
    uniforms.world.value = world;
  }

  var curTime = this.timeSource_();
  uniforms.time.value = curTime;
  uniforms.timeOffset.value = timeOffset;

};

/**
 * Creates a OneShot particle emitter instance.
 * You can use this for dust puffs, explosions, fireworks, etc...
 * @return {tdl.particles.OneShot} A OneShot object.
 */
ParticleEmitter.prototype.createOneShot = function () {
  return new OneShot(this);
};
module.exports = ParticleEmitter;
