/**
 * NOTE: This file *must* live in the top-level directory,
 * same scope as the Service Worker file (`sw.js`).
 */
;(function () {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js', {scope: './'}).then(function () {
      if (navigator.serviceWorker.controller) {
        console.info('Service Worker is currently handling network operations. Subsequent requests will be served from the Cache.');
      } else {
        console.info('Service Worker is not yet handling network operations. Subsequent requests will be served from the Cache.');
      }
    }).catch(function (err) {
      console.warn('Oops! Error with registering Service Worker', err);
    });
  }
})();
