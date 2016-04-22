'use strict';

var Events = require('../../events/Events');
var settings = require('../../settings');
var THREE = require('three');

var initialized = false,
  totalCreatures = 2,
  creaturesLoaded = 0;

function CreaturesManager () {
}

function loadCreature (rage, self) {
  var objectLoader = new THREE.JSONLoader();
  objectLoader.load('models/' + rage + '.json', function (geometry, materials) {
    var mat = new THREE.MultiMaterial(materials);
    self[rage + 'Mesh'] = new THREE.Mesh(geometry, mat);
    geometry.computeFaceNormals();
    geometry.computeVertexNormals();
    mat.materials.forEach(function (value) {
      value.shading = THREE.FlatShading;
      value.shininess = 0;
    });
    console.log(rage + ' loaded');
    Events.emit('creatureMeshLoaded');
  });
}

function creatureMeshLoaded () {
  creaturesLoaded++;
  if (creaturesLoaded === totalCreatures) {
    Events.emit('creaturesLoaded');
  }
}

CreaturesManager.prototype.init = function () {
  if (initialized) {
    return;
  }
  initialized = true;

  Events.on('creatureMeshLoaded', creatureMeshLoaded);

  loadCreature('terrestrial', this);
  loadCreature('bouncer', this);
};

module.exports = new CreaturesManager();
