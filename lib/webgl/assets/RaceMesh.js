'use strict';

var THREE = require('three');
var TWEEN = require('tween.js');

var Events = require('../../events/Events');
var settings = require('../../settings');

var BlendCharacter = require('../animation/BlendCharacter');

function RaceMesh (obj) {
  THREE.Object3D.call(this);

  this.race = obj;

  this.clampedIntensity = 0;

  this.isEnding = false;

  this.mesh = new THREE.BlendCharacter();
  var self = this;
  this.mesh.load('models/races/' + this.race.name + '.json', function () {
    self.mesh.castShadow = true;
    self.mesh.receiveShadow = true;
    self.mesh.material = new THREE.MeshStandardMaterial({
      color: 0x2e2d38,
      roughness: 1,
      metalness: 0,
      emissive: new THREE.Color(settings[self.race.name + 'Color']),
      emissiveIntensity: 0,
      shading: THREE.FlatShading,
      transparent: true,
      skinning: true
    });

    self.add(self.mesh);
    Events.on('updateScene', self.update.bind(self));
    Events.on('raceStatusChanged', self.raceStatusChanged.bind(self));
    Events.on('onEnding', self.onEnding.bind(self));
    self.mesh.play('idle', 1);
    self.mesh.play('awake', 0);
  });
}

RaceMesh.prototype = Object.create(THREE.Object3D.prototype);

RaceMesh.prototype.update = function (delta, time) {
  if (this.isEnding) {
    this.mesh.update(delta);
    // this.updateAtEnding(delta, time);
    return;
  }
  var mappedIntensity = THREE.Math.mapLinear(this.race.track.averageAnalyser * this.race.track.getVolume(), 0, 100, 0, 1);
  this.clampedIntensity = THREE.Math.clamp(mappedIntensity, 0, 1);
  this.scale.y = 1 + this.clampedIntensity / 3;
  this.mesh.material.emissiveIntensity = this.clampedIntensity * 0.3;

  if (this.race.status === 'asleep') {
    // Slow idle animation
    this.mesh.applyWeight('idle', 1 - this.clampedIntensity);
    this.mesh.applyWeight('awake', this.clampedIntensity);
    this.mesh.update(delta * 0.2);
  } else {
    this.mesh.update(delta);
  }
};

RaceMesh.prototype.raceStatusChanged = function (race, status) {
  if (this.race === race && status === 'awake') {
    this.adjustWeight = this.clampedIntensity;
    new TWEEN.Tween(this).to({
      adjustWeight: 1
    }, 2000)
      .onUpdate(function () {
        this.updateWeight();
      })
      .start();
  }
};

RaceMesh.prototype.updateWeight = function () {
  console.log(this.adjustWeight);
  this.mesh.applyWeight('idle', 1 - this.adjustWeight);
  this.mesh.applyWeight('awake', this.adjustWeight);
};

RaceMesh.prototype.onEnding = function () {
  this.isEnding = true;
  new TWEEN.Tween(this.mesh.material).to({
    emissiveIntensity: 1
  }, 15000)
    .start();
  new TWEEN.Tween(this.mesh.material).to({
    opacity: 0.5
  }, 10000)
    .start();
  this.mesh.applyWeight('idle', 0);
  this.mesh.applyWeight('awake', 1);
};

RaceMesh.prototype.updateAtEnding = function (delta, time) {};

module.exports = RaceMesh;
