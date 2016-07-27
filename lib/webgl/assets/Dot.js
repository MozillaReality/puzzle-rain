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
  this.numVertices = numVertices;
  var geometryCircleLine = new THREE.CircleGeometry(1 * this.creature.radius, this.numVertices);
  // Remove center vertex
  geometryCircleLine.vertices.shift();

  var materialCircleLine = new THREE.LineDashedMaterial({
    color: 0xffffff,
  dashSize: 0.002, gapSize: 0.005,transparent: true, opacity: 0, depthWrite: false});
  materialCircleLine.linewidth = 2;
  geometryCircleLine.computeLineDistances();

  this.ring = new THREE.Line(geometryCircleLine, materialCircleLine);

  this.isPlaced = false;
  this.add(this.ring);

  Events.on('grabbed', this.grabbed.bind(this));
  Events.on('dropped', this.dropped.bind(this));
  Events.on('updateScene', this.update.bind(this));

  Events.on('placed', this.placed.bind(this));
}

Dot.prototype = Object.create(THREE.Object3D.prototype);

Dot.prototype.update = function (delta, time) {
  this.ring.quaternion.copy(this.camera.quaternion);
  if (!this.isPlaced) {
    var scaleVolume = THREE.Math.mapLinear(this.creature.track.averageAnalyser * Math.min(1, this.creature.track.getVolume()), 0, 100, 1.5, 3);
    this.ring.scale.set(scaleVolume, scaleVolume, scaleVolume);
  }
};

Dot.prototype.placed = function (side, obj) {
  if (obj === this.creature) {
    this.isPlaced = true;
    TWEEN.remove(this.fadeOutTween);
    TWEEN.remove(this.fadeInTween);
    this.ring.material.opacity = 0.1;
    this.ring.material.gapSize = 0;
    new TWEEN.Tween(this.position).to({
      x: this.creature.dotPosFinal.x,
      y: this.creature.dotPosFinal.y,
      z: this.creature.dotPosFinal.z
    }, 3000)
      .easing(TWEEN.Easing.Circular.Out)
      .start();
  }
};

Dot.prototype.grabbed = function (side, obj) {
  if (obj === this.creature) {
    this.fadeIn();
  }
};

Dot.prototype.dropped = function (obj) {
  if (obj === this.creature && !this.creature.isPlaced) {
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
