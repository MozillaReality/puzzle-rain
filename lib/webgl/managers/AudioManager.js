'use strict';

var Events = require('../../events/Events');
var State = require('../../state/State');
var THREE = require('three');

var settings = require('../../settings');

function AudioManager (id, owner, loop, playOnStart) {
  var audioLoader = new THREE.AudioLoader();

  this.sound = new THREE.PositionalAudio(State.get('listener'));
  this.trackAtPauseIsplaying = false;

  var self = this;
  audioLoader.load('audio/' + id + '.ogg', function (buffer) {
    self.sound.setBuffer(buffer);
    // TODO delete when we have the final tracks
    self.sound.setLoop(loop);
    // A reference distance for reducing volume as source move further from the listener.
    self.sound.setRefDistance(0.2);
    if (playOnStart) {
      self.play();
    }
    Events.emit('audioLoaded', id);
  });
  owner.add(this.sound);
  Events.on('pauseAll', this.pauseAll.bind(this));
  Events.on('updateScene', this.update.bind(this));
}

AudioManager.prototype.update = function (timestamp) {};

AudioManager.prototype.setVolume = function (i) {
  this.sound.setVolume(i);
};

AudioManager.prototype.play = function () {
  this.sound.play();
};

AudioManager.prototype.pauseAll = function (bool) {
  if (bool) {
    this.trackAtPauseIsplaying = this.sound.isPlaying;
    if (this.sound.isPlaying) {
      this.sound.pause();
    }
  } else {
    if (this.trackAtPauseIsplaying) {
      this.sound.play();
    }
  }
};

module.exports = AudioManager;
