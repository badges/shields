# Production hosting

Production hosting is managed by the Shields ops team:

- [calebcartwright](https://github.com/calebcartwright)
- [chris48s](https://github.com/chris48s)
- [paulmelnikow](https://github.com/paulmelnikow)
- [PyvesB](https://github.com/PyvesB)

[![operations issues](https://img.shields.io/github/issues/badges/shields/operations.svg?label=open%20operations%20issues)][operations issues]

[#ops chat room][ops discord]

[operations issues]: https://github.com/badges/shields/issues?q=is%3Aissue+is%3Aopen+label%3Aoperations
[ops discord]: https://discordapp.com/channels/308323056592486420/480747695879749633

| Component                     | Subcomponent                    | People with access                                              |
| ----------------------------- | ------------------------------- | --------------------------------------------------------------- |
| shields-production-us         | Account owner                   | @calebcartwright, @paulmelnikow                                 |
| shields-production-us         | Full access                     | @calebcartwright, @chris48s, @paulmelnikow, @pyvesb             |
| shields-production-us         | Access management               | @calebcartwright, @chris48s, @paulmelnikow, @pyvesb             |
| Compose.io Redis              | Account owner                   | @paulmelnikow                                                   |
| Compose.io Redis              | Account access                  | @paulmelnikow                                                   |
| Compose.io Redis              | Database connection credentials | @calebcartwright, @chris48s, @paulmelnikow, @pyvesb             |
| Raster server                 | Full access as team members     | @paulmelnikow, @chris48s, @calebcartwright, @platan             |
| shields-server.com redirector | Full access as team members     | @paulmelnikow, @chris48s, @calebcartwright, @platan             |
| Cloudflare (CDN)              | Account owner                   | @espadrine                                                      |
| Cloudflare (CDN)              | Access management               | @espadrine                                                      |
| Cloudflare (CDN)              | Admin access                    | @calebcartwright, @chris48s, @espadrine, @paulmelnikow, @PyvesB |
| Twitch                        | OAuth app                       | @PyvesB                                                         |
| Discord                       | OAuth app                       | @PyvesB                                                         |
| YouTube                       | Account owner                   | @PyvesB                                                         |
| GitLab                        | Account owner                   | @calebcartwright                                                |
| GitLab                        | Account access                  | @calebcartwright, @chris48s, @paulmelnikow, @PyvesB             |
| OpenStreetMap (for Wheelmap)  | Account owner                   | @paulmelnikow                                                   |
| DNS                           | Account owner                   | @olivierlacan                                                   |
| DNS                           | Read-only account access        | @espadrine, @paulmelnikow, @chris48s                            |
| Sentry                        | Error reports                   | @espadrine, @paulmelnikow                                       |
| Metrics server                | Owner                           | @platan                                                         |
| UptimeRobot                   | Account owner                   | @paulmelnikow                                                   |
| More metrics                  | Owner                           | @RedSparr0w                                                     |

## Attached state

Shields has mercifully little persistent state:

1. The GitHub tokens we collect are saved on each server in a cloud Redis
   database. They can also be fetched from the [GitHub auth admin endpoint][]
   for debugging.
2. The server keeps the [resource cache][] in memory. It is neither
   persisted nor inspectable.

[github auth admin endpoint]: https://github.com/badges/shields/blob/master/services/github/auth/admin.js
[resource cache]: https://github.com/badges/shields/blob/master/core/base-service/resource-cache.js

## Configuration

To bootstrap the configuration process,
[the script that starts the server][start-shields.sh] sets a single
environment variable:

```
NODE_CONFIG_ENV=shields-io-production
```

With that variable set, the server ([using `config`][config]) reads these
files:

- [`local-shields-io-production.yml`][local-shields-io-production.yml].
  This file contains secrets which are checked in with a deploy commit.
- [`shields-io-production.yml`][shields-io-production.yml]. This file
  contains non-secrets which are checked in to the main repo.
- [`default.yml`][default.yml]. This file contains defaults.

[start-shields.sh]: https://github.com/badges/ServerScript/blob/master/start-shields.sh#L7
[config]: https://github.com/lorenwest/node-config/wiki/Configuration-Files
[local-shields-io-production.yml]: ../config/local-shields-io-production.template.yml
[shields-io-production.yml]: ../config/shields-io-production.yml
[default.yml]: ../config/default.yml

## Badge CDN

Sitting in front of the three servers is a Cloudflare Free account which
provides several services:

- Global CDN, caching, and SSL gateway for `img.shields.io` and `shields.io`
- Analytics through the Cloudflare dashboard
- DNS resolution for `shields.io` (and subdomains)

Cloudflare is configured to respect the servers' cache headers.

## Raster server

The raster server `raster.shields.io` (a.k.a. the rasterizing proxy) is
hosted on Heroku. It's managed in the
[squint](https://github.com/badges/squint/) repo.

### Heroku Deployment

Both the badge server and frontend are served from Heroku.

After merging a commit to master, heroku should create a staging deploy. Check this has deployed correctly in the `shields-staging` pipeline and review https://shields-staging.herokuapp.com/

If we're happy with it, "promote to production". This will deploy what's on staging to the `shields-production-eu` and `shields-production-us` pieplines.

## DNS

DNS is registered with [DNSimple][].

[dnsimple]: https://dnsimple.com/

## Logs

Logs can be retrieved [from heroku](https://devcenter.heroku.com/articles/logging#log-retrieval).

## Error reporting

[Error reporting][sentry] is one of the most useful tools we have for monitoring
the server. It's generously donated by [Sentry][sentry home]. We bundle
[`raven`][raven] into the application, and the Sentry DSN is configured via
`local-shields-io-production.yml` (see [documentation][sentry configuration]).

[sentry]: https://sentry.io/shields/
[raven]: https://www.npmjs.com/package/raven
[sentry home]: https://sentry.io/shields/
[sentry configuration]: https://github.com/badges/shields/blob/master/doc/self-hosting.md#sentry

## URLs

The canonical and only recommended domain for badge URLs is `img.shields.io`. Currently it is possible to request badges on both `img.shields.io` and `shields.io` i.e: https://img.shields.io/badge/build-passing-brightgreen and https://shields.io/badge/build-passing-brightgreen will both work. However:

- We never show or generate the `img.`-less URL format on https://shields.io/
- We make no guarantees about the `img.`-less URL format. At some future point we may remove the ability to serve badges on `shields.io` (without `img.`) without any warning. `img.shields.io` should always be used for badge urls.

## Monitoring

Overall server performance and requests by service are monitored using
[Prometheus and Grafana][metrics].

Request performance is monitored in two places:

- [Status][] (using [UptimeRobot][])
- [Server metrics][] using Prometheus and Grafana
- [@RedSparr0w's monitor][monitor] which posts [notifications][] to a private
  [#monitor chat room][monitor discord]

[metrics]: https://metrics.shields.io/
[status]: https://stats.uptimerobot.com/PjXogHB5p
[server metrics]: https://metrics.shields.io/
[uptimerobot]: https://uptimerobot.com/
[monitor]: https://shields.redsparr0w.com/1568/
[notifications]: http://shields.redsparr0w.com/discord_notification
[monitor discord]: https://discordapp.com/channels/308323056592486420/470700909182320646
