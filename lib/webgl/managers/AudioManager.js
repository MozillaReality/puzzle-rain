'use strict';

var Events = require('../../events/Events');
var State = require('../../state/State');
var THREE = require('three');

var settings = require('../../settings');

function AudioManager (id, owner, playOnStart) {
  var audioLoader = new THREE.AudioLoader();

  this.sound = new THREE.PositionalAudio(State.get('listener'));
  var self = this;
  audioLoader.load('audio/' + id + '.ogg', function (buffer) {
    self.sound.setBuffer(buffer);
    // TODO delete when we have the final tracks
    self.sound.setLoop(true);
    // A reference distance for reducing volume as source move further from the listener.
    self.sound.setRefDistance(0.5);
    if (playOnStart) {
      self.sound.play();
    }
  });
  owner.add(this.sound);
  Events.on('updateScene', this.update.bind(this));
}

AudioManager.prototype.update = function (timestamp) {};

module.exports = AudioManager;
