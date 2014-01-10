# Contribution Guidelines

This is the home of Shields.io, containing the badge design specification and API documentation for Badges as a Service. There is also a [gh-pages branch][website] containing the static web site at [shields.io][].

We invite participation through [GitHub Issues][], which we use much like a discussion forum. This repository should only contain non-implementation specific topics: specifications, design, and the web site.

## Implementations

Please report **bugs** and discuss implementation specific concerns (performance characteristics, etc.) in the repository for the respective implementation:

| website / AP                  | language   | issues                        |
| ----------------------------- | ---------- | ----------------------------- |
| [b.adge.me][] *               | JavaScript | [gh-badges][gh-badges issues] |
| shielded                      | JavaScript | [shielded][shielded issues]   |
| [buckler.repl.ca][]           | Go         | [buckler][buckler issues]     |
| img.shields.io *              | Python     | [img.shields.io-old][]        |

\* gh-badges [has been adopted][primary] as the primary implementation going forward
\* img.shields.io is being disbanded and replaced with gh-badges

## Adding support for a service

Please [open an issue][new issue] if you'd like to use Shields badges for a project that isn't yet supported.

## Shields-as-a-Service

Our long term goal is to transform Shields into a service with which widely compatible badges can be generated via a simple API call, any help with this would be much appreciated.

[shields.io]: http://shields.io/
[website]: https://github.com/badges/shields/tree/gh-pages
[GitHub Issues]: https://github.com/badges/shields/issues
[new issue]: https://github.com/badges/shields/issues/new

[b.adge.me]: http://b.adge.me/
[gh-badges issues]: https://github.com/espadrine/gh-badges/issues
[primary]: https://github.com/badges/shields/issues/94

[shielded issues]: https://github.com/badges/shielded/issues

[buckler.repl.ca]: http://buckler.repl.ca/
[buckler issues]: https://github.com/badges/buckler/issues

[img.shields.io-old]: https://github.com/badges/img.shields.io-old/issues



