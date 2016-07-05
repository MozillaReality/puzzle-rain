'use strict';

var THREE = require('three');

var settings = require('../../../settings');

var Race = require('../Race');
var Terrestrial = require('../creatures/Terrestrial');

function Terrestrials () {
  Race.call(this, 'terrestrials');
  this.raceMesh.position.set(-0.506, 0.3, 1.062);

  terrestrial = new Terrestrial(this, 2, new THREE.Vector3(-0.4, 0.3, 0.9), 0.08);
  this.creaturesArr.push(terrestrial);
  this.add(terrestrial);
  var terrestrial = new Terrestrial(this, 1, new THREE.Vector3(-0.5, 0.4, 0.8), 0.1);
  this.creaturesArr.push(terrestrial);
  this.add(terrestrial);
  terrestrial = new Terrestrial(this, 3, new THREE.Vector3(-0.3, 0, -0.6).add(this.raceMesh.position), 0.06);
  this.creaturesArr.push(terrestrial);
  this.add(terrestrial);

}

Terrestrials.prototype = Object.create(Race.prototype);

Terrestrials.prototype.addEmitter = function () {
  this.emitter = this.particleSystem.createParticleEmitter(new THREE.TextureLoader().load('textures/racesAnimParticles.png'));
  this.emitter.setTranslation(0, 0, 0);
  this.emitter.setState(THREE.AdditiveBlending);
  // Based on bouncersColor > 0x035688
  this.emitter.setColorRamp(
    [3 / 255, 86 / 255, 136 / 255, 0,
      3 / 255, 86 / 255, 136 / 255, 0.5,
      152 / 255, 202 / 255, 232 / 255, 0.1,
      152 / 255, 202 / 255, 232 / 255, 0.1,
      152 / 255, 202 / 255, 232 / 255, 0.1,
      1, 1, 1, 0]);
  this.emitter.setParameters({
    numParticles: 100,
    numFrames: 16,
    frameDuration: 20,
    frameStartRange: 8,
    lifeTime: 10,
    timeRange: 5,
    startSize: 0.1,
    endSize: 0.1,
    velocity: [0, 0.03, 0],
    velocityRange: [0, 0.05, 0],
    acceleration: [0, 0.03, 0],
    accelerationRange: [0, 0.05, 0],
    positionRange: [0.7, 0, 0.5],
    opacity: 0,
    rotationY: - Math.PI / 4,
  billboard: true});

  this.emitter.frustumCulled = false;
  this.add(this.emitter);
};
module.exports = Terrestrials;
