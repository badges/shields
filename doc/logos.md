# Logos

## Using Logos

### SimpleIcons

We support a wide range of logos via [SimpleIcons][]. They should be referenced by the logo slug e.g:

![](https://img.shields.io/npm/v/npm.svg?logo=nodedotjs) - https://img.shields.io/npm/v/npm.svg?logo=nodedotjs

The set of Simple Icon slugs can be found in the [slugs.md](https://github.com/simple-icons/simple-icons/blob/develop/slugs.md) file in the Simple Icons repository. NB - the Simple Icons site and that slugs.md page may at times contain new icons that haven't yet been pulled into the Shields.io runtime. More information on how and when we incorporate icon updates can be found [here](https://github.com/badges/shields/discussions/5369).

### Shields logos

We also maintain a small number of custom logos for some services: https://github.com/badges/shields/tree/master/logo They can also be referenced by name and take preference to SimpleIcons e.g:

![](https://img.shields.io/npm/v/npm.svg?logo=npm) - https://img.shields.io/npm/v/npm.svg?logo=npm

### Custom Logos

Any custom logo can be passed in a URL parameter by base64 encoding it. e.g:

![](https://img.shields.io/badge/play-station-blue.svg?logo=data:image/svg%2bxml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZlcnNpb249IjEiIHdpZHRoPSI2MDAiIGhlaWdodD0iNjAwIj48cGF0aCBkPSJNMTI5IDExMWMtNTUgNC05MyA2Ni05MyA3OEwwIDM5OGMtMiA3MCAzNiA5MiA2OSA5MWgxYzc5IDAgODctNTcgMTMwLTEyOGgyMDFjNDMgNzEgNTAgMTI4IDEyOSAxMjhoMWMzMyAxIDcxLTIxIDY5LTkxbC0zNi0yMDljMC0xMi00MC03OC05OC03OGgtMTBjLTYzIDAtOTIgMzUtOTIgNDJIMjM2YzAtNy0yOS00Mi05Mi00MmgtMTV6IiBmaWxsPSIjZmZmIi8+PC9zdmc+) - https://img.shields.io/badge/play-station-blue.svg?logo=data:image/svg%2bxml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZlcnNpb249IjEiIHdpZHRoPSI2MDAiIGhlaWdodD0iNjAwIj48cGF0aCBkPSJNMTI5IDExMWMtNTUgNC05MyA2Ni05MyA3OEwwIDM5OGMtMiA3MCAzNiA5MiA2OSA5MWgxYzc5IDAgODctNTcgMTMwLTEyOGgyMDFjNDMgNzEgNTAgMTI4IDEyOSAxMjhoMWMzMyAxIDcxLTIxIDY5LTkxbC0zNi0yMDljMC0xMi00MC03OC05OC03OGgtMTBjLTYzIDAtOTIgMzUtOTIgNDJIMjM2YzAtNy0yOS00Mi05Mi00MmgtMTV6IiBmaWxsPSIjZmZmIi8+PC9zdmc+

## Contributing Logos

Our preferred way to consume icons is via the SimpleIcons logo. As a first port of call, we encourage you to contribute logos to [the SimpleIcons project][simple-icons github]. Please review their [guidance](https://github.com/simple-icons/simple-icons/blob/develop/CONTRIBUTING.md) before contributing.

In some cases we may also accept logo submissions directly. In general, we do this only when:

- We have a corresponding badge on the homepage, (e.g. the Eclipse logo because we support service badges for the Eclipse Marketplace). We may also approve logos for other tools widely used by developers.
- The logo provided in SimpleIcons is unclear when displayed at small size on a badge.
- There is substantial benefit in using a multi-colored icon over a monochrome icon.
- The logo doesn't meet the requirements to be included in the SimpleIcons set.

If you are submitting a pull request for a custom logo, please:

- Minimize SVG files through [SVGO][]. This can be done in one of two ways
  - The [SVGO Command Line Tool][svgo]
    - Install SVGO
      - With npm: `npm install -g svgo`
      - With Homebrew: `brew install svgo`
    - Run the following command `svgo --precision=3 icon.svg icon.min.svg`
    - Check if there is a loss of quality in the output, if so increase the precision.
  - The [SVGOMG Online Tool][svgomg]
    - Click "Open SVG" and select an SVG file.
    - Set the precision to about 3, depending on if there is a loss of quality.
    - Leave the remaining settings untouched (or reset them with the button at the bottom of the settings).
    - Click the download button.
- Set a viewbox and ensure the logo is scaled to fit the viewbox, while preserving the logo's original proportions. This means the icon should be touching at least two sides of the viewbox.
- Ensure the logo is vertically and horizontally centered.
- Ensure the logo is minified to a single line with no formatting.
- Ensure the SVG does not contain extraneous attributes.
- Ensure your submission conforms to any relevant brand or logo guidelines.

### Problems

We try to ensure our logos are compliant with brand guidelines. If one of our custom logos does not conform to the necessary brand guidelines, please open an issue on the [shields.io tracker](https://github.com/badges/shields/issues) and we'll work with you to resolve it. If a logo from the simple-icons set does not conform to the relevant brand guidelines, please open an issue on the [simple-icons tracker](https://github.com/simple-icons/simple-icons/issues) first.

[simpleicons]: https://simpleicons.org/
[simple-icons github]: https://github.com/simple-icons/simple-icons
[svgo]: https://github.com/svg/svgo
[svgomg]: https://jakearchibald.github.io/svgomg/
