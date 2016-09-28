# _Puzzle Rain_

A room-scale [WebVR](https://webvr.info/) puzzle game for the [HTC Vive](https://www.vive.com/).

[**Play _Puzzle Rain_ now!** `https://mozvr.com/puzzle-rain/`<br><br><img src="https://cloud.githubusercontent.com/assets/203725/18859336/f330d662-8427-11e6-9f14-4520f12f5cc6.png" alt="Puzzle Rain poster" title="Puzzle Rain poster" width="100%">](https://mozvr.com/puzzle-rain/)

## Local Development

```sh
# Clone this repo.
git clone git@github.com:mozvr/puzzle-rain.git && cd puzzle-rain

# Install the Node dependencies.
npm install

# Run the project at [http://localhost:9966/](http://localhost:9966/).
npm run start

# Build project
npm run build
```

## Deployment

To deploy to production (https://mozvr.com/puzzle-rain/):

```sh
npm run deploy
```

To deploy to some other repo (https://cvan.github.io/puzzle-rain/):

```sh
npm run deploy -- -r cvan/puzzle-rain
```

## License

This program is free software and is distributed under an [MIT License](LICENSE.md).
