'use strict';

var THREE = require('three');

var Race = require('../Race');
var Bouncer = require('../creatures/Bouncer');

function Bouncers (pos) {
  Race.call(this, 'bouncers', pos);
  // Add 4 creatures
  var bouncer = new Bouncer(new THREE.Vector3(0, 0, 0), 0.2);
  this.add(bouncer);
  bouncer = new Bouncer(new THREE.Vector3(0.2, 0, 0.2), 0.1);
  this.add(bouncer);
  bouncer = new Bouncer(new THREE.Vector3(-0.2, 0, 0.1), 0.1);
  this.add(bouncer);
  bouncer = new Bouncer(new THREE.Vector3(0.3, 0, -0.3), 0.3);
  this.add(bouncer);
}

Bouncers.prototype = Object.create(Race.prototype);

module.exports = Bouncers;
