'use strict';

var THREE = require('three');

var settings = require('../../../settings');

var Race = require('../Race');
var Bouncer = require('../creatures/Bouncer');

function Bouncers () {
  Race.call(this, 'bouncers');

  this.raceMesh.position.set(0.184, 0, -1.278);

  bouncer = new Bouncer(this, 1, new THREE.Vector3(-0.4, 0.25, -0.1).add(this.raceMesh.position), 0.05);
  this.creaturesArr.push(bouncer);
  this.add(bouncer);
  var bouncer = new Bouncer(this, 3, new THREE.Vector3(-0.1, 0.2, -0.15).add(this.raceMesh.position), 0.1);
  this.creaturesArr.push(bouncer);
  this.add(bouncer);
  bouncer = new Bouncer(this, 2, new THREE.Vector3(0.2, 0.25, -0.2).add(this.raceMesh.position), 0.08);
  this.creaturesArr.push(bouncer);
  this.add(bouncer);
  bouncer = new Bouncer(this, 4, new THREE.Vector3(0.4, 0.15, -0.1).add(this.raceMesh.position), 0.065);
  this.creaturesArr.push(bouncer);
  this.add(bouncer);

}

Bouncers.prototype = Object.create(Race.prototype);

Bouncers.prototype.addEmitter = function () {
  this.emitter = this.particleSystem.createParticleEmitter(new THREE.TextureLoader().load('textures/racesAnimParticles.png'));
  this.emitter.setTranslation(0, 0, -0.5);
  this.emitter.setState(THREE.AdditiveBlending);
  // Based on bouncersColor > 0x9E3F36
  this.emitter.setColorRamp(
    [158 / 255, 63 / 255, 54 / 255, 0,
      158 / 255, 63 / 255, 54 / 255, 0.5,
      234 / 255, 168 / 255, 162 / 255, 0.1,
      234 / 255, 168 / 255, 162 / 255, 0.05,
      234 / 255, 168 / 255, 162 / 255, 0,
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
    positionRange: [0.6, 0, 0.3],
    opacity: 0,
  // rotationY: - Math.PI / 4,
  billboard: true});

  this.emitter.frustumCulled = false;
  this.add(this.emitter);
};

module.exports = Bouncers;
