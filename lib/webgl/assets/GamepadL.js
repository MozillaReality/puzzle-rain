'use strict';

const Events = require('../../events/Events');

const BlendCharacter = require('../animation/BlendCharacter');
const THREE = require('three');

function GamepadL () {
  THREE.BlendCharacter.call(this);
  const scope = this;
  this.load('models/handL.json', function () {
    Events.emit('gamepadLLoaded');
    Events.on('updateScene', scope.update.bind(scope));
  });
}

GamepadL.prototype = Object.create(THREE.BlendCharacter.prototype);

module.exports = GamepadL;
