'use strict';

var THREE = require('../../three');

// Mouth texture has 2x4 image atlas
var mouthsPerColumn = 4;
var mouthsPerRow = 2;

function Mouth () {
  THREE.Object3D.call(this);
  var texture = new THREE.TextureLoader().load('textures/mouthOpen.png');
  var material = new THREE.MeshStandardMaterial({map: texture, emissive: 0xffffff, emissiveIntensity: 0, transparent: true});

  this.mesh = new THREE.Mesh(new THREE.PlaneBufferGeometry(0.5, 0.025), material);
  this.add(this.mesh);
}

Mouth.prototype = Object.create(THREE.Object3D.prototype);

module.exports = Mouth;
