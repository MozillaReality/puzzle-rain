'use strict';

var State = require('../state/State');
var Events = require('../events/Events');
var settings = require('../settings');

var moveForward = false;
var moveBackwards = false;
var moveLeft = false;
var moveRight = false;
var moveUp = false;
var moveDown = false;
var trigger = false;
var lastTrigger = false;

function KeyManager () {
  document.addEventListener('keydown', onDocumentKeyDown, false);
  if (!State.get('vrEnabled')) {
    document.addEventListener('keyup', onDocumentKeyUp, false);
    Events.on('updateScene', update);
  }
  console.log('Press "d" to show/hide Performance debug');
  console.log('Press "1" to change Terrestrial behavoir');
  console.log('Press "2" to change Bouncer behavoir');
}

function onDocumentKeyDown (event) {
  // console.log(event.keyCode);
  switch (event.keyCode) {
    case 68: // d
      Events.emit('debugPerformanceChange');
      break;
    case 38: // up
      moveForward = true;
      break;
    case 40: // down
      moveBackwards = true;
      break;
    case 37: // left
      moveLeft = true;
      break;
    case 39: // right
      moveRight = true;
      break;
    case 81: // q
      moveUp = true;
      break;
    case 65: // a
      moveDown = true;
      break;
    case 90: // z
      trigger = true;
      break;
    case 49: // 1
      Events.emit('changeTerrestrialBehaviour');
      break;
    case 50: // 2
      Events.emit('changeBouncerBehaviour');
      break;
  }
}

function onDocumentKeyUp (event) {
  switch (event.keyCode) {
    case 38: // up
      moveForward = false;
      break;
    case 40: // down
      moveBackwards = false;
      break;
    case 37: // left
      moveLeft = false;
      break;
    case 39: // right
      moveRight = false;
      break;
    case 81: // q
      moveUp = false;
      break;
    case 65: // a
      moveDown = false;
      break;
    case 90: // z
      trigger = false;
      break;
  }
}

function update () {
  if (moveForward) {
    Events.emit('move', 'forward');
  }
  if (moveBackwards) {
    Events.emit('move', 'backwards');
  }
  if (moveLeft) {
    Events.emit('move', 'left');
  }
  if (moveRight) {
    Events.emit('move', 'right');
  }
  if (moveUp) {
    Events.emit('move', 'up');
  }
  if (moveDown) {
    Events.emit('move', 'down');
  }
  if (lastTrigger !== trigger) {
    lastTrigger = trigger;
    // handL because is the Dummy one
    Events.emit('trigger', 'handR', trigger);
  }
}

module.exports = new KeyManager();
