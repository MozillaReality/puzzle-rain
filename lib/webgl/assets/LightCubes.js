'use strict';

var THREE = require('three');
var glslify = require('glslify');

var Events = require('../../events/Events');

var orientations, offsets;

function LightCubes () {
  // geometry
  var instances = 5000;
  var geometry = new THREE.InstancedBufferGeometry();
  // per mesh data
  var vertices = new THREE.BufferAttribute(new Float32Array([
    // Front
    -1, 1, 1,
    1, 1, 1,
    -1, -1, 1,
    1, -1, 1,
    // Back
    1, 1, -1,
    -1, 1, -1,
    1, -1, -1,
    -1, -1, -1,
    // Left
    -1, 1, -1,
    -1, 1, 1,
    -1, -1, -1,
    -1, -1, 1,
    // Right
    1, 1, 1,
    1, 1, -1,
    1, -1, 1,
    1, -1, -1,
    // Top
    -1, 1, 1,
    1, 1, 1,
    -1, 1, -1,
    1, 1, -1,
    // Bottom
    1, -1, 1,
    -1, -1, 1,
    1, -1, -1,
    -1, -1, -1
  ]), 3);

  geometry.addAttribute('position', vertices);

  var uvs = new THREE.BufferAttribute(new Float32Array([
    // x	y	z
    // Front
    0, 0,
    1, 0,
    0, 1,
    1, 1,
    // Back
    1, 0,
    0, 0,
    1, 1,
    0, 1,
    // Left
    1, 1,
    1, 0,
    0, 1,
    0, 0,
    // Right
    1, 0,
    1, 1,
    0, 0,
    0, 1,
    // Top
    0, 0,
    1, 0,
    0, 1,
    1, 1,
    // Bottom
    1, 0,
    0, 0,
    1, 1,
    0, 1
  ]), 2);

  geometry.addAttribute('uv', uvs);

  var indices = new Uint16Array([
    0, 1, 2,
    2, 1, 3,
    4, 5, 6,
    6, 5, 7,
    8, 9, 10,
    10, 9, 11,
    12, 13, 14,
    14, 13, 15,
    16, 17, 18,
    18, 17, 19,
    20, 21, 22,
    22, 21, 23
  ]);

  geometry.setIndex(new THREE.BufferAttribute(indices, 1));

  // per instance data
  offsets = new THREE.InstancedBufferAttribute(new Float32Array(instances * 3), 3, 1);

  var vector = new THREE.Vector4();
  for ( var i = 0, ul = offsets.count; i < ul; i++) {
    var x = Math.random() * 400 - 200;
    var y = Math.random() * 1 - 0.2;
    var z = Math.random() * 400 - 200;
    vector.set(x, y, z, 0).normalize();
    // move out at least 5 units from center in current direction
    offsets.setXYZ(i, x + vector.x * 50, y, z + vector.z * 50);
    var index = i * 4;
  }

  geometry.addAttribute('offset', offsets); // per mesh translation

  orientations = new THREE.InstancedBufferAttribute(new Float32Array(instances * 4), 4, 1).setDynamic(true);

  for ( var i = 0, ul = orientations.count; i < ul; i++) {
    vector.set(Math.random() * 2 - 1, Math.random() * 2 - 1, Math.random() * 2 - 1, Math.random() * 2 - 1);
    vector.normalize();

    orientations.setXYZW(i, vector.x, vector.y, vector.z, vector.w);

  }

  geometry.addAttribute('orientation', orientations); // per mesh orientation

  var texture = new THREE.TextureLoader().load('textures/lightCube.png');
  // texture.anisotropy = renderer.getMaxAnisotropy();
  var material = new THREE.RawShaderMaterial({
    uniforms: {
      map: { type: 't', value: texture }
    },
    vertexShader: glslify('../shaders/lightCubes.vert'),
    fragmentShader: glslify('../shaders/lightCubes.frag'),
    side: THREE.DoubleSide,
    transparent: true

  });
  THREE.Mesh.call(this, geometry, material);

  Events.on('updateScene', this.update.bind(this));
}

LightCubes.prototype = Object.create(THREE.Mesh.prototype);

LightCubes.prototype.update = function (delta, time) {
  // for ( var i = 0, ul = orientations.count; i < ul; i++) {
  //   var index = i * 4;
  //   currentQ.set( orientations.array[index], orientations.array[index + 1], orientations.array[index + 2], orientations.array[index + 3] );
  //   currentQ.multiply( tmpQ );
  //   orientations.setXYZW( i, currentQ.x, currentQ.y, currentQ.z, currentQ.w );
  //
  // }
  // orientations.needsUpdate = true;
  for ( var i = 0, ul = offsets.count; i < ul; i++) {
    offsets.setY(i, offsets.getY(i) + Math.random() * 0.05);
  }
  offsets.needsUpdate = true;
};

module.exports = LightCubes;
