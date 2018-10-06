Contributing to Shields
=======================

Shields is a community project. We invite your participation through
financial contributions, issues, and pull requests!


Ways you can help
-----------------

### Financial contributions

We welcome financial contributions in full transparency on our
[open collective](https://opencollective.com/shields). Anyone can file an
expense. If the expense makes sense for the development of the community, it
will be "merged" into the ledger of our open collective by the core
contributors and the person who filed the expense will be reimbursed.

### Contributing code

This project has quite a backlog of suggestions! If you're new to the project,
maybe you'd like to open a pull request to address one of them:

[![GitHub issues by-label](https://img.shields.io/github/issues/badges/shields/good%20first%20issue.svg)](https://github.com/badges/shields/issues?q=is%3Aissue+is%3Aopen+label%3A%22good+first+issue%22)

### Contributing documentation

You can help by improving the project's usage and developer instructions.

- When you read the documentation, you can fix mistakes and add your own thoughts.
- When your pull request follows the documentation but the practice changed,
  consider pointing this out and change the documentation for the next person.

### Helping others

You can help with code review, which reduces bugs, and over time has a
wonderful side effect of making the code more readable and therefore more
approachable. It's also a great way to teach and learn. Feel free to jump in!
Be welcoming, appreciative, and helpful. You can perform first reviews of
simple changes, like badge additions. These are usually tagged with
[service badge][service badge PR tag].

Please review [these impeccable guidelines][code review guidelines].

You can monitor [issues][] and the [chat room][], and help other people who
have questions about contributing to Shields, or using it for their projects.

Feel free to reach out to one of the [maintainers][]
if you need help getting started.

[service badge PR tag]: https://github.com/badges/shields/pulls?q=is%3Apr+is%3Aopen+label%3Aservice-badge
[code review guidelines]: http://amyciavolino.com/assets/MindfulCommunicationInCodeReviews.pdf
[issues]: https://github.com/badges/shields/issues
[chat room]: https://discordapp.com/invite/HjJCwm5
[maintainers]: https://github.com/badges/shields#project-leaders

### Suggesting improvements

There are _a lot_ of suggestions on file. You can help by weighing in on these
suggestions, which helps convey community need to other contributors who might
pick them up.

There is no need to post a new comment. Just add a :thumbsup: or :heart: to
the top post.

If you have a suggestion of your own, [search the open issues][issues]. If you
don't see it, feel free to [open a new issue][open an issue].

[open an issue]: https://github.com/badges/shields/issues/new/choose

### Spreading the word

Feel free to star the repository. This will help increase the visibility of the project, therefore attracting more users and contributors to Shields!

We're also asking for [one-time $10 donations](https://opencollective.com/shields) from developers who use and love Shields, please spread the word!

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

- Shields.io hosts integrations for services which are primarily
  used by developers or which are widely used by developers
- The left-hand side of a badge should not advertise. It should be a lowercase *noun*
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

### Prettier

This project formats its source code using Prettier. The most enjoyable way to
use Prettier is to let is format code for you when you save. You can [integrate
it into your editor][integrate prettier].

If for whatever reason you don't want to do that, you can run
`npm run prettier` to format the code from the command line.

[integrate prettier]: https://prettier.io/docs/en/editors.html

### Tests

When adding or changing a service [please write tests][service-tests].

When opening a pull request, include your service name in brackets in the pull
request title. That way, those service tests will run in CI.

e.g. **[Travis] Fix timeout issues**

When changing other code, please add unit tests.

To run the integration tests, you must have redis installed and in your PATH.
Use `brew install redis`, `yum install redis`, etc. The test runner will
start the server automatically.

[service-tests]: https://github.com/badges/shields/blob/master/doc/service-tests.md

### Code organization

Function declarations are placed in `lib/`, not directly in `server.js`.


Logos
-----

We support a wide range of logos via [SimpleIcons][] and encourage you to [contribute logos to that project][simple-icons github].

We also accept logos directly. In general, we do this only when we have a corresponding badge on the homepage, (e.g. the Eclipse logo because we support service badges for the Eclipse Marketplace). We may also approve logos for tools widely used by developers (e.g. our Slack logo). We will happily consider all requests, but don't expect systematic approval, it's at the discretion of the maintainers.

Please minimize checked-in SVG files through [SVGO][]. You can use [svgomg][].

If you want to use a logo that does not meet our guidelines, a custom logo can be passed in a URL parameter by base64 encoding it. For example this badge ![](https://img.shields.io/badge/play-station-blue.svg?logo=data:image/svg%2bxml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZlcnNpb249IjEiIHdpZHRoPSI2MDAiIGhlaWdodD0iNjAwIj48cGF0aCBkPSJNMTI5IDExMWMtNTUgNC05MyA2Ni05MyA3OEwwIDM5OGMtMiA3MCAzNiA5MiA2OSA5MWgxYzc5IDAgODctNTcgMTMwLTEyOGgyMDFjNDMgNzEgNTAgMTI4IDEyOSAxMjhoMWMzMyAxIDcxLTIxIDY5LTkxbC0zNi0yMDljMC0xMi00MC03OC05OC03OGgtMTBjLTYzIDAtOTIgMzUtOTIgNDJIMjM2YzAtNy0yOS00Mi05Mi00MmgtMTV6IiBmaWxsPSIjZmZmIi8+PC9zdmc+) could be generated by calling: https://img.shields.io/badge/play-station-blue.svg?logo=data:image/svg%2bxml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZlcnNpb249IjEiIHdpZHRoPSI2MDAiIGhlaWdodD0iNjAwIj48cGF0aCBkPSJNMTI5IDExMWMtNTUgNC05MyA2Ni05MyA3OEwwIDM5OGMtMiA3MCAzNiA5MiA2OSA5MWgxYzc5IDAgODctNTcgMTMwLTEyOGgyMDFjNDMgNzEgNTAgMTI4IDEyOSAxMjhoMWMzMyAxIDcxLTIxIDY5LTkxbC0zNi0yMDljMC0xMi00MC03OC05OC03OGgtMTBjLTYzIDAtOTIgMzUtOTIgNDJIMjM2YzAtNy0yOS00Mi05Mi00MmgtMTV6IiBmaWxsPSIjZmZmIi8+PC9zdmc+

[simpleicons]: https://simpleicons.org/
[simple-icons github]: https://github.com/simple-icons/simple-icons
[SVGO]: https://github.com/svg/svgo
[svgomg]: https://jakearchibald.github.io/svgomg/
