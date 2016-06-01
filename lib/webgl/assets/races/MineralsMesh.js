'use strict';

var THREE = require('three');

var Events = require('../../../events/Events');

var BlendCharacter = require('../../animation/BlendCharacter');

function MineralsMesh (obj) {
  THREE.Object3D.call(this);

  this.raceObj = obj;

  this.clampedIntensity = 0;

  this.mesh = new THREE.BlendCharacter();
  var self = this;
  this.mesh.load('models/races/minerals.json', function () {
    self.mesh.castShadow = true;
    self.mesh.receiveShadow = true;
    self.mesh.material = new THREE.MeshStandardMaterial({
      color: 0x2e2d38,
      roughness: 1,
      metalness: 0,
      emissive: new THREE.Color(0x352034),
      emissiveIntensity: 0,
      shading: THREE.FlatShading,
      transparent: true,
      skinning: true
    });

    self.add(self.mesh);
    Events.on('updateScene', self.update.bind(self));
    self.mesh.play('idle', 1);
    self.mesh.play('awake', 0);
  });
}

MineralsMesh.prototype = Object.create(THREE.Object3D.prototype);

MineralsMesh.prototype.update = function (delta) {
  var mappedIntensity = THREE.Math.mapLinear(this.raceObj.track.averageAnalyser * this.raceObj.track.getVolume(), 0, 100, 0, 1);
  this.clampedIntensity = THREE.Math.clamp(mappedIntensity, 0, 1);
  this.scale.y = 1 + this.clampedIntensity / 3;
  this.mesh.material.emissiveIntensity = this.clampedIntensity * 0.3;

  this.mesh.applyWeight('idle', 1 - this.clampedIntensity);
  this.mesh.applyWeight('awake', this.clampedIntensity);
  if (this.clampedIntensity < 0.3) {
    // Slow idle animation
    this.mesh.update(delta * 0.2);
  } else {
    this.mesh.update(delta);
  }
};

module.exports = MineralsMesh;
