'use strict';

const Events = require('../../events/Events');
const settings = require('../../settings');
const THREE = require('three');

let initialized = false,
  totalCreatures = 2,
  creaturesLoaded = 0;

function CreaturesManager () {
  Events.on('changeTerrestrialBehaviour', changeTerrestrialBehaviour);
  Events.on('changeBouncerBehaviour', changeBouncerBehaviour);
}

function changeTerrestrialBehaviour () {
  if (settings.terrestrialsBehaviour === 0) {
    settings.terrestrialsBehaviour = 1;
  } else {
    settings.terrestrialsBehaviour = 0;
  }
}

function changeBouncerBehaviour () {
  if (settings.bouncersBehaviour === 0) {
    settings.bouncersBehaviour = 1;
  } else {
    settings.bouncersBehaviour = 0;
  }
}

function loadCreature (rage, scope) {
  const objectLoader = new THREE.JSONLoader();
  objectLoader.load('models/' + rage + '.json', function (geometry, materials) {
    const mat = new THREE.MultiMaterial(materials);
    scope[rage + 'Mesh'] = new THREE.Mesh(geometry, mat);
    geometry.computeFaceNormals();
    geometry.computeVertexNormals();
    mat.materials.forEach(value => {
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
