'use strict';

var THREE = require('three');
var TWEEN = require('tween.js');

var Events = require('../../events/Events');
var State = require('../../state/State');
var settings = require('../../settings');

function Headset () {
  THREE.Object3D.call(this);

  this.camera = State.get('camera');
  this.scene = State.get('scene');

  this.counter = 0;
  this.allHead = new THREE.Group();

  var objectLoader = new THREE.ObjectLoader();
  var self = this;
  objectLoader.load('models/headset.json', function (obj) {
    obj.children.forEach(function (value) {
      if (value instanceof THREE.Mesh) {
        value.geometry.computeFaceNormals();
        value.geometry.computeVertexNormals();
        value.material.shading = THREE.FlatShading;
        switch (value.name) {
          case 'head':
            self.head = value;
            break;
          case 'eyeR':
            self.eyeR = value;
            break;
          case 'eyeL':
            self.eyeL = value;
            break;
          case 'body':
            self.body = value;
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
  Events.on('updateScene', this.update.bind(this));
  Events.on('cameraChanged', this.cameraChanged.bind(this));
};

Headset.prototype.update = function (delta, time) {
  this.allHead.position.set(this.camera.position.x, this.camera.position.y, this.camera.position.z);
  this.allHead.rotation.set(this.camera.rotation.x, this.camera.rotation.y, this.camera.rotation.z);
  this.body.position.set(this.camera.position.x, this.camera.position.y, this.camera.position.z);
};

Headset.prototype.cameraChanged = function (id) {};

module.exports = Headset;
