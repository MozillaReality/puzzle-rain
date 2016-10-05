var Router = require('vanilla-router');

var Analytics = require('./analytics')();
var App = require('./webgl/App');
var KeyManager = require('./managers/KeyManager');
var settings = require('./settings');

var state = 0;  // State counter.

function initApp (opts) {
  opts.mode = (opts.mode || '').toLowerCase();

  var docEl = document.documentElement;

  if (!opts.mode || opts.mode === 'debug') {
    // TODO: Test with `/puzzle-rain/` path.
    // opts.router.navigateTo('/');
    return;
  }

  // TODO: Test with `/puzzle-rain/` path.
  // opts.router.navigateTo('?mode=' + opts.mode);

  // App.init(bool);

  if (App.isReadyToStart) {
    // TODO: Dim out other things.
    return App.enterVR();
  } else {
    return App.modeSelected(opts.mode === 'spectator');
  }
}

window.addEventListener('load', function () {
  var docEl = document.documentElement;

  var canonicalLinkEl = document.querySelector('link[rel=canonical]');
  var canonicalUrl = canonicalLinkEl ? canonicalLinkEl.href : '';
  var rootUrl = window.location.href.indexOf(canonicalUrl) === 0 ? canonicalUrl : '/';

  var router = new Router({
    mode: 'history',
    root: rootUrl,
    hooks: {
      before: function (newPage) {
        console.info('Before page loads hook', newPage);
      }
    },
    page404: function (path) {
      console.warn('Page not found: ' + rootUrl + path);
    }
  });

  var currentUri = window.location.pathname +
    window.location.search +
    window.location.hash;

  router
    .add('', function (page) {
      console.log('Home page');
      var splashEl = document.querySelector('#splash');
      if (splashEl) {
        console.info('Hiding splash screen');
        // splashEl.classList.add('hidden');
      }
      document.title = docEl.dataset.titleSplash;


      console.log(router._getQuery());
      // document.title = docEl.dataset.titleModeNormal;

    })
    // .add(/\?mode=spectator/i, function () {
    //   console.log('spec mode');
    //   document.title = docEl.dataset.titleModeNormal;
    // })
    .add('spectator', function () {
      document.title = docEl.dataset.titleModeNormal;
    })
    .addUriListener()
    .navigateTo(currentUri);

  var mode = router._getQuery().mode;
  docEl.dataset.modeRequested = mode;

  if (mode === 'debug') {
    settings.debugMode = true;
    initApp({router: router, mode: 'debug'});
  } else {
    if (navigator.getVRDisplays === undefined) {
      window.location.replace('fallback.html');
      return;
    }

    document.getElementById('splash').classList.remove('hidden');

    var initNormal = function () {
      initApp({router: router, mode: 'normal'});
    };

    var initSpectator = function () {
      initApp({router: router, mode: 'spectator'});
    };

    document.getElementById('button-mode-normal').addEventListener('click', function () {
      e.preventDefault();
      initNormal();
    });

    document.getElementById('button-mode-spectator').addEventListener('click', function () {
      e.preventDefault();
      initSpectator();
    });

    switch (mode) {
      case 'normal':
        initNormal();
        break;
      case 'spectator':
        initSpectator();
        break;
    }
  }

  KeyManager.init();
});
