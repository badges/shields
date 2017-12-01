Hosting your own Shields server
===============================

Installation
------------

You will need version 6 of Node.js, which you can install using a
[package manager][].

On Ubuntu / Debian:

```sh
curl -sL https://deb.nodesource.com/setup_6.x | sudo -E bash -; sudo apt-get install -y nodejs
```

```sh
git clone https://github.com/badges/shields.git
cd shields
npm install  # You may need sudo for this.
```

[package manager]: https://nodejs.org/en/download/package-manager/


Build the frontend
------------------

```sh
BASE_URL=https://your-server.example.com npm run build:production
```


Start the server
----------------

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


Heroku
------

Once you have installed the [Heroku Toolbelt][]:

```bash
heroku login
heroku create your-app-name
heroku config:set BUILDPACK_URL=https://github.com/mojodna/heroku-buildpack-multi.git#build-env
cp /path/to/Verdana.ttf .
make deploy
heroku open
```

[Heroku Toolbelt]: https://toolbelt.heroku.com/


Docker
------

You can build and run the server locally using Docker. First build an image:

```console
$ docker build -t shields .
Sending build context to Docker daemon 3.923 MB
…
Successfully built 4471b442c220
```

Optionally, create a file called `shields.env` that contains the needed
configuration. See [shields.example.env][shields.example.env] for an example.

Then run the container:

```console
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


Zeit Now
--------

To deploy using Zeit Now:

```console
npm run build  # Not sure why, but this needs to be run before deploying.
now
```


Server secrets
--------------

You can add your own server secrets in `private/secret.json`.

Because of Github rate limits, you will need to provide a token, or else badges
will stop working once you hit 60 requests per hour, the
[unauthenticated rate limit][github rate limit].

You can [create a personal access token][personal access tokens] through the
Github website. When you create the token, you can choose to give read access
to your repositories. If you do that, your self-hosted Shields installation
will have access to your private repositories.

```
{
  "gh_token": "..."
}
```

When a `gh_token` is specified, it is used in place of the Shields token
rotation logic.


[github rate limit]: https://developer.github.com/v3/#rate-limiting
[personal access tokens]: https://github.com/settings/tokens


Separate frontend hosting
-------------------------

If you want to host the frontend on a separate server, such as cloud storage
or a CDN, you can do that. Just copy the built `index.html` there.

To help out users, you can make the Shields server redirect the server root.
Set the `REDIRECT_URI` environment variable:

```sh
REDIRECT_URI=http://my-custom-shields.s3.amazonaws.com/
```

If you want to use server suggestions, you should also set `ALLOWED_ORIGIN`:

```sh
ALLOWED_ORIGIN=http://my-custom-shields.s3.amazonaws.com,https://my-custom-shields.s3.amazonaws.com
```

This should be a comma-separated list of allowed origin headers. They should
not have paths or trailing slashes.
