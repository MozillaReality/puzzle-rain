'use strict';

var THREE = require('three');

var Creature = require('../Creature');

function Flyer (pos, scale) {
  Creature.call(this, 'flyer', pos, scale);

  var geometry = new THREE.IcosahedronGeometry(1, 0);
  var material = new THREE.MeshPhongMaterial({color: 0xC9CC1E, shading: THREE.FlatShading});
  this.mesh = new THREE.Mesh(geometry, material);
  this.receiveShadow = true;
  this.castShadow = true;

  this.add(this.mesh);
}

Flyer.prototype = Object.create(Creature.prototype);

module.exports = Flyer;
