'use strict';

var THREE = require('three');
var TWEEN = require('tween.js');

var Events = require('../../events/Events');
var State = require('../../state/State');
var settings = require('../../settings');
var glslify = require('glslify');

function Sun (obj) {
  THREE.Object3D.call(this);

  this.isActive = false;

  this.cameraForGlow = State.get('camera');
  this.cameraSpectator = State.get('camera');
  this.addGlow();

  this.addRings();

  var geometry = new THREE.OctahedronGeometry(8, 0);
  var material = new THREE.MeshStandardMaterial({color: 0xffffff, roughness: 1, metalness: 0.5,
    emissive: 0xffffff, emissiveIntensity: 0.5, shading: THREE.FlatShading,
  transparent: true, opacity: 0});
  this.mesh = new THREE.Mesh(geometry, material);
  this.add(this.mesh);

  Events.on('updateScene', this.update.bind(this));
  Events.on('elevationStarted', this.elevationStarted.bind(this));
  if (settings.spectatorMode) {
    Events.on('updateSpectatorRender', this.updateSpectatorRender.bind(this));
    Events.on('cameraSwitched', this.cameraSwitched.bind(this));
  }
  this.visible = false;
}

Sun.prototype = Object.create(THREE.Object3D.prototype);

Sun.prototype.addGlow = function () {
  var glowGeometry = new THREE.SphereGeometry(12, 16, 16);
  var glowMaterial = new THREE.ShaderMaterial(
    {
      uniforms: {
        'c': { type: 'f', value: 0.0 },
        'p': { type: 'f', value: 6.0 },
        'opacity': { type: 'f', value: 0 },
        glowColor: { type: 'c', value: new THREE.Color(0xffffff) },
        viewVector: { type: 'v3', value: this.cameraForGlow.position }
      },
      vertexShader: glslify('../shaders/glow.vert'),
      fragmentShader: glslify('../shaders/glow.frag'),
      side: THREE.BackSide,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      transparent: true
    });

  this.glow = new THREE.Mesh(glowGeometry, glowMaterial.clone());
  this.add(this.glow);
};

Sun.prototype.addRings = function () {
  var geometryCircleLine = new THREE.CircleGeometry(12, 6);
  geometryCircleLine.vertices.shift();
  var materialCircleLine = new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, depthWrite: false,opacity: 0});
  // materialCircleLine.linewidth = 2;

  this.ring01 = new THREE.Line(geometryCircleLine, materialCircleLine);
  this.add(this.ring01);

  geometryCircleLine = new THREE.CircleGeometry(10, 5);
  geometryCircleLine.vertices.shift();
  var materialRing3 = new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, depthWrite: false,opacity: 0});
  this.ring02 = new THREE.Line(geometryCircleLine, materialRing3);
  this.add(this.ring02);
};

Sun.prototype.update = function (delta, time) {
  if (!this.isActive) {
    return;
  }
  this.cameraForGlow = State.get('camera');
  this.updateCommon(delta, time);
};

Sun.prototype.updateSpectatorRender = function (delta, time) {
  if (!this.isActive) {
    return;
  }
  this.cameraForGlow = this.cameraSpectator;
  this.updateCommon(delta, time);
};

Sun.prototype.updateCommon = function (delta, time) {
  this.updateGlowOrientation();
  var scaleTime = 1 + (Math.cos(time * 2) / 4);
  this.glow.scale.set(scaleTime, scaleTime, scaleTime);

  this.ring01.rotation.x += 0.01;
  this.ring01.rotation.z += 0.01;

  this.ring02.rotation.y -= 0.01;
  this.ring02.rotation.z -= 0.01;

};

Sun.prototype.updateGlowOrientation = function () {
  var cameraRelPos = new THREE.Vector3().setFromMatrixPosition(this.cameraForGlow.matrixWorld);
  var glowPos = new THREE.Vector3().setFromMatrixPosition(this.glow.matrixWorld);
  this.glow.material.uniforms.viewVector.value = new THREE.Vector3().subVectors(cameraRelPos, glowPos);
};

Sun.prototype.elevationStarted = function () {
  if (State.get('endMode') === 1) {
    this.isActive = true;
    this.visible = true;
    new TWEEN.Tween(this.mesh.material).to({
      opacity: 0.5
    }, 5000)
      .easing(TWEEN.Easing.Quadratic.Out)
      .start();
    new TWEEN.Tween(this.glow.material.uniforms.opacity).to({
      value: 1
    }, 3000)
      .easing(TWEEN.Easing.Quadratic.Out)
      .start();
    new TWEEN.Tween(this.ring01.material).to({
      opacity: 1
    }, 7000)
      .easing(TWEEN.Easing.Quadratic.Out)
      .start();
    new TWEEN.Tween(this.ring02.material).to({
      opacity: 1
    }, 8000)
      .easing(TWEEN.Easing.Quadratic.Out)
      .start();
    // Add wide shadow camera range to view the shadow of the final super head
    new TWEEN.Tween(this.position).to({
      x: 0,
      z: 0
    }, 20000)
      .easing(TWEEN.Easing.Sinusoidal.Out)
      .start();
  }
};

Sun.prototype.cameraSwitched = function () {
  this.cameraSpectator = State.get('cameraSpectator');
};

module.exports = Sun;
