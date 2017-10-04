<p align="center">
    <img src="https://raw.githubusercontent.com/badges/shields/master/logo.svg"
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
    <a href="https://discord.gg/HjJCwm5">
        <img src="https://img.shields.io/discord/308323056592486420.svg"
             alt="chat on Discord">
    </a>
</p>

[![Twitter](https://img.shields.io/twitter/follow/shields_io.svg?style=social)]()

This is home to [Shields.io][shields.io], a service for concise, consistent,
and legible badges in SVG and raster format, which can easily be included in
GitHub readmes or any other web page. The service supports dozens of
continuous integration services, package registries, distributions, app
stores, social networks, code coverage services, and code analysis services.
Every month it serves over 470 million images.

In addition to hosting the shields.io home page and server code, this monorepo
hosts an [NPM library for generating badges][gh-badges], and the badge design
specification.


Examples
--------

* build status: `build | failing`
* code coverage percentage: `coverage | 80%`
* stable release version: `version | 1.2.3`
* package manager release: `gem | 1.2.3`
* status of third-party dependencies: `dependencies | out-of-date`
* static code analysis GPA: `code climate | 3.8`
* [SemVer](http://semver.org/) version observance: `semver | 2.0.0`
* amount of [Gratipay](http://gratipay.com) donations per week: `tips | $2/week`

[Make your own badges][custom badges]!
(Quick guide: `https://img.shields.io/badge/left-right-f39f37.svg`.)

Browse a [complete list of badges][shields.io].

[custom badges]: http://shields.io/#your-badge


Contributing
------------

Shields is a community project! We invite your participation through issues
and pull requests.

When adding or changing a service please add [tests][service-tests].

This project has quite a backlog of suggestions! If you're new to the project,
maybe you'd like to opan a pull request to address one of them:

[![GitHub issues by-label](https://img.shields.io/github/issues/badges/shields/beginner-friendly.svg)]()

Or you can adopt one of these pull requests:

[![GitHub issues by-label](https://img.shields.io/github/issues-pr/badges/shields/beginner-friendly.svg)]()

You can read a [tutorial on how to add a badge][tutorial].

You can peruse the [contributing guidelines][contributing].

[service-tests]: https://github.com/badges/shields/blob/master/service-tests/README.md
[tutorial]: doc/TUTORIAL.md
[contributing]: CONTRIBUTING.md


Using the badge library
-----------------------

[![npm version](http://img.shields.io/npm/v/gh-badges.svg)](https://npmjs.org/package/gh-badges)

```sh
npm install -g gh-badges
badge build passed :green .png > mybadge.png
```

```js
const badge = require('gh-badges')

// Optional step, to have accurate text width computation.
const format = {
  text: ['build', 'passed'],
  colorscheme: 'green',
  template: 'flat',
}

badge.loadFont('/path/to/Verdana.ttf', err => {
  badge(format, (svg, err) => {
    // svg is a string containing your badge
  })})
```

View the [documentation for gh-badges][gh-badges doc].

**Note:** The badge library was last released in 2016.

[gh-badges doc]: doc/gh-badges.md


Development
-----------

1. Install Node 6 or later. You can use the [package manager][] of your choice.
2. Clone this repository.
3. Run `npm install` to install the dependencies.
4. Run `node server 1111 localhost` to start the server.
5. Open `http://localhost:1111/try.html` to view the home page.

[package manager]: https://nodejs.org/en/download/package-manager/


Hosting your own server
-----------------------

There is documentation about [hosting your own server][self-hosting].

[self-hosting]: doc/self-hosting.md


History
-------

The badge specification was developed in 2013 by [espadrine][] as part of a
library called [gh-badges][old-gh-badges], which then merged with shields.io,
badgr.co, and b.adge.me to form this project. You can read more about
[the project's inception][thread],
[the motivation of the SVG badge specification][motivation], and
[the specification itself][spec].

[espadrine]: https://github.com/espadrine
[old-gh-badges]: https://github.com/badges/gh-badges
[motivation]: spec/motivation.md
[spec]: spec/SPECIFICATION.md
[thread]: https://github.com/h5bp/lazyweb-requests/issues/150


Project leaders
---------------

[espadrine](https://github.com/espadrine) is the sysadmin.

These contributors donate time on a consistent basis to help guide and
maintain the project:

* [Daniel15](https://github.com/Daniel15)
* [espadrine](https://github.com/espadrine)
* [paulmelnikow](https://github.com/paulmelnikow)


Related projects
----------------

- [badgerbadgerbadger gem][gem]

[gem]: https://github.com/badges/badgerbadgerbadger


License
-------

All assets and code are under the [CC0 LICENSE](LICENSE.md) and in the public
domain unless specified otherwise.

The assets in `logo/` are trademarks of their respective companies and are
under their terms and license.
