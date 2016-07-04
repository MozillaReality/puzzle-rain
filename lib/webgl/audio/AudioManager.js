'use strict';

var Events = require('../../events/Events');
var State = require('../../state/State');
var THREE = require('three');

var settings = require('../../settings');

function AudioManager (id, isPositional, owner, loop, playOnStart) {
  var audioLoader = new THREE.AudioLoader();

  this.id = id;

  this.isPositional = isPositional;
  if (this.isPositional) {
    this.sound = new THREE.PositionalAudio(State.get('listener'));
  } else {
    this.sound = new THREE.Audio(State.get('listener'));
  }

  this.averageAnalyser = 0;

  this.trackAtPauseIsplaying = false;

  var self = this;
  audioLoader.load('audio/' + id + '.ogg', function (buffer) {
    self.sound.setBuffer(buffer);
    // TODO delete when we have the final tracks
    self.sound.setLoop(loop);
    // A reference distance for reducing volume as source move further from the listener.
    // TODO Ad-hoc code for The Composer
    if (self.isPositional) {
      self.sound.setRefDistance(0.5);
    }
    if (playOnStart) {
      if (self.sound.source.buffer) {
        self.play();
      }
    }
    self.analyser = new THREE.AudioAnalyser(self.sound, 32);
    Events.emit('audioLoaded', id);
    Events.on('pauseAll', self.pauseAll.bind(self));
    Events.on('updateScene', self.update.bind(self));
  });
  owner.add(this.sound);
}

AudioManager.prototype.update = function (delta, time) {
  this.averageAnalyser = this.getAverage(this.analyser.getFrequencyData());
};

AudioManager.prototype.setVolume = function (i) {
  this.sound.setVolume(i);
};

AudioManager.prototype.setRefDistance = function (i) {
  this.sound.setRefDistance(i);
};

AudioManager.prototype.getVolume = function () {
  return this.sound.getVolume();
};

AudioManager.prototype.getCurrentTime = function () {
  if (this.sound.source.buffer) {
    // this.sound.context.currentTime not return as expected, seems to return currentTime sine first audio is loaded
    return (this.sound.context.currentTime % this.sound.source.buffer.duration);
  } else {
    return 0;
  }
};

AudioManager.prototype.setStartTime = function (i) {
  if (this.sound.source.buffer) {
    if (this.sound.isPlaying) {
      this.sound.stop();
      this.sound.startTime = i;
      // TODO add dummy 50ms delay to stop the sound (if you play again without it does not work)
      var self = this;
      setTimeout(function () {
        self.sound.play();
      }, 50);
    } else {
      this.sound.startTime = i;
      this.sound.play();
    }
  }
};

AudioManager.prototype.getNormalTime = function () {
  if (this.sound.source.buffer) {
    return (this.getCurrentTime() / this.sound.source.buffer.duration);
  } else {
    return 0;
  }
};

AudioManager.prototype.play = function () {
  if (this.sound.isPlaying) {
    this.sound.stop();
  } else {
    if (this.sound.source.buffer) {
      this.sound.play();
    }
  }
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

AudioManager.prototype.getAverage = function (array) {
  var ave = 0;
  var l = array.length;
  for ( var i = 0; i < array.length; i++) {
    ave += array[i];
  }
  ave /= l;
  return ave;
};

module.exports = AudioManager;
