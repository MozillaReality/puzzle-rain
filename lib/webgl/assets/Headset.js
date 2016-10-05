'use strict';

var THREE = require('../three');
var TWEEN = require('tween.js');

var Events = require('../../events/Events');
var State = require('../../state/State');
var settings = require('../../settings');

function Headset () {
  THREE.Object3D.call(this);

  this.camera = State.get('camera');
  this.scene = State.get('scene');

  this.hasFinished = false;
  this.counter = 0;
  this.allHead = new THREE.Group();

  var objectLoader = new THREE.ObjectLoader();
  var self = this;
  objectLoader.load('models/headset.json', function (obj) {
    obj.children.forEach(function (value) {
      if (value instanceof THREE.Mesh) {
        value.material.shading = THREE.FlatShading;
        switch (value.name) {
          case 'head':
            self.head = value;
            self.head.material = new THREE.MeshStandardMaterial({
              color: settings.offColor,
              roughness: 1,
              metalness: 0,
              emissive: settings.offColor,
              emissiveIntensity: 0
            });
            break;
          case 'eyeR':
            self.eyeR = value;
            self.eyeR.material = new THREE.MeshStandardMaterial({
              color: 0xffffff,
              roughness: 1,
              metalness: 0,
              emissive: 0xffffff,
              emissiveIntensity: 1
            });
            break;
          case 'eyeL':
            self.eyeL = value;
            self.eyeL.material = new THREE.MeshStandardMaterial({
              color: 0xffffff,
              roughness: 1,
              metalness: 0,
              emissive: 0xffffff,
              emissiveIntensity: 1
            });
            break;
          case 'body':
            self.body = value;
            self.body.material = new THREE.MeshStandardMaterial({
              color: settings.offColor,
              roughness: 1,
              metalness: 0,
              emissive: settings.offColor,
              emissiveIntensity: 0
            });
            break;
        }
      }
    });
    self.allHead.add(self.head);
    self.allHead.add(self.eyeR);
    self.allHead.add(self.eyeL);
    self.add(self.allHead);
    self.init();
    self.add(obj);
  });
}

Headset.prototype = Object.create(THREE.Object3D.prototype);

Headset.prototype.init = function () {
  Events.on('updateSceneSpectator', this.updateSceneSpectator.bind(this));
  Events.on('updateScene', this.update.bind(this));
  Events.on('cameraChanged', this.cameraChanged.bind(this));
  Events.on('introBallStarted', this.introBallStarted.bind(this));
  Events.on('introBallCatched', this.introBallCatched.bind(this));
  Events.on('hideAll', this.hideAll.bind(this));
};

Headset.prototype.introBallStarted = function (delta) {
  var self = this;
  new TWEEN.Tween(this.head.material).to({
    emissiveIntensity: 2
  }, 3200)
    .easing(TWEEN.Easing.Circular.In)
    .start();
  new TWEEN.Tween(this.body.material).to({
    emissiveIntensity: 2
  }, 3200)
    .easing(TWEEN.Easing.Circular.In)
    .start();
};

Headset.prototype.introBallCatched = function () {
  this.head.material.color = this.body.material.color = new THREE.Color(0xffffff);
  this.head.material.emissive = this.body.material.emissive = new THREE.Color(0xffffff);

  this.eyeR.material.color = this.eyeL.material.color = new THREE.Color(0x000000);
  this.eyeR.material.emissive = this.eyeL.material.emissive = new THREE.Color(0x000000);
  new TWEEN.Tween(this.head.material).to({
    emissiveIntensity: 0.35
  }, 1000)
    .easing(TWEEN.Easing.Cubic.Out)
    .start();
  new TWEEN.Tween(this.body.material).to({
    emissiveIntensity: 0.35
  }, 1000)
    .easing(TWEEN.Easing.Cubic.Out)
    .start();
};

Headset.prototype.updateSceneSpectator = function (delta, time) {
  if (this.hasFinished) {
    return;
  }
  if (settings.spectatorMode) {
    if (State.get('camera') !== State.get('cameraSpectator')) {
      this.visible = true;
    }
    this.updateCommon(delta, time);
  }
};

Headset.prototype.update = function (delta, time) {
  if (this.hasFinished) {
    return;
  }
  this.visible = false;
  this.updateCommon(delta, time);
};

Headset.prototype.updateCommon = function (delta, time) {
  this.allHead.position.set(this.camera.position.x, this.camera.position.y, this.camera.position.z);
  this.allHead.rotation.set(this.camera.rotation.x, this.camera.rotation.y, this.camera.rotation.z);
  this.body.position.set(this.camera.position.x, this.camera.position.y, this.camera.position.z);
  // snippet code from http://stackoverflow.com/questions/34447119/positioning-a-three-js-object-in-front-of-the-camera-but-not-tied-to-the-camera
  var direction = new THREE.Vector3(0, 0, 1);
  direction.applyQuaternion(this.camera.quaternion);
  var ycomponent = new THREE.Vector3(0, 1, 0).multiplyScalar(direction.dot(new THREE.Vector3(0, 1, 0)));
  direction.sub(ycomponent);
  direction.normalize();
  this.body.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), direction);
// this.visible = false;
};

Headset.prototype.cameraChanged = function (id) {};

Headset.prototype.hideAll = function () {
  this.hasFinished = true;
  this.visible = false;
};
module.exports = Headset;
