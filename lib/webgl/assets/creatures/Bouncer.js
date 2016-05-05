'use strict';

var THREE = require('three');
var settings = require('../../../settings');
var Creature = require('../Creature');

var emotions = {
  'asleep': { 'body_color': 0xFFFF00, 'eye_color': 0x333333, 'frequency': 2, 'amplitude': 0.05, opacity: 0.1 },
  'asleep_upset': { 'body_color': 0xFF0000, 'eye_color': 0xFFFF00, opacity: 0.3 },
  'normal': { 'body_color': 0xFFFF00, 'eye_color': 0x333333, 'frequency': 2, 'amplitude': 0.05, opacity: 1.0 },
  'happy': { 'body_color': 0xFFFF00, 'eye_color': 0x333333, 'frequency': 2, 'amplitude': 0.05, opacity: 1.0 },
  'upset': { 'body_color': 0xFFFF00, 'eye_color': 0x333333, 'frequency': 2, 'amplitude': 0.05, opacity: 1.0 },
};

function Bouncer (raceObj, index, pos, scale) {
  Creature.call(this, raceObj, index, pos, scale);

  var geometry = new THREE.IcosahedronGeometry(0.5, 1);
  geometry.applyMatrix(new THREE.Matrix4().makeTranslation(0, 0.5, 0));
  this.originalColor = settings.bouncersColor;
  this.material = new THREE.MeshStandardMaterial({color: this.originalColor, transparent: true, opacity: 0.3, shading: THREE.FlatShading});
  this.mesh = new THREE.Mesh(geometry, this.material);
  this.mesh.name = 'bouncer_' + index;
  this.mesh.receiveShadow = true;
  this.mesh.castShadow = true;

  this.eyes.position.set(0,0.8,0.2);
  //this.eyes.position.set(0,0.3,0.2);
  this.phase = Math.random() * Math.PI*2;
  this.add(this.mesh);
}

Bouncer.prototype = Object.create(Creature.prototype);

function bounceOut(t) {
  var a = 4.0 / 11.0;
  var b = 8.0 / 11.0;
  var c = 9.0 / 10.0;

  var ca = 4356.0 / 361.0;
  var cb = 35442.0 / 1805.0;
  var cc = 16061.0 / 1805.0;

  var t2 = t * t;

  return t < a
    ? 7.5625 * t2
    : t < b
      ? 9.075 * t2 - 9.9 * t + 3.4
      : t < c
        ? ca * t2 - cb * t + cc
        : 10.8 * t * t - 20.52 * t + 10.72;
}

var EasingFunctions = {
  // no easing, no acceleration
  linear: function (t) { return t },
  // accelerating from zero velocity
  InQuad: function (t) { return t*t },
  // decelerating to zero velocity
  OutQuad: function (t) { return t*(2-t) },
  // acceleration until halfway, then deceleration
  InOutQuad: function (t) { return t<.5 ? 2*t*t : -1+(4-2*t)*t },
  // accelerating from zero velocity
  InCubic: function (t) { return t*t*t },
  // decelerating to zero velocity
  OutCubic: function (t) { return (--t)*t*t+1 },
  // acceleration until halfway, then deceleration
  InOutCubic: function (t) { return t<.5 ? 4*t*t*t : (t-1)*(2*t-2)*(2*t-2)+1 },
  // accelerating from zero velocity
  InQuart: function (t) { return t*t*t*t },
  // decelerating to zero velocity
  OutQuart: function (t) { return 1-(--t)*t*t*t },
  // acceleration until halfway, then deceleration
  InOutQuart: function (t) { return t<.5 ? 8*t*t*t*t : 1-8*(--t)*t*t*t },
  // accelerating from zero velocity
  InQuint: function (t) { return t*t*t*t*t },
  // decelerating to zero velocity
  OutQuint: function (t) { return 1+(--t)*t*t*t*t },
  // acceleration until halfway, then deceleration
  InOutQuint: function (t) { return t<.5 ? 16*t*t*t*t*t : 1+16*(--t)*t*t*t*t },

  elasticInOut: function(t) {
    return t < 0.5
      ? 0.5 * Math.sin(+13.0 * Math.PI/2 * 2.0 * t) * Math.pow(2.0, 10.0 * (2.0 * t - 1.0))
      : 0.5 * Math.sin(-13.0 * Math.PI/2 * ((2.0 * t - 1.0) + 1.0)) * Math.pow(2.0, -10.0 * (2.0 * t - 1.0)) + 1.0;
  },
  bounceInOut(t) {
  return t < 0.5
    ? 0.5 * (1.0 - bounceOut(1.0 - t * 2.0))
    : 0.5 * bounceOut(t * 2.0 - 1.0) + 0.5;
}
}

Bouncer.prototype.update = function (delta, time) {
  var emotion = emotions[this.status];

  var offsetTime = time - this.lastStatusTime;
  this.rotation.set(0,0,0);

  if (this.raceObj.status === 'asleep') {
    var sleepingPerc = this.raceObj.awake.awakeLevel * 2;
    var k = EasingFunctions.InOutCubic(sleepingPerc);
    this.position.y = 1.0 * k + (Math.sin(emotion.frequency * time + this.phase + Math.PI/2)+1) * emotion.amplitude;

    if (this.status === 'upset') {
      this.material.opacity = 0.4;
      this.eyes.setOpacity(0.4);
      this.rotation.y = Math.sin(offsetTime * Math.PI * 2 * 5) * 0.5;
    } else {
      this.material.opacity = 0.3 + 0.7 * sleepingPerc;
    }
  } else {
    this.eyes.setOpacity(1.0);
    this.material.opacity = 1.0;

    var k = EasingFunctions.InOutQuad(offsetTime);
    //k = offsetTime;
    this.position.y = 1.0 + (Math.sin(emotion.frequency * time + this.phase + Math.PI/2)+1) * emotion.amplitude;
    //this.position.y = 1.0 + Math.sin(emotion.frequency * time + this.phase) * emotion.amplitude;

    if (this.status == 'normal') {
    } else if (this.status == 'upset') {
      this.rotation.y = Math.sin(k * Math.PI * 6) * 0.5;
    } else if (this.status == 'happy') {
      this.rotation.x = Math.sin(k * Math.PI * 2) * 0.5;
    }
  }

};

module.exports = Bouncer;
