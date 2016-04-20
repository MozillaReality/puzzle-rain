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
    case 107: // +
      moveUp = true;
      break;
    case 109: // -
      moveDown = true;
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
    case 107: // +
      moveUp = false;
      break;
    case 109: // -
      moveDown = false;
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

}

module.exports = new KeyManager();
