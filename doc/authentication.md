# Badges Requiring Authentication

There are two patterns for how shields.io can interact with APIs that require auth:

1. We can store one token at the service level which allows us to read public data for everyone's projects, or lift a rate limit. If you are looking for information on configuring credentials for a self-hosted instance see https://github.com/badges/shields/blob/master/doc/server-secrets.md
2. If every user needs to provide their own token, that has to be a token which can be passed to us as a query param in the badge URL. This means it must be possible to generate a key or token that can be exposed in a public github README public with no negative consequences. (i.e: that key or token only exposes public metrics).

If every user would need to supply their own token for some particular service and it is only possible to generate a key or token which allows access to sensitive data or allows write access to resources, we can't provide an integration for this service.
