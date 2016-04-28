'use strict';

var THREE = require('three');

var Race = require('../Race');
var Bulrush = require('../creatures/Bulrush');

var cuadrantWidth = 0.2;
var cuadrantHeight = 0.2;

function Bulrushes (pos) {
  Race.call(this, 'bulrushes', pos);
  // Add 12 creatures
  for (var i = 0;i < 12;i++) {
    var bulrush = new Bulrush(i, getCuadrantPosition(i).add(this.position), 0.1);
    this.creaturesArr.push(bulrush.mesh);
    this.scene.add(bulrush);
  }
}

function getCuadrantPosition (i) {
  var vec = new THREE.Vector3();
  var row = (i % 4) - 2;
  var column = Math.floor(i / 4) - 2;
  // vec.x = row * (cuadrantWidth + (Math.random() - 0.5) * 0.1);
  // vec.z = column * (cuadrantHeight + (Math.random() - 0.5) * 0.1);
  vec.x = row * cuadrantWidth;
  vec.z = column * cuadrantHeight;
  return vec;
}
Bulrushes.prototype = Object.create(Race.prototype);

module.exports = Bulrushes;
