'use strict';

var THREE = require('three');
var glslify = require('glslify');

function Sky () {
  var geometry = new THREE.SphereBufferGeometry(65, 64, 64);
  var material = new THREE.ShaderMaterial(
    {
      uniforms: {
        colorTop: { type: 'c', value: new THREE.Color(0x353449) },
        // colorBottom: { type: 'c', value: new THREE.Color(0xBC483E) }
        colorBottom: { type: 'c', value: new THREE.Color(0x000000) }
      },
      vertexShader: glslify('../shaders/sky.vert'),
      fragmentShader: glslify('../shaders/sky.frag'),
      side: THREE.BackSide
    }
  );

  THREE.Mesh.call(this, geometry, material);
}

Sky.prototype = Object.create(THREE.Mesh.prototype);

module.exports = Sky;
