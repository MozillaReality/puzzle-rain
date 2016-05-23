'use strict';

var THREE = require('three');
var settings = require('../../../settings');
var Creature = require('../Creature');
var EasingFunctions = require('../../utils/EasingFunctions');

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
  geometry.translate(0, 0.5, 0);
  this.originalColor = settings.bouncersColor;
  this.material = new THREE.MeshStandardMaterial({color: this.originalColor, roughness: 1, metalness: 0.5, shading: THREE.FlatShading});
  // this.material = new THREE.MeshStandardMaterial({color: 0x444444, emissive: this.originalColor, emissiveIntensity: 0.5, shading: THREE.FlatShading});
  this.mesh = new THREE.Mesh(geometry, this.material);
  this.mesh.name = 'bouncer_' + index;
  this.mesh.receiveShadow = true;
  this.mesh.castShadow = true;

  this.eyes.position.set(0, 0.8, 0.2);
  this.mouth.position.set(0, 0.45, 0.5);
  this.phase = Math.random() * Math.PI * 2;
  this.body.add(this.mesh);
}

Bouncer.prototype = Object.create(Creature.prototype);

Bouncer.prototype.update = function (delta, time) {
  var userPos = new THREE.Vector3().setFromMatrixPosition(this.camera.matrixWorld).sub(this.parent.position);
  this.lookAt(new THREE.Vector3(userPos.x, 0, userPos.z));

  var emotion = emotions[this.status];

  var offsetTime = time - this.lastStatusTime;
  this.body.rotation.set(0, 0, 0);

  if (this.raceObj.status === 'asleep') {
    var sleepingPerc = this.raceObj.awake.awakeLevel * 2;
    var k = EasingFunctions.InOutCubic(sleepingPerc);
    this.body.position.y = 1.0 * k + (Math.sin(emotion.frequency * time + this.phase + Math.PI / 2) + 1) * emotion.amplitude;

    if (this.status === 'upset') {
      this.material.opacity = 0.4;
      this.eyes.setOpacity(0.4);
      this.body.rotation.y += Math.sin(offsetTime * Math.PI * 2 * 5) * 0.5;
    } else {
      this.material.opacity = 0.3 + 0.7 * sleepingPerc;
    }
  } else {
    this.eyes.setOpacity(1.0);
    this.material.opacity = 1.0;
    this.body.position.y = 1.0 + (Math.sin(emotion.frequency * time + this.phase + Math.PI / 2) + 1) * emotion.amplitude;

    if (this.status == 'normal') {
    } else {
      if (this.status == 'upset') {
        var k = EasingFunctions.InOutCubic(offsetTime);
        this.body.rotation.y += Math.sin(k * Math.PI * 6) * 0.5;
      }
      else if (this.status == 'happy') {
        var k = EasingFunctions.InOutQuad(offsetTime);
        this.body.rotation.x += -Math.sin(k * Math.PI * 6) * 0.5;
      }
    }
  }

};

module.exports = Bouncer;
