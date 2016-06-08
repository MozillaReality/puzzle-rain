'use strict';

var THREE = require('three');
var TWEEN = require('tween.js');

var Events = require('../../events/Events');
var State = require('../../state/State');
var settings = require('../../settings');

function EndCredits () {
  THREE.Object3D.call(this);

  this.initialized = false;

  this.camera = State.get('camera');
  var geometry = new THREE.SphereBufferGeometry(0.05, 32, 32);
  var material = new THREE.MeshBasicMaterial({color: 0xcccccc, side: THREE.BackSide, transparent: true, opacity: 0});
  this.endSphere = new THREE.Mesh(geometry, material);

  var geometryFar = new THREE.SphereBufferGeometry(5, 32, 32);
  var texture = new THREE.TextureLoader().load('textures/titleEnd.png');
  texture.wrapS = THREE.RepeatWrapping;
  texture.repeat.x = - 1;
  var materialFar = new THREE.MeshBasicMaterial({ map: texture, side: THREE.BackSide});
  this.creditsSphere = new THREE.Mesh(geometryFar, materialFar);
  this.creditsSphere.rotation.y = Math.PI / 2;

  Events.on('endCreditsStarted', this.endCreditsStarted.bind(this));
  Events.on('updateScene', this.update.bind(this));
}

EndCredits.prototype = Object.create(THREE.Object3D.prototype);

EndCredits.prototype.update = function (delta, time) {
  if (this.initialized) {
    this.endSphere.position.set(this.camera.position.x, this.camera.position.y, this.camera.position.z);
  }
};

EndCredits.prototype.endCreditsStarted = function () {
  if (State.get('endMode') === 1) {
    this.endSphere.material.color = new THREE.Color(0x121114);
  }
  this.add(this.endSphere);
  this.initialized = true;
  var self = this;
  new TWEEN.Tween(this.endSphere.material).to({
    opacity: 1
  }, 500)
    .onComplete(function () {
      self.showCreditsSphere();
    })
    .easing(TWEEN.Easing.Cubic.Out)
    .start();
};

EndCredits.prototype.showCreditsSphere = function () {
  this.add(this.creditsSphere);
  Events.emit('hideAll');
  var self = this;
  new TWEEN.Tween(this.endSphere.material).to({
    opacity: 0
  }, 3000)
    .delay(2000)
    .onComplete(function () {
      self.endSphere.visible = false;
    })
    .easing(TWEEN.Easing.Cubic.In)
    .start();
};

module.exports = EndCredits;
