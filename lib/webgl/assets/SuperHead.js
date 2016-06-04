'use strict';

var Events = require('../../events/Events');
var State = require('../../state/State');
var settings = require('../../settings');

var BlendCharacter = require('../animation/BlendCharacter');
var THREE = require('three');

function SuperHead (hand) {
  THREE.Object3D.call(this);
  this.SuperHeadVive;

  this.mesh = new THREE.BlendCharacter();

  var self = this;
  this.mesh.load('models/superHead.json', function () {
    self.mesh.castShadow = true;
    self.mesh.receiveShadow = false;
    //
    var materials = [

      new THREE.MeshLambertMaterial({ color: 0x90A075 }),
      new THREE.MeshBasicMaterial({ color: 0xffffff})

    ];
    self.mesh.material = new THREE.MultiMaterial(materials);
    self.mesh.material.materials[0].skinning = true;
    self.mesh.material.materials[1].skinning = true;

    self.mesh.material.shading = THREE.FlatShading;

    self.add(self.mesh);
    Events.on('updateScene', self.update.bind(self));
    Events.on('surprise', self.surprise.bind(self));
  });
}

SuperHead.prototype = Object.create(THREE.Object3D.prototype);

SuperHead.prototype.update = function (delta) {
  this.mesh.update(delta);
};

SuperHead.prototype.surprise = function () {
  // this.mesh.stopAll();
  // this.mesh.unPauseAll();
  // // this.mesh.play('idle', 1);
  // this.mesh.play('end', 1);
  this.mesh.mixer.clipAction('end').loop = 2200;
  this.mesh.mixer.clipAction('end').clampWhenFinished = true;
  this.mesh.play('end', 1);
};

module.exports = SuperHead;
