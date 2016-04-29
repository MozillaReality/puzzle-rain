'use strict';

var THREE = require('three');
var State = require('../../../state/State');
var settings = require('../../../settings');

var Creature = require('../Creature');
var SeparationAndSeek = require('../../behaviours/SeparationAndSeek');

function Terrestrial (index, pos, scale) {
  Creature.call(this, 'terrestrial', index, pos, scale);

  this.camera = State.get('camera');

  this.limitZ = State.get('gameArea').height / 3;
  this.separationAndSeek = new SeparationAndSeek(this, 2);

  var geometry = new THREE.BoxBufferGeometry(1, 1, 1);
  geometry.applyMatrix(new THREE.Matrix4().makeTranslation(0, 0.5, 0));
  this.originalColor = settings.terrestrialsColor;
  var material = new THREE.MeshStandardMaterial({color: this.originalColor, transparent: true, opacity: 0.5, shading: THREE.FlatShading});
  this.mesh = new THREE.Mesh(geometry, material);
  this.mesh.name = 'terrestrial_' + index;
  this.mesh.receiveShadow = true;
  this.mesh.castShadow = true;

  this.add(this.mesh);

}

Terrestrial.prototype = Object.create(Creature.prototype);

Terrestrial.prototype.update = function (delta) {
  this.lookAt(new THREE.Vector3(this.camera.position.x, 0, this.camera.position.z));
  var posZabs = this.position.z + this.parent.position.z;
  if (posZabs < this.limitZ) {
    this.position.z = this.limitZ - this.parent.position.z;
  }
};

module.exports = Terrestrial;
