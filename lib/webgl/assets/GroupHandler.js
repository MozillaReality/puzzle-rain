'use strict';

var THREE = require('three');
var TWEEN = require('tween.js');

var Events = require('../../events/Events');

var AudioManager = require('../managers/AudioManager');

function GroupHandler (size, color, idAudio) {
  THREE.Object3D.call(this);

  // over / out
  this.status = 'out';

  this.idAudio = idAudio;

  var geometry = new THREE.IcosahedronGeometry(size);
  var material = new THREE.MeshStandardMaterial({color: color, side: THREE.BackSide, transparent: true, opacity: 0});

  this.mesh = new THREE.Mesh(geometry, material);
  this.add(this.mesh);

  var geometryCircleLine = new THREE.CircleGeometry(size, 64);
  // Remove center vertex
  geometryCircleLine.vertices.shift();

  var materialCircleLine = new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0});
  materialCircleLine.linewidth = 1;
  this.ring = new THREE.Line(geometryCircleLine, materialCircleLine);
  this.ring.doubleSided = true;
  this.ring.scale.set(1.5, 1.5, 1.5);
  this.add(this.ring);

  this.addAudio();
}

GroupHandler.prototype = Object.create(THREE.Object3D.prototype);

GroupHandler.prototype.addAudio = function () {
  Events.on('audioLoaded', this.audioLoaded.bind(this));
  this.track = new AudioManager(this.idAudio, this, true, true);
  this.track.setVolume(0);
};

GroupHandler.prototype.audioLoaded = function (id) {
  if (id === this.idAudio) {
    Events.on('updateScene', this.update.bind(this));
    Events.on('handlerCollided', this.handlerCollided.bind(this));
  }
};

GroupHandler.prototype.update = function (delta, time) {};

GroupHandler.prototype.handlerCollided = function (side, obj) {
  if (obj === this) {
    this.rollOver();
  } else {
    this.rollOut();
  }
};

GroupHandler.prototype.activate = function () {
  var tween = new TWEEN.Tween(this.ring.material).to({
    opacity: 0.8
  }, 3000)
    .easing(TWEEN.Easing.Cubic.Out)
    .start();
  var tween = new TWEEN.Tween(this.mesh.material).to({
    opacity: 0.5
  }, 3000)
    .easing(TWEEN.Easing.Cubic.Out)
    .start();
};

GroupHandler.prototype.deactivate = function () {
  var tween = new TWEEN.Tween(this.ring.material).to({
    opacity: 0
  }, 3000)
    .easing(TWEEN.Easing.Cubic.In)
    .start();
  var tween = new TWEEN.Tween(this.mesh.material).to({
    opacity: 0
  }, 3000)
    .easing(TWEEN.Easing.Cubic.In)
    .start();
};

GroupHandler.prototype.rollOver = function () {
  if (this.status !== 'over') {
    this.status = 'over';
    this.ring.scale.set(1.7, 1.7, 1.7);
    this.mesh.material.opacity = 0.9;
  }
};

GroupHandler.prototype.rollOut = function () {
  if (this.status !== 'out') {
    this.status = 'out';
    this.helper.scale.set(1.5, 1.5, 1.5);
    this.mesh.material.opacity = 0.5;
  }
};

module.exports = GroupHandler;
