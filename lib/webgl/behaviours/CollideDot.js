'use strict';

var THREE = require('three');

var Events = require('../../events/Events');
var State = require('../../state/State');

function CollideDot () {
  this.camera = State.get('camera');
  this.intersectArr = [];
  this.raycaster = new THREE.Raycaster();
  Events.on('updateScene', this.update.bind(this));
}

CollideDot.prototype.update = function () {
  this.raycaster.setFromCamera({ x: 0, y: 0 }, this.camera);
  var intersects = this.raycaster.intersectObjects(this.intersectArr);
  if (intersects.length > 0) {
    var arrCreatures = [];
    var arrCreatureDots = [];
    for (var i = 0;i < intersects.length;i++) {
      // console.log(intersects[i].object.type);
      if (intersects[i].object.type === 'Line') {
        arrCreatureDots.push(intersects[i].object.parent.creature);
      }
      if (intersects[i].object.type === 'Mesh') {
        arrCreatures.push(intersects[i].object.parent.parent);
      }
      // if (intersects[i].object.parent.creature.bodyMesh) {
      //   console.log(intersects[i].object.parent.creature.bodyMesh.name);
      //   arrNameDots.push(intersects[i].object.parent.creature.bodyMesh.name);
      // } else {
      //   if (intersects[i].object.parent.parent.bodyMesh) {
      //     arrNameCreatures.push(intersects[i].object.parent.parent.bodyMesh.name);
      //   }
      // }

    // console.log(intersects[i].object.name === intersects[i].object.creature.name);
    //   if (this.lastCollideDot !== intersects[i].object.parent.parent) {
    //     Events.emit('activeCreatureChanged', this.controller.side, intersects[i].object.parent.parent);
    //     this.lastCollideDot = intersects[i].object.parent.parent;
    //   }
    }
    // console.log(intersects.length, arrCreatures, arrCreatureDots);
    for (var i = 0; i < arrCreatures.length; i++) {
      // console.log(arrCreatures[i].bodyMesh.name);
      for (var j = 0; j < arrCreatureDots.length; j++) {
        // console.log(arrCreatureDots[j].bodyMesh.name);
        if (arrCreatures[i].bodyMesh.name === arrCreatureDots[j].bodyMesh.name) {
          if (this.lastCollideDot !== arrCreatures[i]) {
            Events.emit('creatureDotCollided', arrCreatures[i]);
            this.lastCollideDot = arrCreatures[i];
          }
        }
      }
    }
  } else {
    if (this.lastCollideDot !== 'none') {
      Events.emit('creatureDotCollided', 'none');
      this.lastCollideDot = 'none';
    }
  }
};

CollideDot.prototype.addIntersect = function (arr) {
  this.intersectArr = this.intersectArr.concat(arr);
};

module.exports = CollideDot;
