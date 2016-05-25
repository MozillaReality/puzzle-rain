'use strict';

var THREE = require('three');

var settings = require('../../../settings');

var Speaker = require('../Speaker');
var AudioManager = require('../../managers/AudioManager');

var Race = require('../Race');
var Bulrush = require('../creatures/Bulrush');

var cuadrantWidth = 0.2;
var cuadrantHeight = 0.2;

var totalCreatures = 12;
var groups = 2;

function Bulrushes (initCuadrant) {
  Race.call(this, 'bulrushes', initCuadrant);

  // Add 12 creatures
  for (var i = 0;i < totalCreatures;i++) {
    var group = 1;
    if (i > 5) {
      group = 2;
    }
    var bulrush = new Bulrush(this, group, i, getInCuadrantPosition(i), 0.1);
    this.creaturesArr.push(bulrush.mesh);
    this.add(bulrush);
  }

  this.dummyGroup1 = new THREE.Object3D();
  if (settings.debugHelpers) {
    var helper = new THREE.Mesh(
      new THREE.BoxBufferGeometry(0.025, 0.025, 0.025),
      new THREE.MeshBasicMaterial({ color: settings[this.race + 'Color']})
    );
    this.dummyGroup1.add(helper);
  }
  this.dummyGroup1.position.set(-0.25, 0, 0.1);
  this.add(this.dummyGroup1);

  this.dummyGroup2 = new THREE.Object3D();
  if (settings.debugHelpers) {
    var helper = new THREE.Mesh(
      new THREE.BoxBufferGeometry(0.025, 0.025, 0.025),
      new THREE.MeshBasicMaterial({ color: settings[this.race + 'Color']})
    );
    this.dummyGroup2.add(helper);
  }
  this.dummyGroup2.position.set(0.25, 0, 0.1);
  this.add(this.dummyGroup2);

  this.trackGroup1 = new AudioManager(this.race + '_1', this.speaker, true, true);
  this.trackGroup1.setVolume(0);

  this.trackGroup2 = new AudioManager(this.race + '_2', this.speaker, true, true);
  this.trackGroup2.setVolume(0);
}

function getInCuadrantPosition (i) {
  var vec = new THREE.Vector3();
  var row = (i % 4) - 1;
  var column = Math.floor(i / 4) - 1;
  // vec.x = row * (cuadrantWidth + (Math.random() - 0.5) * 0.1);
  // vec.z = column * (cuadrantHeight + (Math.random() - 0.5) * 0.1);
  vec.x = row * cuadrantWidth;
  vec.z = column * cuadrantHeight;
  return vec;
}
Bulrushes.prototype = Object.create(Race.prototype);

Bulrushes.prototype.update = function (delta, time) {
  Race.prototype.update.call(this, delta, time);
  var volumeChange = ((this.camera.position.y - 0.6) - this.arrive.position.y) * 0.1;
  var newVolume = THREE.Math.clamp(this.trackGroup1.getVolume() - volumeChange, 0, 1);
  this.trackGroup1.setVolume(newVolume);
  this.trackGroup2.setVolume(newVolume);

};

module.exports = Bulrushes;
