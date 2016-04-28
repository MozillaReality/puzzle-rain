'use strict';

var THREE = require('three');
var settings = require('../../../settings');

var Creature = require('../Creature');

function Terrestrial (index, pos, scale) {
  Creature.call(this, 'terrestrial', index, pos, scale);
  var geometry = new THREE.BoxBufferGeometry(1, 1, 1);
  geometry.applyMatrix(new THREE.Matrix4().makeTranslation(0, 0.5, 0));
  var material = new THREE.MeshStandardMaterial({color: settings.terrestrialsColor, transparent: true, opacity: 0.5, shading: THREE.FlatShading});
  this.mesh = new THREE.Mesh(geometry, material);
  this.mesh.name = 'terrestrial_' + i;
  this.mesh.receiveShadow = true;
  this.mesh.castShadow = true;

  this.add(this.mesh);
}

Terrestrial.prototype = Object.create(Creature.prototype);

module.exports = Terrestrial;
