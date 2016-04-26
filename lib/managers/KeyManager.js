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

var activeHand = 0;

function KeyManager () {
  document.addEventListener('keydown', onDocumentKeyDown, false);
  if (!State.get('vrEnabled')) {
    document.addEventListener('keyup', onDocumentKeyUp, false);
    Events.on('updateScene', update);
  }
  console.log('Press "d" to show/hide Performance debug');
  console.log('Press "r or l" to change active hand');
  console.log('Press "arrows" to move a hand');
  console.log('Press "q" to move a hand up');
  console.log('Press "a" to move a hand down');
  console.log('Press "z" to trigger with active hand');
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
    case 82: // r
      activeHand = 0;
      break;
    case 76: // l
      activeHand = 1;
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
    Events.emit('move', 'forward', activeHand);
  }
  if (moveBackwards) {
    Events.emit('move', 'backwards', activeHand);
  }
  if (moveLeft) {
    Events.emit('move', 'left', activeHand);
  }
  if (moveRight) {
    Events.emit('move', 'right', activeHand);
  }
  if (moveUp) {
    Events.emit('move', 'up', activeHand);
  }
  if (moveDown) {
    Events.emit('move', 'down', activeHand);
  }
  if (lastTrigger !== trigger) {
    lastTrigger = trigger;
    // handL because is the Dummy one
    Events.emit('trigger', activeHand, trigger);
  }
}

module.exports = new KeyManager();
