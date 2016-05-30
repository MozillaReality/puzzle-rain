'use strict';

var Events = require('../../events/Events');
var State = require('../../state/State');
var THREE = require('three');

var settings = require('../../settings');

// INIT CODE BASED ON: natureofcode.com/book/chapter-6-autonomous-agents/
function Arrive (obj) {
  this.raceToControl = obj;
  THREE.Object3D.call(this);

  if (settings.debugHelpers) {
    this.helper = new THREE.Mesh(
      new THREE.SphereGeometry(0.05, 3, 2),
      new THREE.MeshBasicMaterial({ color: settings[this.raceToControl.name + 'Color']})
    );
    this.add(this.helper);
  }

  this.mass = 10;
  this.maxSpeed = 0.5;
  this.velocity = new THREE.Vector3();
  this.maxForce = 2;
  this.steeringForce = new THREE.Vector3();
  this.arrivalThreshold = 10;
  this.dummy = new THREE.Vector3();

  Events.on('updateScene', this.update.bind(this));
  Events.on('gamepadRAdded', this.gamepadRAdded.bind(this));
  Events.on('gamepadLAdded', this.gamepadLAdded.bind(this));
}

Arrive.prototype = Object.create(THREE.Object3D.prototype);

Arrive.prototype.gamepadRAdded = function () {
  this.target0 = State.get('gamepadR');
};
Arrive.prototype.gamepadLAdded = function () {
  this.target1 = State.get('gamepadL');
};
// Method to update location
Arrive.prototype.update = function (timestamp) {
  // asleep
  // awakeIdle
  // awakeInfluenced
  this.moveByMode(this.getArriveStatus());
};

Arrive.prototype.getArriveStatus = function () {
  var statusTmp = 'asleep';
  var isInfluenced = this.isInfluencedByHands();
  if (this.raceToControl.status === 'awake') {
    if (isInfluenced) {
      statusTmp = 'awakeInfluenced';
    } else {
      statusTmp = 'awakeIdle';
    }
  }
  return statusTmp;
};

Arrive.prototype.isInfluencedByHands = function () {
  var influenced = false;
  if (this.target0 !== undefined && this.target0.influencedRace === this.raceToControl && this.target0.lastPressed) {
    influenced = true;
  }
  if (this.target1 !== undefined && this.target1.influencedRace === this.raceToControl && this.target1.lastPressed) {
    influenced = true;
  }
  return influenced;
};

Arrive.prototype.moveByMode = function (mode) {
  this.moveAwakeInfluenced();
};

Arrive.prototype.moveAwakeInfluenced = function () {
  this.arrive(this.getTargetPosition());

  this.steeringForce.setLength(Math.min(this.maxForce, this.steeringForce.length()));

  this.steeringForce = this.steeringForce.divideScalar(this.mass);

  this.velocity = this.velocity.add(this.steeringForce);
  this.steeringForce.set(0, 0, 0);

  // truncate
  this.velocity.setLength(Math.min(this.maxSpeed, this.velocity.length()));

  // add velocity to position
  this.position.add(this.velocity);
};

Arrive.prototype.getTargetPosition = function () {
  // By default the target is the center of the race (which is the speaker)
  // var target = new THREE.Vector3(0, 0, 0);
  var target = this.raceToControl.speaker.position;

  if (this.target0 !== undefined && this.target0.influencedRace === this.raceToControl) {
    target = this.target0.position.clone().sub(this.raceToControl.position);
  }
  if (this.target1 !== undefined && this.target1.influencedRace === this.raceToControl) {
    target = this.target1.position.clone().sub(this.raceToControl.position);
  }
  if (this.target0 !== undefined && this.target0.influencedRace === this.raceToControl && this.target1 !== undefined && this.target1.influencedRace === this.raceToControl) {
    // Mid point
    target = new THREE.Vector3((this.target0.position.x + this.target1.position.x) / 2, (this.target0.position.y + this.target1.position.y) / 2, (this.target0.position.z + this.target1.position.z) / 2).clone().sub(this.raceToControl.position);
  }

  this.relPosition = this.raceToControl.speaker.position.clone().sub(target);
  // console.log(this.relPosition);
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

  this.steeringForce = this.steeringForce.add(desiredVelocity.clone().sub(this.velocity));

};
// END CODE BASED ON: natureofcode.com/book/chapter-6-autonomous-agents/

module.exports = Arrive;
