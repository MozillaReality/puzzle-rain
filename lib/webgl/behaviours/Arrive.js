'use strict';

var Events = require('../../events/Events');
var State = require('../../state/State');
var THREE = require('three');

var settings = require('../../settings');

// INIT CODE BASED ON: natureofcode.com/book/chapter-6-autonomous-agents/
function Arrive (obj) {
  this.obj = obj;

  this.mass = 10;
  this.maxSpeed = 0.5;
  this.position = new THREE.Vector3();
  this.velocity = new THREE.Vector3();
  this.maxForce = 2;
  this.steeringForce = new THREE.Vector3();
  this.arrivalThreshold = 10;
  this.view = new THREE.Mesh(new THREE.SphereGeometry(0.05, 3, 2), new THREE.MeshBasicMaterial({ color: settings[this.obj.race + 'Color']}));
  this.dummy = new THREE.Vector3();
  Events.on('updateScene', this.update.bind(this));
  Events.on('gamepadRAdded', this.gamepadRAdded.bind(this));
  Events.on('gamepadLAdded', this.gamepadLAdded.bind(this));
}

Arrive.prototype.gamepadRAdded = function () {
  this.target0 = State.get('gamepadR');
};
Arrive.prototype.gamepadLAdded = function () {
  this.target1 = State.get('gamepadL');
};
// Method to update location
Arrive.prototype.update = function (timestamp) {
  this.arrive(this.getTargetPosition());

  this.steeringForce.setLength(Math.min(this.maxForce, this.steeringForce.length()));

  this.steeringForce = this.steeringForce.divideScalar(this.mass);

  this.velocity = this.velocity.add(this.steeringForce);
  this.steeringForce.set(0, 0, 0);

  // truncate
  this.velocity.setLength(Math.min(this.maxSpeed, this.velocity.length()));

  // add velocity to position
  this.position = this.position.add(this.velocity);

  // update position of sprite
  this.view.position.x = this.position.x;
  this.view.position.y = this.position.y;
  this.view.position.z = this.position.z;
};

Arrive.prototype.getTargetPosition = function () {
  var target = this.obj.boundingBoxCenter.position.sub(this.obj.position);
  if (this.target0 !== undefined && this.target0.actOnRace === this.obj.race) {
    target = this.target0.position.clone().sub(this.obj.position);
  }
  if (this.target1 !== undefined && this.target1.actOnRace === this.obj.race) {
    target = this.target1.position.clone().sub(this.obj.position);
  }
  if (this.target0 !== undefined && this.target0.actOnRace === this.obj.race && this.target1 !== undefined && this.target1.actOnRace === this.obj.race) {
    // Mid point
    target = new THREE.Vector3((this.target0.position.x + this.target1.position.x) / 2, (this.target0.position.y + this.target1.position.y) / 2, (this.target0.position.z + this.target1.position.z) / 2).clone().sub(this.obj.position);
  }
  return target;
};

Arrive.prototype.arrive = function (target) {
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
