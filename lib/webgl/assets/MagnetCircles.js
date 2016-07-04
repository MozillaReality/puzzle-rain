'use strict';

var Events = require('../../events/Events');
var settings = require('../../settings');
var THREE = require('three');
var TWEEN = require('tween.js');

function MagnetCircles (obj) {
  THREE.Object3D.call(this);

  this.controller = obj;

  this.animated = false;

  this.speedMagnet = 0.015;
  this.maxOpacity = 0.1;
  var geometryCircleLine = new THREE.CircleGeometry(0.2, 16);
  geometryCircleLine.rotateX(- Math.PI / 2);
  // Remove center vertex
  geometryCircleLine.vertices.shift();

  var materialCircleLine = new THREE.LineBasicMaterial({
  color: 0xffffff,transparent: true, opacity: 0, depthWrite: false});
  materialCircleLine.linewidth = 2;
  this.ring = new THREE.Line(geometryCircleLine, materialCircleLine);
  this.add(this.ring);
  this.ring.position.y = -2;
  var self = this;
  this.transition = 0;
  Events.on('updateScene', this.update.bind(this));
  Events.on('gamepadOn', this.gamepadOn.bind(this));
  Events.on('gamepadOff', this.gamepadOff.bind(this));
}
MagnetCircles.prototype = Object.create(THREE.Object3D.prototype);

MagnetCircles.prototype.update = function (delta, time) {
  if (this.controller.lastPressed) {
    if (this.controller.active) {
      this.animated = true;
      this.animateRings();
    } else {
      this.animated = false;
      this.pauseRings();
    }
  }
  if (!this.controller.lastPressed && this.animated) {
    this.animated = false;
    this.pauseRings();
  }
};

MagnetCircles.prototype.updateTween = function () {
  console.log(this.transition);
};

MagnetCircles.prototype.animateRings = function () {
  this.transition += this.speedMagnet;
  if (this.transition > 1) {
    this.transition = 0;
  }
  this.ring.position.y = THREE.Math.mapLinear(this.transition, 0, 1, -2, 0);
  this.scaleTmp = THREE.Math.mapLinear(this.transition, 0, 1, 1, 0.2);
  this.ring.scale.set(this.scaleTmp, this.scaleTmp, this.scaleTmp);
  if (this.transition < 0.2) {
    this.ring.material.opacity = THREE.Math.mapLinear(this.transition, 0, 0.2, 0, this.maxOpacity);
  }else if (this.transition > 0.8) {
    this.ring.material.opacity = THREE.Math.mapLinear(this.transition, 0.8, 1, this.maxOpacity, 0);
  } else {
    this.ring.material.opacity = this.maxOpacity;
  }

};

MagnetCircles.prototype.pauseRings = function () {
  this.restoreRings();
};

MagnetCircles.prototype.restoreRings = function () {
  this.ring.position.y = -2;
  this.ring.material.opacity = 0;
  this.ring.scale.set(1, 1, 1);
  this.transition = 0;
};

MagnetCircles.prototype.gamepadOn = function (side) {
  if (this.controller.side === side) {
  }
};

MagnetCircles.prototype.gamepadOff = function (side) {
  if (this.controller.side === side) {
    this.animated = false;
    this.pauseRings();
  }
};

module.exports = MagnetCircles;
