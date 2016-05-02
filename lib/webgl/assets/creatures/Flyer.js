'use strict';

var THREE = require('three');
var Events = require('../../../events/Events');
var State = require('../../../state/State');
var settings = require('../../../settings');

var Creature = require('../Creature');
var SeparationAndSeek = require('../../behaviours/SeparationAndSeek');

var heightLimit = 1.5;

function Flyer (raceObj, index, pos, scale) {
  Creature.call(this, raceObj, index, pos, scale);

  var geometry = new THREE.IcosahedronGeometry(1, 0);
  geometry.applyMatrix(new THREE.Matrix4().makeTranslation(0, 0.5, 0));
  this.originalColor = settings.flyersColor;
  var material = new THREE.MeshStandardMaterial({color: this.originalColor, shading: THREE.FlatShading});
  this.mesh = new THREE.Mesh(geometry, material);
  this.mesh.name = 'flyer_' + index;
  this.mesh.receiveShadow = true;
  this.mesh.castShadow = true;

  this.add(this.mesh);

  Events.on('gamepadRAdded', this.gamepadRAdded.bind(this));
}

Flyer.prototype = Object.create(Creature.prototype);

Flyer.prototype.gamepadRAdded = function () {
  this.godToFollow = State.get('gamepadR');
  this.separationAndSeek = new SeparationAndSeek(this, 3, this.godToFollow);
};

Flyer.prototype.update = function (delta) {
  if (this.godToFollow) {
    var godPos = new THREE.Vector3().setFromMatrixPosition(this.godToFollow.matrixWorld);
    this.lookAt(new THREE.Vector3(godPos.x, godPos.y, godPos.z));
  }
  var posYabs = this.position.y + this.parent.position.y;
  if (posYabs < heightLimit) {
    this.position.y = heightLimit - this.parent.position.y;
  }
};

module.exports = Flyer;
