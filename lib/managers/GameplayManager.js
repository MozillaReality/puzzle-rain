'use strict';

var State = require('../state/State');
var Events = require('../events/Events');
var settings = require('../settings');

function GameplayManager () {
  this.timeToEnding = 150;

  this.timeToPlayWithAllAwake = 30;

  // Times for end01 audio track
  this.timeToEnd01Raining = 2;
  this.timeToEnd01Storming = 20;
  this.timeToEnd01StartElevating = 24;
  this.timeToEnd01CreditsStarted = 43;

  // Times for end02 audio track
  this.timeToEnd02AllRising = 8;
  this.timeToEnd02Raining = 12;
  this.timeToEnd02StartElevating = 28;
  this.timeToEnd02CreditsStarted = 46.5;

  this.experienceCounter = 0;
  this.endingCounter = 0;

  this.startEnding = false;

  // 1 - happy
  // 2 - sad
  State.add('endMode', 2);
  Events.on('stageChanged', this.stageChanged.bind(this));
}

GameplayManager.prototype.init = function () {
  Events.on('updateScene', this.update.bind(this));

  Events.on('forceEnding', this.forceEnding.bind(this));
  Events.on('closerEnding', this.closerEnding.bind(this));

  Events.on('endModeEstimated', this.endModeEstimated.bind(this));
};

GameplayManager.prototype.update = function (delta, time) {
  if (State.get('stage') === 'experience') {
    this.experienceCounter += delta;
    if (this.experienceCounter >= this.timeToEnding && !this.startEnding) {
      this.startEnding = true;
      Events.emit('isEnding');
    }
  }
  if (State.get('stage') === 'ending') {
    this.endingCounter += delta;
    if (State.get('endMode') === 1) {
      this.updateEnd01();
    } else {
      this.updateEnd02();
    }
  }
// console.log(this.endingCounter);
};

GameplayManager.prototype.updateEnd01 = function () {
  if (this.endingCounter >= this.timeToEnd01Raining && !this.isRainStarted) {
    this.isRainStarted = true;
    Events.emit('rainStarted');
  }
  if (this.endingCounter >= this.timeToEnd01Storming && !this.isStormStarted) {
    this.isStormStarted = true;
    Events.emit('stormStarted');
  }
  if (this.endingCounter >= this.timeToEnd01StartElevating && !this.isElevationStarted) {
    this.isElevationStarted = true;
    Events.emit('elevationStarted');
  }
  // storming
  if (this.endingCounter >= this.timeToEnd01CreditsStarted && !this.isCreditsStarted) {
    this.isCreditsStarted = true;
    Events.emit('endCreditsStarted');
  }
};

GameplayManager.prototype.updateEnd02 = function () {
  if (this.endingCounter >= this.timeToEnd02AllRising && !this.isShellRised) {
    this.isShellRised = true;
    Events.emit('shellRised');
  }
  if (this.endingCounter >= this.timeToEnd02Raining && !this.isRainStarted) {
    this.isRainStarted = true;
    Events.emit('rainStarted');
  }
  if (this.endingCounter >= this.timeToEnd02StartElevating && !this.isElevationStarted) {
    this.isElevationStarted = true;
    Events.emit('elevationStarted');
  }
  if (this.endingCounter >= this.timeToEnd02CreditsStarted && !this.isCreditsStarted) {
    this.isCreditsStarted = true;
    Events.emit('endCreditsStarted');
  }
};

GameplayManager.prototype.stageChanged = function (newStage) {
  State.add('stage', newStage);
};

GameplayManager.prototype.endModeEstimated = function (i) {
  State.add('endMode', i);
  // console.log(i);
  this.dispatchEnding();
};

GameplayManager.prototype.forceEnding = function () {
  this.dispatchEnding();
};

GameplayManager.prototype.closerEnding = function () {
  if (this.experienceCounter < this.timeToEnding - this.timeToPlayWithAllAwake) {
    this.experienceCounter = this.timeToEnding - this.timeToPlayWithAllAwake;
  }
};

GameplayManager.prototype.dispatchEnding = function () {
  // console.log('delete because is forcing ending');
  // State.add('endMode', 1);
  Events.emit('stageChanged', 'ending');
};

module.exports = new GameplayManager();
