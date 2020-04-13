# Octopus Organizer

A modern an intuitive File and Document Manager.

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes. See deployment for notes on how to deploy the project on a live system.

### Download

Windows, 64 Bit: [octopus-organizer-2020.2-windows-x64.zip](https://www.dropbox.com/s/504z2vv54ponzn7/octopus-organizer-2020.2-windows-x64.zip?dl=1)

MacOS, 64 Bit: [octopus-organizer-2020.2-macos-x64.zip](https://www.dropbox.com/s/e35j9qz52sgf1zr/octopus-organizer-2020.2-macos-x64.zip?dl=1)


### Installing

Clone Project from Repository.

```shell
git clone https://github.com/lennardscheffler/octopus-organizer.git
```

Install Node Dependencies.

```shell
npm install
```

Run the Application from your local development Repository.

```shell
npm start
```

## Deployment

### Using Pre-Built Scripts
Deploy with pre-build scripts depending on your operating system.

**Windows**
```shell
npm run build-win32
```

**MacOS**
```shell
npm run build-darwin
```

The deployed packages will be stored in your local project repostory in ./build


### Manual Deployment

For manual deployment you may use any electron packager. In the development dependencies we included [electron-packager](https://github.com/electron/electron-packager). You can use this to manually deploy the application, i.e.

```shell
electron-packager . --overwrite --out=build --icon=octopus-icon.icns --platform=win32 --arch=x64
```

## Authors

* **Lennard Scheffler** - *Initial work* - [lennardscheffler](https://github.com/lennardscheffler)

See also the list of [contributors](https://github.com/lennardscheffler/octopus-organizer/graphs/contributors) who participated in this project.

## License

This project is licensed under the GPLv3 License - see the [LICENSE](LICENSE) file for details
