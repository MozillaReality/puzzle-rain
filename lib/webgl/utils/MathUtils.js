var MathUtils = {
  randomInt: function (min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
  },

  randomRange: function (min, max) {
    return min + Math.random() * (max - min);
  },

  lerp: function (ratio, start, end) {
    return start + (end - start) * ratio;
  },

  norm: function (val, min, max) {
    return (val - min) / (max - min);
  },

  map: function (val, min1, max1, min2, max2) {
    return this.lerp(this.norm(val, min1, max1), min2, max2);
  },

  clamp: function (val, min, max) {
    return val < min ? min : (val > max ? max : val);
  },

  between: function (x, min, max) {
    return x >= min && x <= max;
  },

  isOdd: function (num) {
    return num % 2;
  },

  keepAngleInRange: function (val, unit) {
    var multiplier;

    switch (unit) {
      case 'rad':
        multiplier = Math.PI * 2;
        break;
      default:
        multiplier = 360;
    }

    var isNegative = val < 0;

    val = Math.abs(val);
    var divisor = Math.floor(val / multiplier);
    val -= divisor * multiplier;

    if (isNegative)
      val = multiplier - 1 * val;

    return val;
  },

  // More easing functions here https://github.com/danro/jquery-easing/blob/master/jquery.easing.js
  // Visual cheat sheet http://easings.net/
  // t: current time, b: begInnIng value, c: change In value, d: duration
  easeInQuad: function (t, b, c, d) {
    return c * (t /= d) * t + b;
  },

  easeOutQuad: function (t, b, c, d) {
    return -c * (t /= d) * (t - 2) + b;
  },

  easeInExpo: function (t, b, c, d) {
    return (t == 0) ? b : c * Math.pow(2, 10 * (t / d - 1)) + b;
  },

  easeOutExpo: function (t, b, c, d) {
    return (t == d) ? b + c : c * (-Math.pow(2, -10 * t / d) + 1) + b;
  },

  // Color functions

  componentToHex: function (c) {
    var hex = c.toString(16);
    return hex.length == 1 ? '0' + hex : hex;
  },

  rgbToHex: function (r, g, b) {
    return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
  },

  hexToRgb: function (hex) {
    // Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
    var shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
    hex = hex.replace(shorthandRegex, function (m, r, g, b) {
      return r + r + g + g + b + b;
    });

    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  },

  // http://stackoverflow.com/questions/5560248/programmatically-lighten-or-darken-a-hex-color-or-rgb-and-blend-colors
  // Modified to admit 0x (now not admit #)
  // Lighter colors blendColors(color, 0xFFFFFF, 0.5)
  // Darker colors blendColors(color, 0x000000, 0.5)
  blendColors: function (c0, c1, p) {
    var f = c0,t = c1,R1 = f >> 16,G1 = f >> 8 & 0x00FF,B1 = f & 0x0000FF,R2 = t >> 16,G2 = t >> 8 & 0x00FF,B2 = t & 0x0000FF;
    return '#' + (0x1000000 + (Math.round((R2 - R1) * p) + R1) * 0x10000 + (Math.round((G2 - G1) * p) + G1) * 0x100 + (Math.round((B2 - B1) * p) + B1)).toString(16).slice(1);
  },

  blendRGBColors: function (c0, c1, p) {
    var f = c0.split(','),t = c1.split(','),R = parseInt(f[0].slice(4)),G = parseInt(f[1]),B = parseInt(f[2]);
    return 'rgb(' + (Math.round((parseInt(t[0].slice(4)) - R) * p) + R) + ',' + (Math.round((parseInt(t[1]) - G) * p) + G) + ',' + (Math.round((parseInt(t[2]) - B) * p) + B) + ')';
  },

  distance: function (p0, p1) {
    var dx = p1.x - p0.x,
      dy = p1.y - p0.y;

    return Math.sqrt(dx * dx + dy * dy);
  },

  angleBetweenPointsInRad: function (p0, p1) {
    return Math.atan2(p1.y - p0.y, p1.x - p0.x);
  },

  // Based on quat.zachbennett.com
  calculateEuler: function (x, y, z, w) {
    var returnArr = [];
    var qw = parseFloat(w);
    var qx = parseFloat(x);
    var qy = parseFloat(y);
    var qz = parseFloat(z);
    var qw2 = qw * qw;
    var qx2 = qx * qx;
    var qy2 = qy * qy;
    var qz2 = qz * qz;
    var test = qx * qy + qz * qw;
    if (test > 0.499) {
      returnArr[1] = 360 / Math.PI * Math.atan2(qx, qw);
      returnArr[2] = 90;
      returnArr[0] = 0;
      return returnArr;
    }
    if (test < -0.499) {
      returnArr[1] = -360 / Math.PI * Math.atan2(qx, qw);
      returnArr[2] = -90;
      returnArr[0] = 0;
      return returnArr;
    }
    var h = Math.atan2(2 * qy * qw - 2 * qx * qz, 1 - 2 * qy2 - 2 * qz2);
    var a = Math.asin(2 * qx * qy + 2 * qz * qw);
    var b = Math.atan2(2 * qx * qw - 2 * qy * qz, 1 - 2 * qx2 - 2 * qz2);
    returnArr[1] = h * 180 / Math.PI;
    returnArr[2] = a * 180 / Math.PI;
    returnArr[0] = b * 180 / Math.PI;
    return returnArr;
  },

  calculateQuat: function (x, y, z) {
    var h = parseFloat(y) * Math.PI / 360;
    var a = parseFloat(z) * Math.PI / 360;
    var b = parseFloat(x) * Math.PI / 360;
    var c1 = Math.cos(h);
    var c2 = Math.cos(a);
    var c3 = Math.cos(b);
    var s1 = Math.sin(h);
    var s2 = Math.sin(a);
    var s3 = Math.sin(b);
    var returnArr = [];
    returnArr[3] = Math.round((c1 * c2 * c3 - s1 * s2 * s3) * 100000) / 100000;
    returnArr[0] = Math.round((s1 * s2 * c3 + c1 * c2 * s3) * 100000) / 100000;
    returnArr[1] = Math.round((s1 * c2 * c3 + c1 * s2 * s3) * 100000) / 100000;
    returnArr[2] = Math.round((c1 * s2 * c3 - s1 * c2 * s3) * 100000) / 100000;
    return returnArr;
  }
};

module.exports = MathUtils;
