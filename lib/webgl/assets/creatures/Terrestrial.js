'use strict';

var THREE = require('three');

var Creature = require('../Creature');

function Terrestrial (pos, scale) {
  Creature.call(this, 'terrestrial', pos, scale);

  var geometry = new THREE.BoxBufferGeometry(1, 1, 1);
  var material = new THREE.MeshPhongMaterial({color: 0x123042, shading: THREE.FlatShading});
  this.mesh = new THREE.Mesh(geometry, material);
  this.receiveShadow = true;
  this.castShadow = true;

  this.add(this.mesh);
}

Terrestrial.prototype = Object.create(Creature.prototype);

module.exports = Terrestrial;
