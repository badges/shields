# Shields [![Gittip](http://img.shields.io/gittip/shields.svg)](https://www.gittip.com/Shields/) [![npm version](http://img.shields.io/npm/v/gh-badges.svg)](https://npmjs.org/package/gh-badges) [![build status](http://img.shields.io/travis/badges/shields.svg)](https://travis-ci.org/badges/shields)

A legible & concise status badge solution for third-party codebase services.

Make your own badges [here][badges]!

[badges]: <http://img.shields.io>

## Services using the Shields standard
- [Travis CI](https://github.com/travis-ci/travis-ci/issues/630#issuecomment-38054967)
- [Code Climate](https://codeclimate.com/changelog/510d4fde56b102523a0004bf)
- [Coveralls](https://coveralls.io/r/kaize/nastachku)
- [Gemfury/RubyGems](http://badge.fury.io/)
- [Gemnasium](http://support.gemnasium.com/forums/236528-general/suggestions/5518400-use-svg-for-badges-so-they-still-look-sharp-on-r)
- [Scrutinizer CI](https://scrutinizer-ci.com/)
- [Semaphore](https://semaphoreapp.com)
- [Read the Docs](https://readthedocs.org/)
- [BadgerBadgerBadger][gem]
- [badges2svg][]
- [reposs][]

[gem]: https://github.com/badges/badgerbadgerbadger
[badges2svg]: https://github.com/bfontaine/badges2svg
[reposs]: https://github.com/rexfinn/reposs

## Problem
Many GitHub repos sport badges for things like:
- [Travis CI](https://travis-ci.org/) build status:

![travis badge](http://f.cl.ly/items/2H233M0I0T43313c3h0C/Screen%20Shot%202013-01-30%20at%202.45.30%20AM.png)

- [Gemnasium](https://gemnasium.com/) dependency checks:

![gemnasium badge](http://f.cl.ly/items/2j1D2R0q2C3s1x2y3k09/Screen%20Shot%202013-01-30%20at%202.46.10%20AM.png)

- [Code Climate](http://codeclimate.com):

![code climate badge](http://f.cl.ly/items/0H2O1A3q2b3j1D2i0M3j/Screen%20Shot%202013-01-30%20at%202.46.47%20AM.png)

- [RubyGems](http://rubygems.org) released gem version:

![rubygems badge](http://f.cl.ly/items/443X21151h1V301s2s3a/Screen%20Shot%202013-01-30%20at%202.47.10%20AM.png)

As you can see from the zoomed 400% versions of these badges above, nobody is (really) using the same badge file and at normal size, they're hardly legible. Worst of all, they're completely inconsistent. The information provided isn't of the same kind on each badge. The context is blurry, which doesn't make for å straightforward understanding of how these badges are relevant to the project they're attached to and what information they provide.

## Solution
As you can see below, without increasing the footprint of these badges, I've tried to increase legibility and coherence, removing useless text to decrease the horizontal length in the (likely) scenario that more of these badge thingies crop up on READMEs all across the land.

![Badge design](spec/proportions.png)

We have an effort to produce similar-looking SVGs through a web service at
<http://img.shields.io>. That ensures that we are retina-ready.

## Examples

What kind of meta data can you convey using badges?

- test build status: `build | failing`
- code coverage percentage: `coverage | 80%`
- stable release version: `version | 1.2.3`
- package manager release: `gem | 1.2.3`
- status of third-party dependencies: `dependencies | out-of-date`
- static code analysis GPA: `code climate | 3.8`
- [semver](http://semver.org/) version observance: `semver | 2.0.0`
- amount of [gittip](http://gittip.com) donations per week: `tips | $2/week`

## Font
The font chosen in the specification is the Apache licensed Open Sans Regular available from [Google Web Fonts](http://www.google.com/webfonts/specimen/Open+Sans).

## Specification
See [SPECIFICATION.md](spec/SPECIFICATION.md).

## Installation Instructions
See [INSTALL.md](INSTALL.md).

## Contributions
See [CONTRIBUTING.md](CONTRIBUTING.md).

## License
See [LICENSE.md](LICENSE.md).

