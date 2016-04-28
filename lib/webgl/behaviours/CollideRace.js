'use strict';

var Events = require('../../events/Events');
var State = require('../../state/State');
var THREE = require('three');

var settings = require('../../settings');

var racesArr = ['bouncers', 'bulrushes', 'flyers', 'minerals', 'terrestrials'];

function CollideRace (obj) {
  this.obj = obj;
  this.value = 'none';
  this.collidableRaceMeshList = [];
  for (var i = 0; i < racesArr.length;i++) {
    this.collidableRaceMeshList.push(State.get(racesArr[i]).boundingBoxMesh);
  }
  Events.on('updateScene', this.update.bind(this));
}

CollideRace.prototype.update = function () {
  for (var vertexIndex = 0; vertexIndex < this.obj.myBoundingPlane.geometry.vertices.length; vertexIndex++) {
    var localVertex = this.obj.myBoundingPlane.geometry.vertices[vertexIndex].clone();
    var globalVertex = localVertex.applyMatrix4(this.obj.matrix);
    var directionVector = globalVertex.sub(this.obj.position);
    var ray = new THREE.Raycaster(this.obj.position, directionVector.clone().normalize());
    var collisionResults = ray.intersectObjects(this.collidableRaceMeshList);
    if (collisionResults.length > 0 && collisionResults[0].distance < directionVector.length()) {
      for (var i = 0;i < collisionResults.length;i++) {
        if (collisionResults[i].distance < 0.1) {
          console.log('coll', collisionResults[i].object.race);
        }
      // if (collisionResults[i].distance < 0.1) {
      //   // console.log('coll', collisionResults[i].object.name);
      //   // console.log(collisionResults[i]);
      //   collisionResults[i].object.parent.makeCollision(this.obj.side, collisionResults[i].point);
      // // console.log(collisionResults[i].distance);
      // }
      }
    }
  }
};

module.exports = CollideRace;
