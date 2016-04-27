'use strict';

var THREE = require('three');
var State = require('../../state/State');

var Bouncers = require('./races/Bouncers');
var Bulrushes = require('./races/Bulrushes');
var Flyers = require('./races/Flyers');
var Minerals = require('./races/Minerals');
var Terrestrials = require('./races/Terrestrials');

var cuadrantWidth, cuadrantHeight;

function GameArea (w, h) {
  this.width = w;
  this.height = h;
  // game area is divided in 9 cuadrants (3x3)
  cuadrantWidth = this.width / 3;
  cuadrantHeight = this.height / 3;

  var geometry = new THREE.PlaneGeometry(w, h, 32, 32);
  var material = new THREE.MeshLambertMaterial(
    {
      color: 0xffffff,
      transparent: true,
      opacity: 0.1
    }
  );
  geometry.rotateX(- Math.PI / 2);

  THREE.Mesh.call(this, geometry, material);
  this.addCreatures();
}

function getInitialPosition (race) {
  var initVec = new THREE.Vector3();
  switch (race) {
    case 'bouncers':
      initVec = getCuadrantPosition(3);
      break;
    case 'bulrushes':
      initVec = getCuadrantPosition(1);
      break;
    case 'flyers':
      initVec = getCuadrantPosition(7);
      break;
    case 'minerals':
      initVec = getCuadrantPosition(5);
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

GameArea.prototype = Object.create(THREE.Mesh.prototype);

GameArea.prototype.addCreatures = function () {
  var bouncers = new Bouncers(getInitialPosition('bouncers'));
  State.add('bouncers', bouncers);
  this.add(bouncers);
  var bulrushes = new Bulrushes(getInitialPosition('bulrushes'));
  State.add('bulrushes', bulrushes);
  this.add(bulrushes);
  var flyers = new Flyers(getInitialPosition('flyers'));
  State.add('flyers', flyers);
  this.add(flyers);
  var minerals = new Minerals(getInitialPosition('minerals'));
  State.add('minerals', minerals);
  this.add(minerals);
  var terrestrials = new Terrestrials(getInitialPosition('terrestrials'));
  State.add('terrestrials', terrestrials);
  this.add(terrestrials);
};

module.exports = GameArea;
