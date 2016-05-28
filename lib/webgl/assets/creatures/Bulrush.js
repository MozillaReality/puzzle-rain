'use strict';

var THREE = require('three');

var settings = require('../../../settings');

var Creature = require('../Creature');

function Bulrush (raceObj, index, pos, scale, minHeight, maxHeight) {
  Creature.call(this, raceObj, index, pos, scale, minHeight, maxHeight);

  // this.maxRandEmissive = 0.3 + Math.random() * 0.2;
  var geometry = new THREE.SphereBufferGeometry(1, 6, 2);
  this.originalColor = settings[this.raceObj.race + 'Color'];
  var material = new THREE.MeshStandardMaterial({color: 0x39393c, roughness: 1, metalness: 0, emissive: this.originalColor, emissiveIntensity: 0, shading: THREE.FlatShading});
  this.mesh = new THREE.Mesh(geometry, material);
  this.mesh.name = 'bulrush_' + index;
  this.mesh.receiveShadow = true;
  this.mesh.castShadow = true;
  // this.mesh.rotation.y = Math.PI / 2;

  this.eyes.position.set(0, 0.5, 0.2);
  this.mouth.position.set(0, 0.3, 0.51);
  this.body.add(this.mesh);
}

Bulrush.prototype = Object.create(Creature.prototype);

Bulrush.prototype.update = function (delta, time) {
  Creature.prototype.update.call(this, delta, time);

  var userPos = new THREE.Vector3().setFromMatrixPosition(this.camera.matrixWorld).sub(this.parent.position);
  this.lookAt(new THREE.Vector3(userPos.x, 0, userPos.z));
// this.mesh.material.emissiveIntensity = THREE.Math.mapLinear(this.raceObj.track.averageAnalyser * this.raceObj.awake.awakeLevel, 0, 100, 0, this.maxRandEmissive);
};

module.exports = Bulrush;
