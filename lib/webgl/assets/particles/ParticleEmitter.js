'use strict';

var THREE = require('three');

var State = require('../../../state/State');

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

  this.tmpWorld_ = new Float32Array(16);

  // The VBO holding the particles' data, (re-)allocated in
  // allocateParticles_().
  this.particleBuffer_ = new THREE.BufferGeometry();

  // The buffer object holding the particles' indices, (re-)allocated
  // in allocateParticles_().
  this.indexBuffer_ = [];

  // The number of particles that are stored in the particle buffer.
  this.numParticles_ = 0;

  this.rampTexture_ = particleSystem.defaultRampTexture;
  this.colorTexture_ = opt_texture || particleSystem.defaultColorTexture;
  this.colorTexture_.minFilter = THREE.NearestFilter;
  this.particleSystem = particleSystem;

  this.timeSource_ = opt_clock;

  this.translation_ = [0, 0, 0];

  this.setState(THREE.NormalBlending);

  this.camera = State.get('camera');
}

ParticleEmitter.prototype = Object.create(THREE.Mesh.prototype);

ParticleEmitter.prototype.clone = function (object) {
  if (object === undefined) object = this.particleSystem.createParticleEmitter(this.colorTexture_, this.timeSource_); // new ParticleEmitter(this.particleSystem,this.colorTexture_,this.timeSource_);
  object.geometry = this.geometry;
  object.material = this.material.clone();
  object.material.uniforms.world.value = object.matrixWorld;
  object.material.uniforms.viewInverse.value = this.camera.matrixWorld;
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
  this.rampTexture_.minFilter = THREE.NearestFilter;
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
  /*var positions = this.mesh.geometry.attributes.position.array
  var startTime = this.mesh.geometry.attributes.startTime.array
  var uvLifeTimeFrameStart = this.mesh.geometry.attributes.uvLifeTimeFrameStart.array
  var velocityStartSize = this.mesh.geometry.attributes.velocityStartSize.array
  var accelerationEndSize = this.mesh.geometry.attributes.accelerationEndSize.array
  var spinStartSpinSpeed = this.mesh.geometry.attributes.spinStartSpinSpeed.array
  var orientation = this.mesh.geometry.attributes.orientation.array
  var colorMult = this.mesh.geometry.attributes.colorMult.array*/

  var positions = this.geometry.attributes.position.array;
  var startTime = this.geometry.attributes.startTime.array;
  var uvLifeTimeFrameStart = this.geometry.attributes.uvLifeTimeFrameStart.array;
  var velocityStartSize = this.geometry.attributes.velocityStartSize.array;
  var accelerationEndSize = this.geometry.attributes.accelerationEndSize.array;
  var spinStartSpinSpeed = this.geometry.attributes.spinStartSpinSpeed.array;
  var orientation = this.geometry.attributes.orientation.array;
  var colorMult = this.geometry.attributes.colorMult.array;

  var offset_position = 0 + (firstParticleIndex * 3 * 4);
  var offset_start_time = 0 + (firstParticleIndex * 4);
  var offset_4buffers = 0 + (firstParticleIndex * 4 * 4);

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
    for (var jj = 0; jj < 4; ++jj) {
      positions[ offset_position ] = pPosition.x;
      positions[ offset_position + 1 ] = pPosition.y;
      positions[ offset_position + 2 ] = pPosition.z;

      uvLifeTimeFrameStart[offset_4buffers] = CORNERS_[jj][0];
      uvLifeTimeFrameStart[offset_4buffers + 1] = CORNERS_[jj][1];
      uvLifeTimeFrameStart[offset_4buffers + 2] = pLifeTime;
      uvLifeTimeFrameStart[offset_4buffers + 3] = pFrameStart;

      startTime[ offset_start_time] = pStartTime;

      velocityStartSize[offset_4buffers] = pVelocity.x;
      velocityStartSize[offset_4buffers + 1] = pVelocity.y;
      velocityStartSize[offset_4buffers + 2] = pVelocity.z;
      velocityStartSize[offset_4buffers + 3] = pStartSize;

      accelerationEndSize[offset_4buffers] = pAcceleration.x;
      accelerationEndSize[offset_4buffers + 1] = pAcceleration.y;
      accelerationEndSize[offset_4buffers + 2] = pAcceleration.z;
      accelerationEndSize[offset_4buffers + 3] = pEndSize;

      spinStartSpinSpeed[offset_4buffers] = pSpinStart;
      spinStartSpinSpeed[offset_4buffers + 1] = pSpinSpeed;
      spinStartSpinSpeed[offset_4buffers + 2] = 0;
      spinStartSpinSpeed[offset_4buffers + 3] = 0;

      orientation[offset_4buffers] = pOrientation.x;
      orientation[offset_4buffers + 1] = pOrientation.y;
      orientation[offset_4buffers + 2] = pOrientation.z;
      orientation[offset_4buffers + 3] = pOrientation.w;

      colorMult[offset_4buffers] = pColorMult.x;
      colorMult[offset_4buffers + 1] = pColorMult.y;
      colorMult[offset_4buffers + 2] = pColorMult.z;
      colorMult[offset_4buffers + 3] = pColorMult.w;

      offset_position += 3;
      offset_start_time += 1;
      offset_4buffers += 4;

    }

  }

  this.geometry.attributes.position.needsUpdate = true;
  this.geometry.attributes.startTime.needsUpdate = true;
  this.geometry.attributes.uvLifeTimeFrameStart.needsUpdate = true;
  this.geometry.attributes.velocityStartSize.needsUpdate = true;
  this.geometry.attributes.accelerationEndSize.needsUpdate = true;
  this.geometry.attributes.spinStartSpinSpeed.needsUpdate = true;
  this.geometry.attributes.orientation.needsUpdate = true;
  this.geometry.attributes.colorMult.needsUpdate = true;
  this.geometry.computeBoundingSphere();

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

    var indices = new Uint16Array(numIndices);
    var idx = 0;
    for (var ii = 0; ii < numParticles; ++ii) {
      // Make 2 triangles for the quad.
      var startIndex = ii * 4;
      indices[idx++] = startIndex + 0;
      indices[idx++] = startIndex + 1;
      indices[idx++] = startIndex + 2;
      indices[idx++] = startIndex + 0;
      indices[idx++] = startIndex + 2;
      indices[idx++] = startIndex + 3;
    }

    var positions = new Float32Array(numParticles * 4 * 3);
    var startTime = new Float32Array(numParticles * 4 * 1);
    var uvLifeTimeFrameStart = new Float32Array(numParticles * 4 * 4);
    var velocityStartSize = new Float32Array(numParticles * 4 * 4);
    var accelerationEndSize = new Float32Array(numParticles * 4 * 4);
    var spinStartSpinSpeed = new Float32Array(numParticles * 4 * 4);
    var orientation = new Float32Array(numParticles * 4 * 4);
    var colorMult = new Float32Array(numParticles * 4 * 4);

    this.indexBuffer_ = indices;
    this.numParticles_ = numParticles;

    this.particleBuffer_.setIndex(new THREE.BufferAttribute(new Uint16Array(this.indexBuffer_), 1));
    // this.particleBuffer_.addAttribute('index', new THREE.BufferAttribute(this.indexBuffer_, 1));
    this.particleBuffer_.addAttribute('position', new THREE.BufferAttribute(positions, 3));
    this.particleBuffer_.addAttribute('startTime', new THREE.BufferAttribute(startTime, 1));
    this.particleBuffer_.addAttribute('uvLifeTimeFrameStart', new THREE.BufferAttribute(uvLifeTimeFrameStart, 4));
    this.particleBuffer_.addAttribute('velocityStartSize', new THREE.BufferAttribute(velocityStartSize, 4));
    this.particleBuffer_.addAttribute('accelerationEndSize', new THREE.BufferAttribute(accelerationEndSize, 4));
    this.particleBuffer_.addAttribute('spinStartSpinSpeed', new THREE.BufferAttribute(spinStartSpinSpeed, 4));
    this.particleBuffer_.addAttribute('orientation', new THREE.BufferAttribute(orientation, 4));
    this.particleBuffer_.addAttribute('colorMult', new THREE.BufferAttribute(colorMult, 4));

    this.particleBuffer_.computeBoundingSphere();

    var attributes = {
      startTime: { type: 'f', value: null },
      uvLifeTimeFrameStart: { type: 'v4', value: null },
      velocityStartSize: { type: 'v4', value: null },
      accelerationEndSize: { type: 'v4', value: null },
      spinStartSpinSpeed: { type: 'v4', value: null },
      orientation: { type: 'v4', value: null },
      colorMult: { type: 'v4', value: null }

    };

    var uniforms = {
      // world:  { type: 'm4', value: this.mesh.matrixWorld },
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
      // attributes: attributes,
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
