'use strict';

var THREE = require('three');

var AudioManager = require('../managers/AudioManager');

var track;

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
    track = new AudioManager('track0', self, true, true);
    track.setVolume(1);

  });
}

Ground.prototype = Object.create(THREE.Object3D.prototype);

module.exports = Ground;
