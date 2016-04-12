'use strict';

const Events = require('../../events/Events');

const BlendCharacter = require('../animation/BlendCharacter');
const THREE = require('three');

function GamepadR () {
  THREE.BlendCharacter.call(this);
  this.load('models/handR.json', function () {
    Events.emit('gamepadRLoaded');
  });
}

GamepadR.prototype = Object.create(THREE.BlendCharacter.prototype);

module.exports = GamepadR;
