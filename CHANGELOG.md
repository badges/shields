# Changelog

Note: this changelog is for the shields.io server. The changelog for the badge-maker NPM package is at https://github.com/badges/shields/blob/master/badge-maker/CHANGELOG.md

---

## server-2021-10-04

- feat: add 2021 support to GitHub Hacktoberfest [#7086](https://github.com/badges/shields/issues/7086)
- Add [ClearlyDefined] service [#6944](https://github.com/badges/shields/issues/6944)
- handle null licenses in crates.io response schema, run [crates] [#7074](https://github.com/badges/shields/issues/7074)
- [OBS] add Open Build Service service-badge [#6993](https://github.com/badges/shields/issues/6993)
- Correction of badges url in self-hosting configuration with a custom port. Issue 7025 [#7036](https://github.com/badges/shields/issues/7036)
- fix: support gitlab token via env var [#7023](https://github.com/badges/shields/issues/7023)
- Add API-based support for [GitLab] badges, add new GitLab Tag badge [#6988](https://github.com/badges/shields/issues/6988)
- [freecodecamp]: allow + symbol in username [#7016](https://github.com/badges/shields/issues/7016)
- Rename Riot to Element in Matrix badge help [#6996](https://github.com/badges/shields/issues/6996)
- Fixed Reddit Negative Karma Issue [#6992](https://github.com/badges/shields/issues/6992)
- Dependency updates

## server-2021-09-01

- use multi-stage build to reduce size of docker images [#6938](https://github.com/badges/shields/issues/6938)
- remove disableStrictSsl param from [jenkins] [#6887](https://github.com/badges/shields/issues/6887)
- refactor(GitHubCommitActivity): switch to v4/GraphQL API [#6959](https://github.com/badges/shields/issues/6959)
- feat: add freecodecamp badge [#6958](https://github.com/badges/shields/issues/6958)
- use the right version of NPM in docker build [#6941](https://github.com/badges/shields/issues/6941)
- [TwitchExtensionVersion] New badge [#6900](https://github.com/badges/shields/issues/6900)
- enforce strict SSL checking for [coverity] [#6886](https://github.com/badges/shields/issues/6886)
- Update self hosting docs [#6877](https://github.com/badges/shields/issues/6877)
- Support optionalDependencies in [GithubPackageJson] [#6749](https://github.com/badges/shields/issues/6749)
- Dependency updates

## server-2021-08-01

- use v5 API for [AUR] badges [#6836](https://github.com/badges/shields/issues/6836)
- [Sonar] Fix invalid fetch query to sonarqube >=6.6 [#6636](https://github.com/badges/shields/issues/6636)
- Delegate discord logo to simple-icons, which matches the current branding [#6764](https://github.com/badges/shields/issues/6764)
- Re-apply 'Migrate request to got (part 1)' [#6755](https://github.com/badges/shields/issues/6755)
- Delete old deprecated badges [#6756](https://github.com/badges/shields/issues/6756)
- Replace opn-cli with open-cli [#6747](https://github.com/badges/shields/issues/6747)
- Verify that Node 14 is installed in development [#6748](https://github.com/badges/shields/issues/6748)
- Migrate from CommonJS to ESM [#6651](https://github.com/badges/shields/issues/6651)
- Add Wikiapiary Extension Badge [WikiapiaryInstalls] [#6678](https://github.com/badges/shields/issues/6678)
- deprecate [beerpay] [#6708](https://github.com/badges/shields/issues/6708)
- deprecate [microbadger] [#6709](https://github.com/badges/shields/issues/6709)
- [npmsioscore] Support npm score [#6630](https://github.com/badges/shields/issues/6630)
- Add [Weblate] badges [#6677](https://github.com/badges/shields/issues/6677)
- Dependency updates

## server-2021-07-01

- improve [MavenCentral], [MavenMetadata], and [GradlePluginPortal] [#6628](https://github.com/badges/shields/issues/6628)
- fix: fix regex to match [codecov]'s flags [#6655](https://github.com/badges/shields/issues/6655)
- fix usage style [#6638](https://github.com/badges/shields/issues/6638)
- update simple-icons to v5 with by-name lookup backwards compatibility [#6591](https://github.com/badges/shields/issues/6591)
- [GradlePluginPortal] add gradle plugin portal [#6449](https://github.com/badges/shields/issues/6449)
- upgrade some vulnerable packages [#6569](https://github.com/badges/shields/issues/6569)
- increase max-age for download and social badges [#6567](https://github.com/badges/shields/issues/6567)
- Dependency updates

## server-2021-06-01

- Changed creating badges to open a new Window/Tab [#6536](https://github.com/badges/shields/issues/6536)
- Make for-the-badge letter spacing more predictable, and rewrite layout logic [#5754](https://github.com/badges/shields/issues/5754)
- deprecate DockerBuild service [#6529](https://github.com/badges/shields/issues/6529)
- Remove rate limiting functionality [#6513](https://github.com/badges/shields/issues/6513)
- [GitHub] Move to 'funding' category [#5846](https://github.com/badges/shields/issues/5846)
- Add GitHub discussions total badge [GithubTotalDiscussions] [#6472](https://github.com/badges/shields/issues/6472)
- Add optional query parameter (include_prereleases) to [GemVersion] [#6451](https://github.com/badges/shields/issues/6451)
- Add [PingPong] Service [#6327](https://github.com/badges/shields/issues/6327)
- Dependency updates

## server-2021-05-01

- Add setting which allows setting a timeout on HTTP requests
  This is configured with the new `REQUEST_TIMEOUT_SECONDS` setting. If a request takes longer
  than this number of seconds a `408 Request Timeout` response will be returned.
- Deprecate [Bintray] service [#6423](https://github.com/badges/shields/issues/6423)
- Support git hash in [nexus] SNAPSHOT version [#6369](https://github.com/badges/shields/issues/6369)
- Replace 4183C4 with blue [#6366](https://github.com/badges/shields/issues/6366)
- [Youtube] Added channel view count and subscriber count badges [#6333](https://github.com/badges/shields/issues/6333)
- Fix Netlify badge by adding new color schema [#6340](https://github.com/badges/shields/issues/6340)
- [REUSE] Add service badges [#6330](https://github.com/badges/shields/issues/6330)
- Dependency updates

## server-2021-04-01

- Use NPM packages to provide fonts instead of Google Fonts [#6274](https://github.com/badges/shields/issues/6274)
- Prevent duplication of parameters in badge examples [#6272](https://github.com/badges/shields/issues/6272)
- Add docs for all types of releases [#6210](https://github.com/badges/shields/issues/6210)
- refresh self-hosting docs [#6273](https://github.com/badges/shields/issues/6273)
- allow missing 'goal' key in [liberapay] badges [#6258](https://github.com/badges/shields/issues/6258)
- use got to push influx metrics [#6257](https://github.com/badges/shields/issues/6257)
- Dependency updates

## server-2021-03-01

- ensure redirect target path is correctly encoded [#6229](https://github.com/badges/shields/issues/6229)
- [SecurityHeaders] Added a possibility for no follow redirects [#6212](https://github.com/badges/shields/issues/6212)
- catch URL parse error in [endpoint] badge [#6214](https://github.com/badges/shields/issues/6214)
- [Homebrew] Add homebrew downloads badge [#6209](https://github.com/badges/shields/issues/6209)
- update [pkgreview] url [#6189](https://github.com/badges/shields/issues/6189)
- Make [Twitch] a social badge [#6183](https://github.com/badges/shields/issues/6183)
- update [flathub] error handling [#6185](https://github.com/badges/shields/issues/6185)
- Add [Testspace] badges [#6162](https://github.com/badges/shields/issues/6162)
- Dependency updates

## server-2021-02-01

- Docs.rs badge (#6098)
- Fix feedz service in case the package page gets paginated (#6101)
- [Bitbucket] Server Adding Auth Tokens and Resolving Pull Request api … (#6076)
- Dependency updates

## server-2021-01-18

- Gotta start somewhere
