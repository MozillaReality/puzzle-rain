'use strict';

var THREE = require('three');

// Mouth texture has 2x4 image atlas
var mouthsPerColumn = 4;
var mouthsPerRow = 2;

function Mouth () {
  THREE.Object3D.call(this);
  var texture = new THREE.TextureLoader().load('textures/mouth.png');
  texture.repeat.x = 1 / mouthsPerRow;
  texture.repeat.y = 1 / mouthsPerColumn;
  var material = new THREE.MeshStandardMaterial({map: texture, emissive: 0xffffff, emissiveIntensity: 1, transparent: true});

  this.mouth = new THREE.Mesh(new THREE.PlaneBufferGeometry(1, 0.5), material);
  this.add(this.mouth);
  this.changeMouth(1);
}

Mouth.prototype = Object.create(THREE.Object3D.prototype);

Mouth.prototype.changeMouth = function (index) {
  var row = Math.ceil(index / mouthsPerRow) - 1;
  var column = (index - 1) % mouthsPerRow;
  this.mouth.material.map.offset.x = 1 / mouthsPerRow * column;
  this.mouth.material.map.offset.y = - 1 / mouthsPerColumn * row;

};

module.exports = Mouth;
