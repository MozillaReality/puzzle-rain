'use strict';

var THREE = require('three');

var Race = require('../Race');
var Terrestrial = require('../creatures/Terrestrial');

function Terrestrials (initCuadrant) {
  Race.call(this, 'terrestrials', initCuadrant);
  // Add 3 creatures
  var terrestrial = new Terrestrial(this, 0, new THREE.Vector3(0, 0, 0), 0.4);
  this.creaturesArr.push(terrestrial.mesh);
  this.add(terrestrial);
  terrestrial = new Terrestrial(this, 1, new THREE.Vector3(0.5, 0, 0.2), 0.3);
  this.creaturesArr.push(terrestrial.mesh);
  this.add(terrestrial);
  terrestrial = new Terrestrial(this, 2, new THREE.Vector3(-0.5, 0, -0.2), 0.2);
  this.creaturesArr.push(terrestrial.mesh);
  this.add(terrestrial);
}

Terrestrials.prototype = Object.create(Race.prototype);

Terrestrials.prototype.update = function (delta, time) {
  Race.prototype.update.call(this, delta, time);
};

module.exports = Terrestrials;
