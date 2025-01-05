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

### CurseForge

- `CURSEFORGE_API_KEY` (yml: `private.curseforge_api_key`)

A CurseForge API key is required to use the [CurseForge API][cf api]. To obtain
an API key, [signup to CurseForge Console][cf signup] with a Google account and
create an organization, then go to the [API keys page][cf api key] and copy the
generated API key.

[cf api]: https://docs.curseforge.com
[cf signup]: https://console.curseforge.com/#/signup
[cf api key]: https://console.curseforge.com/#/api-keys

### Discord

Using a token for Discord is optional but will allow higher API rates.

- `DISCORD_BOT_TOKEN` (yml: `private.discord_bot_token`)

Register an application in the [Discord developer console](https://discord.com/developers).
To obtain a token, simply create a bot for your application.

### DockerHub

Using authentication for DockerHub is optional but can be used to allow
higher API rates or access to private repos.

- `DOCKERHUB_USER` (yml: `private.dockerhub_username`)
- `DOCKERHUB_PAT` (yml: `private.dockerhub_pat`)

`DOCKERHUB_PAT` is a Personal Access Token. Generate a token in your
[account security settings](https://hub.docker.com/settings/security) with
"Read-Only" or "Public Repo Read-Only", depending on your needs.

### Drone

- `DRONE_ORIGINS` (yml: `public.services.drone.authorizedOrigins`)
- `DRONE_TOKEN` (yml: `private.drone_token`)

The self-hosted Drone API [requires authentication][drone auth]. Log in to your
Drone instance and obtain a token from the user profile page.

[drone auth]: https://0-8-0.docs.drone.io/api-authentication/

### GitHub

- `GITHUB_URL` (yml: `public.services.github.baseUri`)
- `GH_TOKEN` (yml: `private.gh_token`)

Because of GitHub rate limits, you will need to provide a token, or else badges
will stop working once you hit 60 requests per hour, the
[unauthenticated rate limit][github rate limit].

You can [create a personal access token][personal access tokens] (PATs) through the
GitHub website. When you create the token, you can choose to give read access
to your repositories. If you do that, your self-hosted Shields installation
will have access to your private repositories.

For most users we recommend using a classic PAT as opposed to a [fine-grained PAT][fine-grained pat].
It is possible to request a fairly large subset of the GitHub badge suite using a
fine-grained PAT for authentication but there are also some badges that won't work.
This is because some of our badges make use of GitHub's v4 GraphQL API and the
GraphQL API only supports authentication with a classic PAT.

When a `gh_token` is specified, it is used in place of the Shields token
rotation logic.

`GITHUB_URL` can be used to optionally send all the GitHub requests to a
GitHub Enterprise server. This can be done in conjunction with setting a
token, though it's not required.

[github rate limit]: https://developer.github.com/v3/#rate-limiting
[personal access tokens]: https://github.com/settings/tokens
[fine-grained pat]: https://github.blog/2022-10-18-introducing-fine-grained-personal-access-tokens-for-github/

- `GH_CLIENT_ID` (yml: `private.gh_client_id`)
- `GH_CLIENT_SECRET` (yml: `private.gh_client_secret`)

These settings are used by shields.io for GitHub OAuth app authorization
but will not be necessary for most self-hosted installations. See
[production-hosting.md](./production-hosting.md).

### Gitea

- `GITEA_ORIGINS` (yml: `public.services.gitea.authorizedOrigins`)
- `GITEA_TOKEN` (yml: `private.gitea_token`)

A Gitea [Personal Access Token][gitea-pat] is required for accessing private content. If you need a Gitea token for your self-hosted Shields server then we recommend limiting the scopes to the minimal set necessary for the badges you are using.

[gitea-pat]: https://docs.gitea.com/development/api-usage#generating-and-listing-api-tokens

### GitLab

- `GITLAB_ORIGINS` (yml: `public.services.gitlab.authorizedOrigins`)
- `GITLAB_TOKEN` (yml: `private.gitlab_token`)

A GitLab [Personal Access Token][gitlab-pat] is required for accessing private content. If you need a GitLab token for your self-hosted Shields server then we recommend limiting the scopes to the minimal set necessary for the badges you are using.

[gitlab-pat]: https://docs.gitlab.com/ee/user/profile/personal_access_tokens.html

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

### Libraries.io/Bower

- `LIBRARIESIO_TOKENS` (yml: `private.librariesio_tokens`)

Note that the Bower badges utilize the Libraries.io API, so use this secret for both Libraries.io badges and/or Bower badges.

Just like the `*_ORIGINS` type secrets, this value can accept a single token as a string, or a group of tokens provided as an array of strings. For example:

```yaml
private:
  librariesio_tokens: my-token
## Or
private:
  librariesio_tokens: [my-token some-other-token]
```

When using the environment variable with multiple tokens, be sure to use a space to separate the tokens, e.g. `LIBRARIESIO_TOKENS="my-token some-other-token"`

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

### Open Build Service

- `OBS_USER` (yml: `private.obs_user`)
- `OBS_PASS` (yml: `private.obs_user`)

Only authenticated users are allowed to access the Open Build Service API.
Authentication is done by sending a Basic HTTP Authorisation header. A user
account for the [reference instance](https://build.opensuse.org) is a SUSE
IdP account, which can be created [here](https://idp-portal.suse.com/univention/self-service/#page=createaccount).

While OBS supports [API tokens](https://openbuildservice.org/help/manuals/obs-user-guide/cha.obs.authorization.token.html#id-1.5.10.16.4),
they can only be scoped to execute specific actions on a POST request. This
means however, that an actual account is required to read the build status
of a package.

### OpenCollective

- `OPENCOLLECTIVE_TOKEN` (yml: `private.opencollective_token`)

OpenCollective's GraphQL API only allows 10 reqs/minute for anonymous users.
An [API token](https://graphql-docs-v2.opencollective.com/access)
can be provided to access a higher rate limit of 100 reqs/minute.

### Pepy

- `PEPY_KEY` (yml: `private.pepy_key`)

The Pepy API requires authentication. To obtain a key,
Create an account, sign in and obtain generate a key on your
[account page](https://www.pepy.tech/user).

### PyPI

- `PYPI_URL` (yml: `public.pypi.baseUri`)

`PYPI_URL` can be used to optionally send all the PyPI requests to a Self-hosted Pypi registry,
users can also override this by query parameter `pypiBaseUrl`.

### Reddit

Using a token for Reddit is optional but will allow higher API rates.

- `REDDIT_CLIENT_ID` (yml: `private.reddit_client_id`)
- `REDDIT_CLIENT_SECRET` (yml: `private.reddit_client_secret`)

Register to use the API using [this form](https://support.reddithelp.com/hc/en-us/requests/new?ticket_form_id=14868593862164)
and create an app in the [Reddit preferences page](https://www.reddit.com/prefs/apps)
in order to obtain a client id and a client secret for making Reddit API calls.

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

### StackApps (for StackExchange and StackOverflow)

- `STACKAPPS_API_KEY`: (yml: `private.stackapps_api_key`)

Anonymous requests to the stackexchange API are limited to 300 calls per day.
To increase your quota to 10,000 calls per day, create an account at
[StackApps](https://stackapps.com/) and
[register an OAuth app](https://stackapps.com/apps/oauth/register). Having registered
an OAuth app, you'll be granted a key which can be used to increase your request quota.
It is not necessary to performa full OAuth Flow to gain an access token.

### TeamCity

- `TEAMCITY_ORIGINS` (yml: `public.services.teamcity.authorizedOrigins`)
- `TEAMCITY_USER` (yml: `private.teamcity_user`)
- `TEAMCITY_PASS` (yml: `private.teamcity_pass`)

Provide a username and password to give your self-hosted Shields installation
access to your private nexus repositories.

### Twitch

- `TWITCH_CLIENT_ID` (yml: `private.twitch_client_id`)
- `TWITCH_CLIENT_SECRET` (yml: `private.twitch_client_secret`)

Register an application in the [Twitch developer console](https://dev.twitch.tv/console)
in order to obtain a client id and a client secret for making Twitch API calls.

### Weblate

- `WEBLATE_ORIGINS` (yml: `public.services.weblate.authorizedOrigins`)
- `WEBLATE_API_KEY` (yml: `private.weblate_api_key`)

By default Weblate throttles [unauthenticated request][weblate authentication]
to only 100 requests per day, after this you will need an API key or else
badges will stop working.

You can find your Weblate API key in your profile under
["API access"][weblate api key location].

[weblate authentication]: https://docs.weblate.org/en/latest/api.html#authentication-and-generic-parameters
[weblate api key location]: https://hosted.weblate.org/accounts/profile/#api

### YouTube

- `YOUTUBE_API_KEY` (yml: `private.youtube_api_key`)

The YouTube API requires authentication. To obtain an API key,
log in to a Google account, go to the [credentials page][youtube credentials],
and create an API key for the YouTube Data API v3.

[youtube credentials]: https://console.developers.google.com/apis/credentials

## Error reporting

- `SENTRY_DSN` (yml: `private.sentry_dsn`)

A [Sentry DSN][] may be used to send error reports from your installation to
[Sentry.io][]. For more info, see the [self hosting docs][].

[sentry dsn]: https://docs.sentry.io/error-reporting/quickstart/?platform=javascript#configure-the-dsn
[sentry.io]: http://sentry.io/
[self hosting docs]: https://github.com/badges/shields/blob/master/doc/self-hosting.md#sentry
