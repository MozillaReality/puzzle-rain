'use strict';

var THREE = require('three');

var settings = require('../../../settings');

var Creature = require('../Creature');

function Bulrush (race, index, pos, scale, minHeight, maxHeight) {
  Creature.call(this, race, index, pos, scale, minHeight, maxHeight);

  // this.maxRandEmissive = 0.3 + Math.random() * 0.2;
  var geometry = new THREE.SphereBufferGeometry(1, 6, 2);
  this.originalColor = settings[this.race.name + 'Color'];
  var material = new THREE.MeshStandardMaterial({color: 0x39393c, roughness: 1, metalness: 0, emissive: this.originalColor, emissiveIntensity: 0, shading: THREE.FlatShading});
  this.bodyMesh = new THREE.Mesh(geometry, material);
  this.bodyMesh.name = 'bulrush_' + index;
  this.bodyMesh.receiveShadow = true;
  this.bodyMesh.castShadow = true;
  // this.bodyMesh.rotation.y = Math.PI / 2;

  this.eyes.position.set(0, 0.5, 0.2);
  this.mouth.position.set(0, 0.3, 0.51);
  this.body.add(this.bodyMesh);
}

Bulrush.prototype = Object.create(Creature.prototype);

Bulrush.prototype.update = function (delta, time) {
  Creature.prototype.update.call(this, delta, time);

  var userPos = new THREE.Vector3().setFromMatrixPosition(this.camera.matrixWorld).sub(this.parent.position);
  this.lookAt(new THREE.Vector3(userPos.x, 0, userPos.z));
// this.bodyMesh.material.emissiveIntensity = THREE.Math.mapLinear(this.race.track.averageAnalyser * this.race.awake.awakeLevel, 0, 100, 0, this.maxRandEmissive);
};

module.exports = Bulrush;
