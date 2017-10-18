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


Build the index
---------------

Build the "real" index page:

```sh
make website
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

For testing purposes, you can go to `http://localhost/try.html`.


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

http://[::1]:80/try.html
```

Assuming Docker is running locally, you should be able to get to the
application at http://localhost:8080/try.html.

If you run Docker in a virtual machine (such as boot2docker or Docker Machine)
then you will need to replace `localhost` with the IP address of that virtual
machine.

[shields.example.env]: ../shields.example.env
