'use strict';

var THREE = require('three');

var settings = require('../../../settings');

var Creature = require('../Creature');

function Bulrush (raceObj, group, index, pos, scale) {
  Creature.call(this, raceObj, group, index, pos, scale);

  this.maxRandEmissive = 0.1 + Math.random() * 0.2;
  var geometry = new THREE.BoxBufferGeometry(1, 5, 1);
  geometry.applyMatrix(new THREE.Matrix4().makeTranslation(0, 2.5, 0));
  this.originalColor = settings.bulrushesColor;
  // var material = new THREE.MeshStandardMaterial({color: this.originalColor, roughness: 1, metalness: 0.5, shading: THREE.FlatShading});
  var material = new THREE.MeshStandardMaterial({color: 0x444444, emissive: this.originalColor, emissiveIntensity: 0, shading: THREE.FlatShading});
  this.mesh = new THREE.Mesh(geometry, material);
  this.mesh.name = 'bulrush_' + index;
  this.mesh.receiveShadow = true;
  this.mesh.castShadow = true;
  this.mesh.rotation.y = Math.PI / 2;

  this.eyes.position.set(0, 5, 0.2);
  this.mouth.position.set(0, 4.8, 0.51);
  this.body.add(this.mesh);
}

Bulrush.prototype = Object.create(Creature.prototype);

Bulrush.prototype.update = function (delta, time) {
  Creature.prototype.update.call(this, delta, time);
  // var userPos = new THREE.Vector3().setFromMatrixPosition(this.raceObj.arrive.matrixWorld).sub(this.parent.position);
  var userPos = new THREE.Vector3().setFromMatrixPosition(this.camera.matrixWorld).sub(this.parent.position);
  this.lookAt(new THREE.Vector3(userPos.x, 0, userPos.z));
  this.mesh.material.emissiveIntensity = THREE.Math.mapLinear(this.raceObj.track.averageAnalyser * this.raceObj.awake.awakeLevel, 0, 100, 0, this.maxRandEmissive);
};

module.exports = Bulrush;
