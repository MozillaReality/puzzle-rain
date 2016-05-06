'use strict';

var THREE = require('three');
var Events = require('../../events/Events');

var AudioManager = require('../managers/AudioManager');

var track;
var idAudio = 'track0';

function Ground () {
  THREE.Object3D.call(this);

  var objectLoader = new THREE.ObjectLoader();
  var self = this;
  objectLoader.load('models/ground.json', function (obj) {
    obj.children.forEach(function (value) {
      if (value instanceof THREE.Mesh) {
        value.geometry.computeFaceNormals();
        value.geometry.computeVertexNormals();
        value.receiveShadow = true;
        value.material.shading = THREE.FlatShading;
      }
    });
    self.add(obj);
    self.addAudio();

  });
}

Ground.prototype = Object.create(THREE.Object3D.prototype);

Ground.prototype.addAudio = function () {
  Events.on('audioLoaded', this.audioLoaded.bind(this));
  track = new AudioManager(idAudio, this, true, true);
  track.setVolume(1);
};

Ground.prototype.audioLoaded = function (id) {
  if (id === idAudio) {
    Events.on('updateScene', this.update.bind(this));
  }
};

Ground.prototype.update = function (delta, time) {
  // console.log(track.analyser.getData());
};

module.exports = Ground;
