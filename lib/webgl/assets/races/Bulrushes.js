'use strict';

var THREE = require('three');

var settings = require('../../../settings');

var Race = require('../Race');
var Bulrush = require('../creatures/Bulrush');

function Bulrushes (pos) {
  Race.call(this, 'bulrushes', pos);

  // var objectLoader = new THREE.ObjectLoader();
  // var self = this;
  // objectLoader.load('models/races/' + this.name + '.json', function (obj) {
  //   self.raceMesh = obj;
  //   // obj.children.forEach(function (value) {
  //   //   if (value instanceof THREE.Mesh) {
  //   //   }
  //   // });
  //   self.add(obj);
  // });

  var bulrush = new Bulrush(this, 1, new THREE.Vector3(-0.3, 0.3, 0.1), 0.11, 0.4, 1.9);
  this.creaturesArr.push(bulrush);
  this.add(bulrush);
  bulrush = new Bulrush(this, 2, new THREE.Vector3(-0.3, 0.2, -0.3), 0.08, 0.3, 1.9);
  this.creaturesArr.push(bulrush);
  this.add(bulrush);
}

Bulrushes.prototype = Object.create(Race.prototype);

module.exports = Bulrushes;
