# Server Secrets

It is possible to provide a token or credentials for a number of external
services. These may be used to lift a rate limit or provide access to
private resources from a self-hosted instance.

There are two ways of setting secrets:

1. Via environment variables. This is a good way to set them in a PaaS
   environment.

```sh
GH_TOKEN=...
```

2. Via checked-in `config/local.yml`:

```yml
private:
  gh_token: '...'
```

For more complex scenarios, configuration files can cascade. See the [node-config documentation][]
for details.

[node-config documentation]: https://github.com/lorenwest/node-config/wiki/Configuration-Files

## Azure DevOps

- `AZURE_DEVOPS_TOKEN` (yml: `azure_devops_token`)

An Azure DevOps Token (PAT) is required for accessing [private Azure DevOps projects][ado project visibility].

[Create a PAT][ado personal access tokens] using an account that has access to your target Azure DevOps projects. Your PAT only needs the following [scopes:][ado token scopes]

- `Build (read)`
- `Release (read)`
- `Test Management (read)`

[ado project visibility]: https://docs.microsoft.com/en-us/azure/devops/organizations/public/about-public-projects?view=vsts
[ado personal access tokens]: https://docs.microsoft.com/en-us/azure/devops/organizations/accounts/use-personal-access-tokens-to-authenticate?view=vsts#create-personal-access-tokens-to-authenticate-access
[ado token scopes]: https://docs.microsoft.com/en-us/azure/devops/integrate/get-started/authentication/oauth?view=vsts#scopes

## Bintray

- `BINTRAY_USER` (yml: `bintray_user`)
- `BINTRAY_API_KEY` (yml: `bintray_apikey`)

The bintray API [requires authentication](https://bintray.com/docs/api/#_authentication)
Create an account and obtain a token from the user profile page.

## Drone

- `DRONE_TOKEN` (yml: `drone_token`)

The self-hosted Drone API [requires authentication](https://0-8-0.docs.drone.io/api-authentication/)
Login to your Drone instance and obtain a token from the user profile page.

## GitHub

- `GH_TOKEN` (yml: `gh_token`)

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

- `GH_CLIENT_ID` (yml: `gh_client_id`)
- `GH_CLIENT_SECRET` (yml: `gh_client_secret`)

These settings are used by shields.io for GitHub OAuth app authorization
but will not be necessary for most self-hosted installations. See
[production-hosting.md](./production-hosting.md).

## Jenkins CI

- `JENKINS_USER` (yml: `jenkins_user`)
- `JENKINS_PASS` (yml: `jenkins_pass`)

Provide a username and password to give your self-hosted Shields installation
access to a private Jenkins CI instance.

## JIRA

- `JIRA_USER` (yml: `jira_user`)
- `JIRA_PASS` (yml: `jira_pass`)

Provide a username and password to give your self-hosted Shields installation
access to a private JIRA instance.

## Nexus

- `NEXUS_USER` (yml: `nexus_user`)
- `NEXUS_PASS` (yml: `nexus_pass`)

Provide a username and password to give your self-hosted Shields installation
access to your private nexus repositories.

## NPM

- `NPM_TOKEN` (yml: `npm_token`)

[Generate an npm token][npm token] to give your self-hosted Shields
installation access to private npm packages

[npm token]: https://docs.npmjs.com/getting-started/working_with_tokens

## Sentry

- `SENTRY_DSN` (yml: `sentry_dsn`)

A [Sentry DSN](https://docs.sentry.io/error-reporting/quickstart/?platform=javascript#configure-the-dsn)
may be used to send error reports from your installation to
[Sentry.io](http://sentry.io/). For more info, see the
[self hosting docs](https://github.com/badges/shields/blob/master/doc/self-hosting.md#sentry).

## SymfonyInsight (formerly Sensiolabs)

- `SL_INSIGHT_USER_UUID` (yml: `sl_insight_userUuid`)
- `SL_INSIGHT_API_TOKEN` (yml: `sl_insight_apiToken`)

The SymfonyInsight API requires authentication. To obtain a token,
Create an account, sign in and obtain a uuid and token from your
[account page](https://insight.sensiolabs.com/account).

## SonarQube

- `SONARQUBE_TOKEN` (yml: `sonarqube_token`)

[Generate a token](https://docs.sonarqube.org/latest/user-guide/user-token/)
to give your self-hosted Shields installation access to a
private SonarQube instance or private project on a public instance.

## Twitch

- `TWITCH_CLIENT_ID` (yml: `twitch_client_id`)
- `TWITCH_CLIENT_SECRET` (yml: `twitch_client_secret`)

Register an application in the [Twitch developer console](https://dev.twitch.tv/console)
in order to obtain a client id and a client secret for making Twitch API calls.

## Wheelmap

- `WHEELMAP_TOKEN` (yml: `wheelmap_token`)

The wheelmap API requires authentication. To obtain a token,
Create an account, [sign in][wheelmap token] and use the _Authentication Token_
displayed on your profile page.

[wheelmap token]: http://classic.wheelmap.org/en/users/sign_in
