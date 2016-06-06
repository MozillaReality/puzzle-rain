'use strict';

var THREE = require('three');
var TWEEN = require('tween.js');

var Events = require('../../events/Events');
var State = require('../../state/State');

function Cracks () {
  THREE.Object3D.call(this);

  this.cracksArr = [];

  var geometry = new THREE.CircleGeometry(1, 4);
  geometry.rotateX(- Math.PI / 2);
  var material = new THREE.MeshBasicMaterial({ color: 0xC9CC1E });
  var crack = new THREE.Mesh(geometry, material);
  crack.scale.set(0.05, 0.05, 0.05);
  crack.position.set(0.4, 0.02, 0.4);
  this.cracksArr.push(crack);
  this.add(crack);

  geometry = new THREE.CircleGeometry(1, 5);
  geometry.rotateX(- Math.PI / 2);
  var material = new THREE.MeshBasicMaterial({ color: 0x9f409b });
  crack = new THREE.Mesh(geometry, material);
  crack.scale.set(0.05, 0.05, 0.05);
  crack.position.set(0.5, 0.021, -0.5);
  this.cracksArr.push(crack);
  this.add(crack);

  geometry = new THREE.CircleGeometry(1, 6);
  geometry.rotateX(- Math.PI / 2);
  var material = new THREE.MeshBasicMaterial({ color: 0x9E3F36 });
  crack = new THREE.Mesh(geometry, material);
  crack.scale.set(0.05, 0.05, 0.05);
  crack.position.set(-0.6, 0.022, -0.6);
  this.cracksArr.push(crack);
  this.add(crack);

  geometry = new THREE.CircleGeometry(1, 3);
  geometry.rotateX(- Math.PI / 2);
  var material = new THREE.MeshBasicMaterial({ color: 0x035688 });
  crack = new THREE.Mesh(geometry, material);
  crack.scale.set(0.05, 0.05, 0.05);
  crack.position.set(-0.5, 0.023, 0.4);
  this.cracksArr.push(crack);
  this.add(crack);

  Events.on('stageChanged', this.stageChanged.bind(this));

}

Cracks.prototype = Object.create(THREE.Object3D.prototype);

Cracks.prototype.stageChanged = function () {
  if (State.get('stage') === 'ending') {
    tween(this.cracksArr[0].scale, 8000, 2000 + Math.random() * 2000);
    tween(this.cracksArr[1].scale, 10000, 2000 + Math.random() * 2000);
    tween(this.cracksArr[2].scale, 9000, 2000 + Math.random() * 2000);
    tween(this.cracksArr[3].scale, 7000, 2000 + Math.random() * 2000, true);
  }
};

function tween (obj, time, delay, onComplete) {
  var tween = new TWEEN.Tween(obj).to({
    x: 1,
    y: 1,
    z: 1
  }, time)
    .delay(delay)
    .start();

  if (onComplete) {
    tween.onComplete(function () {
      Events.emit('surprise');
    });
  }
}

module.exports = Cracks;
