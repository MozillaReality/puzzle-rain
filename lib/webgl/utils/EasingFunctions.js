var EasingFunctions = {
  // no easing, no acceleration
  linear: function (t) { return t },
  // accelerating from zero velocity
  InQuad: function (t) { return t*t },
  // decelerating to zero velocity
  OutQuad: function (t) { return t*(2-t) },
  // acceleration until halfway, then deceleration
  InOutQuad: function (t) { return t<.5 ? 2*t*t : -1+(4-2*t)*t },
  // accelerating from zero velocity
  InCubic: function (t) { return t*t*t },
  // decelerating to zero velocity
  OutCubic: function (t) { return (--t)*t*t+1 },
  // acceleration until halfway, then deceleration
  InOutCubic: function (t) { return t<.5 ? 4*t*t*t : (t-1)*(2*t-2)*(2*t-2)+1 },
  // accelerating from zero velocity
  InQuart: function (t) { return t*t*t*t },
  // decelerating to zero velocity
  OutQuart: function (t) { return 1-(--t)*t*t*t },
  // acceleration until halfway, then deceleration
  InOutQuart: function (t) { return t<.5 ? 8*t*t*t*t : 1-8*(--t)*t*t*t },
  // accelerating from zero velocity
  InQuint: function (t) { return t*t*t*t*t },
  // decelerating to zero velocity
  OutQuint: function (t) { return 1+(--t)*t*t*t*t },
  // acceleration until halfway, then deceleration
  InOutQuint: function (t) { return t<.5 ? 16*t*t*t*t*t : 1+16*(--t)*t*t*t*t },
  elasticInOut: function(t) {
    return t < 0.5
      ? 0.5 * Math.sin(+13.0 * Math.PI/2 * 2.0 * t) * Math.pow(2.0, 10.0 * (2.0 * t - 1.0))
      : 0.5 * Math.sin(-13.0 * Math.PI/2 * ((2.0 * t - 1.0) + 1.0)) * Math.pow(2.0, -10.0 * (2.0 * t - 1.0)) + 1.0;
  },
};

module.exports = EasingFunctions;
