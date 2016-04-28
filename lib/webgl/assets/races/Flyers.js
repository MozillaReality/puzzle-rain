'use strict';

var THREE = require('three');

var Race = require('../Race');
var Flyer = require('../creatures/Flyer');

var cuadrantWidth = 0.1;
var cuadrantHeight = 0.1;

function Flyers (pos) {
  Race.call(this, 'flyers', pos);
  // Add 12 creatures
  for (var i = 0;i < 16;i++) {
    var bulrush = new Flyer(i, getCuadrantPosition(i), 0.01);
    this.add(bulrush);
  }
}

function getCuadrantPosition (i) {
  var vec = new THREE.Vector3();
  var row = (i % 4) - 2;
  var column = Math.floor(i / 4) - 2;
  // console.log(row, column);
  vec.x = row * (cuadrantWidth + (Math.random() - 0.5) * 0.05);
  vec.y = 1 + ((Math.random() - 0.5) * 0.1);
  vec.z = column * (cuadrantHeight + (Math.random() - 0.5) * 0.05);
  return vec;
}
Flyers.prototype = Object.create(Race.prototype);

module.exports = Flyers;
