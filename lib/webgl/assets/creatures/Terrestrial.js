'use strict';

var THREE = require('three');
var State = require('../../../state/State');
var settings = require('../../../settings');

var Creature = require('../Creature');

function Terrestrial (raceObj, index, pos, scale) {
  Creature.call(this, raceObj, index, pos, scale);

  var geometry = new THREE.BoxBufferGeometry(1, 1, 1);
  geometry.applyMatrix(new THREE.Matrix4().makeTranslation(0, 0.5, 0));
  this.originalColor = settings.terrestrialsColor;
  var material = new THREE.MeshStandardMaterial({color: this.originalColor, roughness: 1, metalness: 0.5, shading: THREE.FlatShading});
  this.mesh = new THREE.Mesh(geometry, material);
  this.mesh.name = 'terrestrial_' + index;
  this.mesh.receiveShadow = true;
  this.mesh.castShadow = true;

  this.eyes.position.set(0, 1, 0.3);
  this.mouth.position.set(0, 0.8, 0.51);
  this.body.add(this.mesh);

}

Terrestrial.prototype = Object.create(Creature.prototype);

Terrestrial.prototype.update = function (delta) {
  var userPos = new THREE.Vector3().setFromMatrixPosition(this.parent.arrive.matrixWorld).sub(this.parent.position);

  this.lookAt(new THREE.Vector3(userPos.x, 0, userPos.z));

};

module.exports = Terrestrial;
