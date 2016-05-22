'use strict';

var THREE = require('three');
var State = require('../../../state/State');
var settings = require('../../../settings');

var Creature = require('../Creature');
var SeparationAndSeek = require('../../behaviours/SeparationAndSeek');
function Terrestrial (raceObj, index, pos, scale) {
  Creature.call(this, raceObj, index, pos, scale);

  this.limitZ = State.get('gameArea').height / 3;
  this.separationAndSeek = new SeparationAndSeek(this, 2, raceObj.arrive);

  var geometry = new THREE.BoxBufferGeometry(1, 1, 1);
  geometry.applyMatrix(new THREE.Matrix4().makeTranslation(0, 0.5, 0));
  this.originalColor = settings.terrestrialsColor;
  var material = new THREE.MeshStandardMaterial({color: this.originalColor, roughness: 1, metalness: 0.5, shading: THREE.FlatShading});
  this.mesh = new THREE.Mesh(geometry, material);
  this.mesh.name = 'terrestrial_' + index;
  this.mesh.receiveShadow = true;
  this.mesh.castShadow = true;

  this.eyes.position.set(0, 1, 0.3);
  this.body.add(this.mesh);

}

Terrestrial.prototype = Object.create(Creature.prototype);

Terrestrial.prototype.update = function (delta) {
  var userPos = new THREE.Vector3().setFromMatrixPosition(this.parent.arrive.matrixWorld).sub(this.parent.position);

  this.lookAt(new THREE.Vector3(userPos.x, 0, userPos.z));
  var posZabs = this.position.z + this.parent.position.z;
  if (posZabs < this.limitZ) {
    this.position.z = this.limitZ - this.parent.position.z;
  }
};

module.exports = Terrestrial;
