'use strict';

var THREE = require('three');
var TWEEN = require('tween.js');

var Events = require('../../events/Events');
var State = require('../../state/State');
var settings = require('../../settings');

var GameplayManager = require('../../managers/GameplayManager');

function TimeRing () {
  THREE.Object3D.call(this);

  this.active = true;

  this.ringSides = 32;
  this.ringIndex = 32;
  var geometryCircleLine = new THREE.CircleGeometry(0.7, this.ringSides, Math.PI, Math.PI * 2);
  // Remove center vertex
  geometryCircleLine.vertices.shift();
  geometryCircleLine.computeLineDistances();
  var materialCircleLine = new THREE.LineDashedMaterial({
    color: 0xffffff,
  dashSize: 0.02, gapSize: 0.05, transparent: true, opacity: 0.2, depthWrite: false});
  materialCircleLine.linewidth = 2;

  this.ring = new THREE.Line(geometryCircleLine, materialCircleLine);
  this.ring.rotation.x = -Math.PI / 2;
  this.ring.position.y = 0.2;

  this.ring.doubleSided = true;
  this.ring.frustumCulled = false;
  this.add(this.ring);

  var geometrySolidCircleLine = new THREE.CircleGeometry(0.69, this.ringSides, Math.PI, Math.PI * 2);
  geometrySolidCircleLine.vertices.shift();
  var materialSolidCircleLine = new THREE.LineDashedMaterial({
    color: 0xffffff,
  dashSize: 0.02, gapSize: 0.05, transparent: true, opacity: 0.2, depthWrite: false});
  materialCircleLine.linewidth = 2;
  this.ringSolid = new THREE.Line(geometrySolidCircleLine, materialSolidCircleLine);

  this.ringSolid.doubleSided = true;
  this.ringSolid.frustumCulled = false;
  this.add(this.ringSolid);
  this.ringSolid.rotation.x = -Math.PI / 2;
  this.ringSolid.position.y = 0.2;

  Events.on('preparingForHappyEnd', this.preparingForHappyEnd.bind(this));
  Events.on('stageChanged', this.stageChanged.bind(this));
  Events.on('updateScene', this.update.bind(this));
}

TimeRing.prototype = Object.create(THREE.Object3D.prototype);

TimeRing.prototype.update = function (delta, time) {
  // if (State.get('stage') === 'experience') {
  // this.experienceCounter += delta;
  // }
  if (!this.active) {
    return;
  }
  this.setTimeRing();
  var flashSpeed = 1;
  var scaleSolidTmp = 1;
  if (this.ringIndex <= 5) {
    flashSpeed = (6 - this.ringIndex) * 2;
    this.ring.material.opacity = THREE.Math.mapLinear(Math.sin(time * flashSpeed), -1, 1, 0.1, 0.6);
    this.ringSolid.material.opacity = THREE.Math.mapLinear(Math.sin(time * flashSpeed), -1, 1, 0.05, 0.3);
    scaleSolidTmp = THREE.Math.mapLinear(Math.sin(time), -1, 1, 0.6, 1);
  } else {
    this.ring.material.opacity = THREE.Math.mapLinear(Math.sin(time * flashSpeed), -1, 1, 0.05, 0.3);
    this.ringSolid.material.opacity = THREE.Math.mapLinear(Math.sin(time * flashSpeed), -1, 1, 0.02, 0.1);
    scaleSolidTmp = THREE.Math.mapLinear(Math.sin(time), -1, 1, 0.9, 1);
  }
  this.ringSolid.scale.set(scaleSolidTmp, scaleSolidTmp, scaleSolidTmp);

};

TimeRing.prototype.setTimeRing = function () {
  var index = Math.floor(THREE.Math.mapLinear(GameplayManager.timeToEnding - GameplayManager.experienceCounter, 0, GameplayManager.timeToEnding, 0, this.ringSides));
  if (index < 0) {
    index = 0;
  }
  if (index !== this.ringIndex) {
    this.ringIndex = index;
    var sides = index;
    var thetaLength = Math.PI * 2 / this.ringSides * sides;
    this.ring.geometry.dispose();
    this.ring.geometry = new THREE.CircleGeometry(0.7, sides, Math.PI, thetaLength);
    this.ring.geometry.vertices.shift();
    if (this.ringIndex > 5) {
      this.ring.geometry.computeLineDistances();
    }

  }
};

TimeRing.prototype.preparingForHappyEnd = function () {
  if (this.active) {
    this.fadeOut();
  }
};

TimeRing.prototype.stageChanged = function (newStage) {
  if (newStage === 'ending' && this.active) {
    this.fadeOut();
  }
};

TimeRing.prototype.fadeOut = function () {
  this.active = false;
  var self = this;
  new TWEEN.Tween(this.ring.material).to({
    opacity: 0
  }, 1000)
    .easing(TWEEN.Easing.Cubic.Out)
    .start();
  new TWEEN.Tween(this.ringSolid.position).to({
    y: 3
  }, 5000)
    .easing(TWEEN.Easing.Cubic.Out)
    .start();
  new TWEEN.Tween(this.ringSolid.material).to({
    opacity: 0
  }, 3000)
    .delay(2000)
    .easing(TWEEN.Easing.Cubic.Out)
    .start();
};

module.exports = TimeRing;
