'use strict';

var THREE = require('three');

var settings = require('../../../settings');

var Race = require('../Race');
var Mineral = require('../creatures/Mineral');

function Minerals (pos) {
  Race.call(this, 'minerals', pos);

  this.raceMesh.position.set(1.51, 0.4, -0.41);
  this.emitter.setTranslation(this.raceMesh.position.x, this.raceMesh.position.y, this.raceMesh.position.z + 0.1);

  var mineral = new Mineral(this, 1, new THREE.Vector3(-0.55, 0.1, -0.2).add(this.raceMesh.position), 0.07);
  this.creaturesArr.push(mineral);
  this.add(mineral);

  mineral = new Mineral(this, 2, new THREE.Vector3(-0.3, 0, 0.3).add(this.raceMesh.position), 0.09);
  this.creaturesArr.push(mineral);
  this.add(mineral);

}

Minerals.prototype = Object.create(Race.prototype);

Minerals.prototype.addEmitter = function () {
  this.emitter = this.particleSystem.createParticleEmitter(new THREE.TextureLoader().load('textures/racesAnimParticles.png'));
  this.emitter.setState(THREE.AdditiveBlending);
  // Based on bouncersColor > 0x9f409b
  this.emitter.setColorRamp(
    [159 / 255, 64 / 255, 155 / 255, 0,
      159 / 255, 64 / 255, 155 / 255, 0.5,
      228 / 255, 166 / 255, 225 / 255, 0.1,
      228 / 255, 166 / 255, 225 / 255, 0.05,
      228 / 255, 166 / 255, 225 / 255, 0,
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
    positionRange: [0.6, 0, 0.5],
    opacity: 0,
  // rotationY: - Math.PI / 4,
  billboard: true});

  this.emitter.frustumCulled = false;
  this.add(this.emitter);
};
module.exports = Minerals;
