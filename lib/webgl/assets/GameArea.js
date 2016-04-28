'use strict';

var THREE = require('three');
var State = require('../../state/State');

function GameArea (w, h) {
  this.width = w;
  this.height = h;
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

module.exports = GameArea;
