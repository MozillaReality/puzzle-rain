'use strict';

var THREE = require('three');
var Events = require('../../events/Events');

var AudioManager = require('../managers/AudioManager');
var LightCubes = require('./LightCubes');

var track;
var idAudio = 'base';

function Ground () {
  THREE.Object3D.call(this);

  var objectLoader = new THREE.ObjectLoader();
  var self = this;
  objectLoader.load('models/world_v2.json', function (obj) {
    obj.children.forEach(function (value) {
      if (value instanceof THREE.Mesh) {
        value.geometry.computeFaceNormals();
        value.geometry.computeVertexNormals();
        value.material.shading = THREE.FlatShading;
      }
      if (value instanceof THREE.DirectionalLight) {
        value.position.set(1, 10, 2);
        value.intensity = 0.4;
      }
    });
    console.log(obj);
    self.add(obj);
    self.addAudio();
    self.lightCubes = new LightCubes();
    self.lightCubes.scale.set(0.1, 0.1, 0.1);
  // self.add(self.lightCubes);
  });
}

Ground.prototype = Object.create(THREE.Object3D.prototype);

Ground.prototype.addAudio = function () {
  Events.on('audioLoaded', this.audioLoaded.bind(this));
  track = new AudioManager(idAudio, this, true, true);
  track.setVolume(3);
};

Ground.prototype.audioLoaded = function (id) {
  if (id === idAudio) {
    Events.on('updateScene', this.update.bind(this));
  }
};

Ground.prototype.update = function (delta, time) {
  // console.log(track.analyser.getData());
  // console.log(track.analyser.getData()[ 0 ]);
  // console.log(track.averageAnalyser);
};

module.exports = Ground;
