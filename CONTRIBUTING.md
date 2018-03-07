Contributing to Shields
=======================

Shields is a community project. We invite your participation through
financial contributions, issues, and pull requests!


Ways you can help
-----------------

### Spreading the word

Feel free to star the repository. This will help increase the visibility of the project, therefore attracting more users and contributors to Shields! 

We're also asking for one-time $10 donations from people who use and love Shields. Please donate and spread the word! Financial contributions are handled in full transparency on our
[open collective](https://opencollective.com/shields). Anyone can file an
expense. If the expense makes sense for the development of the community, it
will be "merged" into the ledger of our open collective by the core
contributors and the person who filed the expense will be reimbursed.

### Contributing code

This project has quite a backlog of suggestions! If you're new to the project,
maybe you'd like to open a pull request to address one of them:

[![GitHub issues by-label](https://img.shields.io/github/issues/badges/shields/good%20first%20issue.svg)](https://github.com/badges/shields/issues?q=is%3Aissue+is%3Aopen+label%3A%22good+first+issue%22)

Or you can adopt one of these pull requests:

[![GitHub issues by-label](https://img.shields.io/github/issues-pr/badges/shields/good%20first%20issue.svg)](https://github.com/badges/shields/pulls?q=is%3Apr+is%3Aopen+label%3A%22good+first+issue%22)

### Contributing documentation

You can help by improving the project's usage and developer instructions.

### Helping others

You can help with code review, which reduces bugs, and over time has a
wonderful side effect of making the code more readable and therefore more
approachable. It's also a great way to teach and learn. Feel free to jump in!
Be welcoming, appreciative, and helpful.

Please review [these impeccable guidelines][code review guidelines].

You can perform first reviews of simple changes, like badge additions. You can
also review @paulmelnikow's changes, most of which are otherwise
self-reviewed.

You can monitor [issues][] and the [chat room][], and help other people who
have questions about contributing to Shields, or using it for their projects.

Feel free to reach out to @paulmelnikow if you'd need help getting started.

[code review guidelines]: http://amyciavolino.com/assets/MindfulCommunicationInCodeReviews.pdf
[issues]: https://github.com/badges/shields/issues
[chat room]: https://discordapp.com/invite/HjJCwm5

### Suggesting improvements

There are _a lot_ of suggestions on file. You can help by weighing in on these
suggestions, which helps convey community need to other contributors who might
pick them up.

There is no need to post a new comment. Just add a :thumbsup: or :heart: to
the top post.

If you have a suggestion of your own, [search the open issues][issues]. If you
don't see it, feel free to [open a new issue][open an issue].

[open an issue]: https://github.com/badges/shields/issues/new

Getting help
------------

There are three places to get help:

1. If you're new to the project, a good place to start is the [tutorial][].
2. If you need help getting started or implementing a change, [open an issue][]
   with your question. We promise it's okay to do that. If there is already an
   issue open for the feature you're working on, you can post there.
3. You can also join the [chat room][] and ask your question there.

[tutorial]: doc/TUTORIAL.md


Badge guidelines
----------------

- The left-hand side of a badge should not advertize. It should be a *noun*
  succinctly describing the meaning of the right-hand side.
- Query parameters must be *declared by the service*. See `request-handler.js`.
- Except for badges using the `social` style, logos should be *turned off by
  default*.


Badge URLs
----------

- The format of new badges should be of the form
  `/SERVICE/NOUN/PARAMETERS/QUALIFIERS.format`. For instance,
  `/gitter/room/nwjs/nw.js.svg`. The vendor is gitter, the
  badge is for rooms, the parameter is nwjs/nw.js, and the format is svg.
- For services which require a hostname, the badge should be of the form
  `/SERVICE/SCHEME/HOST/NOUN/PARAMETERS/QUALIFIERS.format`. For instance,
  `/discourse/https/discourse.example.com/topics.svg`.


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

Please minimize checked-in SVG files through [SVGO][]. You can use [svgomg][]. In general we only accept logos that have a corresponding badge on the homepage (e.g. the Eclipse logo because we support service badges for the Eclipse Marketplace), but we may also approve logos for tools widely used by developers (e.g. our Slack logo). We will happily consider all requests, but don't expect systematic approval, it's at the discretion of the maintainers.

[SVGO]: https://github.com/svg/svgo
[svgomg]: https://jakearchibald.github.io/svgomg/
