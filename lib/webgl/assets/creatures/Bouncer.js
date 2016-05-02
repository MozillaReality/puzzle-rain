'use strict';

var THREE = require('three');
var settings = require('../../../settings');

var Creature = require('../Creature');
function Bouncer (raceObj, index, pos, scale) {
  Creature.call(this, raceObj, index, pos, scale);

  var geometry = new THREE.SphereBufferGeometry(0.5, 8, 8);
  geometry.applyMatrix(new THREE.Matrix4().makeTranslation(0, 0.5, 0));
  this.originalColor = settings.bouncersColor;
  var material = new THREE.MeshStandardMaterial({color: this.originalColor, transparent: true, opacity: 0.5,shading: THREE.FlatShading});
  this.mesh = new THREE.Mesh(geometry, material);
  this.mesh.name = 'bouncer_' + index;
  this.mesh.receiveShadow = true;
  this.mesh.castShadow = true;

  this.add(this.mesh);
}

Bouncer.prototype = Object.create(Creature.prototype);

module.exports = Bouncer;
