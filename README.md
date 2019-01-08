<p align="center">
    <img src="https://rawgit.com/badges/shields/master/static/logo.svg"
        height="130">
</p>
<p align="center">
    <a href="#backers" alt="Backers on Open Collective">
        <img src="https://opencollective.com/shields/backers/badge.svg" /></a>
    <a href="#sponsors" alt="Sponsors on Open Collective">
        <img src="https://opencollective.com/shields/sponsors/badge.svg" /></a>
    <a href="https://circleci.com/gh/badges/shields/tree/master">
        <img src="https://img.shields.io/circleci/project/github/badges/shields/master.svg"
            alt="build status"></a>
    <a href="https://circleci.com/gh/badges/daily-tests">
        <img src="https://img.shields.io/circleci/project/github/badges/daily-tests.svg?label=service%20tests"
            alt="service-test status"></a>
    <a href="https://docs.google.com/spreadsheets/d/1cHIUSVaiKrIFw3KIu0yt-EMNlMkIfU5alE7YKZ4PeOE/edit#gid=0">
        <img src="https://img.shields.io/github/search/badges/shields/extends%20LegacyService.svg?label=legacy%20services%20needing%20refactor"
            alt="legacy services needing refactor"></a>
    <a href="https://github.com/search?utf8=%E2%9C%93&q=previewUrl+repo%3Abadges%2Fshields+path%3A%2Fservices&type=Code&ref=advsearch&l=&l=">
        <img src="https://img.shields.io/github/search/badges/shields/previewUrl.svg?label=`previewUrl`s%20needing%20refactor"
            alt="`previewUrl`s needing refactor"></a>
    <a href="https://coveralls.io/github/badges/shields">
        <img src="https://img.shields.io/coveralls/github/badges/shields.svg"
            alt="coverage"></a>
    <a href="https://lgtm.com/projects/g/badges/shields/alerts/">
        <img src="https://img.shields.io/lgtm/alerts/g/badges/shields.svg"
            alt="Total alerts"/></a>
    <a href="https://github.com/badges/shields/compare/gh-pages...master">
        <img src="https://img.shields.io/github/commits-since/badges/shields/gh-pages.svg?label=commits%20to%20be%20deployed"
            alt="commits to be deployed"></a>
    <a href="https://discord.gg/HjJCwm5">
        <img src="https://img.shields.io/discord/308323056592486420.svg?logo=discord"
            alt="chat on Discord"></a>
    <a href="https://twitter.com/intent/follow?screen_name=shields_io">
        <img src="https://img.shields.io/twitter/follow/shields_io.svg?style=social&logo=twitter"
            alt="follow on Twitter"></a>
</p>

This is home to [Shields.io][shields.io], a service for concise, consistent,
and legible badges in SVG and raster format, which can easily be included in
GitHub readmes or any other web page. The service supports dozens of
continuous integration services, package registries, distributions, app
stores, social networks, code coverage services, and code analysis services.
Every month it serves over 470 million images.

This repo hosts:

- The [Shields.io][shields.io] frontend and server code
- An [NPM library for generating badges][gh-badges]
  - [documentation][gh-badges-docs]
  - [changelog][gh-badges-changelog]
- The [badge design specification][badge-spec]

[shields.io]: https://shields.io/
[gh-badges]: https://www.npmjs.com/package/gh-badges
[badge-spec]: https://github.com/badges/shields/tree/master/spec
[gh-badges-docs]: https://github.com/badges/shields/tree/master/gh-badges/README.md
[gh-badges-changelog]: https://github.com/badges/shields/tree/master/gh-badges/CHANGELOG.md

## Examples

- code coverage percentage: ![coverage](https://img.shields.io/badge/coverage-80%25-yellowgreen.svg?maxAge=2592000)
- stable release version: ![version](https://img.shields.io/badge/version-1.2.3-blue.svg?maxAge=2592000)
- package manager release: ![gem](https://img.shields.io/badge/gem-2.2.0-blue.svg?maxAge=2592000)
- status of third-party dependencies: ![dependencies](https://img.shields.io/badge/dependencies-out%20of%20date-orange.svg?maxAge=2592000)
- static code analysis grade: ![codacy](https://img.shields.io/badge/codacy-B-green.svg?maxAge=2592000)
- [SemVer](https://semver.org/) version observance: ![semver](https://img.shields.io/badge/semver-2.0.0-blue.svg?maxAge=2592000)
- amount of [Liberapay](https://liberapay.com/) donations per week: ![receives](https://img.shields.io/badge/receives-2.00%20USD%2Fweek-yellow.svg?maxAge=2592000)
- Python package downloads: ![downloads](https://img.shields.io/badge/downloads-13k%2Fmonth-brightgreen.svg?maxAge=2592000)
- Chrome Web Store extension rating: ![rating](https://img.shields.io/badge/rating-★★★★☆-brightgreen.svg?maxAge=2592000)
- [Uptime Robot](https://uptimerobot.com) percentage: ![uptime](https://img.shields.io/badge/uptime-100%25-brightgreen.svg?maxAge=2592000)

[Make your own badges!][custom badges]
(Quick example: `https://img.shields.io/badge/left-right-f39f37.svg`)

Browse a [complete list of badges][shields.io].

[custom badges]: http://shields.io/#your-badge

## Contributing

Shields is a community project. We invite your participation through issues
and pull requests! You can peruse the [contributing guidelines][contributing].

When adding or changing a service [please add tests][service-tests].

This project has quite a backlog of suggestions! If you're new to the project,
maybe you'd like to open a pull request to address one of them:

[![GitHub issues by-label](https://img.shields.io/github/issues/badges/shields/good%20first%20issue.svg)](https://github.com/badges/shields/issues?q=is%3Aissue+is%3Aopen+label%3A%22good+first+issue%22)

You can read a [tutorial on how to add a badge][tutorial].

[service-tests]: https://github.com/badges/shields/blob/master/doc/service-tests.md
[tutorial]: doc/TUTORIAL.md
[contributing]: CONTRIBUTING.md

## Development

1. Install Node 8 or later. You can use the [package manager][] of your choice.
   Tests need to pass in Node 8 and 9.
2. Clone this repository.
3. Run `npm install` to install the dependencies.
4. Run `npm start` to start the server.
5. Open `http://localhost:3000/` to view the frontend.

To generate the frontend using production cache settings &ndash; that is,
badge preview URIs with `maxAge` &ndash; run `LONG_CACHE=true npm run build`.

To analyze the frontend bundle, run `npm install webpack-bundle-analyzer` and
then `ANALYZE=true npm start`.

[Snapshot tests][] ensure we don't inadvertently make changes that affect the
SVG or JSON output. When deliberately changing the output, run
`SNAPSHOT_DRY=1 npm run test:js:server` to preview changes to the saved
snapshots, and `SNAPSHOT_UPDATE=1 npm run test:js:server` to update them.

The server can be configured to use [Sentry][] ([configuration][sentry configuration]) and [Prometheus][] ([configuration][prometheus configuration]).

Daily tests, including a full run of the service tests and overall code coverage, are run via [badges/daily-tests][daily-tests].

[package manager]: https://nodejs.org/en/download/package-manager/
[snapshot tests]: https://glebbahmutov.com/blog/snapshot-testing/
[prometheus]: https://prometheus.io/
[prometheus configuration]: doc/self-hosting.md#prometheus
[sentry]: https://sentry.io/
[sentry configuration]: doc/self-hosting.md#sentry
[daily-tests]: https://github.com/badges/daily-tests

## Hosting your own server

There is documentation about [hosting your own server][self-hosting].

[self-hosting]: doc/self-hosting.md

## History

b.adge.me was the original website for this service. Heroku back then had a
thing which made it hard to use a toplevel domain with it, hence the odd
domain. It used code developed in 2013 from a library called
[gh-badges][old-gh-badges], both developed by [Thaddée Tyl][espadrine].
The project merged with shields.io by making it use the b.adge.me code
and closed b.adge.me.

The original badge specification was developed in 2013 by
[Olivier Lacan][olivierlacan]. It was inspired by the Travis CI and similar
badges (there were a lot fewer, back then). In 2014 Thaddée Tyl redesigned
it with help from a Travis CI employee and convinced everyone to switch to
it. The old design is what today is called the plastic style; the new one
is the flat style.

You can read more about [the project's inception][thread],
[the motivation of the SVG badge specification][motivation], and
[the specification itself][spec].

[olivierlacan]: https://github.com/olivierlacan
[espadrine]: https://github.com/espadrine
[old-gh-badges]: https://github.com/badges/gh-badges
[motivation]: spec/motivation.md
[spec]: spec/SPECIFICATION.md
[thread]: https://github.com/h5bp/lazyweb-requests/issues/150

## Project leaders

Maintainers:

- [calebcartwright](https://github.com/calebcartwright)
- [chris48s](https://github.com/chris48s) (core team)
- [Daniel15](https://github.com/Daniel15) (core team)
- [espadrine](https://github.com/espadrine) (core team)
- [paulmelnikow](https://github.com/paulmelnikow) (core team)
- [platan](https://github.com/platan) (core team)
- [PyvesB](https://github.com/PyvesB) (core team)
- [RedSparr0w](https://github.com/RedSparr0w) (core team)

Operations:

- [espadrine](https://github.com/espadrine) (sysadmin)
- [paulmelnikow](https://github.com/paulmelnikow) (limited access)

Alumni:

- [olivierlacan](https://github.com/olivierlacan)

## Related projects

- [badgerbadgerbadger gem][gem]
- [pybadges python library][pybadges]

[gem]: https://github.com/badges/badgerbadgerbadger
[pybadges]: https://github.com/google/pybadges

## License

All assets and code are under the [CC0 LICENSE](LICENSE) and in the public
domain unless specified otherwise.

The assets in `logo/` are trademarks of their respective companies and are
under their terms and license.

## Contributors

This project exists thanks to all the people who contribute. [[Contribute](CONTRIBUTING.md)].
<a href="https://github.com/badges/shields/graphs/contributors"><img src="https://opencollective.com/shields/contributors.svg?width=890" /></a>

## Backers

Thank you to all our backers! 🙏 [[Become a backer](https://opencollective.com/shields#backer)]

<a href="https://opencollective.com/shields#backers" target="_blank"><img src="https://opencollective.com/shields/backers.svg?width=890"></a>

## Sponsors

Support this project by becoming a sponsor. Your logo will show up here with a link to your website. [[Become a sponsor](https://opencollective.com/shields#sponsor)]

<a href="https://opencollective.com/shields/sponsor/0/website" target="_blank"><img src="https://opencollective.com/shields/sponsor/0/avatar.svg"></a>
<a href="https://opencollective.com/shields/sponsor/1/website" target="_blank"><img src="https://opencollective.com/shields/sponsor/1/avatar.svg"></a>
<a href="https://opencollective.com/shields/sponsor/2/website" target="_blank"><img src="https://opencollective.com/shields/sponsor/2/avatar.svg"></a>
<a href="https://opencollective.com/shields/sponsor/3/website" target="_blank"><img src="https://opencollective.com/shields/sponsor/3/avatar.svg"></a>
<a href="https://opencollective.com/shields/sponsor/4/website" target="_blank"><img src="https://opencollective.com/shields/sponsor/4/avatar.svg"></a>
<a href="https://opencollective.com/shields/sponsor/5/website" target="_blank"><img src="https://opencollective.com/shields/sponsor/5/avatar.svg"></a>
<a href="https://opencollective.com/shields/sponsor/6/website" target="_blank"><img src="https://opencollective.com/shields/sponsor/6/avatar.svg"></a>
<a href="https://opencollective.com/shields/sponsor/7/website" target="_blank"><img src="https://opencollective.com/shields/sponsor/7/avatar.svg"></a>
<a href="https://opencollective.com/shields/sponsor/8/website" target="_blank"><img src="https://opencollective.com/shields/sponsor/8/avatar.svg"></a>
<a href="https://opencollective.com/shields/sponsor/9/website" target="_blank"><img src="https://opencollective.com/shields/sponsor/9/avatar.svg"></a>
