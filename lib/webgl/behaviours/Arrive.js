'use strict';

var Events = require('../../events/Events');
var State = require('../../state/State');
var THREE = require('three');

var settings = require('../../settings');

// INIT CODE BASED ON: natureofcode.com/book/chapter-6-autonomous-agents/
function Arrive (race) {
  this.race = race;

  this.mass = 1;
  this.maxSpeed = 0.05;
  this.position = new THREE.Vector3();
  this.velocity = new THREE.Vector3();
  this.maxForce = 2;
  this.steeringForce = new THREE.Vector3();
  this.arrivalThreshold = 1;
  this.view = new THREE.Mesh(new THREE.SphereGeometry(0.05, 3, 2), new THREE.MeshBasicMaterial({ color: settings[race + 'Color']}));
  this.dummy = new THREE.Vector3();
  this.rotationZ = 0;
  this.rotationX = 0;

  this.target0 = State.get('controllerR');
  this.target1 = State.get('controllerL');
  Events.on('updateScene', this.update.bind(this));
}

// Method to update location
Arrive.prototype.update = function (timestamp) {
  this.arrive();
  this.steeringForce.setLength(Math.min(this.maxForce, this.steeringForce.length()));

  this.steeringForce = this.steeringForce.divideScalar(this.mass);

  this.velocity = this.velocity.add(this.steeringForce);
  this.steeringForce.set(0, 0, 0);

  // truncate
  this.velocity.setLength(Math.min(this.maxSpeed, this.velocity.length()));

  // add velocity to position
  this.position = this.position.add(this.velocity);
  this.rotationZ += - ( (this.rotationZ + Math.atan((this.position.x - this.view.position.x) * 0.01)) ) / 20;
  this.rotationX += - ( (this.rotationX - Math.atan((this.position.y - this.view.position.y) * 0.01)) ) / 20;
  // this.rotationZ= -Math.atan(this.velocity.x*0.01);
  // this.rotationX= Math.atan(this.velocity.y*0.01);

  // update position of sprite
  this.view.position.x = this.position.x;
  this.view.position.y = this.position.y;

};

Arrive.prototype.getTargetPosition = function () {
  var target = new THREE.Vector3();
  if (this.target0 !== undefined && this.target0.activeRace === this.race) {
    target = this.target0.position;
  }
  if (this.target1 !== undefined && this.target1.activeRace === this.race) {
    target = this.target1.position;
  }
  if (this.target0 !== undefined && this.target0.activeRace === this.race && this.target1 !== undefined && this.target1.activeRace === this.race) {
    // Mid point
    target = new THREE.Vector3((this.target0.position.x + this.target1.position.x) / 2, (this.target0.position.y + this.target1.position.y) / 2, (this.target0.position.z + this.target1.position.z) / 2);
  }
  return target;
};

Arrive.prototype.arrive = function () {
  var target = this.getTargetPosition();

  var desiredVelocity = this.dummy.subVectors(target, this.position);
  desiredVelocity.normalize();

  var dist = this.position.distanceTo(target);

  if (dist > this.arrivalThreshold) {
    desiredVelocity = desiredVelocity.multiplyScalar(this.maxSpeed);

  } else {
    desiredVelocity = desiredVelocity.multiplyScalar(this.maxSpeed * dist / this.arrivalThreshold);

  }

  this.steeringForce = this.steeringForce.add(desiredVelocity.sub(this.velocity));

};
// END CODE BASED ON: natureofcode.com/book/chapter-6-autonomous-agents/

module.exports = Arrive;
