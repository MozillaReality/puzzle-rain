'use strict';

var Events = require('../../events/Events');
var State = require('../../state/State');
var THREE = require('three');

var initialized = false;

function SeparationAndSeek (obj) {
  this.obj = obj;
  this.secureDistanceToGod = 0.2;
  this.maxSpeed = 0.005;
  this.maxForce = 0.0002;
  this.acceleration = new THREE.Vector3();
  this.velocity = new THREE.Vector3();
  this.separateFactor = 8;
  this.seekFactor = 6;
  this.desiredSeparation = 0.5;
  if (State.get('gamepadR')) {
    this.godToFollow = State.get('gamepadR');
  }
  Events.on('updateScene', this.update.bind(this));
}

// INIT CODE BASED ON: natureofcode.com/book/chapter-6-autonomous-agents/
SeparationAndSeek.prototype.applyBehaviours = function (vehicles) {
  var separateForce = this.separate(vehicles);

  var godPosition = new THREE.Vector3(this.godToFollow.position.x, this.godToFollow.position.y, this.godToFollow.position.z);
  var seekForce = this.seek(godPosition);

  separateForce.multiplyScalar(this.separateFactor);
  seekForce.multiplyScalar(this.seekFactor);

  this.applyForce(separateForce);
  this.applyForce(seekForce);
};

SeparationAndSeek.prototype.applyForce = function (force) {
  this.acceleration.add(force);
};
SeparationAndSeek.prototype.separate = function (vehicles) {
  var sum = new THREE.Vector3();
  var count = 0;
  // For every boid in the system, check if it's too close
  for ( var i = 0; i < vehicles.length; i++) {
    var myPos2D = new THREE.Vector3(this.obj.position.x, this.obj.position.y, this.obj.position.z);
    var vehiclePos2D = new THREE.Vector3(vehicles[ i ].position.x, vehicles[ i ].position.y, vehicles[ i ].position.z);
    var d = myPos2D.distanceTo(vehiclePos2D);
    // If the distance is greater than 0 and less than an arbitrary amount (0 when you are yourself)
    if ((d > 0) && (d < this.desiredSeparation)) {
      // Calculate vector pointing away from neighbor
      var diff = new THREE.Vector3();
      diff = diff.subVectors(myPos2D, vehiclePos2D);
      diff.normalize();
      diff.divideScalar(d); // Weight by distance
      sum.add(diff);
      count++; // Keep track of how many
    }
  }
  // Average -- divide by how many
  if (count > 0) {
    sum.divideScalar(count);
    // Our desired vector is the average scaled to maximum speed
    sum.normalize();
    sum.multiplyScalar(this.maxSpeed);
    // Implement Reynolds: Steering = Desired - Velocity
    sum.sub(this.velocity);
    sum.setLength(this.maxForce);
  }
  return sum;
};

SeparationAndSeek.prototype.seek = function (godPosition) {
  var desired = new THREE.Vector3();
  var myPos2D = new THREE.Vector3(this.obj.position.x, this.obj.position.y, this.obj.position.z);
  desired = desired.subVectors(godPosition, myPos2D); // A vector pointing from the location to the target

  if (desired.length() < this.secureDistanceToGod) {
    desired.setLength(- 0.01);
  } else {
    // Normalize desired and scale to maximum speed
    desired.setLength(this.maxSpeed);
  }

  // Steering = Desired minus velocity
  var steer = new THREE.Vector3();
  steer = steer.subVectors(desired, this.velocity);
  steer.setLength(this.maxForce); // Limit to maximum steering force
  return steer;
};

// Method to update location
SeparationAndSeek.prototype.update = function (timestamp) {
  if (!this.godToFollow) {
    return;
  }
  this.applyBehaviours(State.get(this.obj.rage + 's'));
  // Update velocity
  this.velocity.add(this.acceleration);
  // Limit speed
  this.velocity.setLength(this.maxSpeed);
  var vel3D = new THREE.Vector3(this.velocity.x, this.velocity.y, this.velocity.z);
  this.obj.position.add(vel3D);

  // Reset acceleration to 0 each cycle
  this.acceleration.multiplyScalar(0);
  // this.moodManager.update( timestamp );

};
// END CODE BASED ON: natureofcode.com/book/chapter-6-autonomous-agents/

module.exports = SeparationAndSeek;
