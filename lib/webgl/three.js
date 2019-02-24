var THREE = require('three');

var CROSS_ORIGIN = 'anonymous';

THREE.ImageUtils.crossOrigin = "anonymous";

// Allow cross-origin images to be loaded.
// Note: This should not be on `THREE.Loader` nor `THREE.ImageUtils`.
// Must be on `THREE.TextureLoader`.
if (THREE.TextureLoader) {
  THREE.TextureLoader.prototype.crossOrigin = CROSS_ORIGIN;
}

// For images loaded from the model loaders.
if (THREE.ImageLoader) {
  THREE.ImageLoader.prototype.crossOrigin = CROSS_ORIGIN;
}

// For Collada and OBJ/MTL loaders.
if (THREE.ColladaLoader) {
  THREE.ColladaLoader.prototype.crossOrigin = CROSS_ORIGIN;
}
if (THREE.MTLLoader) {
  THREE.MTLLoader.prototype.crossOrigin = CROSS_ORIGIN;
}
if (THREE.OBJLoader) {
  THREE.OBJLoader.prototype.crossOrigin = CROSS_ORIGIN;
}

// In-memory caching for XHRs (for images, textures, etc.).
// Note: audio files are not handled by three.js yet - see
// https://github.com/mrdoob/three.js/issues/9323#issuecomment-232670028
if (THREE.Cache) {
  THREE.Cache.enabled = true;
}

module.exports = THREE;
