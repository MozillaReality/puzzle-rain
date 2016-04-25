'use strict';

var THREE = require('three');

var Creature = require('../Creature');
function Bouncer (pos, scale) {
  Creature.call(this, 'bouncer', pos, scale);

  var geometry = new THREE.SphereBufferGeometry(0.5, 8, 8);
  geometry.applyMatrix(new THREE.Matrix4().makeTranslation(0, 0.5, 0));
  var material = new THREE.MeshPhongMaterial({color: 0x9E3F36, shading: THREE.FlatShading});
  this.mesh = new THREE.Mesh(geometry, material);
  this.mesh.receiveShadow = true;
  this.mesh.castShadow = true;

  this.add(this.mesh);
}

Bouncer.prototype = Object.create(Creature.prototype);

module.exports = Bouncer;
