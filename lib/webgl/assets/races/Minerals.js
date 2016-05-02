'use strict';

var THREE = require('three');

var Race = require('../Race');
var Mineral = require('../creatures/Mineral');

var cuadrantWidth = 0.25;
var cuadrantHeight = 0.25;

function Minerals (initCuadrant) {
  Race.call(this, 'minerals', initCuadrant);
  // Add 12 creatures
  for (var i = 0;i < 8;i++) {
    var mineral = new Mineral(this, i, getInCuadrantPosition(i), 0.025 + (Math.random() * 0.05));
    this.creaturesArr.push(mineral.mesh);
    this.add(mineral);
  }
}

function getInCuadrantPosition (i) {
  var vec = new THREE.Vector3();
  var row = (i % 3) - 1;
  var column = Math.floor(i / 2) - 1;
  vec.x = row * (cuadrantWidth / 2 + (Math.random() - 0.5) * 0.05);
  vec.z = column * (cuadrantHeight / 2 + (Math.random() - 0.5) * 0.05);
  return vec;
}
Minerals.prototype = Object.create(Race.prototype);

module.exports = Minerals;
