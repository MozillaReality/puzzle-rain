'use strict';

var State = require('../state/State');
var Events = require('../events/Events');
var settings = require('../settings');

function GameplayManager () {
  this.timeToEnding = 8;

  this.timeToPlayWithAllAwake = 5;

  this.timeAtSurprise = 8;
  this.timeAtRaining = 12;
  this.timeAtStartEating = 28;
  this.timeAtCreditsStarted = 46.5;

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
    if (this.experienceCounter >= this.timeAtSurprise && !this.startEnding) {
      this.startEnding = true;
      Events.emit('isEnding');
    }
  }
  if (State.get('stage') === 'ending') {
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
  console.log(this.endingCounter);
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
  Events.emit('stageChanged', 'ending');
};

module.exports = new GameplayManager();
