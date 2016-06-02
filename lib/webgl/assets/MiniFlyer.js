'use strict';

var THREE = require('three');
var TWEEN = require('tween.js');

var Events = require('../../events/Events');
var State = require('../../state/State');

var SeparationAndSeek = require('../behaviours/SeparationAndSeek');

var track;
var idAudio = 'base';

function MiniFlyer (obj) {
  THREE.Object3D.call(this);

  this.isEnding = false;

  this.creature = obj;
  this.maxRandEmissive = 1 + Math.random() * 0.5;

  this.sepAndSeek = new SeparationAndSeek(this, 3, this.creature, 0.1, this.creature.race.miniFlyers);

  var geometry = new THREE.OctahedronGeometry(0.01, 0);
  var material = new THREE.MeshStandardMaterial({color: 0x2e2d38, roughness: 1, metalness: 0.5,
    emissive: this.creature.originalColor, emissiveIntensity: 0.5, shading: THREE.FlatShading,
  transparent: true, opacity: 0});
  this.mesh = new THREE.Mesh(geometry, material);
  this.add(this.mesh);
  var creatureAbsPos = this.creature.position;
  this.position.set(creatureAbsPos.x, creatureAbsPos.y, creatureAbsPos.z);

  Events.on('raceStatusChanged', this.raceStatusChanged.bind(this));
  Events.on('updateScene', this.update.bind(this));
  Events.on('onEnding', this.onEnding.bind(this));
}

MiniFlyer.prototype = Object.create(THREE.Object3D.prototype);

MiniFlyer.prototype.raceStatusChanged = function (race, status) {
  if (this.creature.race === race) {
    if (status === 'awake') {
      this.show();
    } else {
      this.hide();
    }
  }
};

MiniFlyer.prototype.onEnding = function () {
  this.isEnding = true;
  this.hide();
};

MiniFlyer.prototype.show = function () {
  var creatureAbsPos = this.creature.position;
  this.position.set(creatureAbsPos.x + Math.random() - 0.5, creatureAbsPos.y + Math.random() * 2 - 1, creatureAbsPos.z + Math.random() - 0.5);
  new TWEEN.Tween(this.mesh.material).to({
    opacity: 1
  }, 2000)
    .easing(TWEEN.Easing.Cubic.Out)
    .start();
};

MiniFlyer.prototype.hide = function () {
  new TWEEN.Tween(this.mesh.material).to({
    opacity: 0
  }, 1000)
    .easing(TWEEN.Easing.Cubic.In)
    .start();
};

MiniFlyer.prototype.update = function (delta, time) {
  if (this.isEnding) {
    return;
  }
  if (this.creature.race.status === 'awake') {
    var valTmp = THREE.Math.mapLinear(this.creature.track.averageAnalyser * this.creature.race.awake.awakeLevel, 10, 90, 0, this.maxRandEmissive);
    this.mesh.material.emissiveIntensity = valTmp;
  }
};

module.exports = MiniFlyer;
