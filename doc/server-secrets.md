# Server Secrets

It is possible to provide a token or credentials for a number of external
services. These may be used to lift a rate limit or provide access to
private resources from a self-hosted instance.

Secrets can be set in  `private/secret.json`. For example:

```
{
  "gh_token": "..."
}
```

## Bintray

* `bintray_user`
* `bintray_apikey`

The bintray API [requires authentication](https://bintray.com/docs/api/#_authentication)
Create an account and obtain a token from the user profile page.


## GitHub

* `gh_token`

Because of Github rate limits, you will need to provide a token, or else badges
will stop working once you hit 60 requests per hour, the
[unauthenticated rate limit][github rate limit].

You can [create a personal access token][personal access tokens] through the
Github website. When you create the token, you can choose to give read access
to your repositories. If you do that, your self-hosted Shields installation
will have access to your private repositories.

When a `gh_token` is specified, it is used in place of the Shields token
rotation logic.

[github rate limit]: https://developer.github.com/v3/#rate-limiting
[personal access tokens]: https://github.com/settings/tokens

* `gh_client_id`
* `gh_client_secret`

These settings are used by shields.io for GitHub OAuth app authorization
but will not be necessary for most self-hosted installations. See
[production-hosting.md](./production-hosting.md).

## Jenkins CI

* `jenkins_user`
* `jenkins_pass`

Provide a username and password to give your self-hosted Shields installation
access to a private Jenkins CI instance.

## JIRA

* `jira_user`
* `jira_pass`

Provide a username and password to give your self-hosted Shields installation
access to a private JIRA instance.

For legacy reasons `jira_username` and `jira_password` are also supported
but may be removed in future.

## Nexus

* `nexus_user`
* `nexus_pass`

Provide a username and password to give your self-hosted Shields installation
access to your private nexus repositories.

## NPM

* `npm_token`

[Generate an npm token][npm token] to give your self-hosted Shields
installation access to private npm packages

[npm token]: https://docs.npmjs.com/getting-started/working_with_tokens

## Sentry

* `sentry_dsn`

A [Sentry DSN](https://docs.sentry.io/error-reporting/quickstart/?platform=javascript#configure-the-dsn)
may be used to send error reports from your installation to
[Sentry.io](http://sentry.io/). For more info, see the
[self hosting docs](https://github.com/badges/shields/blob/master/doc/self-hosting.md#sentry).

## SymfonyInsight (formerly Sensiolabs)

* `sl_insight_userUuid`
* `sl_insight_apiToken`

The SymfonyInsight API requires authentication. To obtain a token,
Create an account, sign in and obtain a uuid and token from your
[account page](https://insight.sensiolabs.com/account).

## SonarQube

* `sonarqube_token`

[Generate a token](https://docs.sonarqube.org/latest/user-guide/user-token/)
to give your self-hosted Shields installation access to a
private SonarQube instance or private project on a public instance.

## Wheelmap

* `wheelmap_token`

The wheelmap API requires authentication. To obtain a token,
Create an account, [sign in][wheelmap token] and use the _Authentication Token_
displayed on your profile page.

[wheelmap token]: http://classic.wheelmap.org/en/users/sign_in
