# Hosting your own Shields server

## Installation

You will need Node 8 or later, which you can install using a
[package manager][].

On Ubuntu / Debian:

```sh
curl -sL https://deb.nodesource.com/setup_8.x | sudo -E bash -; sudo apt-get install -y nodejs
```

```sh
git clone https://github.com/badges/shields.git
cd shields
npm ci  # You may need sudo for this.
```

[package manager]: https://nodejs.org/en/download/package-manager/

## Build the frontend

```sh
npm run build
```

## Start the server

```sh
sudo node server
```

The server uses port 80 by default, which requires `sudo` permissions.

There are two ways to provide an alternate port:

```sh
PORT=8080 node server
node server 8080
```

The root gets redirected to https://shields.io.

For testing purposes, you can go to `http://localhost/`.

## Heroku

Once you have installed the [Heroku CLI][]

```bash
heroku login
heroku create your-app-name
git push heroku master
heroku open
```

[heroku cli]: https://devcenter.heroku.com/articles/heroku-cli

## Docker

You can build and run the server locally using Docker. First build an image:

```console
$ docker build -t shields .
Sending build context to Docker daemon 3.923 MB
…
Successfully built 4471b442c220
```

Optionally, create a file called `shields.env` that contains the needed
configuration. See [server-secrets.md](server-secrets.md) and [config/custom-environment-variables.yml](/config/custom-environment-variables.yml) for examples.

Then run the container:

```console
$ docker run --rm -p 8080:80 --name shields shields
# or if you have shields.env file, run the following instead
$ docker run --rm -p 8080:80 --env-file shields.env --name shields shields

> gh-badges@1.1.2 start /usr/src/app
> node server.js

http://[::1]/
```

Assuming Docker is running locally, you should be able to get to the
application at http://localhost:8080/.

If you run Docker in a virtual machine (such as boot2docker or Docker Machine)
then you will need to replace `localhost` with the IP address of that virtual
machine.

[shields.example.env]: ../shields.example.env

## Raster server

If you want to host PNG badges, you can also self-host a [raster server][]
which points to your badge server. It's designed as a web function which is
tested on Zeit Now, though you may be able to run it on AWS Lambda. It's
built on the [micro][] framework, and comes with a `start` script that allows
it to run as a standalone Node service.

- In your raster instance, set `BASE_URL` to your Shields instance, e.g.
  `https://shields.example.co`.
- Optionally, in your Shields, instance, configure `RASTER_URL` to the base
  URL, e.g. `https://raster.example.co`. This will send 301 redirects
  for the legacy raster URLs instead of 404's.

If anyone has set this up, more documentation on how to do this would be
welcome! It would also be nice to ship a Docker image that includes a
preconfigured raster server.

[raster server]: https://github.com/badges/svg-to-image-proxy
[micro]: https://github.com/zeit/micro

## Zeit Now

To deploy using Zeit Now:

```console
npm run build  # Not sure why, but this needs to be run before deploying.
now
```

## Persistence

To enable Redis-backed GitHub token persistence, point `REDIS_URL` to your
Redis installation.

## Server secrets

You can add your own server secrets in environment variables or `config/local.yml`.

These are documented in [server-secrets.md](./server-secrets.md)

## Separate frontend hosting

If you want to host the frontend on a separate server, such as cloud storage
or a CDN, you can do that.

First, build the frontend, pointing `GATSBY_BASE_URL` to your server.

```sh
GATSBY_BASE_URL=https://your-server.example.com npm run build
```

Then copy the contents of the `build/` folder to your static hosting / CDN.

There are also a couple settings you should configure on the server.

If you want to use server suggestions, you should also set `ALLOWED_ORIGIN`:

```sh
ALLOWED_ORIGIN=http://my-custom-shields.s3.amazonaws.com,https://my-custom-shields.s3.amazonaws.com
```

This should be a comma-separated list of allowed origin headers. They should
not have paths or trailing slashes.

To help out users, you can make the Shields server redirect the server root.
Set the `REDIRECT_URI` environment variable:

```sh
REDIRECT_URI=http://my-custom-shields.s3.amazonaws.com/
```

## Sentry

In order to enable integration with [Sentry](https://sentry.io), you need your own [Sentry DSN](https://docs.sentry.io/quickstart/#configure-the-dsn). It’s an URL in format `https://{PUBLIC_KEY}:{SECRET_KEY}@sentry.io/{PROJECT_ID}`.

### How to obtain the Sentry DSN

1.  [Sign up](https://sentry.io/pricing/) for Sentry
2.  Log in to Sentry
3.  Create a new project for Node.js
4.  You should see [Sentry DSN](https://docs.sentry.io/quickstart/#configure-the-dsn) for your project. Sentry DSN can be found by navigating to \[Project Name] -> Project Settings -> Client Keys (DSN) as well.

Start the server using the Sentry DSN. You can set it:

- by `SENTRY_DSN` environment variable

```
sudo SENTRY_DSN=https://xxx:yyy@sentry.io/zzz node server
```

- or by `sentry_dsn` secret property defined in `private/secret.json`

```
sudo node server
```

### Prometheus

Shields uses [prom-client](https://github.com/siimon/prom-client) to provide [default metrics](https://prometheus.io/docs/instrumenting/writing_clientlibs/#standard-and-runtime-collectors). These metrics are disabled by default.
You can enable them by `METRICS_PROMETHEUS_ENABLED` environment variable.

```bash
METRICS_PROMETHEUS_ENABLED=true npm start
```

Metrics are available at `/metrics` resource.
