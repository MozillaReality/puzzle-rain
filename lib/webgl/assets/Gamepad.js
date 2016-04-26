'use strict';

var Events = require('../../events/Events');
var State = require('../../state/State');

var BlendCharacter = require('../animation/BlendCharacter');
var THREE = require('three');

function Gamepad (index) {
  THREE.BlendCharacter.call(this);

  this.activeRace = 'bulrushes';
  var side = 'L';
  if (index === 0) {
    side = 'R';
  }
  this.name = 'hand' + side;
  var self = this;
  this.load('models/hand' + side + '.json', function () {
    var box = new THREE.Box3().setFromObject(self);
    State.add('controller' + side, self);
    Events.emit('gamepad' + side + 'Loaded');
    Events.on('updateScene', self.update.bind(self));
  });
}

Gamepad.prototype = Object.create(THREE.BlendCharacter.prototype);

module.exports = Gamepad;
