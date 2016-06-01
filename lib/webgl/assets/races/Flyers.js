'use strict';

var THREE = require('three');

var settings = require('../../../settings');

var Race = require('../Race');
var Flyer = require('../creatures/Flyer');

var separationX = 0.1;
var separationZ = 0.1;

function Flyers (pos) {
  Race.call(this, 'flyers', pos);

  // this.raceMesh.position.set(-0.3, -0.1, -0.3);

  var flyer = new Flyer(this, 1, new THREE.Vector3(-0.1, 0.2, -0.3), 0.05, 0.4, 2);
  this.creaturesArr.push(flyer);
  this.add(flyer);
}

function getInCuadrantPosition (i) {
  var vec = new THREE.Vector3();
  var row = (i % 4) - 2;
  var column = Math.floor(i / 4) - 2;
  // console.log(row, column);
  vec.x = row * (separationX + (Math.random() - 0.5) * 0.05);
  vec.y = 1 + ((Math.random() - 0.5) * 0.1);
  vec.z = column * (separationZ + (Math.random() - 0.5) * 0.05);
  return vec;
}
Flyers.prototype = Object.create(Race.prototype);

module.exports = Flyers;
