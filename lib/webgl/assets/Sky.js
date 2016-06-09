'use strict';

var THREE = require('three');
var TWEEN = require('tween.js');

var glslify = require('glslify');

var Events = require('../../events/Events');
var State = require('../../state/State');

var MathUtils = require('../utils/MathUtils');

function Sky () {
  var geometry = new THREE.SphereBufferGeometry(100, 64, 64);
  var material = new THREE.ShaderMaterial(
    {
      uniforms: {
        colorTop: { type: 'c', value: new THREE.Color(0x353449) },
        colorBottom: { type: 'c', value: new THREE.Color(0xBC483E) }
      },
      vertexShader: glslify('../shaders/sky.vert'),
      fragmentShader: glslify('../shaders/sky.frag'),
      side: THREE.BackSide
    }
  );

  THREE.Mesh.call(this, geometry, material);

  this.isSkyFading = false;
  this.sunrise = 0;
  this.scene = State.get('scene');

  Events.on('updateScene', this.update.bind(this));
  Events.on('stageChanged', this.stageChanged.bind(this));
  Events.on('stormStarted', this.stormStarted.bind(this));
// this.material.uniforms.colorTop.value = new THREE.Color(0x33b66d);
// this.material.uniforms.colorBottom.value = new THREE.Color(0x4bb8dd);
// this.scene.fog.color = new THREE.Color(0x4bb8dd);
}

Sky.prototype = Object.create(THREE.Mesh.prototype);

Sky.prototype.update = function (delta, time) {
  // console.log(this.sunrise);
  if (this.isSkyFading) {
    this.material.uniforms.colorTop.value = new THREE.Color(MathUtils.blendColors(0x353449, 0x33b66d, this.sunrise));
    this.material.uniforms.colorBottom.value = new THREE.Color(MathUtils.blendColors(0xBC483E, 0x4bb8dd, this.sunrise));
    this.scene.fog.color = new THREE.Color(MathUtils.blendColors(0xBC483E, 0x4bb8dd, this.sunrise));
  }
// if (this.isStorming) {
//
// }
};

Sky.prototype.stormStarted = function (newStage) {
  // One frame for the thunder
  this.material.uniforms.colorTop.value = new THREE.Color(0xffffff);
  this.material.uniforms.colorBottom.value = new THREE.Color(0x4bb8dd);
  this.scene.fog.color = new THREE.Color(0x4bb8dd);
};

Sky.prototype.stageChanged = function (newStage) {
  var self = this;
  switch (newStage) {
    case 'ending':
      if (State.get('endMode') === 1) {
        new TWEEN.Tween(this).to({
          sunrise: 1
        }, 15000)
          .easing(TWEEN.Easing.Quadratic.In)
          .start();
        this.isSkyFading = true;
      }
      break;
  }
};

module.exports = Sky;
