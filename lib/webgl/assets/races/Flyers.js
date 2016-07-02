'use strict';

var THREE = require('three');

var settings = require('../../../settings');
var State = require('../../../state/State');

var Race = require('../Race');
var Flyer = require('../creatures/Flyer');

var MiniFlyer = require('../MiniFlyer');

var separationX = 0.1;
var separationZ = 0.1;

function Flyers () {
  Race.call(this, 'flyers');
  this.raceMesh.position.set(0.997, 0.1, 1.038);

  var flyer = new Flyer(this, 1, new THREE.Vector3(-0.1, 0.2, -0.3).add(this.raceMesh.position), 0.05);
  this.creaturesArr.push(flyer);
  this.add(flyer);

  this.miniFlyers = [];
  for (var i = 0;i < 12;i++) {
    var miniFlyer = new MiniFlyer(flyer);
    this.miniFlyers.push(miniFlyer);
    this.add(miniFlyer);
  }
}

Flyers.prototype = Object.create(Race.prototype);

Flyers.prototype.addEmitter = function () {
  this.emitter = this.particleSystem.createParticleEmitter(new THREE.TextureLoader().load('textures/racesAnimParticles.png'));
  this.emitter.setTranslation(0.1, 0, 0.1);
  this.emitter.setState(THREE.AdditiveBlending);
  // Based on bouncersColor > 0xC9CC1E
  this.emitter.setColorRamp(
    [201 / 255, 204 / 255, 30 / 255, 0,
      201 / 255, 204 / 255, 30 / 255, 0.5,
      237 / 255, 238 / 255, 125 / 255, 0.1,
      237 / 255, 238 / 255, 125 / 255, 0.05,
      237 / 255, 238 / 255, 125 / 255, 0,
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
    positionRange: [0.4, 0, 0.2],
    opacity: 0,
  // rotationY: - Math.PI / 4,
  billboard: true});

  this.emitter.frustumCulled = false;
  this.add(this.emitter);
};

module.exports = Flyers;
