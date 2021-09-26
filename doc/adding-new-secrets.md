# Adding New Server Secrets

The Badge Server supports a [variety of methods for defining configuration values and secrets](./server-secrets.md) and a framework for loading those values during bootstrapping.

New secrets must be correctly registered so that they will be loaded at startup along with the other secrets.

This includes adding the corresponding information for your new secret(s) to the following locations:

- [core/server/server.js](https://github.com/badges/shields/blob/master/core/server/server.js) - Add the new values to the [schemas](https://github.com/badges/shields/blob/master/core/server/server.js#L118-L193)
- [config/custom-environment-variables.yml](https://github.com/badges/shields/blob/master/config/custom-environment-variables.yml)
- [docs/server-secrets.md](https://github.com/badges/shields/blob/master/doc/server-secrets.md)
- (optional) [config/default.yml](https://github.com/badges/shields/blob/master/config/default.yml)
- (optional) any other template config files (e.g. `config/local.template.yml`)

The exact values needed will depend on what type of secret you are adding, but for reference a few commits are included below which added secrets:

- [8a9efb2fc99f97e78ab133c836ab1685803bf4df](https://github.com/badges/shields/commit/8a9efb2fc99f97e78ab133c836ab1685803bf4df)
- [bd6f4ee1465d14a8f188c37823748a21b6a46762](https://github.com/badges/shields/commit/bd6f4ee1465d14a8f188c37823748a21b6a46762)
- [0fd557d7bb623e3852c92cebac586d5f6d6d89d8](https://github.com/badges/shields/commit/0fd557d7bb623e3852c92cebac586d5f6d6d89d8)

Don't hesitate to reach out if you're unsure of the exact values needed for your new secret, or have any other questions. Feel free to post questions on your corresponding Issue/Pull Request, and/or ping us on the `contributing` channel on our Discord server.
