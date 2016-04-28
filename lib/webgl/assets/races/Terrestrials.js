'use strict';

var THREE = require('three');

var Race = require('../Race');
var Terrestrial = require('../creatures/Terrestrial');

function Terrestrials (pos) {
  Race.call(this, 'terrestrials', pos);
  // Add 3 creatures
  var terrestrial = new Terrestrial(0, new THREE.Vector3(0, 0, 0), 0.4);
  this.add(terrestrial);
  terrestrial = new Terrestrial(1, new THREE.Vector3(0.5, 0, 0.2), 0.3);
  this.add(terrestrial);
  terrestrial = new Terrestrial(2, new THREE.Vector3(-0.5, 0, -0.2), 0.2);
  this.add(terrestrial);
}

Terrestrials.prototype = Object.create(Race.prototype);

module.exports = Terrestrials;
