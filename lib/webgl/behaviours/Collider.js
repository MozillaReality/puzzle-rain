'use strict';

var Events = require('../../events/Events');
var State = require('../../state/State');
var THREE = require('three');

var settings = require('../../settings');

var racesArr = ['bouncers', 'bulrushes', 'flyers', 'minerals', 'terrestrials'];

function Collider (obj) {
  this.obj = obj;
  this.collidableMeshList = [];
  Events.on('updateScene', this.update.bind(this));
  Events.on('activeRaceChanged', this.activeRaceChanged.bind(this));

// console.log(this.obj.children[0].geometry.boundingSphere.center);
// this.addCollidables(State.get('dummies'));
}

Collider.prototype.update = function () {
  var axis = new THREE.Vector3(1, 0, 0);
  var angle = this.obj.rotation.x;

  var directionHappy = new THREE.Vector3(0, -1, 0);
  directionHappy.applyAxisAngle(axis, angle);

  var raycasterHappy = new THREE.Raycaster(this.obj.position, directionHappy);
  var happyIntersects = raycasterHappy.intersectObjects(this.collidableMeshList);
  // console.log(this.collidableMeshList);
  if (happyIntersects.length > 0) {
    // console.log(happyIntersects);
    for (var i = 0;i < happyIntersects.length;i++) {
      // console.log(happyIntersects[i].distance);
      console.log('happy', happyIntersects[i].object.name);
    }
  }

  var directionUpset = new THREE.Vector3(0, 1, 0);
  directionUpset.applyAxisAngle(axis, angle);

  var raycasterUpset = new THREE.Raycaster(this.obj.position, directionUpset);
  var upsetIntersects = raycasterUpset.intersectObjects(this.collidableMeshList);
  // console.log(this.collidableMeshList);
  if (upsetIntersects.length > 0) {
    // console.log(happyIntersects);
    for (var i = 0;i < upsetIntersects.length;i++) {
      // console.log(happyIntersects[i].distance);
      console.log('upset', upsetIntersects[i].object.name);
    }
  }
};

Collider.prototype.activeRaceChanged = function (side, race) {
  if (side === this.obj.side) {
    if (race === 'none') {
      this.removeCollidables();
    } else {
      this.addCollidables(State.get(race).creaturesArr);
    }

  }
};

Collider.prototype.addCollidables = function (arr) {
  this.collidableMeshList = arr;
};

Collider.prototype.removeCollidables = function () {
  this.collidableMeshList = [];
};

module.exports = Collider;
