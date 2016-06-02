'use strict';

var THREE = require('three');

var settings = require('../../../settings');
var State = require('../../../state/State');

var Race = require('../Race');
var Flyer = require('../creatures/Flyer');

var MiniFlyer = require('../MiniFlyer');

var separationX = 0.1;
var separationZ = 0.1;

function Flyers (pos) {
  Race.call(this, 'flyers', pos);

  // this.raceMesh.position.set(-0.3, -0.1, -0.3);

  var flyer = new Flyer(this, 1, new THREE.Vector3(-0.1, 0.2, -0.3), 0.05, 0.4, 2);
  this.creaturesArr.push(flyer);
  this.add(flyer);

  // this.scene = State.get('scene');

  this.miniFlyers = [];
  for (var i = 0;i < 12;i++) {
    var miniFlyer = new MiniFlyer(flyer);
    this.miniFlyers.push(miniFlyer);
    this.add(miniFlyer);
  }
}

Flyers.prototype = Object.create(Race.prototype);

module.exports = Flyers;
