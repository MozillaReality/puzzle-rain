'use strict';

var THREE = require('three');

var Creature = require('../Creature');

function Mineral (pos, scale) {
  Creature.call(this, 'mineral', pos, scale);

  var geometry = new THREE.CylinderBufferGeometry(1, 1, 3, 5);
  var material = new THREE.MeshPhongMaterial({color: 0x352034, shading: THREE.FlatShading});
  this.mesh = new THREE.Mesh(geometry, material);
  this.receiveShadow = true;
  this.castShadow = true;

  this.add(this.mesh);
}

Mineral.prototype = Object.create(Creature.prototype);

module.exports = Mineral;
