'use strict';

var THREE = require('three');
var TWEEN = require('tween.js');

var Events = require('../../events/Events');
var State = require('../../state/State');

var AudioManager = require('../audio/AudioManager');

function Ground () {
  THREE.Object3D.call(this);

  this.idAudio = 'base';
  this.timeToEnding = 217;

  var objectLoader = new THREE.ObjectLoader();
  var self = this;
  objectLoader.load('models/ground.json', function (obj) {
    obj.children.forEach(function (value) {
      if (value instanceof THREE.Mesh) {
        value.geometry.computeFaceNormals();
        value.geometry.computeVertexNormals();
        value.material.shading = THREE.FlatShading;
        if (value.name === 'WorldFar') {
          self.worldFar = value;
        }
      }
    });
    self.add(obj);
    self.addAudio();
  });

  Events.on('surprise', this.surprise.bind(this));
  Events.on('forceEnding', this.forceEnding.bind(this));
}

Ground.prototype = Object.create(THREE.Object3D.prototype);

Ground.prototype.surprise = function () {
  this.worldFar.position.y;
  new TWEEN.Tween(this.worldFar.position).to({
    y: -3
  }, 10000)
    .easing(TWEEN.Easing.Cubic.Out)
    .start();
};

Ground.prototype.addAudio = function () {
  Events.on('audioLoaded', this.audioLoaded.bind(this));
  this.track = new AudioManager(this.idAudio, this, true, true);
  this.track.setVolume(3);
};

Ground.prototype.audioLoaded = function (id) {
  if (id === this.idAudio) {
    Events.on('updateScene', this.update.bind(this));
  }
};

Ground.prototype.update = function (delta, time) {
  if (this.track.getCurrentTime() > this.timeToEnding && State.get('stage') === 'experience') {
    State.add('stage', 'ending');
    Events.emit('onEnding');
  }
};

Ground.prototype.forceEnding = function () {
  this.track.setStartTime(217);
  State.add('stage', 'ending');
  Events.emit('onEnding');
};

module.exports = Ground;
