'use strict';

var THREE = require('three');
var settings = require('../../../settings');

var Creature = require('../Creature');

function Flyer (pos, scale) {
  Creature.call(this, 'flyer', pos, scale);

  var geometry = new THREE.IcosahedronGeometry(1, 0);
  geometry.applyMatrix(new THREE.Matrix4().makeTranslation(0, 0.5, 0));
  var material = new THREE.MeshStandardMaterial({color: settings.flyersColor, shading: THREE.FlatShading});
  this.mesh = new THREE.Mesh(geometry, material);
  this.mesh.receiveShadow = true;
  this.mesh.castShadow = true;

  this.add(this.mesh);
}

Flyer.prototype = Object.create(Creature.prototype);

module.exports = Flyer;
