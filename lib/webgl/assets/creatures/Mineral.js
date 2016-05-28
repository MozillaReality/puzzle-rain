'use strict';

var THREE = require('three');

var settings = require('../../../settings');

var Creature = require('../Creature');

function Mineral (race, index, pos, scale, minHeight, maxHeight) {
  Creature.call(this, race, index, pos, scale, minHeight, maxHeight);

  var geometry = new THREE.CylinderBufferGeometry(1, 1, 1, 6);
  var material = new THREE.MeshStandardMaterial({color: this.originalColor, roughness: 0.5, metalness: 0.5, shading: THREE.FlatShading});
  this.bodyMesh = new THREE.Mesh(geometry, material);
  this.bodyMesh.name = 'mineral_' + index;
  this.bodyMesh.receiveShadow = true;
  this.bodyMesh.castShadow = true;
  // this.bodyMesh.rotation.y = - Math.PI / 2;
  // this.rotation.y = - Math.PI / 2;

  this.eyes.position.set(0, 0.5, 0.45);
  this.mouth.position.set(0, 0.8, 0.90);
  this.body.add(this.bodyMesh);
}

Mineral.prototype = Object.create(Creature.prototype);

module.exports = Mineral;
