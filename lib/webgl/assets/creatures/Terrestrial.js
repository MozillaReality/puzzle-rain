'use strict';

var THREE = require('three');
var State = require('../../../state/State');
var settings = require('../../../settings');

var Creature = require('../Creature');
var SeparationAndSeek = require('../../behaviours/SeparationAndSeek');

function Terrestrial (index, pos, scale) {
  Creature.call(this, 'terrestrial', index, pos, scale);

  this.limitZ = State.get('gameArea').height / 3;
  this.separationAndSeek = new SeparationAndSeek(this, 2);

  var geometry = new THREE.BoxBufferGeometry(1, 1, 1);
  geometry.applyMatrix(new THREE.Matrix4().makeTranslation(0, 0.5, 0));
  var material = new THREE.MeshStandardMaterial({color: settings.terrestrialsColor, transparent: true, opacity: 0.5, shading: THREE.FlatShading});
  this.mesh = new THREE.Mesh(geometry, material);
  this.mesh.name = 'terrestrial_' + index;
  this.mesh.receiveShadow = true;
  this.mesh.castShadow = true;

  this.add(this.mesh);

}

Terrestrial.prototype = Object.create(Creature.prototype);

Terrestrial.prototype.update = function (delta) {
  if (this.position.z < this.limitZ) {
    this.position.z = this.limitZ;
  }
};

module.exports = Terrestrial;
