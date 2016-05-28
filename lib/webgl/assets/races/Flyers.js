'use strict';

var THREE = require('three');

var settings = require('../../../settings');

var Race = require('../Race');
var Flyer = require('../creatures/Flyer');

var GroupHandler = require('../GroupHandler');

var separationX = 0.1;
var separationZ = 0.1;

function Flyers () {
  Race.call(this, 'flyers');

  this.position.set(0.66, 0, -0.66);

  var group1Handler = new GroupHandler(this, 0.03, settings[this.race + 'Color'], this.race + '_1', 1.2, 2.2);
  group1Handler.position.set(0, 0, 0);
  this.creaturesArr.push(group1Handler);
  this.add(group1Handler);

  // Add 16 creatures
  for (var i = 0;i < 16;i++) {
    var flyer = new Flyer(this, group1Handler, 1, new THREE.Vector3(0, 0, 0), 0.01);
    this.creaturesArr.push(flyer.mesh);
    flyer.mouth.scale.x = 0.5;
    this.add(flyer);
  }
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
