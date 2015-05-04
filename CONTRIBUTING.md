# Contribution Guidelines

This is the home of Shields.io, home to the badge design specification, API documentation, and server code for Badges as a Service.

We invite participation through [GitHub Issues][], which we use much like a discussion forum. This repository should only contain non-implementation specific topics: specifications, design, and the web site.

## This implementation

Please see [INSTALL.md][] for information on how to start contributing code to
shields.io.

[INSTALL.md]: ./INSTALL.md

Note that the root gets redirected to <http://shields.io>.
For testing purposes, you can go to `http://localhost/try.html`.
You should modify that file. The "real" root, `http://localhost/index.html`,
gets generated from the `try.html` file.

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
