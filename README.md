<p align="center">
    <img src="https://rawgit.com/badges/shields/master/logo.svg"
         height="130">
</p>
<p align="center">
    <a href="https://www.gratipay.com/Shields/">
        <img src="https://img.shields.io/gratipay/team/shields.svg"
             alt="Gratipay">
    </a>
    <a href="https://npmjs.org/package/gh-badges">
        <img src="https://img.shields.io/npm/v/gh-badges.svg"
             alt="npm version">
    </a>
    <a href="https://travis-ci.org/badges/shields">
        <img src="https://img.shields.io/travis/badges/shields.svg"
             alt="build status">
    </a>
</p>
<p align="center"><sup><strong>An image server for legible and concise information. Our <a href="http://shields.io/">Homepage</a> | <a href="https://twitter.com/shields_io">Twitter</a></strong></sup></p>

* **[INSTALL](INSTALL.md)** – installation instructions.
* **[CONTRIBUTING](CONTRIBUTING.md)** – project contribution guidelines.
* **[SPECIFICATION](spec/SPECIFICATION.md)** – spec for the visual design of Shields badges.
* **[LICENSE](LICENSE.md)** – public domain dedication.

Make your own badges [here][badges]! (Quick guide: `https://img.shields.io/badge/left-right-f39f37.svg`.)

[badges]: <http://shields.io/#your-badge>

## Solving the problem
Many GitHub repositories sport badges for things like:
<table>
  <tr>
    <td><a href="https://travis-ci.org/"><strong>Travis CI</strong></a><p><sup>(build status)</sup></p></td>
    <td><img src="http://f.cl.ly/items/2H233M0I0T43313c3h0C/Screen%20Shot%202013-01-30%20at%202.45.30%20AM.png" alt="Travis CI badge"></td>
  </tr>
  <tr>
    <td><a href="https://gemnasium.com/"><strong>Gemnasium</strong></a><p><sup>(dependency checks)</sup></p></td>
    <td><img src="http://f.cl.ly/items/2j1D2R0q2C3s1x2y3k09/Screen%20Shot%202013-01-30%20at%202.46.10%20AM.png" alt="Gemnasium badge"></td>
  </tr>
  <tr>
    <td><a href="http://codeclimate.com"><strong>Code Climate</strong></a><p><sup>(static analysis)</sup></p></td>
    <td><img src="http://f.cl.ly/items/0H2O1A3q2b3j1D2i0M3j/Screen%20Shot%202013-01-30%20at%202.46.47%20AM.png" alt="Code Climate badge"></td>
  </tr>
  <tr>
    <td><a href="http://rubygems.org"><strong>RubyGems</strong></a><p><sup>(released gem version)</sup></p></td>
    <td><img src="http://f.cl.ly/items/443X21151h1V301s2s3a/Screen%20Shot%202013-01-30%20at%202.47.10%20AM.png" alt="RubyGems badge"></td>
  </tr>
</table>

As you can see from the zoomed 400% versions of these badges above, nobody is (really) using the same badge file and at normal size, they're hardly legible. Worst of all, they're completely inconsistent. The information provided isn't of the same kind on each badge. The context is blurry, which doesn't make for a straightforward understanding of how these badges are relevant to the project they're attached to and what information they provide.

## The Shields solution
As you can see below, without increasing the footprint of these badges, I've tried to increase legibility and coherence, removing useless text to decrease the horizontal length in the (likely) scenario that more of these badge thingies crop up on READMEs all across the land.

![Badge design](spec/proportions.png)

This badge design corresponds to an old and now deprecated version which has since been replaced by beautiful and scalable SVG versions that can be found on [shields.io](http://shields.io).

## Examples
What kind of metadata can you convey using badges?
* test build status: `build | failing`
* code coverage percentage: `coverage | 80%`
* stable release version: `version | 1.2.3`
* package manager release: `gem | 1.2.3`
* status of third-party dependencies: `dependencies | out-of-date`
* static code analysis GPA: `code climate | 3.8`
* [SemVer](http://semver.org/) version observance: `semver | 2.0.0`
* amount of [Gratipay](http://gratipay.com) donations per week: `tips | $2/week`

## Services using the Shields standard
* [Badger](https://github.com/badges/badgerbadgerbadger)
* [badges2svg](https://github.com/bfontaine/badges2svg)
* [CII Best Practices](https://bestpractices.coreinfrastructure.org/)
* [Codacy](https://www.codacy.com)
* [Code Climate](https://codeclimate.com/changelog/510d4fde56b102523a0004bf)
* [Coveralls](https://coveralls.io/)
* [Forkability](http://basicallydan.github.io/forkability/)
* [Gemnasium](http://support.gemnasium.com/forums/236528-general/suggestions/5518400-use-svg-for-badges-so-they-still-look-sharp-on-r)
* [GoDoc](https://godoc.org/)
* [PHPPackages](https://phppackages.org)
* [Read the Docs](https://readthedocs.org/)
* [reposs](https://github.com/rexfinn/reposs)
* [ruby-gem-downloads-badge](https://github.com/bogdanRada/ruby-gem-downloads-badge/)
* [Scrutinizer](https://scrutinizer-ci.com/)
* [Semaphore](https://semaphoreapp.com)
* [Travis CI](https://github.com/travis-ci/travis-ci/issues/630#issuecomment-38054967)
* [Version Badge](http://badge.fury.io/)
* [VersionEye](https://www.versioneye.com/)

# Legal

All assets and code are under the [CC0 LICENSE](LICENSE.md) and in the public
domain unless specified otherwise.

The assets in `logo/` are trademarks of their respective companies and are under
their terms and license.
