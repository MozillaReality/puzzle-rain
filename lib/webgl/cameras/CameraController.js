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

  this.actualCamera;

  // Justo antes de tocar la bola > 3
  // Cuando tienes los poderes > 0
  // Enciendes los minerals, al girar a tu izda > 3
  // Enciendes bouncers y bulrushes > 0
  // Juegas con los bulrushes y al girar a los terrestrials > 2
  // Encientes terrestrias y flyers > 0
  // juegas con ellos > 1
  // Notas el final > 2
  // Al poco > 0
  // Último momento > 4
  // Casi al final > 0
  this.arrTrailerCameras = [3, 0, 3, 0, 2, 0, 1, 2, 0, 4, 0];
  this.actualTrailerCamera = -1;

  var camera1 = new THREE.PerspectiveCamera(100, window.innerWidth / window.innerHeight, 0.05, 1000000);
  camera1.position.set(0.5, 0.5, 1.5);
  this.camerasArr.push(camera1);
  var camera2 = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.05, 1000000);
  camera2.position.set(0.2, 0.8, 2);
  this.camerasArr.push(camera2);
  var camera3 = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.05, 1000000);
  camera3.position.set(-1.5, 1, -1.5);
  this.camerasArr.push(camera3);
  var camera4 = new THREE.PerspectiveCamera(110, window.innerWidth / window.innerHeight, 0.05, 1000000);
  camera4.position.set(-2.5, 1, 2.5);
  this.camerasArr.push(camera4);
  this.switchCamera(0);

  Events.on('switchCamera', this.switchCamera.bind(this));
  Events.on('nextCamera', this.nextCamera.bind(this));
};

CameraController.prototype.switchCamera = function (i) {
  this.actualCamera = i;
  State.add('cameraSpectator', this.camerasArr[i]);
  Events.emit('cameraSwitched', i);
  if (settings.trailerMode) {
    this.moveCamera(i);
  }
};

CameraController.prototype.moveCamera = function (i) {
  switch (i) {
    case 4:
      new TWEEN.Tween(this.camerasArr[i].position).to({
        x: 2,
        y: 1.8
      }, 20000)
        .easing(TWEEN.Easing.Sinusoidal.InOut)
        .start();
      break;
    default:

  }
};
CameraController.prototype.nextCamera = function () {
  if (this.actualTrailerCamera < this.arrTrailerCameras.length - 1) {
    this.actualTrailerCamera++;
  } else {
    this.actualTrailerCamera = 0;
  }
  this.switchCamera(this.arrTrailerCameras[this.actualTrailerCamera]);
};

module.exports = new CameraController();
