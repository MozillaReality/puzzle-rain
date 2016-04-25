'use strict';

var THREE = require('three');

var Creature = require('../Creature');

function Bulrush (pos, scale) {
  Creature.call(this, 'bulrush', pos, scale);

  var geometry = new THREE.BoxBufferGeometry(1, 5, 1);
  geometry.applyMatrix(new THREE.Matrix4().makeTranslation(0, 2.5, 0));
  var material = new THREE.MeshPhongMaterial({color: 0x39b620, shading: THREE.FlatShading});
  this.mesh = new THREE.Mesh(geometry, material);
  this.mesh.receiveShadow = true;
  this.mesh.castShadow = true;

  this.add(this.mesh);
}

Bulrush.prototype = Object.create(Creature.prototype);

module.exports = Bulrush;
