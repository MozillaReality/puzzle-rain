'use strict';

var THREE = require('three');
var TWEEN = require('tween.js');

var Events = require('../../events/Events');
var State = require('../../state/State');
var settings = require('../../settings');

var AudioManager = require('../audio/AudioManager');

function HandLight (obj) {
  this.controller = obj;

  this.maxIntensity = 0.5;
  this.maxHelperOpacity = 0.05;
  this.minHelperOpacity = 0.015;

  this.isEnding = false;
  THREE.SpotLight.call(this, 0xf4f4f4, 0);
  // Commented because do not show complete when is emmited
  this.castShadow = true;
  this.position.set(0, 0, 0);
  this.angle = 0.1;
  this.penumbra = 0.05;
  this.decay = 1;
  this.distance = 2;
  this.target = this.controller.dummyLight;
  this.shadow.mapSize.width = 1024;
  this.shadow.mapSize.height = 1024;

  var geometry = new THREE.CylinderBufferGeometry(0.01, 0.2, 2, 32, 1);
  var material = new THREE.MeshBasicMaterial({color: 0xffffff, transparent: true, opacity: 0, side: THREE.DoubleSide, depthTest: true, depthWrite: false});
  this.cylinderHelper = new THREE.Mesh(geometry, material);

  this.cylinderHelper.position.y = -1;
  this.add(this.cylinderHelper);

  this.track = new AudioManager('effects/magnet', true, this, true, true);
  this.track.setVolume(0);

  Events.on('activeCreatureChanged', this.activeCreatureChanged.bind(this));
  Events.on('gamepadOn', this.gamepadOn.bind(this));
  Events.on('gamepadOff', this.gamepadOff.bind(this));

  Events.on('stageChanged', this.stageChanged.bind(this));
}
HandLight.prototype = Object.create(THREE.SpotLight.prototype);

HandLight.prototype.showHelper = function () {
  if (!this.controller.active) {
    return;
  }
// TWEEN.remove(this.tweenHelperOff);
// this.tweenHelperOn = new TWEEN.Tween(this.cylinderHelper.material).to({
//   opacity: this.maxHelperOpacity
// }, 1000)
//   .easing(TWEEN.Easing.Cubic.Out)
//   .start();
};

HandLight.prototype.hideHelper = function () {
  if (!this.controller.active) {
    return;
  }
  // TWEEN.remove(this.tweenHelperOn);
  if (this.controller.whoIsGrabbed !== '' || this.isEnding) {
    this.cylinderHelper.material.opacity = 0;
  }
// else {
//   this.tweenHelperOff = new TWEEN.Tween(this.cylinderHelper.material).to({
//     opacity: this.minHelperOpacity
//   }, 500)
//     .easing(TWEEN.Easing.Cubic.In)
//     .start();
// }
};

HandLight.prototype.activeCreatureChanged = function (side, creature) {
  if (State.get('stage') !== 'experience') {
    return;
  }
  if (side === this.controller.side) {
    if (creature === 'none') {
      this.fadeOutAudio();
      this.hideHelper();
    } else {
      this.fadeInAudio();
      this.showHelper();
    }
  }
};

HandLight.prototype.show = function () {
  TWEEN.remove(this.tweenOff);
  this.tweenOn = new TWEEN.Tween(this).to({
    intensity: this.maxIntensity
  }, 500)
    .easing(TWEEN.Easing.Cubic.Out)
    .start();
};

HandLight.prototype.hide = function () {
  TWEEN.remove(this.tweenOn);
  this.tweenOff = new TWEEN.Tween(this).to({
    intensity: 0
  }, 500)
    .easing(TWEEN.Easing.Cubic.In)
    .start();
  this.hideHelper();
};

HandLight.prototype.gamepadOn = function (side) {
  if (State.get('stage') === 'ending') {
    return;
  }
  if (this.controller.side === side) {
    this.show();
  }
};

HandLight.prototype.gamepadOff = function (side) {
  if (State.get('stage') === 'ending') {
    return;
  }
  if (this.controller.side === side) {
    this.fadeOutAudio();
    this.hide();
  }
};

HandLight.prototype.fadeInAudio = function () {
  TWEEN.remove(this.volumeOutTween);
  var self = this;
  this.volumeInTween = new TWEEN.Tween({
    volume: this.track.getVolume()
  })
    .to({ volume: 0.3 }, 1000)
    .onUpdate(function () {
      self.track.setVolume(this.volume);
    })
    .start();
};

HandLight.prototype.fadeOutAudio = function () {
  TWEEN.remove(this.volumeInTween);
  var self = this;
  this.volumeOutTween = new TWEEN.Tween({
    volume: this.track.getVolume()
  })
    .to({ volume: 0 }, 1000)
    .onUpdate(function () {
      self.track.setVolume(this.volume);
    })
    .start();
};

HandLight.prototype.stageChanged = function (newStage) {
  if (newStage === 'ending') {
    this.isEnding = true;
    this.fadeOutAudio();
    this.hide();
  }
};
module.exports = HandLight;
