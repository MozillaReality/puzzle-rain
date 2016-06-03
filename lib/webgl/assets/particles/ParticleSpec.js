'use strict';

var THREE = require('three');

function ParticleSpec () {
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

  /**
   * Inital opacity
   * @type {int}
   */
  this.opacity = 1;
  /**
   * Inital rotation Y axis
   * @type {int}
   */
  this.rotationY = 0;
}
module.exports = ParticleSpec;
