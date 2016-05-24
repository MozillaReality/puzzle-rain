'use strict';

var THREE = require('three');
var settings = require('../../../settings');

var Creature = require('../Creature');

function Mineral (raceObj, index, pos, scale) {
  Creature.call(this, raceObj, index, pos, scale);

  var geometry = new THREE.CylinderBufferGeometry(1, 1, 10, 6);
  geometry.translate(0, 5, 0);
  this.originalColor = settings.mineralsColor;
  var material = new THREE.MeshStandardMaterial({color: this.originalColor, roughness: 0.5, metalness: 0.5, shading: THREE.FlatShading});
  this.mesh = new THREE.Mesh(geometry, material);
  this.mesh.name = 'mineral_' + index;
  this.mesh.receiveShadow = true;
  this.mesh.castShadow = true;
  this.mesh.rotation.y = - Math.PI / 2;
  this.rotation.y = - Math.PI / 2;

  this.eyes.position.set(0, 10, 0.45);
  this.mouth.position.set(0, 9.8, 0.90);
  this.body.add(this.mesh);
}

Mineral.prototype = Object.create(Creature.prototype);

module.exports = Mineral;
