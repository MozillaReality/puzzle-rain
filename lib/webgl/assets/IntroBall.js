'use strict';

var THREE = require('three');
var TWEEN = require('tween.js');

var Events = require('../../events/Events');
var State = require('../../state/State');

var track;
var idAudio = 'intro';

function IntroBall (obj) {
  THREE.Object3D.call(this);

  this.isCollided = false;

  var geometry = new THREE.OctahedronGeometry(0.1, 0);
  var material = new THREE.MeshStandardMaterial({color: 0x2e2d38, roughness: 1, metalness: 0.5,
    emissive: 0xffffff, emissiveIntensity: 0.5, shading: THREE.FlatShading,
  transparent: true, opacity: 0.5});
  this.mesh = new THREE.Mesh(geometry, material);
  this.add(this.mesh);

  Events.on('updateScene', this.update.bind(this));
  Events.on('introBallCollided', this.introBallCollided.bind(this));
}

IntroBall.prototype = Object.create(THREE.Object3D.prototype);

IntroBall.prototype.introBallCollided = function () {
  if (!this.isCollided) {
    this.scale.set(2, 2, 2);
    this.isCollided = true;
  }
};

IntroBall.prototype.update = function (delta, time) {};

module.exports = IntroBall;
