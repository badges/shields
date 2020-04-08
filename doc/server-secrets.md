# Server Secrets

It is possible to provide a token or credentials for a number of external
services. These may be used to lift a rate limit or provide access to
private resources from a self-hosted instance.

There are two ways of setting secrets:

1. Via environment variables. This is a good way to set them in a PaaS
   environment.

```sh
DRONE_TOKEN=...
DRONE_ORIGINS="https://drone.example.com"
```

2. Via checked-in `config/local.yml`:

```yml
public:
  services:
    drone:
      authorizedOrigins: ['https://drone.example.com']
private:
  drone_token: '...'
```

For more complex scenarios, configuration files can cascade. See the [node-config documentation][]
for details.

[node-config documentation]: https://github.com/lorenwest/node-config/wiki/Configuration-Files

## Authorized origins

Several of the badges provided by Shields allow users to specify the target
URL/server of the upstream instance to use via a query parameter in the badge URL
(e.g. https://img.shields.io/nexus/s/com.google.guava/guava?server=https%3A%2F%2Foss.sonatype.org).
This supports scenarios where your users may need badges from multiple upstream
targets, for example if you have more than one Nexus server.

Accordingly, if you configure credentials for one of these services with your
self-hosted Shields instance, you must also specifically authorize the hosts
to which the credentials are allowed to be sent. If your self-hosted Shields
instance then receives a badge request for a target that does not match any
of the authorized origins, one of two things will happen:

- if credentials are required for the targeted service, Shields will render
  an error badge.
- if credentials are optional for the targeted service, Shields will attempt
  the request, but without sending any credentials.

When setting authorized origins through an environment variable, use a space
to separate multiple origins. Note that failing to define authorized origins
for a service will default to an empty list, i.e. no authorized origins.

It is highly recommended to use `https` origins with valid SSL, to avoid the
possibility of exposing your credentials, for example through DNS-based attacks.

It is also recommended to use tokens for a service account having
[the fewest privileges needed][polp] for fetching the relevant status
information.

[polp]: https://en.wikipedia.org/wiki/Principle_of_least_privilege

## Services

### Azure DevOps

- `AZURE_DEVOPS_TOKEN` (yml: `private.azure_devops_token`)

An Azure DevOps Token (PAT) is required for accessing [private Azure DevOps projects][ado project visibility].

[Create a PAT][ado personal access tokens] using an account that has access to your target Azure DevOps projects. Your PAT only needs the following [scopes:][ado token scopes]

- `Build (read)`
- `Release (read)`
- `Test Management (read)`

[ado project visibility]: https://docs.microsoft.com/en-us/azure/devops/organizations/public/about-public-projects?view=vsts
[ado personal access tokens]: https://docs.microsoft.com/en-us/azure/devops/organizations/accounts/use-personal-access-tokens-to-authenticate?view=vsts#create-personal-access-tokens-to-authenticate-access
[ado token scopes]: https://docs.microsoft.com/en-us/azure/devops/integrate/get-started/authentication/oauth?view=vsts#scopes

### Bintray

- `BINTRAY_USER` (yml: `private.bintray_user`)
- `BINTRAY_API_KEY` (yml: `private.bintray_apikey`)

The bintray API [requires authentication](https://bintray.com/docs/api/#_authentication)
Create an account and obtain a token from the user profile page.

### Bitbucket (Cloud)

- `BITBUCKET_USER` (yml: `private.bitbucket_username`)
- `BITBUCKET_PASS` (yml: `private.bitbucket_password`)

Bitbucket badges use basic auth. Provide a username and password to give your
self-hosted Shields installation access to private repositories hosted on bitbucket.org.

### Bitbucket Server

- `BITBUCKET_SERVER_ORIGINS` (yml: `public.services.bitbucketServer.authorizedOrigins`)
- `BITBUCKET_SERVER_USER` (yml: `private.bitbucket_server_username`)
- `BITBUCKET_SERVER_PASS` (yml: `private.bitbucket_server_password`)

Bitbucket badges use basic auth. Provide a username and password to give your
self-hosted Shields installation access to a private Bitbucket Server instance.

### Drone

- `DRONE_ORIGINS` (yml: `public.services.drone.authorizedOrigins`)
- `DRONE_TOKEN` (yml: `private.drone_token`)

The self-hosted Drone API [requires authentication][drone auth]. Log in to your
Drone instance and obtain a token from the user profile page.

[drone auth]: https://0-8-0.docs.drone.io/api-authentication/

### GitHub

- `GITHUB_URL` (yml: `public.services.github.baseUri`)
- `GH_TOKEN` (yml: `private.gh_token`)

Because of Github rate limits, you will need to provide a token, or else badges
will stop working once you hit 60 requests per hour, the
[unauthenticated rate limit][github rate limit].

You can [create a personal access token][personal access tokens] through the
Github website. When you create the token, you can choose to give read access
to your repositories. If you do that, your self-hosted Shields installation
will have access to your private repositories.

When a `gh_token` is specified, it is used in place of the Shields token
rotation logic.

`GITHUB_URL` can be used to optionally send all the GitHub requests to a
GitHub Enterprise server. This can be done in conjunction with setting a
token, though it's not required.

[github rate limit]: https://developer.github.com/v3/#rate-limiting
[personal access tokens]: https://github.com/settings/tokens

- `GH_CLIENT_ID` (yml: `private.gh_client_id`)
- `GH_CLIENT_SECRET` (yml: `private.gh_client_secret`)

These settings are used by shields.io for GitHub OAuth app authorization
but will not be necessary for most self-hosted installations. See
[production-hosting.md](./production-hosting.md).

### Jenkins CI

- `JENKINS_ORIGINS` (yml: `public.services.jenkins.authorizedOrigins`)
- `JENKINS_USER` (yml: `private.jenkins_user`)
- `JENKINS_PASS` (yml: `private.jenkins_pass`)

Provide a username and password to give your self-hosted Shields installation
access to a private Jenkins CI instance.

### Jira

- `JIRA_ORIGINS` (yml: `public.services.jira.authorizedOrigins`)
- `JIRA_USER` (yml: `private.jira_user`)
- `JIRA_PASS` (yml: `private.jira_pass`)

Provide a username and password to give your self-hosted Shields installation
access to a private JIRA instance.

### Nexus

- `NEXUS_ORIGINS` (yml: `public.services.nexus.authorizedOrigins`)
- `NEXUS_USER` (yml: `private.nexus_user`)
- `NEXUS_PASS` (yml: `private.nexus_pass`)

Provide a username and password to give your self-hosted Shields installation
access to your private nexus repositories.

### npm

- `NPM_ORIGINS` (yml: `public.services.npm.authorizedOrigins`)
- `NPM_TOKEN` (yml: `private.npm_token`)

[Generate an npm token][npm token] to give your self-hosted Shields
installation access to private npm packages

[npm token]: https://docs.npmjs.com/getting-started/working_with_tokens

### SymfonyInsight (formerly Sensiolabs)

- `SL_INSIGHT_USER_UUID` (yml: `private.sl_insight_userUuid`)
- `SL_INSIGHT_API_TOKEN` (yml: `private.sl_insight_apiToken`)

The SymfonyInsight API requires authentication. To obtain a token,
Create an account, sign in and obtain a uuid and token from your
[account page](https://insight.sensiolabs.com/account).

### SonarQube

- `SONAR_ORIGINS` (yml: `public.services.sonar.authorizedOrigins`)
- `SONARQUBE_TOKEN` (yml: `private.sonarqube_token`)

[Generate a token](https://docs.sonarqube.org/latest/user-guide/user-token/)
to give your self-hosted Shields installation access to a
private SonarQube instance or private project on a public instance.

### TeamCity

- `TEAMCITY_ORIGINS` (yml: `public.services.teamcity.authorizedOrigins`)
- `TEAMCITY_USER` (yml: `private.teamcity_user`)
- `TEAMCITY_PASS` (yml: `private.teamcity_pass`)

Provide a username and password to give your self-hosted Shields installation
access to your private nexus repositories.

### Twitch

- `TWITCH_CLIENT_ID` (yml: `twitch_client_id`)
- `TWITCH_CLIENT_SECRET` (yml: `twitch_client_secret`)

Register an application in the [Twitch developer console](https://dev.twitch.tv/console)
in order to obtain a client id and a client secret for making Twitch API calls.

### Wheelmap

- `WHEELMAP_TOKEN` (yml: `private.wheelmap_token`)

The wheelmap API requires authentication. To obtain a token,
Create an account, [sign in][wheelmap token] and use the _Authentication Token_
displayed on your profile page.

[wheelmap token]: http://classic.wheelmap.org/en/users/sign_in

## Error reporting

- `SENTRY_DSN` (yml: `private.sentry_dsn`)

A [Sentry DSN][] may be used to send error reports from your installation to
[Sentry.io][]. For more info, see the [self hosting docs][].

[sentry dsn]: https://docs.sentry.io/error-reporting/quickstart/?platform=javascript#configure-the-dsn
[sentry.io]: http://sentry.io/
[self hosting docs]: https://github.com/badges/shields/blob/master/doc/self-hosting.md#sentry
