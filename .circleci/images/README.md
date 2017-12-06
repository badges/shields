Updating CircleCI Docker images
===============================

Prerequisites
-------------

1. Ask @paulmelnikow to be added to the shieldsio organization on DockerHub.
2. Install Docker. I tested [these instructions on OS X][Install Docker on OS X].
3. Run `eval $(docker-machine env default)`
   (In fish: `eval (docker-machine env default)`)

[Install Docker on OS X]: https://pilsniak.com/how-to-install-docker-on-mac-os-using-brew/

Updating the images
-------------------

Note: Increment the patch version on the tag in each change.

```console
docker build -t shieldsio/shields-node-8:<version> .circleci/images/node-8
docker login
docker push shieldsio/shields-node-8:<version>
```

```console
docker build -t shieldsio/shields-node-6:<version> .circleci/images/node-6
docker login
docker push shieldsio/shields-node-6:<version>
```

After pushing the images, bump the tag in `.circleci/config.yml`.

Reference
---------

For more details see the [CircleCI custom image docs][].

[CircleCI custom image docs]: https://circleci.com/docs/2.0/custom-images/
