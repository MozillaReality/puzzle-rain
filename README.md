# _Puzzle Rain_

Puzzle Rain is a musical journey in which you help awaken and guide mythical creatures back together into happy musical harmony with one another. Only their combined musical chorus can summon life-giving rain to revive the parched and desolate landscape. Though, there isn’t much time. Dangerous predators roam!

[**Play _Puzzle Rain_ now!** `https://mozvr.com/puzzle-rain/`<br><br><img src="https://cloud.githubusercontent.com/assets/203725/18859336/f330d662-8427-11e6-9f14-4520f12f5cc6.png" alt="Puzzle Rain poster" title="Puzzle Rain poster" width="100%">](https://mozvr.com/puzzle-rain/)

To play _Puzzle Rain_, you will need a [VR-capable Windows PC](https://www.vive.com/us/ready/) with an [HTC Vive headset](https://www.vive.com/) running the latest [experimental Chromium VR builds](https://webvr.info/get-chrome/) (full HTC Vive support is [coming to Firefox soon](https://iswebvrready.org/#htc-vive-support)!). Follow [these instructions](https://github.com/Web-VR/iswebvrready/wiki/Instructions%3A-Chromium-for-HTC-Vive-on-Windows) to get set up.


## Local Development

```sh
# Clone this repo.
git clone git@github.com:mozvr/puzzle-rain.git && cd puzzle-rain

# Install the Node dependencies.
npm install

# Start the local dev server (http://localhost:9966/).
npm start

# Run the build system (generates Browserify JS bundle).
npm run build
```

## Deployment

To deploy to production (https://mozvr.com/puzzle-rain/):

```sh
npm run deploy
```

To deploy to some other repo (e.g., https://cvan.github.io/puzzle-rain/):

```sh
npm run deploy -- -r cvan/puzzle-rain
```

### Performance measurements

To run Google PageSpeed insights on [production](https://mozvr.com/puzzle-rain/) (using [`psi`](https://github.com/addyosmani/psi)):

```sh
npm run perf
```

## License

This program is free software and is distributed under an [MIT License](LICENSE.md).
