# _Puzzle Rain_

_Puzzle Rain_ is a musical journey in which you help awaken and guide mythical creatures back together into happy musical harmony with one another. Only their combined musical chorus can summon life-giving rain to revive the parched and desolate landscape. Though, there isn’t much time. Dangerous predators roam!

[<img src="https://cloud.githubusercontent.com/assets/203725/18859336/f330d662-8427-11e6-9f14-4520f12f5cc6.png" alt="Puzzle Rain poster" title="Puzzle Rain poster" width="100%">](https://blog.mozvr.com/puzzle-rain/)

* **[Play now!](https://vr.mozilla.org/puzzle-rain/)**
* [Read blog post](https://blog.mozvr.com/puzzle-rain/)
* [Watch video trailer](https://www.youtube.com/watch?v=XOIDXXynmq8)

To play _Puzzle Rain_, you will need a [VR-capable Windows PC](https://www.vive.com/us/ready/) with a room-scale headset, the [HTC Vive headset](https://www.vive.com/) or an [Oculus Rift (with the Oculus Touch controllers)](https://www.oculus.com/rift/) running the latest [Firefox Nightly](https://webvr.rocks/firefox) or [experimental Chromium WebVR builds](https://webvr.rocks/chromium/). To get set up, follow [these instructions on WebVR Rocks](https://webvr.rocks/).


## Local Development

```sh
# Clone this repo.
git clone git@github.com:MozillaReality/puzzle-rain.git && cd puzzle-rain

# Install the Node dependencies.
npm install

# Start the local dev server (http://localhost:9966/).
npm start

# Run the build system (generates Browserify JS bundle).
npm run build
```

## Deployment

To deploy to production (https://vr.mozilla.org/puzzle-rain/):

```sh
npm run deploy
```

To deploy to some other repo (e.g., https://cvan.github.io/puzzle-rain/):

```sh
npm run deploy -- -r cvan/puzzle-rain
```

### Performance measurements

To run [Google PageSpeed Insights](https://developers.google.com/speed/pagespeed/insights/) locally from the command line against the [production](https://vr.mozilla.org/puzzle-rain/) site (using [`psi`](https://github.com/addyosmani/psi) and [`lighthouse`](https://github.com/GoogleChrome/lighthouse)):

```sh
npm run perf
```

## License

This program is free software and is distributed under an [MIT License](LICENSE.md).
