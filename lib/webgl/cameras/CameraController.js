'use strict';

var THREE = require('three');
var TWEEN = require('tween.js');

var State = require('../../state/State');
var Events = require('../../events/Events');
var settings = require('../../settings');

function CameraController () {
}

CameraController.prototype.init = function () {
  this.camerasArr = [];
  // this.camerasArr[0] is the headset camera
  this.camerasArr.push(State.get('camera'));

  var camera1 = new THREE.PerspectiveCamera(90, window.innerWidth / window.innerHeight, 0.05, 1000000);
  camera1.position.set(-1.5, 2.1, 1.5);
  this.camerasArr.push(camera1);
  var camera2 = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.05, 1000000);
  camera2.position.set(1.5, 0.5, 1.5);
  this.camerasArr.push(camera2);
  var camera3 = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.05, 1000000);
  camera3.position.set(-1.5, 1.5, -1.5);
  this.camerasArr.push(camera3);
  var camera4 = new THREE.PerspectiveCamera(110, window.innerWidth / window.innerHeight, 0.05, 1000000);
  camera4.position.set(2.5, 1.8, -2.5);
  this.camerasArr.push(camera4);
  this.switchCamera(0);

  Events.on('switchCamera', this.switchCamera.bind(this));
};

CameraController.prototype.switchCamera = function (i) {
  State.add('cameraSpectator', this.camerasArr[i]);
  Events.emit('cameraSwitched');
};

module.exports = new CameraController();
