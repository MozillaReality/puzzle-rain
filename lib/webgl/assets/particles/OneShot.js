'use strict';

var THREE = require('three');
var State = require('../../../state/State');
/**
		 * An object to manage a particle emitter instance as a one
		 * shot. Examples of one shot effects are things like an explosion,
		 * some fireworks. Note that once a OneShot has been created for a
		 * given emitter, that emitter can only be treated as containing one
		 * or more OneShots.
		 * @private
		 * @constructor
		 * @param {tdl.particles.ParticleEmitter} emitter The emitter to use for the
		 *     one shot.
		 */

function OneShot (emitter) {
  this.emitter_ = emitter.clone();
  this.scene = State.get('scene');
  this.world_ = new THREE.Matrix4();
  this.tempWorld_ = new THREE.Matrix4();
  this.timeOffset_ = 0;
  this.visible_ = false;

  // Remove the parent emitter from the particle system's drawable
  // list (if it's still there) and add ourselves instead.
  var particleSystem = emitter.particleSystem;
  var idx = particleSystem.drawables_.indexOf(this.emitter_);
  if (idx >= 0) {
    particleSystem.drawables_.splice(idx, 1);
  }

  particleSystem.drawables_.push(this);
}

/**
 * Triggers the oneshot.
 *
 * Note: You must have set the parent either at creation, with setParent, or by
 * passing in a parent here.
 *
 * @param {tdl.math.Vector3} opt_position The position of the one shot
 *     relative to its parent.
 */
OneShot.prototype.trigger = function (opt_world) {
  // if(!this.visible_) scene.add(this.emitter_.mesh);
  if (!this.visible_) {
    this.scene.add(this.emitter_);

  }
  if (opt_world) {
    this.world_.setPosition(new THREE.Vector3().fromArray(opt_world));
  }
  this.visible_ = true;
  this.timeOffset_ = this.emitter_.timeSource_();
};

/**
 * Draws the oneshot.
 *
 * @private
 * @param {tdl.math.Matrix4|tdl.fast.Matrix4} world The world
 *        matrix.
 * @param {tdl.math.Matrix4|tdl.fast.Matrix4} viewProjection The
 *        viewProjection matrix.
 * @param {number} timeOffset time offset to compute state of
 *        particles.
 */
OneShot.prototype.draw = function (camera, world, viewProjection, timeOffset) {
  if (this.visible_) {
    // this.tempWorld_.multiplyMatrices(this.world_, world);
    this.emitter_.draw(camera, this.world_, viewProjection, this.timeOffset_);
  }
};

module.exports = OneShot;
