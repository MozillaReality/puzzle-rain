'use strict';

var THREE = require('three');

var Creature = require('../Creature');

function Mineral (pos, scale) {
  Creature.call(this, 'mineral', pos, scale);

  var geometry = new THREE.CylinderBufferGeometry(1, 1, 3, 5);
  geometry.applyMatrix(new THREE.Matrix4().makeTranslation(0, 0.5, 0));
  var material = new THREE.MeshPhongMaterial({color: 0x352034, shading: THREE.FlatShading});
  this.mesh = new THREE.Mesh(geometry, material);
  this.mesh.receiveShadow = true;
  this.mesh.castShadow = true;

  this.add(this.mesh);
}

Mineral.prototype = Object.create(Creature.prototype);

module.exports = Mineral;
