'use strict';

let data = {};

function State () {
}

State.prototype.add = function (index, value) {
  data[ index ] = value;
};

State.prototype.get = function (index) {
  return data[ index ];
};

module.exports = new State();
