// 'use strict';

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
}

Collider.prototype.update = function () {
  this.getHandInstersections();
  this.getHappyInstersections();

};

Collider.prototype.getHandInstersections = function () {
  for (var vertexIndex = 0; vertexIndex < this.obj.myBoundingPlane.geometry.vertices.length; vertexIndex++) {
    var localVertex = this.obj.myBoundingPlane.geometry.vertices[vertexIndex].clone();
    var globalVertex = localVertex.applyMatrix4(this.obj.matrix);
    var directionVector = globalVertex.sub(this.obj.position);
    var ray = new THREE.Raycaster(this.obj.position, directionVector.clone().normalize());
    var collisionResults = ray.intersectObjects(this.collidableMeshList);
    if (collisionResults.length > 0 && collisionResults[0].distance < directionVector.length()) {
      // if (collisionResults.length > 0 && collisionResults[0].distance < directionVector.length()){
      for (var i = 0;i < collisionResults.length;i++) {
        if (collisionResults[i].distance < 0.1) {
          // console.log('coll', collisionResults[i].object.name);
          // console.log(collisionResults[i]);
          // collisionResults[i].object.parent.makeCollision(this.obj.side, collisionResults[i].point);
          Events.emit('collisionDispatched', collisionResults[i].object, this.obj.side, collisionResults[i].point);
        // console.log(collisionResults[i].distance);
        }
      }
    }
  }
};

Collider.prototype.getHappyInstersections = function () {
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
      // console.log('happy', happyIntersects[i].object.name);
      if (happyIntersects[i].distance < 0.5) {
        Events.emit('happyDispatched', happyIntersects[i].object);
      // happyIntersects[i].object.parent.makeHappy();
      }
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
