'use strict';

var State = require('../state/State');
var Events = require('../events/Events');
var settings = require('../settings');

function GameplayManager () {
  this.timeToEnding = 5;

  this.timeToPlayWithAllAwake = 40;

  this.timeAtSurprise = 17;
  this.timeAtRaining = 28;
  this.timeAtStartEating = 41;
  this.timeAtCreditsStarted = 59.5;

  this.experienceCounter = 0;
  this.endingCounter = 0;

  this.startEnding = false;

  // 1 - happy
  // 2 - sad
  this.endMode = 2;
}

GameplayManager.prototype.init = function () {
  Events.on('updateScene', this.update.bind(this));

  Events.on('forceEnding', this.forceEnding.bind(this));
  Events.on('closerEnding', this.closerEnding.bind(this));

  Events.on('endModeEstimated', this.endModeEstimated.bind(this));
};

GameplayManager.prototype.update = function (delta, time) {
  if (State.get('stage') !== 'ending') {
    this.experienceCounter += delta;
    if (this.experienceCounter >= this.timeToEnding && !this.startEnding) {
      this.startEnding = true;
      Events.emit('isEnding');
    }
  } else {
    this.endingCounter += delta;
    if (this.endingCounter >= this.timeAtRaining && !this.isSurprised) {
      this.isSurprised = true;
      Events.emit('allRised');
    }
    if (this.endingCounter >= this.timeAtRaining && !this.isRainStarted) {
      this.isRainStarted = true;
      Events.emit('rainStarted');
    }
    if (this.endingCounter >= this.timeAtStartEating && !this.isEatStarted) {
      this.isEatStarted = true;
      Events.emit('eatStarted');
    }
    if (this.endingCounter >= this.timeAtCreditsStarted && !this.isCreditsStarted) {
      this.isCreditsStarted = true;
      Events.emit('endCreditsStarted');
    }
  }

};

GameplayManager.prototype.endModeEstimated = function (i) {
  this.endMode = i;
  console.log(i);
  this.dispatchEnding();
};

GameplayManager.prototype.forceEnding = function () {
  this.dispatchEnding();
};

GameplayManager.prototype.closerEnding = function () {
  this.endMode = 1;
  if (this.experienceCounter < this.timeToEnding - this.timeToPlayWithAllAwake) {
    this.experienceCounter = this.timeToEnding - this.timeToPlayWithAllAwake;
  }
};

GameplayManager.prototype.dispatchEnding = function () {
  State.add('stage', 'ending', this.endMode);
  Events.emit('stageChanged');
};

module.exports = new GameplayManager();
