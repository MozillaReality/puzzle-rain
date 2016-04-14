'use strict';

const Events = require('../../events/Events');

const BlendCharacter = require('../animation/BlendCharacter');
const THREE = require('three');
const CANNON = require('cannon');

function GamepadR () {
  THREE.BlendCharacter.call(this);
  const scope = this;
  this.load('models/handR.json', function () {
    var box = new THREE.Box3().setFromObject(scope);
    const shape = new CANNON.Box(new CANNON.Vec3(box.size().x / 2, box.size().y / 2, box.size().z / 2));
    scope.body = new CANNON.Body({
      mass: 0
    });
    scope.body.addShape(shape);
    Events.emit('gamepadRLoaded');

    Events.on('updateScene', scope.update.bind(scope));
    Events.on('updateScene', update.bind(scope));
  });
}

function update (delta) {
  this.body.position.copy(this.position);
  this.body.quaternion.copy(this.quaternion);
}

GamepadR.prototype = Object.create(THREE.BlendCharacter.prototype);

module.exports = GamepadR;
