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

  // var geometry = new THREE.SphereBufferGeometry(0.05, 32, 32);
  // var texture = new THREE.TextureLoader().load('textures/titleEnd.png');
  // texture.wrapS = THREE.RepeatWrapping;
  // texture.repeat.x = - 1;
  // var material = new THREE.MeshBasicMaterial({color: 0xcccccc, map: texture, side: THREE.BackSide, transparent: true, opacity: 0});

  Events.on('endCredtisStarted', this.endCredtisStarted.bind(this));
  Events.on('updateScene', this.update.bind(this));
}

EndCredits.prototype = Object.create(THREE.Object3D.prototype);

EndCredits.prototype.update = function (delta, time) {
  if (this.initialized) {
    this.endSphere.position.set(this.camera.position.x, this.camera.position.y, this.camera.position.z);
  }
};

EndCredits.prototype.endCredtisStarted = function () {
  this.add(this.endSphere);
  this.initialized = true;
  new TWEEN.Tween(this.endSphere.material).to({
    opacity: 1
  }, 500)
    .easing(TWEEN.Easing.Cubic.Out)
    .start();
};

module.exports = EndCredits;
