'use strict';

const Events = require('../../events/Events');

const BlendCharacter = require('../animation/BlendCharacter');
const THREE = require('three');

function GamepadR () {
  THREE.BlendCharacter.call(this);
  const scope = this;
  this.load('models/handR.json', function () {
    Events.emit('gamepadRLoaded');
    Events.on('updateScene', scope.update.bind(scope));
  });
}

GamepadR.prototype = Object.create(THREE.BlendCharacter.prototype);

module.exports = GamepadR;
