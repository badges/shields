# badge-maker/fonts/

Runtime fonts for badge text-width measurement.

`@chenglou/pretext` measures text width through canvas text rendering, so the computed width depends on the fonts that are actually available at runtime. That means badge rendering is only reproducible if CI and local development use the same font files.

## Setup

Populate this directory before running badge-maker tests:

```sh
node scripts/download-fonts.js
```

The script downloads free fonts from GitHub and copies Verdana from your system (see below).

This setup is required for two reasons:

1. CI machines may not have the fonts needed by `pretext` installed.
2. Developers should run `pretext` against the same fonts as CI so text-width calculation stays consistent across environments and matches the committed snapshots.

## Fonts

| File | Family | License | Notes |
| --- | --- | --- | --- |
| `DejaVuSans.ttf` | DejaVu Sans | [Bitstream Vera](https://dejavu-fonts.github.io/License.html) | Free to redistribute |
| `DejaVuSans-Bold.ttf` | DejaVu Sans | Bitstream Vera | Free to redistribute |
| `LiberationSans-Regular.ttf` | Liberation Sans | [SIL OFL 1.1](https://scripts.sil.org/OFL) | Free to redistribute; metric-compatible with Arial/Helvetica |
| `LiberationSans-Bold.ttf` | Liberation Sans | SIL OFL 1.1 | Free to redistribute |
| `Verdana.ttf` | Verdana | © Microsoft | **Proprietary — do NOT commit** |
| `Verdana_Bold.ttf` | Verdana | © Microsoft | **Proprietary — do NOT commit** |

## .gitignore

Verdana is excluded from version control (see `badge-maker/.gitignore`). The free fonts (DejaVu Sans, Liberation Sans) are also excluded since they are re-downloaded by `scripts/download-fonts.js` during CI setup.

In other words, this directory is part of the runtime contract for text measurement: `pretext` needs these fonts to produce stable widths in both CI and local development.

## Why Liberation Sans for Helvetica?

The social badge style measures text with `bold 11px Helvetica`. Helvetica is not freely distributable and is not available on most Linux systems. Liberation Sans is metric-compatible with Arial and Helvetica as specified in the [Liberation Fonts README](https://github.com/liberationfonts/liberation-fonts); registering it under both family names in `canvas-polyfill.js` gives identical glyph widths on all platforms.
