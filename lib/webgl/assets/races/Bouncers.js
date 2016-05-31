'use strict';

var THREE = require('three');

var settings = require('../../../settings');

var Race = require('../Race');
var Bouncer = require('../creatures/Bouncer');

var GroupHandler = require('../GroupHandler');

function Bouncers (pos) {
  Race.call(this, 'bouncers', pos);

  var bouncer = new Bouncer(this, 1, new THREE.Vector3(0, 0.2, 0), 0.1, 0.45, 1.8);
  this.creaturesArr.push(bouncer);
  this.add(bouncer);
  bouncer = new Bouncer(this, 2, new THREE.Vector3(0.2, 0.25, 0.2), 0.08, 0.4, 2);
  this.creaturesArr.push(bouncer);
  this.add(bouncer);
  bouncer = new Bouncer(this, 3, new THREE.Vector3(-0.2, 0.35, 0.1), 0.05, 0.5, 1.9);
  this.creaturesArr.push(bouncer);
  this.add(bouncer);
  bouncer = new Bouncer(this, 4, new THREE.Vector3(0.3, 0.15, -0.3), 0.065, 0.3, 2);
  this.creaturesArr.push(bouncer);
  this.add(bouncer);

}

Bouncers.prototype = Object.create(Race.prototype);

module.exports = Bouncers;
