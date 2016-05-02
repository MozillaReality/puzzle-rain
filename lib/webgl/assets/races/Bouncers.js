'use strict';

var THREE = require('three');

var Race = require('../Race');
var Bouncer = require('../creatures/Bouncer');

function Bouncers (initCuadrant) {
  Race.call(this, 'bouncers', initCuadrant);
  // Add 4 creatures
  var bouncer = new Bouncer(this, 0, new THREE.Vector3(0, 0, 0), 0.2);
  this.creaturesArr.push(bouncer.mesh);
  this.add(bouncer);
  bouncer = new Bouncer(this, 1, new THREE.Vector3(0.2, 0.8, 0.2), 0.1);
  this.creaturesArr.push(bouncer.mesh);
  this.add(bouncer);
  bouncer = new Bouncer(this, 2, new THREE.Vector3(-0.2, 1, 0.1), 0.1);
  this.creaturesArr.push(bouncer.mesh);
  this.add(bouncer);
  bouncer = new Bouncer(this, 3, new THREE.Vector3(0.3, 0.5, -0.3), 0.3);
  this.creaturesArr.push(bouncer.mesh);
  this.add(bouncer);
}

Bouncers.prototype = Object.create(Race.prototype);

module.exports = Bouncers;
