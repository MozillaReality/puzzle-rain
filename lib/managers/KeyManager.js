'use strict';

const State = require('../state/State');
const Events = require('../events/Events');
const settings = require('../settings');

let moveForward = false;
let moveBackwards = false;
let moveLeft = false;
let moveRight = false;
let moveUp = false;
let moveDown = false;
let catching = false;
let lastCatch = false;

function KeyManager () {
  document.addEventListener('keydown', onDocumentKeyDown, false);
  if (!State.get('vrEnabled')) {
    document.addEventListener('keyup', onDocumentKeyUp, false);
    Events.on('updateScene', update);
  }
  console.log('Press "p" to show/hide Cannon debug');
  console.log('Press "d" to show/hide Performance debug');
}

function onDocumentKeyDown (event) {
  // console.log(event.keyCode);
  switch (event.keyCode) {
    case 80: // p
      Events.emit('debugPhysicsChange');
      break;
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
      catching = true;
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
      catching = false;
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
  if (lastCatch !== catching) {
    lastCatch = catching;
    // handL because is the Dummy one
    Events.emit('catching', 'handR', catching);
  }
}

module.exports = new KeyManager();
