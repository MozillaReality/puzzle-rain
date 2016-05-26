// 'use strict';

var Events = require('../../events/Events');
var State = require('../../state/State');
var THREE = require('three');

function Collider (obj) {
  this.obj = obj;
  this.collidableMeshList = [];
  Events.on('updateScene', this.update.bind(this));
  Events.on('activeRaceChanged', this.activeRaceChanged.bind(this));
}

Collider.prototype.update = function () {
  for (var vertexIndex = 0; vertexIndex < this.obj.myBoundingPlane.geometry.vertices.length; vertexIndex++) {
    var localVertex = this.obj.myBoundingPlane.geometry.vertices[vertexIndex].clone();
    var globalVertex = localVertex.applyMatrix4(this.obj.matrix);
    var directionVector = globalVertex.sub(this.obj.position);
    var ray = new THREE.Raycaster(this.obj.position, directionVector.clone().normalize());
    var collisionResults = ray.intersectObjects(this.collidableMeshList);
    if (collisionResults.length > 0 && collisionResults[0].distance < directionVector.length()) {
      for (var i = 0;i < collisionResults.length;i++) {
        if (collisionResults[i].distance < 0.1) {
          Events.emit('collisionDispatched', collisionResults[i].object, this.obj.side, collisionResults[i].point);
        }
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

Collider.prototype.addCollidables = function (creatures) {
  this.collidableMeshList = creatures;
};

Collider.prototype.removeCollidables = function () {
  this.collidableMeshList = [];
};

module.exports = Collider;
