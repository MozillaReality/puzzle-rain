'use strict';

var THREE = require('three');

var Creature = require('../Creature');

function Bulrush (pos, scale) {
  Creature.call(this, 'bulrush', pos, scale);

  var geometry = new THREE.BoxBufferGeometry(1, 1, 3);
  var material = new THREE.MeshPhongMaterial({color: 0x39b620, shading: THREE.FlatShading});
  this.mesh = new THREE.Mesh(geometry, material);
  this.receiveShadow = true;
  this.castShadow = true;

  this.add(this.mesh);
}

Bulrush.prototype = Object.create(Creature.prototype);

module.exports = Bulrush;
