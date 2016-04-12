'use strict';

const THREE = require('three');
const glslify = require('glslify');

function Sky () {
  const geometry = new THREE.SphereBufferGeometry(65, 64, 64);
  const material = new THREE.ShaderMaterial(
    {
      uniforms: {
        colorTop: { type: 'c', value: new THREE.Color(0x353449) },
        colorBottom: { type: 'c', value: new THREE.Color(0xBC483E) }
      },
      vertexShader: glslify('../../shaders/sky.vert'),
      fragmentShader: glslify('../../shaders/sky.frag'),
      side: THREE.BackSide
    }
  );

  THREE.Mesh.call(this, geometry, material);
}

Sky.prototype = Object.create(THREE.Mesh.prototype);

module.exports = Sky;
