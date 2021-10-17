# Adding New Config Values

The Badge Server supports a [variety of methods for defining configuration settings and secrets](./server-secrets.md), and provides a framework for loading those values during bootstrapping.

Any new configuration setting or secret must be correctly registered so that it will be loaded at startup along with the others.

This generally includes adding the corresponding information for your new setting(s)/secret(s) to the following locations:

- [core/server/server.js](https://github.com/badges/shields/blob/master/core/server/server.js) - Add the new values to the [schemas](https://github.com/badges/shields/blob/master/core/server/server.js#L118-L193). Secrets/tokens/etc. should go in the `privateConfigSchema` while non-secret configuration settings should go in the `publicConfigSchema`.
- [config/custom-environment-variables.yml](https://github.com/badges/shields/blob/master/config/custom-environment-variables.yml)
- [docs/server-secrets.md](https://github.com/badges/shields/blob/master/doc/server-secrets.md) (only applicable for secrets)
- [config/default.yml](https://github.com/badges/shields/blob/master/config/default.yml) (optional)
- Any other template config files (e.g. `config/local.template.yml`) (optional)

The exact values needed will depend on what type of secret/setting you are adding, but for reference a few commits are included below which added secrets and or settings:

- (secret) [8a9efb2fc99f97e78ab133c836ab1685803bf4df](https://github.com/badges/shields/commit/8a9efb2fc99f97e78ab133c836ab1685803bf4df)
- (secret) [bd6f4ee1465d14a8f188c37823748a21b6a46762](https://github.com/badges/shields/commit/bd6f4ee1465d14a8f188c37823748a21b6a46762)
- (secret) [0fd557d7bb623e3852c92cebac586d5f6d6d89d8](https://github.com/badges/shields/commit/0fd557d7bb623e3852c92cebac586d5f6d6d89d8)
- (configuration setting) [b1fc4925928c061234e9492f3794c0797467e123](https://github.com/badges/shields/commit/b1fc4925928c061234e9492f3794c0797467e123)

Don't hesitate to reach out if you're unsure of the exact values needed for your new secret/setting, or have any other questions. Feel free to post questions on your corresponding Issue/Pull Request, and/or ping us on the `contributing` channel on our Discord server.
