Contributing to Shields
=======================

Shields is a community project. We invite your participation through issues
and pull requests!


Ways you can help
-----------------

### Contributing code

This project has quite a backlog of suggestions! If you're new to the project,
maybe you'd like to open a pull request to address one of them:

[![GitHub issues by-label](https://img.shields.io/github/issues/badges/shields/good%20first%20issue.svg)](https://github.com/badges/shields/issues?q=is%3Aissue+is%3Aopen+label%3A%22good+first+issue%22)

Or you can adopt one of these pull requests:

[![GitHub issues by-label](https://img.shields.io/github/issues-pr/badges/shields/good%20first%20issue.svg)](https://github.com/badges/shields/pulls?q=is%3Apr+is%3Aopen+label%3A%22good+first+issue%22)

### Contributing documentation

You can help by improving the project's usage and developer instructions.

### Helping others

You can monitor [issues][] and the [chat room][], and help other people who
have questions about contributing to Shields, or using it for their projects.

[issues]: https://github.com/badges/shields/issues
[chat room]: https://discordapp.com/invite/HjJCwm5

### Suggesting improvements

There are _a lot_ of suggestions on file. You can help by weighing in on these
suggestions, which helps convey community need to other contributors who might
pick them up.

There is no need to post a new comment. Just add a :thumbsup: or :heart: to
the top post.

If you have a suggestion of your own, [search the open issues][issues] and if
you don't see it, feel free to [open a new issue][open an issue].

[open an issue]: https://github.com/badges/shields/issues/new


Getting help
------------

There are three places to get help:

1. If you're new to the project, a good place to start is the [tutorial][].
2. If you need help getting started or implementing a change, feel free to
   [open an issue][] with your question.
3. You can also join the [chat room][] and ask your question there.

[tutorial]: doc/TUTORIAL.md


Badge guidelines
----------------

- The left-hand side of a badge should not advertize. It should be a noun
  describing succinctly the meaning of the right-hand-side data.
- New query parameters must be declared by the service. See
  `request-handler.js`.
- The format of new badges should be of the form
  `/VENDOR/SUBVENDOR-BADGE-SPECIFIC/PARAMETERS.format`. For instance,
  `https://img.shields.io/gitter/room/nwjs/nw.js.svg`. The vendor is gitter, the
  badge is for rooms, the parameter is nwjs/nw.js, and the format is svg.
- Except for badges using the `social` style, logos should be turned off by
  default.


Coding guidelines
-----------------

### Tests

When adding or changing a service [please write tests][service-tests].

When opening a pull request, include your service name in brackets in the pull
request title. That way, those service tests will run in CI.

e.g. **[Travis] Fix timeout issues**

When changing other code, please add unit tests.

[service-tests]: https://github.com/badges/shields/blob/master/service-tests/README.md

### Code organization

Function declarations are placed in `lib/`, not directly in `server.js`.


Logos
-----

Please minimize checked-in SVG files through [SVGO][]. You can use [svgomg][].

[SVGO]: https://github.com/svg/svgo
[svgomg]: https://jakearchibald.github.io/svgomg/
