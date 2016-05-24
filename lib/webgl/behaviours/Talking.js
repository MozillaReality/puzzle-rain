'use strict';

var Events = require('../../events/Events');
var THREE = require('three');

function Talking (obj) {
  this.obj = obj;

  Events.on('updateScene', this.update.bind(this));
}

Talking.prototype.update = function (delta, time) {};

Talking.prototype.getPhonemes = function (s) {
  var phonemesArr = [];
  for ( var i = 0; i < s.length; i++) {
    var letter = s.substr(i, 1).toLowerCase();
    switch ( letter ) {
      case 'a':
      case 'i':
      case 'y':
        phonemesArr.push('phoneme_a');
        break;
      case 'o':
      case 'u':
      case 'w':
      case 'r':
        phonemesArr.push('phoneme_o');
        break;
      case 'e':
      case 'x':
        phonemesArr.push('phoneme_e');
        break;
      case 's':
      case 'c':
      case 'd':
      case 'g':
      case 'k':
      case 'n':
      case 'r':
      case 't':
      case 'z':
      case 'j':
      case 'q':
        phonemesArr.push('phoneme_s');
        break;
      case 'l':
        phonemesArr.push('phoneme_l');
        break;
      case 'm':
      case 'b':
      case 'p':
        phonemesArr.push('phoneme_m');
        break;
      case 'f':
      case 'v':
        phonemesArr.push('phoneme_f');
        break;
      default:
        phonemesArr.push('phoneme_-');
    }

  }
  phonemesArr.push('idle');
  // console.log( phonemesArr );
  return phonemesArr;
};

Talking.prototype.doArrExpressions = function () {
  if (this.expressionsArr.length > 0) {
    if (this.expressionsArrIndex < this.expressionsArr.length) {
      this.renderMouth(this.expressionsArr[ this.expressionsArrIndex ]);
      this.expressionsArrIndex++;
    }
  }
};

Talking.prototype.renderMouth = function (phoneme) {
  switch ( phoneme ) {
    case 'phoneme_a':
      break;

  }
};

module.exports = Talking;
