'use strict';

const Events = require('../events/Events');
const settings = require('../settings');

function KeyManager () {
  document.addEventListener('keydown', onDocumentKeyDown, false);
  // document.addEventListener('keyup', onDocumentKeyUp, false);
  console.log('Press "p" to show/hide Cannon debug');
  console.log('Press "d" to show/hide Performance debug');
}

function onDocumentKeyDown (event) {
  switch (event.keyCode) {
    case 80: // p
      Events.emit('debugPhysicsChange');
      break;
    case 68: // d
      Events.emit('debugPerformanceChange');
      break;
    case 38: // up

      break;
    case 38: // up

      break;
    case 40: // down

      break;
    case 37: // left

      break;
    case 39: // right

      break;
  }
}

function onDocumentKeyUp (event) {
}

module.exports = new KeyManager();
