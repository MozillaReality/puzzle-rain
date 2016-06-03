'use strict';

var THREE = require('three');

var settings = require('../../../settings');

var Race = require('../Race');
var Bulrush = require('../creatures/Bulrush');

function Bulrushes (pos) {
  Race.call(this, 'bulrushes', pos);

  this.raceMesh.position.set(-0.05, -0.2, -0.035);

  var bulrush = new Bulrush(this, 1, new THREE.Vector3(0, 0, 0.2), 0.11, 0.2, 2.3);
  this.creaturesArr.push(bulrush);
  this.add(bulrush);
  bulrush = new Bulrush(this, 2, new THREE.Vector3(0.1, 0.2, -0.2), 0.08, 0.3, 2.3);
  this.creaturesArr.push(bulrush);
  this.add(bulrush);
}

Bulrushes.prototype = Object.create(Race.prototype);

Bulrushes.prototype.addEmitter = function () {
  this.emitter = this.particleSystem.createParticleEmitter(new THREE.TextureLoader().load('textures/racesAnimParticles.png'));
  this.emitter.setTranslation(0, 0, 0);
  this.emitter.setState(THREE.AdditiveBlending);
  this.emitter.setColorRamp(
    [57 / 255, 182 / 255, 32 / 255, 0.5,
      151 / 255, 224 / 255, 136 / 255, 0.1,
      151 / 255, 224 / 255, 136 / 255, 0.05,
      151 / 255, 224 / 255, 136 / 255, 0,
      0, 0, 0, 0]);
  this.emitter.setParameters({
    numParticles: 100,
    numFrames: 8,
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
    positionRange: [0.2, 0, 0.65],
    opacity: 0,
    billboard: true,
  // orientation: partQuaternion,
  rotationY: - Math.PI / 4});
  this.emitter.frustumCulled = false;
  this.add(this.emitter);
};
module.exports = Bulrushes;
