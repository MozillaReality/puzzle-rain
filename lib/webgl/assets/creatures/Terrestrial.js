'use strict';

var THREE = require('three');

var Creature = require('../Creature');

function Terrestrial (pos, scale) {
  Creature.call(this, 'terrestrial', pos, scale);
  var geometry = new THREE.BoxBufferGeometry(1, 1, 1);
  geometry.applyMatrix(new THREE.Matrix4().makeTranslation(0, 0.5, 0));
  var material = new THREE.MeshPhongMaterial({color: 0x123042, shading: THREE.FlatShading});
  this.mesh = new THREE.Mesh(geometry, material);
  this.mesh.receiveShadow = true;
  this.mesh.castShadow = true;

  this.add(this.mesh);
}

Terrestrial.prototype = Object.create(Creature.prototype);

module.exports = Terrestrial;
