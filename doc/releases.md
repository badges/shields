# Releases

Shields is a community project that is stewarded by a handful of core maintainers who contribute on a volunteer basis. We do our best to maintain the availability and reliability of the service, and enhance and improve the project overall. However, if you've spotted something wrong or would like to see a specific feature implemented, please consider helping us resolve it by submitting a pull request. All community contributions, even documentation improvements, are welcome!

https://github.com/badges/shields is a monorepo and hosts the Shields frontend and server code as well as the [badge-maker][npm package] NPM library (and the [badge design specification](https://github.com/badges/shields/tree/master/spec)). The packaging and release processes for these items are described in the respective sections below.

## badge-maker package

We follow [Semantic Versioning](https://semver.org/) for the badge-maker package, and publish git Tags using the form `X.Y.Z`, and all such tags of this form are badge-maker releases (e.g. [3.3.0](https://github.com/badges/shields/releases/tag/3.3.0))

The [badge-maker][npm package] is also published to the npm.js registry.

Releases of badge-maker are done as and when needed, and not on any predetermined interval.

## Shields.io service

The [Shields.io Service][shields.io] consists of the frontend [https://shields.io][shields.io] website which allows users to browse and discover available badges, as well as the badge server backend that serves up requested badges (e.g. https://img.shields.io/badge/badges-rock-blue).

This is the core, free, anonymous service available for anyone to use and which serves up hundreds of millions of badges every month!

We do not have a fixed schedule for deploying updates to the Shields.io production environment, but we typically deploy the latest version at least once per week.

We do not have any guaranteed SLA for the Shields.io service, but we do have monitoring and observability capabilities in place and our [Operations team](https://github.com/badges/shields#project-leaders) will review and address any availability, performance, etc. issues on a best-effort basis.

More information about the production environment can be found [here][production hosting]

## Shields server

Some users may wish to host their own instance of Shields so we also make it possible for users to do so. This is particularly useful if you want to serve badges for resources that require authentication or are not exposed to the internet (e.g: inside a corporate network). A variety of options are available either by installing from source or using a docker image.

### Important information

This Shields server is the exact same codebase that powers the main Shields.io service; we do not have a separate self-hosted version of Shields. This means that the server codebase is geared towards the development, maintenance, and operation of the Shields.io service so there are a few things to note:

- We often have to reject or de-prioritize feature requests that are only applicable for self-hosting and/or which may be problematic for the core Shields.io offering (e.g. requiring authentication on the badge server)
- We do not accept new badges that cannot be utilized with Shields.io (e.g. those that would always require user-specific authorization)
- We do not do any additional testing nor validation of self-hosted instances (e.g. we test Shields.io with Jira Cloud badges, but we don't test a self-hosted Shields server against a self-hosted Jira server instance with auth)
- We're happy to try to offer some tips and guidance to self-hosters when and where we can, but we don't have the ability to troubleshoot/debug/support/etc. self-hosted Shields servers
  - Note that Paul, a core team member, offers some paid support options for those interested in self-hosting support. Contact him at ![](https://img.shields.io/badge/paul-%40m6ize.com-blue) for more information.

We are happy to document and collate any self-hosting patterns/approaches that others have found to be helpful to be able to share with the broader community. If you have any self-hosting material you'd like to share, please feel free to get in contact with us (or even open a PR) and we'll work with you to get that incorporated for the benefit of other self-hosters!

### Server Releases

We try to make it as easy as possible for users to self-host a Shields server so we publish a few releases of the server. Please be sure to refer to the [self hosting guide][self hosting] for a detailed walk through on how to spin up a server.

- The server uses [Calendar Versioning](https://calver.org/). Tags of the form `server-YYYY-MM-DD` are server releases (these are the tags that are relevant to self-hosting users, e.g. [server-2021-02-01](https://github.com/badges/shields/releases/tag/server-2021-02-01)).
- As well as [tags on GitHub](https://github.com/badges/shields/tags), server releases are also pushed to [DockerHub](https://registry.hub.docker.com/r/shieldsio/shields/tags). See the self-hosting section on [Docker](https://github.com/badges/shields/blob/master/doc/self-hosting.md#Docker) for more details.
- We publish release notes for server releases in the [CHANGELOG](https://github.com/badges/shields/blob/master/CHANGELOG.md). There may occasionally be non-backwards compatible changes to be aware of.
- We will normally put out one release per month. If there is a security patch or major bugfix affecting self-hosting users, we may put out an out-of-sequence release.
- Releases are just a snapshot in time. We advise always tracking the latest release to ensure you are up-to-date with the latest bug fixes and security updates. There are no 'patch' releases - we don't backport fixes to old releases. Tagged versions just provide a convenient way to apply upgrades in a controlled way or roll back to an older version if necessary and communicate about versions.
- You can stay on the bleeding edge by tracking the `master` branch for source installs or the `next` tag on DockerHub.

[shields.io]: https://shields.io
[npm package]: https://www.npmjs.com/package/badge-maker
[production hosting]: https://github.com/badges/shields/blob/master/doc/production-hosting.md
[self hosting]: https://github.com/badges/shields/blob/master/doc/self-hosting.md
