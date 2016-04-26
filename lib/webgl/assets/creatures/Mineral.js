'use strict';

var THREE = require('three');
var settings = require('../../../settings');

var Creature = require('../Creature');

function Mineral (pos, scale) {
  Creature.call(this, 'mineral', pos, scale);

  var geometry = new THREE.CylinderBufferGeometry(1, 1, 5, 5);
  geometry.applyMatrix(new THREE.Matrix4().makeTranslation(0, 2.5, 0));
  var material = new THREE.MeshStandardMaterial({color: settings.mineralsColor,transparent: true, opacity: 0.5, shading: THREE.FlatShading});
  this.mesh = new THREE.Mesh(geometry, material);
  this.mesh.receiveShadow = true;
  this.mesh.castShadow = true;

  this.add(this.mesh);
}

Mineral.prototype = Object.create(Creature.prototype);

module.exports = Mineral;
