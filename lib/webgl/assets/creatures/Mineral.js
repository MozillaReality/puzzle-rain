'use strict';

var THREE = require('three');

var settings = require('../../../settings');
var State = require('../../../state/State');

var Creature = require('../Creature');

function Mineral (race, index, pos, scale, minHeight, maxHeight) {
  Creature.call(this, race, index, pos, scale, minHeight, maxHeight);

  var geometry = new THREE.CylinderBufferGeometry(0.75, 0.75, 1, 6);
  var material = new THREE.MeshStandardMaterial({color: 0x2e2d38, roughness: 0.5, metalness: 0.5, emissive: this.originalColor, emissiveIntensity: 0, shading: THREE.FlatShading, transparent: true});
  this.bodyMesh = new THREE.Mesh(geometry, material);
  this.bodyMesh.name = 'mineral_' + index;
  this.bodyMesh.receiveShadow = true;
  this.bodyMesh.castShadow = true;
  this.bodyMesh.rotation.y = - Math.PI / 2;
  // this.rotation.y = - Math.PI / 2;

  this.eyes.position.set(0, 0.5, 0.33);
  this.mouth.position.set(0, 0.15, 0.75);
  this.body.add(this.bodyMesh);

  this.init();
}

Mineral.prototype = Object.create(Creature.prototype);

module.exports = Mineral;
