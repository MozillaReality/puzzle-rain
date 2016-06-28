'use strict';

var THREE = require('three');
var TWEEN = require('tween.js');

var Events = require('../../events/Events');
var State = require('../../state/State');
var settings = require('../../settings');

function Dot (obj) {
  THREE.Object3D.call(this);

  this.camera = State.get('camera');
  this.creature = obj;

  var numVertices;
  switch (this.creature.race.name) {
    case 'bulrushes':
      numVertices = 7;
      break;
    case 'bouncers':
      numVertices = 6;
      break;
    case 'flyers':
      numVertices = 3;
      break;
    case 'minerals':
      numVertices = 5;
      break;
    case 'terrestrials':
      numVertices = 4;
      break;
    default:

  }
  var geometryCircleLine = new THREE.CircleGeometry(1 * this.creature.myScale, numVertices);
  // Remove center vertex
  geometryCircleLine.vertices.shift();

  var materialCircleLine = new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0, depthWrite: false});
  materialCircleLine.linewidth = 2;

  this.ring = new THREE.Line(geometryCircleLine, materialCircleLine);

  this.isPlaced = false;
  this.add(this.ring);

  Events.on('grabbed', this.grabbed.bind(this));
  Events.on('dropped', this.dropped.bind(this));
  Events.on('updateScene', this.update.bind(this));
}

Dot.prototype = Object.create(THREE.Object3D.prototype);

Dot.prototype.update = function (delta, time) {
  this.ring.quaternion.copy(this.camera.quaternion);

  var scaleVolume = THREE.Math.mapLinear(this.creature.track.averageAnalyser * Math.min(1, this.creature.track.getVolume()), 0, 100, 1.5, 3);
  this.ring.scale.set(scaleVolume, scaleVolume, scaleVolume);
  var creaturePos = new THREE.Vector3().setFromMatrixPosition(this.creature.matrixWorld);
  var distTo = this.position.distanceTo(creaturePos);
  if (distTo < 0.05 && !this.isPlaced) {
    this.isPlaced = true;
    TWEEN.remove(this.fadeOutTween);
    TWEEN.remove(this.fadeInTween);
    this.ring.material.opacity = 0.1;
    Events.emit('placed', this.creature, this.position);
  }
};

Dot.prototype.grabbed = function (side, obj) {
  if (obj === this.creature) {
    this.fadeIn();
  }
};

Dot.prototype.dropped = function (obj) {
  if (obj === this.creature) {
    this.fadeOut();
  }
};

Dot.prototype.fadeIn = function () {
  if (this.isPlaced) {
    return;
  }
  this.fadeInTween = new TWEEN.Tween(this.ring.material).to({
    opacity: 0.35
  }, 1000)
    .easing(TWEEN.Easing.Cubic.Out)
    .start();
};

Dot.prototype.fadeOut = function () {
  if (this.isPlaced) {
    return;
  }
  this.fadeOutTween = new TWEEN.Tween(this.ring.material).to({
    opacity: 0
  }, 500)
    .easing(TWEEN.Easing.Cubic.In)
    .start();
};

module.exports = Dot;
