'use strict';

var THREE = require('three');
var TWEEN = require('tween.js');

var glslify = require('glslify');

var Events = require('../../events/Events');
var State = require('../../state/State');

var AudioManager = require('../managers/AudioManager');

var MathUtils = require('../utils/MathUtils');

function GroupHandler (raceObj, radius, color, idAudio, minHeight, maxHeight) {
  THREE.Object3D.call(this);

  this.minHeight = minHeight;
  this.maxHeight = maxHeight;

  this.raceObj = raceObj;
  this.radius = radius;

  this.handGrabbed = '';
  this.isActive = false;
  // over / out
  this.overStatus = 'out';
  this.idAudio = idAudio;

  this.overTrack = new AudioManager('effects/over', this, false, false);

  this.camera = State.get('camera');

  var geometry = new THREE.IcosahedronGeometry(this.radius);
  var material = new THREE.MeshStandardMaterial({color: color, side: THREE.BackSide, transparent: true, opacity: 0});

  this.mesh = new THREE.Mesh(geometry, material);
  this.add(this.mesh);

  var glowGeometry = new THREE.SphereGeometry(this.radius, 32, 16);
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

  var geometryCircleLine = new THREE.CircleGeometry(this.radius, 64);
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

  if (this.handGrabbed !== '') {
    var hand = State.get('gamepad' + this.handGrabbed);
    if (hand.position.y < this.minHeight) {
      this.position.y = this.minHeight;
    }else if (hand.position.y > this.maxHeight) {
      this.position.y = this.maxHeight;
    } else {
      this.position.y = hand.position.y;
    }
  }

  var mappedVolume = THREE.Math.mapLinear(this.position.y, this.minHeight, this.maxHeight, 0, 1);
  var clampedVolume = THREE.Math.clamp(mappedVolume, 0, 1);
  this.track.setVolume(clampedVolume);
};

GroupHandler.prototype.addAudio = function () {
  Events.on('audioLoaded', this.audioLoaded.bind(this));
  this.track = new AudioManager(this.idAudio, this, true, true);
  this.track.setVolume(0);
};

GroupHandler.prototype.audioLoaded = function (id) {
  if (id === this.idAudio) {
    Events.on('updateScene', this.update.bind(this));
    Events.on('activeHandlerDispatch', this.activeHandlerDispatch.bind(this));
    Events.on('grabbed', this.grabbed.bind(this));
    Events.on('dropped', this.dropped.bind(this));
  }
};

GroupHandler.prototype.activeHandlerDispatch = function (side, obj) {
  if (this.handGrabbed) {
    return;
  }
  if (obj === this) {
    if (this.overStatus !== 'over') {
      this.rollOver();
      this.overTrack.play();
    }
  } else {
    this.rollOut();
  }
};

GroupHandler.prototype.activate = function () {
  this.isActive = true;
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
  new TWEEN.Tween(this.position).to({
    y: this.minHeight + ((this.maxHeight - this.minHeight) / 2)
  }, 3000)
    .easing(TWEEN.Easing.Cubic.Out)
    .start();
};

GroupHandler.prototype.deactivate = function () {
  this.isActive = false;
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
  new TWEEN.Tween(this.position).to({
    y: 0
  }, 2000)
    .easing(TWEEN.Easing.Cubic.In)
    .start();
};

GroupHandler.prototype.rollOver = function () {
  if (this.overStatus !== 'over') {
    this.overStatus = 'over';
    this.ring.scale.set(1.7, 1.7, 1.7);
    this.glowObj.scale.set(1.8, 1.8, 1.8);
    this.mesh.material.opacity = 0.9;
  }
};

GroupHandler.prototype.rollOut = function () {
  if (this.overStatus !== 'out') {
    this.overStatus = 'out';
    this.ring.scale.set(1.5, 1.5, 1.5);
    this.glowObj.scale.set(1.5, 1.5, 1.5);
    this.mesh.material.opacity = 0.5;
  }
};

GroupHandler.prototype.grabbed = function (side, obj) {
  // console.log(side, obj);
  if (obj === this) {
    this.handGrabbed = side;
    this.glowObj.scale.set(2, 2, 2);
  }
};

GroupHandler.prototype.dropped = function (obj) {
  if (obj === this) {
    this.handGrabbed = '';
    this.glowObj.scale.set(1.5, 1.5, 1.5);
  }
};

module.exports = GroupHandler;
