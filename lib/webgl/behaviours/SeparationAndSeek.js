'use strict';

var Events = require('../../events/Events');
var State = require('../../state/State');
var THREE = require('../three');

var initialized = false;

function SeparationAndSeek (obj, dimensions, godToFollow, separation, vehicles) {
  this.godToFollow = godToFollow;
  this.obj = obj;
  this.dimensions = dimensions;
  this.vehicles = vehicles;
  this.secureDistanceToGod = 0.2;
  this.status = 'asleep';
  this.maxSpeed = 0.007;
  this.maxForce = 0.0004;
  this.acceleration = new THREE.Vector3();
  this.velocity = new THREE.Vector3();
  this.separateFactor = 8;
  this.seekFactor = 6;
  this.desiredSeparation = separation;
  Events.on('raceStatusChanged', this.raceStatusChanged.bind(this));
  Events.on('updateScene', this.update.bind(this));
}

SeparationAndSeek.prototype.raceStatusChanged = function (race, status) {
  if (this.godToFollow.race === race) {
    this.status = status;
  }
};

// INIT CODE BASED ON: natureofcode.com/book/chapter-6-autonomous-agents/
SeparationAndSeek.prototype.applyBehaviours = function (vehicles) {
  var separateForce = this.separate(vehicles);

  var absPos = new THREE.Vector3().setFromMatrixPosition(this.godToFollow.matrixWorld);
  var posY = 0;
  if (this.dimensions === 3) {
    posY = absPos.y;
  }

  var godPosition = new THREE.Vector3(absPos.x, posY, absPos.z);
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
    var posY = 0;
    // TODO fix this because is custom for MiniFlyers
    var absPos = this.obj.position;
    if (this.dimensions === 3) {
      posY = absPos.y;
    }
    var myPos3D = new THREE.Vector3(absPos.x, posY, absPos.z);
    var posVehicleY = 0;
    if (this.dimensions === 3) {
      posVehicleY = vehicles[ i ].position.y;
    }
    var vehiclePos3D = new THREE.Vector3(vehicles[ i ].position.x, posVehicleY, vehicles[ i ].position.z);
    var d = myPos3D.distanceTo(vehiclePos3D);
    // If the distance is greater than 0 and less than an arbitrary amount (0 when you are yourself)
    // console.log(this.obj, vehicles[ i ]);
    if ((d > 0) && (d < this.desiredSeparation)) {
      // Calculate vector pointing away from neighbor
      var diff = new THREE.Vector3();
      diff = diff.subVectors(myPos3D, vehiclePos3D);
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
  var posY = 0;

  var absPos = new THREE.Vector3().setFromMatrixPosition(this.obj.matrixWorld);
  if (this.dimensions === 3) {
    posY = absPos.y;
  }
  var myPos3D = new THREE.Vector3(absPos.x, posY, absPos.z);
  desired = desired.subVectors(godPosition, myPos3D); // A vector pointing from the location to the target

  if (desired.length() < this.secureDistanceToGod) {
    desired.setLength(- 1);
  } else {
    // Normalize desired and scale to maximum speed
    desired.setLength(this.maxSpeed);
  }
  // desired.setLength(this.maxSpeed);

  // Steering = Desired minus velocity
  var steer = new THREE.Vector3();
  steer = steer.subVectors(desired, this.velocity);
  steer.setLength(this.maxForce); // Limit to maximum steering force
  return steer;
};

// Method to update location
SeparationAndSeek.prototype.update = function (timestamp) {
  if (this.status === 'asleep') {
    return;
  }
  if (!this.godToFollow) {
    return;
  }
  this.applyBehaviours(this.vehicles);
  // Update velocity
  this.velocity.add(this.acceleration);
  // Limit speed
  this.velocity.setLength(this.maxSpeed);
  var velY = 0;
  if (this.dimensions === 3) {
    velY = this.velocity.y;
  }
  var vel3D = new THREE.Vector3(this.velocity.x, velY, this.velocity.z);
  this.obj.position.add(vel3D);

  // Reset acceleration to 0 each cycle
  this.acceleration.multiplyScalar(0);
  // this.moodManager.update( timestamp );

};
// END CODE BASED ON: natureofcode.com/book/chapter-6-autonomous-agents/

module.exports = SeparationAndSeek;
