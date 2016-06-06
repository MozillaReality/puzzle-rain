'use strict';

var THREE = require('three');
var TWEEN = require('tween.js');

var Events = require('../../events/Events');
var State = require('../../state/State');

var AudioManager = require('../audio/AudioManager');

function Ground () {
  THREE.Object3D.call(this);

  this.idBaseLoopAudio = 'baseLoop';
  this.idAudio = 'base';
  this.timeAtEnding = 217;

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
    self.addIntroAudio();
  });

  Events.on('stageChanged', this.stageChanged.bind(this));
  Events.on('surprise', this.surprise.bind(this));
  Events.on('forceEnding', this.forceEnding.bind(this));
}

Ground.prototype = Object.create(THREE.Object3D.prototype);

Ground.prototype.addIntroAudio = function () {
  Events.on('audioLoaded', this.audioLoaded.bind(this));

  this.track = new AudioManager(this.idBaseLoopAudio, this, true, true);
  this.track.setVolume(3);
};

Ground.prototype.audioLoaded = function (id) {
  if (id === this.idBaseLoopAudio) {
    Events.on('updateScene', this.update.bind(this));
  }
};

Ground.prototype.stageChanged = function () {
  switch (State.get('stage')) {
    case 'experience':
      this.addAudio();
      break;
  }
};

Ground.prototype.surprise = function () {
  this.worldFar.position.y;
  new TWEEN.Tween(this.worldFar.position).to({
    y: -3
  }, 10000)
    .easing(TWEEN.Easing.Cubic.Out)
    .start();
};

Ground.prototype.addAudio = function () {
  this.track.sound.stop();
  this.track = new AudioManager(this.idAudio, this, true, true);
  this.track.setVolume(3);
};

Ground.prototype.update = function (delta, time) {
  if (State.get('stage') === 'experience' && this.track.getCurrentTime() > this.timeAtEnding) {
    this.dispatchEnding();
  }
};

Ground.prototype.forceEnding = function () {
  this.track.setStartTime(217);
  this.dispatchEnding();
};

Ground.prototype.dispatchEnding = function () {
  State.add('stage', 'ending');
  Events.emit('stageChanged');
};

module.exports = Ground;
