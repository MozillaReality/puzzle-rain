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

var rotateUp = false;
var rotateDown = false;

var isPressed = false;
var lastPressed = false;

var activeHand = 'R';

function KeyManager () {
  document.addEventListener('keydown', onDocumentKeyDown, false);
  if (!State.get('vrDisplay')) {
    document.addEventListener('keyup', onDocumentKeyUp, false);
    Events.on('updateScene', update);
  }
  if (settings.debugMode) {
    console.log('Press "r or l" to change active hand');
    console.log('Press "arrows" to move a hand');
    console.log('Press "q / a" to move hand up / down');
    console.log('Press "w / s" to rotate hand up / down');
    console.log('Press "z" to trigger with active hand');
  }
}

function onDocumentKeyDown (event) {
  // console.log(event.keyCode);
  switch (event.keyCode) {
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
      isPressed = true;
      break;
    case 87: // w
      rotateUp = true;
      break;
    case 83: // s
      rotateDown = true;
      break;
    case 82: // r
      activeHand = 'R';
      break;
    case 76: // l
      activeHand = 'L';
      break;
    case 89: // y
      Events.emit('forceEnding');
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
      isPressed = false;
      break;
    case 87: // w
      rotateUp = false;
      break;
    case 83: // s
      rotateDown = false;
      break;
  }
}

function update () {
  if (moveForward) {
    Events.emit('move', activeHand, 'forward');
  }
  if (moveBackwards) {
    Events.emit('move', activeHand, 'backwards');
  }
  if (moveLeft) {
    Events.emit('move', activeHand, 'left');
  }
  if (moveRight) {
    Events.emit('move', activeHand, 'right');
  }
  if (moveUp) {
    Events.emit('move', activeHand, 'up');
  }
  if (moveDown) {
    Events.emit('move', activeHand, 'down');
  }
  if (rotateUp) {
    Events.emit('move', activeHand, 'rotateUp');
  }
  if (rotateDown) {
    Events.emit('move', activeHand, 'rotateDown');
  }
  if (lastPressed !== isPressed) {
    lastPressed = isPressed;
    // handL because is the Dummy one
    Events.emit('trigger', activeHand, isPressed);
  }
}

module.exports = new KeyManager();
