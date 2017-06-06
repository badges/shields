# Contribution Guidelines

This is the home of Shields.io, home to the badge design specification, API documentation, and server code for Badges as a Service.

We invite participation through [GitHub Issues][], which we use much like a discussion forum. This repository should only contain non-implementation specific topics: specifications, design, and the web site.

## This implementation

Please see [INSTALL.md][] for information on how to start contributing code to
shields.io.
You can read a [Tutorial on how to add a badge](doc/TUTORIAL.md).

[INSTALL.md]: ./INSTALL.md

Note that the root gets redirected to <http://shields.io>.
For testing purposes, you can go to `http://localhost/try.html`.

## Ground rules

- The left-hand side of a badge should not advertize. It should be a noun
  describing succinctly the meaning of the right-hand-side data.
- New query parameters (such as `?label=` or `?style=`) should apply to any
  requested badge. They must be registered in the cache (see `LruCache` in
  `server.js`).
- The format of new badges should be of the form
  `/VENDOR/SUBVENDOR-BADGE-SPECIFIC/PARAMETERS.format`. For instance,
  `https://img.shields.io/gitter/room/nwjs/nw.js.svg`. The vendor is gitter, the
  badge is for rooms, the parameter is nwjs/nw.js, and the format is svg.

Please minimize `.svg` files (eg. in logo/) through [SVGO][] (eg. by using
[svgomg][]).

[SVGO]: https://github.com/svg/svgo
[svgomg]: https://jakearchibald.github.io/svgomg/

## Implementations

The main implementation, available at <http://shields.io>, has its code located in this repository.

Other systems that produce badges following the same design, hosted elsewhere, are listed below.

| website / AP                      | language   | issues                       |
| --------------------------------- | ---------- | ---------------------------- |
| shielded                          | JavaScript | [shielded][shielded issues]  |
| [buckler.repl.ca][]               | Go         | [buckler][buckler issues]    |
| old img.shields.io (discontinued) | Python     | [img.shields.io-old][]       |
| DotBadge                          | C#         | [DotBadge](https://github.com/rebornix/DotBadge/issues) |

Please report **bugs** and discuss implementation specific concerns (performance characteristics, etc.) in the repository for the respective implementation.

## Adding support for a service

Please [open an issue][new issue] if you'd like to use Shields badges for a project that isn't yet supported.


[shields.io]: http://shields.io/
[website]: https://github.com/badges/shields/tree/gh-pages
[GitHub Issues]: https://github.com/badges/shields/issues
[new issue]: https://github.com/badges/shields/issues/new

[img.shields.io]: http://img.shields.io/
[gh-badges issues]: https://github.com/badges/shields/issues
[primary]: https://github.com/badges/shields/issues/94

[shielded issues]: https://github.com/badges/shielded/issues

[buckler.repl.ca]: http://buckler.repl.ca/
[buckler issues]: https://github.com/badges/buckler/issues

[img.shields.io-old]: https://github.com/badges/img.shields.io-old/issues
