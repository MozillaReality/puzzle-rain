'use strict';

var THREE = require('three');

var Race = require('../Race');
var Mineral = require('../creatures/Mineral');

var cuadrantWidth = 0.25;
var cuadrantHeight = 0.25;

function Minerals (pos) {
  Race.call(this, 'minerals', pos);
  // Add 12 creatures
  for (var i = 0;i < 8;i++) {
    var mineral = new Mineral(i, getCuadrantPosition(i), 0.05 + (Math.random() * 0.1));
    this.add(mineral);
  }
}

function getCuadrantPosition (i) {
  var vec = new THREE.Vector3();
  var row = (i % 3) - 1;
  var column = Math.floor(i / 2) - 1;
  vec.x = row * (cuadrantWidth + (Math.random() - 0.5) * 0.1);
  vec.z = column * (cuadrantHeight + (Math.random() - 0.5) * 0.1);
  return vec;
}
Minerals.prototype = Object.create(Race.prototype);

module.exports = Minerals;
