'use strict';

var THREE = require('three');
var TWEEN = require('tween.js');

var glslify = require('glslify');

var Events = require('../../events/Events');
var State = require('../../state/State');

var AudioManager = require('../managers/AudioManager');

var MathUtils = require('../utils/MathUtils');

function GroupHandler (size, color, idAudio) {
  THREE.Object3D.call(this);

  // over / out
  this.status = 'out';
  this.idAudio = idAudio;

  this.camera = State.get('camera');

  var geometry = new THREE.IcosahedronGeometry(size);
  var material = new THREE.MeshStandardMaterial({color: color, side: THREE.BackSide, transparent: true, opacity: 0});

  this.mesh = new THREE.Mesh(geometry, material);
  this.add(this.mesh);

  var glowGeometry = new THREE.SphereGeometry(size, 32, 16);
  var glowMaterial = new THREE.ShaderMaterial(
    {
      uniforms: {
        'c': { type: 'f', value: 0.0 },
        'p': { type: 'f', value: 6.0 },
        'opacity': { type: 'f', value: 0.0 },
        glowColor: { type: 'c', value: new THREE.Color(MathUtils.blendColors(color, 0xffffff, 0.25)) },
        viewVector: { type: 'v3', value: this.camera.position }
      },
      vertexShader: glslify('../shaders/glow.vert'),
      fragmentShader: glslify('../shaders/glow.frag'),
      side: THREE.BackSide,
      blending: THREE.AdditiveBlending,
      transparent: true
    });

  this.glowObj = new THREE.Mesh(glowGeometry, glowMaterial.clone());
  this.glowObj.scale.set(1.5, 1.5, 1.5);
  this.add(this.glowObj);

  var geometryCircleLine = new THREE.CircleGeometry(size, 64);
  // Remove center vertex
  geometryCircleLine.vertices.shift();

  var materialCircleLine = new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0});
  materialCircleLine.linewidth = 1;
  this.ring = new THREE.Line(geometryCircleLine, materialCircleLine);
  this.ring.doubleSided = true;
  this.ring.scale.set(1.5, 1.5, 1.5);
  this.add(this.ring);

  this.addAudio();
}

GroupHandler.prototype = Object.create(THREE.Object3D.prototype);

GroupHandler.prototype.update = function (delta, time) {
  var absolutePos = new THREE.Vector3().subVectors(this.camera.position, this.position);
  var glowPos = new THREE.Vector3().subVectors(this.position, absolutePos);
  this.glowObj.material.uniforms.viewVector.value = glowPos;

  var cameraRelPos = new THREE.Vector3().setFromMatrixPosition(this.matrixWorld).sub(this.camera.position);
  this.ring.lookAt(new THREE.Vector3(cameraRelPos.x, cameraRelPos.y, cameraRelPos.z));
};

GroupHandler.prototype.addAudio = function () {
  Events.on('audioLoaded', this.audioLoaded.bind(this));
  this.track = new AudioManager(this.idAudio, this, true, true);
  this.track.setVolume(0);
};

GroupHandler.prototype.audioLoaded = function (id) {
  if (id === this.idAudio) {
    Events.on('updateScene', this.update.bind(this));
    Events.on('handlerCollided', this.handlerCollided.bind(this));
  }
};

GroupHandler.prototype.handlerCollided = function (side, obj) {
  if (obj === this) {
    this.rollOver();
  } else {
    this.rollOut();
  }
};

GroupHandler.prototype.activate = function () {
  new TWEEN.Tween(this.ring.material).to({
    opacity: 0.8
  }, 3000)
    .easing(TWEEN.Easing.Cubic.Out)
    .start();
  new TWEEN.Tween(this.mesh.material).to({
    opacity: 0.5
  }, 1500)
    .easing(TWEEN.Easing.Cubic.Out)
    .start();
  new TWEEN.Tween(this.glowObj.material.uniforms.opacity).to({
    value: 1.0
  }, 2500)
    .easing(TWEEN.Easing.Cubic.Out)
    .start();
};

GroupHandler.prototype.deactivate = function () {
  new TWEEN.Tween(this.ring.material).to({
    opacity: 0
  }, 1500)
    .easing(TWEEN.Easing.Cubic.In)
    .start();
  new TWEEN.Tween(this.mesh.material).to({
    opacity: 0
  }, 3000)
    .easing(TWEEN.Easing.Cubic.In)
    .start();
  new TWEEN.Tween(this.glowObj.material.uniforms.opacity).to({
    value: 0.0
  }, 2500)
    .easing(TWEEN.Easing.Cubic.In)
    .start();
};

GroupHandler.prototype.rollOver = function () {
  if (this.status !== 'over') {
    this.status = 'over';
    this.ring.scale.set(1.7, 1.7, 1.7);
    this.glowObj.scale.set(1.8, 1.8, 1.8);
    this.mesh.material.opacity = 0.9;
  }
};

GroupHandler.prototype.rollOut = function () {
  if (this.status !== 'out') {
    this.status = 'out';
    this.ring.scale.set(1.5, 1.5, 1.5);
    this.glowObj.scale.set(1.5, 1.5, 1.5);
    this.mesh.material.opacity = 0.5;
  }
};

module.exports = GroupHandler;
