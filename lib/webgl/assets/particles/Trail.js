'use strict';
var THREE = require('three');

var ParticleEmitter = require('./ParticleEmitter');

/**
 * A type of emitter to use for particle effects that leave trails like exhaust.
 * @constructor
 * @extends {tdl.particles.ParticleEmitter}
 * @param {tdl.particles.ParticleSystem} particleSystem The particle system
 *     to manage this emitter.
 * @param {number} maxParticles Maximum number of particles to appear at once.
 * @param {tdl.particles.ParticleSpec} parameters The parameters used to
 *     generate particles.
 * @param {tdl.textures.Texture?} opt_texture The texture to use
 *     for the particles. If you don't supply a texture a
 *     default is provided.
 * @param {tdl.particles.Particle~Setup?} opt_perParticleParamSetter function
 *        to setup particles.
 * @param {tdl.particles.Particle~Clock?} opt_clock A function to be the clock
 *        for the emitter.
 */
function Trail (scene,
  particleSystem,
  maxParticles,
  parameters,
  opt_texture,
  opt_perParticleParamSetter,
  opt_clock) {
  ParticleEmitter.call(
    this, particleSystem, opt_texture, opt_clock);
  this.scene = scene;
  this.allocateParticles_(maxParticles, parameters);
  this.validateParameters(parameters);

  this.parameters = parameters;
  this.perParticleParamSetter = opt_perParticleParamSetter;
  this.birthIndex_ = 0;
  this.maxParticles_ = maxParticles;

}

Trail.prototype = Object.create(ParticleEmitter.prototype);

// tdl.base.inherit(tdl.particles.Trail, tdl.particles.ParticleEmitter);

/**
 * Births particles from this Trail.
 * @param {tdl.math.Vector3} position Position to birth particles at.
 */
Trail.prototype.birthParticles = function (position) {
  var numParticles = this.parameters.numParticles;
  this.parameters.startTime = this.timeSource_();
  this.parameters.position = position;
  while (this.birthIndex_ + numParticles >= this.maxParticles_) {
    var numParticlesToEnd = this.maxParticles_ - this.birthIndex_;

    this.createParticles_(this.birthIndex_,
      numParticlesToEnd,
      this.parameters,
      this.perParticleParamSetter);
    numParticles -= numParticlesToEnd;

    this.birthIndex_ = 0;
  }
  this.createParticles_(this.birthIndex_,
    numParticles,
    this.parameters,
    this.perParticleParamSetter);
  if (this.birthIndex_ === 0) {
    this.scene.add(this);
  }
  this.birthIndex_ += numParticles;

};

module.export = Trail;
