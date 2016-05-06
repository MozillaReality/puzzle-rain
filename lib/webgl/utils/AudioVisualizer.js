'use strict';

var Events = require('../../events/Events');
var THREE = require('three');

function AudioVisualizer (sound) {
  this.sound = sound;

  this.analyser = sound.context.createAnalyser();
  this.analyser.smoothingTimeConstant = 0.3;
  this.analyser.fftSize = 256;

  this.analyser.array = new Uint8Array(this.analyser.frequencyBinCount);
  this.analyser.connect(sound.context.destination);
  // console.log(this.analyser);
  this.sound.source.connect(this.analyser);
  Events.on('updateScene', this.update.bind(this));
  Events.on('pauseAll', this.pauseAll.bind(this));
}

AudioVisualizer.prototype.update = function () {
  this.analyser.getByteFrequencyData(this.analyser.array);
// this.analyser.getByteTimeDomainData(this.analyser.array);
// console.log(this.getAverage(this.analyser.array));
};

AudioVisualizer.prototype.getAverage = function (array) {
  var ave = 0;
  var l = array.length;
  for ( var i = 0; i < array.length; i++) {
    ave += array[i];
  }
  ave /= l;
  return ave;
};

AudioVisualizer.prototype.pauseAll = function (bool) {
  // TODO prevent when come back from pauseAll because there are high values of average
  if (!bool) {
    this.sound.source.connect(this.analyser);
  }
};

module.exports = AudioVisualizer;
