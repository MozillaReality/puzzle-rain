'use strict';

var Events = require('../../events/Events');
var State = require('../../state/State');

var BlendCharacter = require('../animation/BlendCharacter');
var THREE = require('three');

var movementOnPress = 0.01;
var timeScale;

function GamepadDummy (scene) {
  THREE.BlendCharacter.call(this);

  this.name = 'handR';
  var self = this;
  this.load('models/handR.json', function () {
    var box = new THREE.Box3().setFromObject(self);

    self.castShadow = true;
    self.receiveShadow = true;
    self.material.shading = THREE.FlatShading;
    self.position.set(0, 0.5, -0.2);
    scene.add(self);
    State.add('controllerR', self);
    Events.emit('gamepadsLoaded');
    Events.on('updateScene', self.update.bind(self));
    Events.on('move', move.bind(self));
    Events.on('trigger', trigger.bind(self));
  });

}

function move (dir) {
  switch (dir) {
    case 'left':
      this.position.x -= movementOnPress;
      break;
    case 'right':
      this.position.x += movementOnPress;
      break;
    case 'forward':
      this.position.z -= movementOnPress;
      break;
    case 'backwards':
      this.position.z += movementOnPress;
      break;
    case 'up':
      this.position.y += movementOnPress;
      break;
    case 'down':
      this.position.y -= movementOnPress;
      break;
    default:

  }

}

function trigger (hand, bool) {
  if (bool) {
    timeScale = 1;
  } else {
    timeScale = -1;
  }
  this.mixer.clipAction('close').loop = 2200;
  this.mixer.clipAction('close').clampWhenFinished = true;
  this.mixer.clipAction('close').timeScale = timeScale;
  this.play('close', 0);
  this.play('close', 1);
}

function playOnce (animation, timeScale) {
  // TODO fix aramtures on blend files
  // return;
  // console.log(hand, animation, timeScale);
  var activeHand;
  var animationActive;

  if (hand === 0) {
    activeHand = gamepadR;
    animationActive = animationActiveR;
  } else {
    activeHand = gamepadL;
    animationActive = animationActiveL;
  }

  if (animation === animationActive && activeHand.mixer.clipAction(animationActive).timeScale === timeScale) {
    return;
  }
  activeHand.mixer.clipAction(animation).loop = 2200;
  activeHand.mixer.clipAction(animation).clampWhenFinished = true;
  activeHand.mixer.clipAction(animation).timeScale = timeScale;
  activeHand.play(animationActive, 0);
  activeHand.play(animation, 1);

  if (hand === 0) {
    animationActiveR = animation;
  } else {
    animationActiveL = animation;
  }

}

GamepadDummy.prototype = Object.create(THREE.BlendCharacter.prototype);

module.exports = GamepadDummy;
