'use strict';

var THREE = require('three');

var Creature = require('../Creature');
function Bouncer (pos, scale) {
  Creature.call(this, 'bouncer', pos, scale);

  var geometry = new THREE.SphereBufferGeometry(1, 8, 8);
  var material = new THREE.MeshPhongMaterial({color: 0x9E3F36, shading: THREE.FlatShading});
  this.mesh = new THREE.Mesh(geometry, material);
  this.receiveShadow = true;
  this.castShadow = true;

  this.add(this.mesh);
}

Bouncer.prototype = Object.create(Creature.prototype);

module.exports = Bouncer;
