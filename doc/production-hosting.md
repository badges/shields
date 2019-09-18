# Production hosting

[![operations issues](https://img.shields.io/github/issues/badges/shields/operations.svg?label=open%20operations%20issues)][operations issues]

[#ops chat room][ops discord]

[operations issues]: https://github.com/badges/shields/issues?q=is%3Aissue+is%3Aopen+label%3Aoperations
[ops discord]: https://discordapp.com/channels/308323056592486420/480747695879749633

| Component                     | Subcomponent                    | People with access                                                                         |
| ----------------------------- | ------------------------------- | ------------------------------------------------------------------------------------------ |
| Badge servers                 | Account owner                   | @espadrine                                                                                 |
| Badge servers                 | ssh, logs                       | @espadrine                                                                                 |
| Badge servers                 | Deployment                      | @espadrine, @paulmelnikow                                                                  |
| Badge servers                 | Admin endpoints                 | @espadrine, @paulmelnikow                                                                  |
| Compose.io Redis              | Account owner                   | @paulmelnikow                                                                              |
| Compose.io Redis              | Account access                  | @paulmelnikow                                                                              |
| Compose.io Redis              | Database connection credentials | @espadrine, @paulmelnikow                                                                  |
| Zeit Now                      | Team owner                      | @paulmelnikow                                                                              |
| Zeit Now                      | Team members                    | @paulmelnikow, @chris48s, @calebcartwright, @platan                                        |
| Raster server                 | Full access as team members     | @paulmelnikow, @chris48s, @calebcartwright, @platan                                        |
| shields-server.com redirector | Full access as team members     | @paulmelnikow, @chris48s, @calebcartwright, @platan                                        |
| Cloudflare                    | Account owner                   | @espadrine                                                                                 |
| Cloudflare                    | Admin access                    | @espadrine, @paulmelnikow                                                                  |
| GitHub                        | OAuth app                       | @espadrine ([could be transferred to the badges org][oauth transfer])                      |
| Twitch                        | OAuth app                       | @PyvesB                                                                                    |
| OpenStreetMap (for Wheelmap)  | Account owner                   | @paulmelnikow                                                                              |
| DNS                           | Account owner                   | @olivierlacan                                                                              |
| DNS                           | Read-only account access        | @espadrine, @paulmelnikow, @chris48s                                                       |
| Sentry                        | Error reports                   | @espadrine, @paulmelnikow                                                                  |
| Frontend                      | Deployment                      | Technically anyone with push access but in practice must be deployed with the badge server |
| Metrics server                | Owner                           | @platan                                                                                    |
| UptimeRobot                   | Account owner                   | @paulmelnikow                                                                              |
| More metrics                  | Owner                           | @RedSparr0w                                                                                |
| Netlify (documentation site)  | Owner                           | @chris48s                                                                                  |

There are [too many bottlenecks][issue 2577]!

## Badge servers

There are three public badge servers on OVH VPS’s.

| Cname                       | Hostname             | Type | IP             | Location           |
| --------------------------- | -------------------- | ---- | -------------- | ------------------ |
| [s0.servers.shields.io][s0] | vps71670.vps.ovh.ca  | VPS  | 192.99.59.72   | Quebec, Canada     |
| [s1.servers.shields.io][s1] | vps244529.ovh.net    | VPS  | 51.254.114.150 | Gravelines, France |
| [s2.servers.shields.io][s2] | vps117870.vps.ovh.ca | VPS  | 149.56.96.133  | Quebec, Canada     |

- These are single-core virtual hosts with 2 GB RAM [VPS SSD 1][].
- The Node version (v9.4.0 at time of writing) and dependency versions on the
  servers can be inspected in Sentry, but only when an error occurs.
- The servers use self-signed SSL certificates. ([#1460][issue 1460])
- After accepting the certificate, you can debug an individual server using
  the links above.
- The scripts that start the server live in the [ServerScript][] repo. However
  updates must be pulled manually. They are not updated as part of the deploy process.
- The server runs SSH.
- Deploys are made using a git post-receive hook.
- The server uses systemd to automatically restart the server when it crashes.
- Provisioning additional servers is a manual process which is yet to been
  documented.
- The public servers _do not_ use docker. The `Dockerfile` is included for
  self-hosting (including on a Docker-capable PaaS).

[s0]: https://s0.servers.shields.io/index.html
[s1]: https://s1.servers.shields.io/index.html
[s2]: https://s2.servers.shields.io/index.html
[vps ssd 1]: https://www.ovh.com/world/vps/vps-ssd.xml
[issue 1460]: https://github.com/badges/shields/issues/1460
[serverscript]: https://github.com/badges/ServerScript

## Attached state

Shields has mercifully little persistent state:

1.  The GitHub tokens we collect are saved on each server in a cloud Redis database.
    They can also be fetched from the [GitHub auth admin endpoint][] for debugging.
2.  The server keeps a few caches in memory. These are neither persisted nor
    inspectable.
    - The [request cache][]
    - The [regular-update cache][]

[github auth admin endpoint]: https://github.com/badges/shields/blob/master/services/github/auth/admin.js
[request cache]: https://github.com/badges/shields/blob/master/core/base-service/legacy-request-handler.js#L29-L30
[regular-update cache]: https://github.com/badges/shields/blob/master/core/legacy/regular-update.js
[oauth transfer]: https://developer.github.com/apps/managing-oauth-apps/transferring-ownership-of-an-oauth-app/

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

The project ships with `dotenv`, however there is no `.env` in production.

## Badge CDN

Sitting in front of the three servers is a Cloudflare Free account which
provides several services:

- Global CDN, caching, and SSL gateway for `img.shields.io`
- Analytics through the Cloudflare dashboard
- DNS hosting for `shields.io`

Cloudflare is configured to respect the servers' cache headers.

## Frontend

The frontend is served by [GitHub Pages][] via the [gh-pages branch][gh-pages]. SSL is enforced.

`shields.io` resolves to the GitHub Pages hosts. It is not proxied through
Cloudflare.

Technically any maintainer can push to `gh-pages`, but in practice the frontend must be deployed
with the badge server via the deployment process described below.

[github pages]: https://pages.github.com/
[gh-pages]: https://github.com/badges/shields/tree/gh-pages

## Raster server

The raster server `raster.shields.io` (a.k.a. the rasterizing proxy) is
hosted on [Zeit Now][]. It's managed in the
[svg-to-image-proxy repo][svg-to-image-proxy].

[zeit now]: https://zeit.co/now
[svg-to-image-proxy]: https://github.com/badges/svg-to-image-proxy

## Deployment

To set things up for deployment:

1.  Get your SSH key added to the server.
2.  Clone a fresh copy of the repository, dedicated for deployment.
    (Not required, but recommended; and lets you use `npm ci` below.)
3.  Add remotes:

```sh
git remote add s0 root@s0.servers.shields.io:/home/m/shields.git
git remote add s1 root@s1.servers.shields.io:/home/m/shields.git
git remote add s2 root@s2.servers.shields.io:/home/m/shields.git
```

`origin` should point to GitHub as usual.

4.  Since the deploy uses `git worktree`, make sure you have git 2.5 or later.

To deploy:

1.  Use `git fetch` to obtain a current copy of
    `local-shields-io-production.yml` from the server (or obtain the current
    version of that file some other way). Save it in `config/`.
2.  Check out the commit you want to deploy.
3.  Run `npm ci`. **This is super important for the frontend build!**
4.  Run `make deploy-s0` to make a canary deploy.
5.  Check the canary deploy:
    - [Visit the server][s0]. Don't forget that most of the preview badges
      are static!
    - Look for errors in [Sentry][].
    - Keep an eye on the [status page][status].
6.  After a little while (usually 10–60 minutes), finish the deploy:
    `make push-s1 push-s2 deploy-gh-pages`.

To roll back, check out the commit you want to roll back to and repeat those
steps.

To see which commit is deployed to a server run `git ls-remote` and then
`git log` on the `HEAD` ref. There will be two deploy commits preceded by the
commit which was deployed.

Be careful not to push the deploy commits to GitHub.

`make deploy-s0` does the following:

1.  Creates a working tree in `/tmp`.
2.  In that tree, runs `features` and `examples` to generate data files
    needed for the frontend.
3.  Builds and checks in the built frontend.
4.  Checks in `local-shields-io-production.yml`.
5.  Pushes to s0, which updates dependencies and then restarts itself.

`make push-s1 push-s2 deploy-gh-pages` does the following:

1.  Pushes the same working tree to s1 and s2.
2.  Creates a new working tree for the frontend.
3.  Adds a commit cleaning out the index.
4.  Adds another commit with the build frontend.
5.  Pushes to `gh-pages`.

## DNS

DNS is registered with [DNSimple][].

[dnsimple]: https://dnsimple.com/

## Logs

Logs are available on the individual servers via SSH.

## Error reporting

[Error reporting][sentry] is one of the most useful tools we have for monitoring
the server. It's generously donated by [Sentry][sentry home]. We bundle
[`raven`][raven] into the application, and the Sentry DSN is configured via
`local-shields-io-production.yml` (see [documentation][sentry configuration]).

[sentry]: https://sentry.io/shields/
[raven]: https://www.npmjs.com/package/raven
[sentry home]: https://sentry.io/shields/
[sentry configuration]: https://github.com/badges/shields/blob/master/doc/self-hosting.md#sentry

## Monitoring

Overall server performance and requests by service are monitored using
[Prometheus and Grafana][metrics].

Request performance is monitored in two places:

- [Status][] (using [UptimeRobot][])
- [Server metrics][] using Prometheus and Grafana
- [@RedSparr0w's monitor][monitor] which posts [notifications][] to a private
  [#monitor chat room][monitor discord]

[metrics]: https://metrics.shields.io/
[status]: https://status.shields.io/
[server metrics]: https://metrics.shields.io/
[uptimerobot]: https://uptimerobot.com/
[monitor]: https://shields.redsparr0w.com/1568/
[notifications]: http://shields.redsparr0w.com/discord_notification
[monitor discord]: https://discordapp.com/channels/308323056592486420/470700909182320646

## Known limitations

1.  The only way to inspect the commit on the server is with `git ls-remote`.
2.  The production deploy installs `devDependencies`. It does not honor
    `package-lock.json`. ([#1988][issue 1988])

[issue 2577]: https://github.com/badges/shields/issues/2577
[issue 1988]: https://github.com/badges/shields/issues/1988
