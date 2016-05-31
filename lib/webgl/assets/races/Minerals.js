'use strict';

var THREE = require('three');

var settings = require('../../../settings');

var Race = require('../Race');
var Mineral = require('../creatures/Mineral');



function Minerals (pos) {
  Race.call(this, 'minerals', pos);

  var mineral = new Mineral(this, 1, new THREE.Vector3(-0.1, 0.04, -0.3), 0.08, 0.45, 1.9);
  this.creaturesArr.push(mineral);
  this.add(mineral);

  mineral = new Mineral(this, 2, new THREE.Vector3(-0.1, 0.03, 0.3), 0.06, 0.35, 1.8);
  this.creaturesArr.push(mineral);
  this.add(mineral);

}

Minerals.prototype = Object.create(Race.prototype);

module.exports = Minerals;
