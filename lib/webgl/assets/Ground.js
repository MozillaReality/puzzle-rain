'use strict';

var THREE = require('three');
var TWEEN = require('tween.js');

var Events = require('../../events/Events');
var State = require('../../state/State');
var settings = require('../../settings');

var AudioManager = require('../audio/AudioManager');

function Ground () {
  THREE.Object3D.call(this);

  this.idBaseLoopAudio = 'baseLoop';
  this.idAudio = 'base';
  this.timeAtEnding = 217;
  this.timeAtRaining = 245;
  this.isRainStarted = false;

  this.timeAtStartEating = 258;
  this.isEatStarted = false;

  this.timeAtEndEating = 276.5;
  this.isEatEnded = false;

  this.camera = State.get('camera');
  this.scene = State.get('scene');

  this.counter = 0;

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
  Events.on('closerEnding', this.closerEnding.bind(this));
}

Ground.prototype = Object.create(THREE.Object3D.prototype);

Ground.prototype.addIntroAudio = function () {
  Events.on('audioLoaded', this.audioLoaded.bind(this));

  this.trackIntro = new AudioManager(this.idBaseLoopAudio, this, true, true);
  this.trackIntro.setVolume(5);
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
  this.trackIntro.sound.stop();
  this.track = new AudioManager(this.idAudio, this, false, true);
// this.track.setVolume(1);
};

Ground.prototype.update = function (delta, time) {
  if (this.isEatEnded) {
    this.endSphere.position.set(this.camera.position.x, this.camera.position.y, this.camera.position.z);
  }
  if (State.get('stage') !== 'intro') {
    this.counter += delta;
    if (this.counter > this.timeAtEnding && State.get('stage') === 'experience') {
      this.track.setStartTime(this.timeAtEnding);
      this.dispatchEnding();
    }
    if (this.counter > this.timeAtRaining && !this.isRainStarted) {
      this.isRainStarted = true;
      Events.emit('rainStarted');
    }
    if (this.counter > this.timeAtStartEating && !this.isEatStarted) {
      this.isEatStarted = true;
      Events.emit('eatStarted');
    }
    if (this.counter > this.timeAtEndEating && !this.isEatEnded) {
      this.fadeToEnd();
      this.isEatEnded = true;
    // Events.emit('eatEnded');
    }
  }
};

Ground.prototype.fadeToEnd = function () {
  var geometry = new THREE.SphereBufferGeometry(0.05, 32, 32);
  var material = new THREE.MeshBasicMaterial({color: 0xcccccc, side: THREE.BackSide, transparent: true, opacity: 0});
  this.endSphere = new THREE.Mesh(geometry, material);
  this.scene.add(this.endSphere);
  new TWEEN.Tween(this.endSphere.material).to({
    opacity: 1
  }, 500)
    .easing(TWEEN.Easing.Cubic.Out)
    .start();
  this.endSphere.position.set(this.camera.position.x, this.camera.position.y, this.camera.position.z);
};

Ground.prototype.forceEnding = function () {
  this.counter = this.timeAtEnding;
  this.track.setStartTime(this.timeAtEnding);
  this.dispatchEnding();
};

Ground.prototype.closerEnding = function () {
  this.track.setStartTime(this.timeAtEnding - 30);
  this.counter = this.timeAtEnding - 30;
};

Ground.prototype.dispatchEnding = function () {
  State.add('stage', 'ending');
  Events.emit('stageChanged');
};

module.exports = Ground;
