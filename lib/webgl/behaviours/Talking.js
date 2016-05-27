'use strict';

var Events = require('../../events/Events');
var THREE = require('three');

function Talking (obj) {
  this.obj = obj;

  this.normalTime = 0;
  this.speechArr = [];
  Events.on('updateScene', this.update.bind(this));
}

Talking.prototype.update = function (delta, time) {
  this.normalTime = this.obj.groupHandler.track.getNormalTime();
  this.speak();
};

Talking.prototype.speak = function () {
  if (this.obj.raceObj.status === 'asleep') {
    this.obj.mouth.changeMouth(8);
  } else {
    var currentVal = Math.round(Math.round(this.speechArr.length * this.normalTime) - this.speechArr.length * 0.1);
    if (currentVal < 0) {
      currentVal = this.speechArr.length + currentVal;
    }
    this.renderMouth(this.speechArr[ currentVal ]);
  }
};

Talking.prototype.setSpeech = function (s) {
  this.speechArr = this.getPhonemes(s);
};

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

Talking.prototype.renderMouth = function (phoneme) {
  switch ( phoneme ) {
    case 'phoneme_a':
      this.obj.mouth.changeMouth(1);
      break;
    case 'phoneme_o':
      this.obj.mouth.changeMouth(2);
      break;
    case 'phoneme_e':
      this.obj.mouth.changeMouth(3);
      break;
    case 'phoneme_s':
      this.obj.mouth.changeMouth(4);
      break;
    case 'phoneme_l':
      this.obj.mouth.changeMouth(5);
      break;
    case 'phoneme_m':
      this.obj.mouth.changeMouth(6);
      break;
    case 'phoneme_f':
      this.obj.mouth.changeMouth(7);
      break;
    case 'phoneme_-':
      this.obj.mouth.changeMouth(8);
      break;
  }
};

module.exports = Talking;
