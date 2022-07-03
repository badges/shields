# Changelog

Note: this changelog is for the shields.io server. The changelog for the badge-maker NPM package is at https://github.com/badges/shields/blob/master/badge-maker/CHANGELOG.md

---

## server-2022-07-03

- Add [galaxytoolshed] services [#8114](https://github.com/badges/shields/issues/8114)
- fix [gitlab] auth [#8145](https://github.com/badges/shields/issues/8145) [#8162](https://github.com/badges/shields/issues/8162)
- increase cache length on AUR version badge, run [AUR] [#8110](https://github.com/badges/shields/issues/8110)
- Use GraphQL to fix GitHub file count badges [github] [#8112](https://github.com/badges/shields/issues/8112)
- feat: add [gitlab] contributors service [#8084](https://github.com/badges/shields/issues/8084)
- [greasyfork] Add Greasy Fork service badges [#8080](https://github.com/badges/shields/issues/8080)
- Add [gitlablicense] services [#8024](https://github.com/badges/shields/issues/8024)
- [Spack] Package Manager: Update Domain [#8046](https://github.com/badges/shields/issues/8046)
- switch [jitpack] to use latestOk endpoint [#8041](https://github.com/badges/shields/issues/8041)
- Dependency updates

## server-2022-06-01

- Update GitLab logo (2022) [#7984](https://github.com/badges/shields/issues/7984)
- [GitHub] Added milestone property to GitHub issue details service [#7864](https://github.com/badges/shields/issues/7864)
- [Spack] Package Manager: Update Endpoint [#7957](https://github.com/badges/shields/issues/7957)
- Update Chocolatey API endpoint URL [#7952](https://github.com/badges/shields/issues/7952)
- [Flathub]Add downloads badge [#7724](https://github.com/badges/shields/issues/7724)
- replace the outdated Telegram logo with the newest [#7831](https://github.com/badges/shields/issues/7831)
- add [PUB] points badge [#7918](https://github.com/badges/shields/issues/7918)
- add [PUB] popularity badge [#7920](https://github.com/badges/shields/issues/7920)
- add [PUB] likes badge [#7916](https://github.com/badges/shields/issues/7916)
- Dependency updates

## server-2022-05-03

- [OSSFScorecard] Create scorecard badge service [#7687](https://github.com/badges/shields/issues/7687)
- Stringify [githublanguagecount] message [#7881](https://github.com/badges/shields/issues/7881)
- Stringify and trim whitespace from a few services [#7880](https://github.com/badges/shields/issues/7880)
- add labels to Dockerfile [#7862](https://github.com/badges/shields/issues/7862)
- handle missing 'fly-client-ip' [#7814](https://github.com/badges/shields/issues/7814)
- Dependency updates

## server-2022-04-03

- Breaking change: This release updates ioredis from v4 to v5.
  If you are using redis for GitHub token pooling, redis connection strings of the form
  `redis://junkusername:authpassword@example.com:1234` will need to be updated to
  `redis://:authpassword@example.com:1234`. See the
  [ioredis upgrade guide](https://github.com/luin/ioredis/wiki/Upgrading-from-v4-to-v5)
  for further details.
- fix installation issue on npm >= 8.5.5 [#7809](https://github.com/badges/shields/issues/7809)
- two fixes for [packagist] schemas [#7782](https://github.com/badges/shields/issues/7782)
- allow requireCloudflare setting to work when hosted on fly.io [#7781](https://github.com/badges/shields/issues/7781)
- fix [pypi] badges when package has null license [#7761](https://github.com/badges/shields/issues/7761)
- Add a [pub] publisher badge [#7715](https://github.com/badges/shields/issues/7715)
- Switch Steam file size badge to informational color [#7722](https://github.com/badges/shields/issues/7722)
- Make W3C and Youtube documentation links clickable [#7721](https://github.com/badges/shields/issues/7721)
- Improve Wercker examples [#7720](https://github.com/badges/shields/issues/7720)
- Improve Cirrus CI examples [#7719](https://github.com/badges/shields/issues/7719)
- Support [CodeClimate] responses with multiple data items [#7716](https://github.com/badges/shields/issues/7716)
- Delete [TeamCityCoverage] and [BowerVersion] redirectors [#7718](https://github.com/badges/shields/issues/7718)
- Deprecate [Shippable] service [#7717](https://github.com/badges/shields/issues/7717)
- fix: restore version comparison updates from #4173 [#4254](https://github.com/badges/shields/issues/4254)
- [piwheels], filter out versions with no files [#7696](https://github.com/badges/shields/issues/7696)
- set a longer cacheLength on [librariesio] badges [#7692](https://github.com/badges/shields/issues/7692)
- improve python version formatting [#7682](https://github.com/badges/shields/issues/7682)
- Clarify GitHub All Contributors badge [#7690](https://github.com/badges/shields/issues/7690)
- Support [HexPM] packages with no stable release [#7685](https://github.com/badges/shields/issues/7685)
- Add Test at Scale Badge [#7612](https://github.com/badges/shields/issues/7612)
- [packagist] api v2 support [#7681](https://github.com/badges/shields/issues/7681)
- Add [piwheels] version badge [#7656](https://github.com/badges/shields/issues/7656)
- Dependency updates

## server-2022-03-01

- Add [Conan] version service (#7460)
- remove suspended [github] tokens from the pool [#7654](https://github.com/badges/shields/issues/7654)
- generate links without trailing : if port not set [#7655](https://github.com/badges/shields/issues/7655)
- Use the latest build status when checking docs.rs [#7613](https://github.com/badges/shields/issues/7613)
- Remove no download handling and add API warning to [Wordpress] badges [#7606](https://github.com/badges/shields/issues/7606)
- set a higher default cacheLength on rating/star category [#7587](https://github.com/badges/shields/issues/7587)
- Update [amo] to use v4 API, set custom `cacheLength`s [#7586](https://github.com/badges/shields/issues/7586)
- fix(amo): include trailing slash in API call [#7585](https://github.com/badges/shields/issues/7585)
- fix docker image user agent [#7582](https://github.com/badges/shields/issues/7582)
- Delete deprecated Codetally and continuousphp services [#7572](https://github.com/badges/shields/issues/7572)
- Deprecate [Requires] service [#7571](https://github.com/badges/shields/issues/7571)
- [AUR] Fix RPC URL [#7570](https://github.com/badges/shields/issues/7570)
- Dependency updates

## server-2022-02-01

- [Depfu] Add support for Gitlab [#7475](https://github.com/badges/shields/issues/7475)
- replace label in hn-user-karma with U/ [#7500](https://github.com/badges/shields/issues/7500)
- Support [Feedz] response with multiple pages without items [#7476](https://github.com/badges/shields/issues/7476)
- revert decamelize and humanize-string to old versions [#7449](https://github.com/badges/shields/issues/7449)
- Dependency updates

## server-2022-01-01

- minor [reddit] improvements [#7436](https://github.com/badges/shields/issues/7436)
- [HackerNews] Show User Karma [#7411](https://github.com/badges/shields/issues/7411)
- [YouTube] Drop support for removed dislikes [#7410](https://github.com/badges/shields/issues/7410)
- change closed GitHub issue color to purple [#7374](https://github.com/badges/shields/issues/7374)
- restore cors header injection from #4171 [#4255](https://github.com/badges/shields/issues/4255)
- [GithubPackageJson] Get version from monorepo subfolder package.json [#7350](https://github.com/badges/shields/issues/7350)
- Dependency updates

## server-2021-12-01

- Send better user-agent values [#7309](https://github.com/badges/shields/issues/7309)
  Self-hosting users now send a user agent which indicates the server version and starts `shields (self-hosted)/` by default.
  This can be configured using the env var `USER_AGENT_BASE`
- upgrade to node 16 [#7271](https://github.com/badges/shields/issues/7271)
- feat: deprecate dependabot badges [#7274](https://github.com/badges/shields/issues/7274)
- fix: npmversion tagged service test [#7269](https://github.com/badges/shields/issues/7269)
- feat: create new Test Results category [#7218](https://github.com/badges/shields/issues/7218)
- Migration from Request to Got for all HTTP requests is completed in this release
- Dependency updates

## server-2021-11-04

- migrate regularUpdate() from request-->got [#7215](https://github.com/badges/shields/issues/7215)
- migrate github badges to use got instead of request; affects [github librariesio] [#7212](https://github.com/badges/shields/issues/7212)
- deprecate David badges [#7197](https://github.com/badges/shields/issues/7197)
- fix: ensure libraries.io header values are processed numerically [#7196](https://github.com/badges/shields/issues/7196)
- Add authentication for Libraries.io-based badges, run [Libraries Bower] [#7080](https://github.com/badges/shields/issues/7080)
- fixes and tests for pipenv helpers [#7194](https://github.com/badges/shields/issues/7194)
- add GitLab Release badge, run all [GitLab] [#7021](https://github.com/badges/shields/issues/7021)
- set content-length header on badge responses [#7179](https://github.com/badges/shields/issues/7179)
- fix [github] release/tag/download schema [#7170](https://github.com/badges/shields/issues/7170)
- Supported nested groups on [GitLabPipeline] badge [#7159](https://github.com/badges/shields/issues/7159)
- Support nested groups on [GitLabTag] badge [#7158](https://github.com/badges/shields/issues/7158)
- Fixing incorrect JetBrains Plugin rating values for [JetBrainsRating] [#7140](https://github.com/badges/shields/issues/7140)
- support using release or tag name in [GitHub] Release version badge [#7075](https://github.com/badges/shields/issues/7075)
- feat: support branches in sonar badges [#7065](https://github.com/badges/shields/issues/7065)
- Add [Modrinth] total downloads badge [#7132](https://github.com/badges/shields/issues/7132)
- remove [github] admin routes [#7105](https://github.com/badges/shields/issues/7105)
- Dependency updates

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
