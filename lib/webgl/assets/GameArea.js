'use strict';

var THREE = require('three');
var State = require('../../state/State');

function GameArea (w, h) {
  this.width = w;
  this.height = h;
  // game area is divided in 9 cuadrants (3x3)
  this.cuadrantWidth = this.width / 3;
  this.cuadrantHeight = this.height / 3;
  State.add('gameArea', this);
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
}

GameArea.prototype = Object.create(THREE.Mesh.prototype);

// game area is divided in 9 cuadrants (3x3)
GameArea.prototype.getCuadrantPosition = function (i) {
  var vec = new THREE.Vector3();
  var row = (i % 3) - 1;
  var column = Math.floor(i / 3) - 1;
  // 5/4 to place not too close to the center
  vec.x = row * this.cuadrantWidth * 5 / 4;
  vec.z = column * this.cuadrantHeight * 5 / 4;
  return vec;
};

GameArea.prototype.getCuadrantFromPosition = function (pos) {
  var cuadrantTmp = 0;
  var posXabs = pos.x + this.width / 2;
  var posZabs = pos.z + this.height / 2;
  var row = Math.floor(posXabs / this.cuadrantWidth);
  var column = Math.floor(posZabs / this.cuadrantHeight);
  cuadrantTmp = row + (column * 3);
  // Out of limits
  if (posXabs > this.width || posXabs < 0 || posZabs > this.height || posZabs < 0) {
    cuadrantTmp = -1;
  }
  return cuadrantTmp;
};

module.exports = GameArea;
