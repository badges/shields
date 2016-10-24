# GitHub badges in SVG format

[![npm version](http://img.shields.io/npm/v/gh-badges.svg)](https://npmjs.org/package/gh-badges)

![coverage](https://rawgithub.com/badges/shields/master/coverage.svg)

[![build status](http://img.shields.io/travis/badges/gh-badges.svg)](https://travis-ci.org/badges/gh-badges)

Make your own badges [here][badges]! (Quick guide: `https://img.shields.io/badge/left-right-f39f37.svg`.)

[badges]: <http://shields.io/#your-badge>

# Install the API

```bash
npm install gh-badges
```

```js
var badge = require('gh-badges');
// Optional step, to have accurate text width computation.
badge.loadFont('/path/to/Verdana.ttf', function(err) {
  badge({ text: ["build", "passed"], colorscheme: "green", template: "flat" },
    function(svg, err) {
      // svg is a String of your badge.
    });
});
```

# Use the CLI

```bash
npm install -g gh-badges
badge build passed :green .png > mybadge.png
# Stored a PNG version of your badge on disk.
```

# Start the Server
To run the server you will need the following executables on your Path:
- [PhantomJS](http://www.phantomjs.org/)

On an OS X machine, [Homebrew](brew.sh) is a good package manager that will
allow you to install that.

On Ubuntu / Debian: `sudo apt-get install phantomjs`.

```bash
git clone https://github.com/badges/shields.git
cd shields
npm install  # You may need sudo for this.
sudo node server
```

The server uses port 80 by default, which requires `sudo` permissions.
There are two ways to provide an alternate port:

```bash
PORT=8080 node server
node server 8080
```

The root gets redirected to <http://shields.io>.
For testing purposes, you can go to `http://localhost/try.html`.
You should modify that file. The "real" root, `http://localhost/index.html`,
gets generated from the `try.html` file.

# Format

The format is the following:

```js
{
  /* Textual information shown, in order. */
  "text": [ "build", "passed" ],
  "format": "svg",  // Also supports "json".
  "colorscheme": "green",
  /* … Or… */
  "colorA": "#555",
  "colorB": "#4c1",
  /* See template/ for a list of available templates.
     Each offers a different visual design. */
  "template": "flat"
}
```

# Defaults

If you want to add a colorscheme, head to `colorscheme.json`. Each scheme has a
name and a [CSS/SVG color][] for the color used in the first box (for the first
piece of text, field `colorA`) and for the one used in the second box (field
`colorB`).

[CSS/SVG color]: http://www.w3.org/TR/SVG/types.html#DataTypeColor

```js
"green": {
  "colorB": "#4c1"
}
```

Both `colorA` and `colorB` have default values. Usually, the first box uses the
same dark grey, so you can rely on that default value by not providing a
`"colorA"` field (such as above).

You can also use the `"colorA"` and `"colorB"` fields directly in the badges if
you don't want to make a color scheme for it. In that case, remove the
`"colorscheme"` field altogether.

# Making your Heroku badge server

Once you have installed the [Heroku Toolbelt][]:

[Heroku Toolbelt]: https://toolbelt.heroku.com/

```bash
heroku login
heroku create your-app-name
heroku config:set BUILDPACK_URL=https://github.com/mojodna/heroku-buildpack-multi.git#build-env
cp /path/to/Verdana.ttf .
make deploy
heroku open
```

# Docker

You can build and run the server locally using Docker. First build an image:

```console
$ docker build -t shields ./
Sending build context to Docker daemon 3.923 MB
Step 0 : FROM node:6.4.0-onbuild
…
Removing intermediate container c4678889953f
Successfully built 4471b442c220
```

Then run the container:

```console
$ docker run --rm -p 8080:80 -v "$(pwd)/secret.json":/usr/src/app/secret.json --name shields shields

> gh-badges@1.1.2 start /usr/src/app
> node server.js

http://[::1]:80/try.html
```

Assuming Docker is running locally, you should be able to get to the application at http://localhost:8080/try.html. If you run Docker in a virtual machine (such as boot2docker or Docker Machine) then you will need to replace `localhost` with the actual IP address of that virtual machine.

# Main Server Sysadmin

- DNS round-robin between https://vps197850.ovh.net/try.html and https://vps244529.ovh.net/try.html.
- Self-signed TLS certificates, but `img.shields.io` is behind CloudFlare, which provides signed certificates.
- Using node v0.12.7 because later versions, combined with node-canvas, give inaccurate badge measurements.
- Using forever (the node monitor) to automatically restart the server when it crashes.

See https://github.com/badges/ServerScript for helper admin scripts.

# Links

See <https://github.com/h5bp/lazyweb-requests/issues/150> for a story of the
project's inception.

This is also available as a gem `badgerbadgerbadger`, [code here][gem].

[gem]: https://github.com/badges/badgerbadgerbadger

# License

All work here is licensed CC0.
