'use strict';

const Emitter = require('events').EventEmitter;

function Events () {
  this.emitter = new Emitter();
}

Events.prototype.on = function () {
  this.emitter.on.apply(this.emitter, arguments);
  return this;
};

Events.prototype.removeListener = function () {
  this.emitter.removeListener.apply(this.emitter, arguments);
  return this;
};

module.exports = new Events();
