# Hosting your own Shields server

This document describes how to host your own shields server either from source or using a docker image. See the docs on [releases](https://github.com/badges/shields/blob/master/doc/releases.md#shields-server) for info on how we version the server and how to choose a release.

## Installing from Source

You will need Node 16 or later, which you can install using a
[package manager][].

On Ubuntu / Debian:

```sh
curl -sL https://deb.nodesource.com/setup_16.x | sudo -E bash -; sudo apt-get install -y nodejs
```

```sh
git clone https://github.com/badges/shields.git
cd shields
git checkout $(git tag | grep server | tail -n 1)  # checkout the latest tag
npm ci  # You may need sudo for this.
```

[package manager]: https://nodejs.org/en/download/package-manager/

### Build the frontend

```sh
npm run build
```

### Start the server

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

### Deploying to Heroku

Once you have installed the [Heroku CLI][]

```bash
heroku login
heroku create your-app-name
git push heroku master
heroku open
```

[heroku cli]: https://devcenter.heroku.com/articles/heroku-cli

### Deploying to Zeit Vercel

To deploy using Zeit Vercel:

```console
npm run build  # Not sure why, but this needs to be run before deploying.
vercel
```

## Docker

### DockerHub

We publish images to DockerHub at https://registry.hub.docker.com/r/shieldsio/shields

The `next` tag is the latest build from `master`, or tagged releases are available
https://registry.hub.docker.com/r/shieldsio/shields/tags

```console
$ docker pull shieldsio/shields:next
$ docker run shieldsio/shields:next
```

### Building Docker Image Locally

Alternatively, you can build and run the server locally using Docker. First build an image:

```console
$ docker build -t shields .
Sending build context to Docker daemon 3.923 MB
…
Successfully built 4471b442c220
```

Optionally, alter the default values for configuration by setting them via [environment variables](https://docs.docker.com/engine/reference/commandline/run/#set-environment-variables--e---env---env-file).
See [server-secrets.md](server-secrets.md) and [config/custom-environment-variables.yml](/config/custom-environment-variables.yml) for possible values.
In [config/custom-environment-variables.yml](/config/custom-environment-variables.yml), environment variable names are specified as the quoted, uppercase key values (e.g. `GH_TOKEN`).

Then run the container, and be sure to specify the same mapped port as the one Shields is listening on :

```console
$ docker run --rm -p 8080:8080 --env PORT=8080 --name shields shieldsio/shields:next

Configuration:
...
0916211515 Server is starting up: http://0.0.0.0:8080/
```

Assuming Docker is running locally, you should be able to get to the
application at http://localhost:8080/.

If you run Docker in a virtual machine (such as boot2docker or Docker Machine)
then you will need to replace `localhost` with the IP address of that virtual
machine.

## Raster server

If you want to host PNG badges, you can also self-host a [raster server][]
which points to your badge server. It's a docker container. We host it on
Heroku but should be possible to host on a wide variety of platforms.

- In your raster instance, set `BASE_URL` to your Shields instance, e.g.
  `https://shields.example.co`.
- Optionally, in your Shields, instance, configure `RASTER_URL` to the base
  URL, e.g. `https://raster.example.co`. This will send 301 redirects
  for the legacy raster URLs instead of 404's.

If anyone has set this up, more documentation on how to do this would be
welcome!

[raster server]: https://github.com/badges/squint

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

Or via config as you would do with [server secrets](server-secrets.md):

```yml
private:
  sentry_dsn: ...
```

```sh
sudo node server
```

## Prometheus

Shields uses [prom-client](https://github.com/siimon/prom-client) to provide [default metrics](https://prometheus.io/docs/instrumenting/writing_clientlibs/#standard-and-runtime-collectors). These metrics are disabled by default.
You can enable them by `METRICS_PROMETHEUS_ENABLED` and `METRICS_PROMETHEUS_ENDPOINT_ENABLED` environment variables.

```bash
METRICS_PROMETHEUS_ENABLED=true METRICS_PROMETHEUS_ENDPOINT_ENABLED=true npm start
```

Metrics are available at `/metrics` resource.

## Cloudflare

Shields.io uses Cloudflare as a downstream CDN. If your installation does the same,
you can configure your server to only accept requests coming from Cloudflare's IPs.
Set `public.requireCloudflare: true`.
