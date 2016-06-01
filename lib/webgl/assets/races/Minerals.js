'use strict';

var THREE = require('three');

var settings = require('../../../settings');

var Race = require('../Race');
var Mineral = require('../creatures/Mineral');
var RaceMesh = require('../RaceMesh');

function Minerals (pos) {
  Race.call(this, 'minerals', pos);

  this.raceMesh = new RaceMesh(this);
  this.raceMesh.position.set(0, 0.4, 0);
  this.add(this.raceMesh);

  var mineral = new Mineral(this, 1, new THREE.Vector3(-0.4, 0, -0.1), 0.08, 0.45, 1.9);
  this.creaturesArr.push(mineral);
  this.add(mineral);

  mineral = new Mineral(this, 2, new THREE.Vector3(-0.3, 0, 0.2), 0.06, 0.35, 1.8);
  this.creaturesArr.push(mineral);
  this.add(mineral);

}

Minerals.prototype = Object.create(Race.prototype);

module.exports = Minerals;
