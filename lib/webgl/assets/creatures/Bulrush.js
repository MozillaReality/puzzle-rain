'use strict';

var THREE = require('three');

var settings = require('../../../settings');

var Creature = require('../Creature');

function Bulrush (index, pos, scale) {
  Creature.call(this, 'bulrush', index, pos, scale);

  var geometry = new THREE.BoxBufferGeometry(1, 5, 1);
  geometry.applyMatrix(new THREE.Matrix4().makeTranslation(0, 2.5, 0));
  var material = new THREE.MeshStandardMaterial({color: settings.bulrushesColor,transparent: true, opacity: 0.5,shading: THREE.FlatShading});
  this.mesh = new THREE.Mesh(geometry, material);
  this.mesh.name = 'bulrush_' + index;
  this.mesh.receiveShadow = true;
  this.mesh.castShadow = true;

  this.add(this.mesh);
}

Bulrush.prototype = Object.create(Creature.prototype);

module.exports = Bulrush;
