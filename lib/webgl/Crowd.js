'use strict';

var THREE = require('three');
var State = require('../state/State');

var Bouncers = require('./assets/races/Bouncers');
var Bulrushes = require('./assets/races/Bulrushes');
var Flyers = require('./assets/races/Flyers');
var Minerals = require('./assets/races/Minerals');
var Terrestrials = require('./assets/races/Terrestrials');

var cuadrantWidth, cuadrantHeight;

function Crowd () {
  this.gameArea = State.get('gameArea');
  // game area is divided in 9 cuadrants (3x3)
  cuadrantWidth = this.gameArea.width / 3;
  cuadrantHeight = this.gameArea.height / 3;

  this.scene = State.get('scene');
  this.addCreatures();
}

function getInitialPosition (race) {
  var initVec = new THREE.Vector3();
  switch (race) {
    case 'bouncers':
      initVec = getCuadrantPosition(3);
      break;
    case 'bulrushes':
      initVec = getCuadrantPosition(5);
      break;
    case 'flyers':
      initVec = getCuadrantPosition(7);
      break;
    case 'minerals':
      initVec = getCuadrantPosition(1);
      break;
    case 'terrestrials':
      initVec = getCuadrantPosition(6);
      break;
  }
  return initVec;
}

// game area is divided in 9 cuadrants (3x3)
function getCuadrantPosition (i) {
  var vec = new THREE.Vector3();
  var row = (i % 3) - 1;
  var column = Math.floor(i / 3) - 1;
  vec.x = row * cuadrantWidth;
  vec.z = column * cuadrantHeight;
  return vec;
}

Crowd.prototype.addCreatures = function () {
  var bouncers = new Bouncers(getInitialPosition('bouncers'));
  this.scene.add(bouncers);
  var bulrushes = new Bulrushes(getInitialPosition('bulrushes'));
  this.scene.add(bulrushes);
  var flyers = new Flyers(getInitialPosition('flyers'));
  this.scene.add(flyers);
  var minerals = new Minerals(getInitialPosition('minerals'));
  this.scene.add(minerals);
  var terrestrials = new Terrestrials(getInitialPosition('terrestrials'));
  this.scene.add(terrestrials);
};

module.exports = Crowd;
