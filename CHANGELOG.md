# Changelog

Note: this changelog is for the shields.io server. The changelog for the badge-maker NPM package is at https://github.com/badges/shields/blob/master/badge-maker/CHANGELOG.md

---

## server-2025-02-02

- Mark Stubs-only packages with [PypiTypes] badge [#10864](https://github.com/badges/shields/issues/10864)
- fix badge style when logo only [#10794](https://github.com/badges/shields/issues/10794)
- pass matching mime type to xmldom; test [dynamicxml] [#10830](https://github.com/badges/shields/issues/10830)
- allow [chromewebstore] size to contain decimal point [#10812](https://github.com/badges/shields/issues/10812)
- Add auth support to [Reddit] badges [#10790](https://github.com/badges/shields/issues/10790)
- Fixed mixed up Code climate endpoints [#10813](https://github.com/badges/shields/issues/10813)
- feat: add terraform registry providers and modules downloads [#10793](https://github.com/badges/shields/issues/10793)
- Renew [Mastodon] docs and improve parameter handling [#10789](https://github.com/badges/shields/issues/10789)
- Support [Matrix] summary endpoint [#10782](https://github.com/badges/shields/issues/10782)
- use metric() in [coderabbit] badge [#10779](https://github.com/badges/shields/issues/10779)
- cache matrix badges for 4 hours [#10778](https://github.com/badges/shields/issues/10778)
- Dependency updates

## server-2025-01-01

- Add [PypiTypes] badge [#10774](https://github.com/badges/shields/issues/10774)
- feat(endpoint-badge): add logoSize support [#10132](https://github.com/badges/shields/issues/10132)
- fix auto-sized logo sizes [#10764](https://github.com/badges/shields/issues/10764)
- Add [Coderabbit] PR Stats service and tests [#10749](https://github.com/badges/shields/issues/10749)
- add [PUB] downloads badge [#10745](https://github.com/badges/shields/issues/10745)
- Add [GitLab] Top Language Badge [#10750](https://github.com/badges/shields/issues/10750)
- provide a non-repository scoped version of [githubcodesearch] [#10733](https://github.com/badges/shields/issues/10733)
- [ReproducibleCentral] add Reproducible Central in Dependencies [#10705](https://github.com/badges/shields/issues/10705)
- Add ability to format bytes as metric or IEC; affects [bundlejs bundlephobia ChromeWebStoreSize CratesSize DockerSize GithubRepoSize GithubCodeSize GithubSize NpmUnpackedSize SpigetDownloadSize steam VisualStudioAppCenterReleasesSize whatpulse] [#10547](https://github.com/badges/shields/issues/10547)
- Dependency updates

## server-2024-12-01

- add [WingetVersion] Badge [#10245](https://github.com/badges/shields/issues/10245)
- Fix broken URL for pingpong.one [#10655](https://github.com/badges/shields/issues/10655)
- [npm] - Last update badge added [#10641](https://github.com/badges/shields/issues/10641)
- reduce overhead of NPM Last Update badge; test [npm] [#10666](https://github.com/badges/shields/issues/10666)
- Add YouTube-specific privacy notes [#10646](https://github.com/badges/shields/issues/10646)
- Dependency updates

## server-2024-11-02

- cleanly handle null or undefined result from jsonpath-plus [#10645](https://github.com/badges/shields/issues/10645)
- add content security policy header to SVG responses [#10642](https://github.com/badges/shields/issues/10642)
- [Scoop] Added scoop-license badge. [#10627](https://github.com/badges/shields/issues/10627)
- [Chromewebstore] Extension size & last updated [#10613](https://github.com/badges/shields/issues/10613)
- Deprecate HackageDeps service [#10618](https://github.com/badges/shields/issues/10618)
- Add [CratesUserDownloads] service and tester [#10619](https://github.com/badges/shields/issues/10619)
- [Snapcraft] - Added snapcraft last update badge [#10610](https://github.com/badges/shields/issues/10610)
- [GitHubHacktoberfest] 2024 support [#10612](https://github.com/badges/shields/issues/10612)
- add [homebrew] cask download badge [#10595](https://github.com/badges/shields/issues/10595)
- remove prefix v for commit hash version [#10597](https://github.com/badges/shields/issues/10597)
- [Maven] Added badge for Maven-Cenral last-update (#10301) [#10585](https://github.com/badges/shields/issues/10585)
- [DynamicXml] parse doc as html if served with text/html content type [#10607](https://github.com/badges/shields/issues/10607)
- Revert "Use old.stats.jenkins.io for JSON data (#10522)" [#10537](https://github.com/badges/shields/issues/10537)
- catch queries that cause TypeError [#10556](https://github.com/badges/shields/issues/10556)
- Dependency updates

## server-2024-09-25

This release includes an important security fix. See

- https://github.com/badges/shields/security/advisories/GHSA-rxvx-x284-4445
- https://github.com/badges/shields/issues/10553

for more details

- [dynamicjson dynamicyaml dynamictoml] switch to jsonpath-plus [#10551](https://github.com/badges/shields/issues/10551)
- [Snapcraft] license [#10520](https://github.com/badges/shields/issues/10520)
- deprecate [wheelmap] service [#10538](https://github.com/badges/shields/issues/10538)
- Use old.stats.jenkins.io for JSON data [#10522](https://github.com/badges/shields/issues/10522)
- catch xml ParseError [#10516](https://github.com/badges/shields/issues/10516)
- migrate [MozillaObservatory] to /scan endpoint [#10491](https://github.com/badges/shields/issues/10491)
- fix incorrect codecov config link [#10511](https://github.com/badges/shields/issues/10511)
- [OSSLifecycle OSSLifecycleRedirect] Add file_url param to pull from non-github sources [#10489](https://github.com/badges/shields/issues/10489)
- perf: improve logoSize performance [#10488](https://github.com/badges/shields/issues/10488)
- perf: faster `resetIconPosition` avoiding to parse path twice [#10497](https://github.com/badges/shields/issues/10497)
- perf: limit logoSize precision to 3 [#10521](https://github.com/badges/shields/issues/10521)
- Dependency updates

## server-2024-09-02

- Publish linux/amd64 docker images for snapshot builds [#10476](https://github.com/badges/shields/issues/10476)
- Fix Gitea not having credentials/authorizedOrigins in Docker environments [#10486](https://github.com/badges/shields/issues/10486)
- fix typo in pepy downloads [#10475](https://github.com/badges/shields/issues/10475)
- ignore a couple of docusaurus warnings [#10469](https://github.com/badges/shields/issues/10469)
- Use Ecologi API to power Treeware badges [#10467](https://github.com/badges/shields/issues/10467)
- move go version badge to platform support category [#10444](https://github.com/badges/shields/issues/10444)
- [Crates] Implement Dependents Badge [#10438](https://github.com/badges/shields/issues/10438)
- [Crates] Added crate size badge [#10421](https://github.com/badges/shields/issues/10421)
- Dependency updates

## server-2024-08-01

- send Cross-Origin-Resource-Policy header on all responses [#10420](https://github.com/badges/shields/issues/10420)
- migrate [MozillaObservatory] to new API [#10402](https://github.com/badges/shields/issues/10402)
- use metric() for [discord] and [revolt] badges [#10406](https://github.com/badges/shields/issues/10406)
- Cache text only static badges for longer [#10403](https://github.com/badges/shields/issues/10403)
- Fix [FreeCodeCampPoints] not found handling [#10377](https://github.com/badges/shields/issues/10377)
- Fix [Gitea] not found message [#10373](https://github.com/badges/shields/issues/10373)
- Deprecate [Bountysource] service [#10371](https://github.com/badges/shields/issues/10371)
- Sunset Shields custom logos [#10347](https://github.com/badges/shields/issues/10347)
- Use ellipsis when many versions returned for [ModrinthGameVersions] [#10350](https://github.com/badges/shields/issues/10350)
- deprecate [tokei] service [#9581](https://github.com/badges/shields/issues/9581)
- Add CF-Ray header value to Sentry errors if available [#10339](https://github.com/badges/shields/issues/10339)
- Use XML for Chocolatey, affects [Chocolatey Resharper PowershellGallery] [#10344](https://github.com/badges/shields/issues/10344)
- include github contributors badge in docs site [#10337](https://github.com/badges/shields/issues/10337)
- Dependency updates

## server-2024-07-01

- Add [AUR] Popularity Badge [#10304](https://github.com/badges/shields/issues/10304)
- fix npm badges when `maintainers` not in response [#10286](https://github.com/badges/shields/issues/10286)
- Expose `logoBase64` and `links` in badge-maker NPM package [#10283](https://github.com/badges/shields/issues/10283)
- Remove `logoPosition` [#10284](https://github.com/badges/shields/issues/10284)
- [MBIN] Add subscribers badge [#10270](https://github.com/badges/shields/issues/10270)
- Add [Docker] support for loong64 arch [#10241](https://github.com/badges/shields/issues/10241)
- Add puppetforge quality score badges [#10201](https://github.com/badges/shields/issues/10201)
- Dependency updates

## server-2024-06-01

- Remove namedLogo from defaultBadgeData of non-social badges [#10195](https://github.com/badges/shields/issues/10195)
- Update number of badges served each month [#10197](https://github.com/badges/shields/issues/10197)
- Delete old deprecated services [#10196](https://github.com/badges/shields/issues/10196)
- handle [BitbucketPipelines] responses with missing result key [#10163](https://github.com/badges/shields/issues/10163)
- Update description of GitHub commit status badge [#10198](https://github.com/badges/shields/issues/10198)
- chore: fix spelling of GitHub in badge descriptions [#10199](https://github.com/badges/shields/issues/10199)
- Add [GithubCheckRuns] service [#7759](https://github.com/badges/shields/issues/7759)
- feat: add Revolt badge [#10093](https://github.com/badges/shields/issues/10093)
- ensure color is string before calling toLowerCase() [#10129](https://github.com/badges/shields/issues/10129)
- instruct dependabot to monitor composite actions [#10139](https://github.com/badges/shields/issues/10139)
- run tests on node 22 [#10127](https://github.com/badges/shields/issues/10127)
- tweaks to libraries.io token pooling code [#10074](https://github.com/badges/shields/issues/10074)
- fix [pypi] status badge when package has no 'Development Status' classifier [#10107](https://github.com/badges/shields/issues/10107)
- clarify yml paths in server-secrets docs [#10106](https://github.com/badges/shields/issues/10106)
- Update region flag name in flyctl deploy command [#10134](https://github.com/badges/shields/issues/10134)
- Dependency updates

## server-2024-05-01

- [Hexpm] Fix badges for pre-release only versions [#10112](https://github.com/badges/shields/issues/10112)
- feat(logos): support auto-sizing mode [#9191](https://github.com/badges/shields/issues/9191) [#10110](https://github.com/badges/shields/issues/10110) [#10125](https://github.com/badges/shields/issues/10125)
- support setting pypiBaseUrl by environment variables and queryParameters; affects [pypi] [#10044](https://github.com/badges/shields/issues/10044)
- Add 0BSD license to licenseTypes and [PypiLicense] [#10092](https://github.com/badges/shields/issues/10092)
- Update Mastodon profile URL [#10082](https://github.com/badges/shields/issues/10082)
- [GitHubGoMod] Ignore comment after version (fixes #10079) [#10080](https://github.com/badges/shields/issues/10080)
- Perf: Librariesio repo dependencies [#10062](https://github.com/badges/shields/issues/10062)
- [Chocolatey Nuget] Fix "not found" error for chocolatey badge [#10060](https://github.com/badges/shields/issues/10060)
- Dependency updates

## server-2024-04-01

- improve performance of [GithubLastCommit] [GitlabLastCommit] [GiteaLastCommit] [#10046](https://github.com/badges/shields/issues/10046)
- [BitbucketLastCommit] Add Bitbucket last commit [#10043](https://github.com/badges/shields/issues/10043)
- [GithubLastCommit] [GitlabLastCommit] [GiteaLastCommit] Support file path for last commit [#10041](https://github.com/badges/shields/issues/10041)
- upgrade to docusaurus 3 [#9820](https://github.com/badges/shields/issues/9820)
- redirect [npm] /dt to /d18m [#10033](https://github.com/badges/shields/issues/10033)
- Add [JSR] version service [#10030](https://github.com/badges/shields/issues/10030)
- Add [snapcraft] version badge [#9976](https://github.com/badges/shields/issues/9976)
- Dependency updates

## server-2024-03-01

- feat(gitea): add last commit badge [#9995](https://github.com/badges/shields/issues/9995)
- [GithubCreatedAt] Add Created At Badge for Github [#9981](https://github.com/badges/shields/issues/9981)
- Added custom bucket url support for [Scoop] [#9984](https://github.com/badges/shields/issues/9984)
- [NpmUnpackedSize] Unpacked Size Badge [#9954](https://github.com/badges/shields/issues/9954)
- [Website] Render `status: down` badge if website is unresponsive [#9966](https://github.com/badges/shields/issues/9966)
- deprecate TAS [#9932](https://github.com/badges/shields/issues/9932)
- [GITEA] add forks, stars, issues and pr badges [#9923](https://github.com/badges/shields/issues/9923)
- tolerate missing short_version in [visualstudioappcenter] [#9951](https://github.com/badges/shields/issues/9951)
- [Crates] Only use non-yanked crate versions (ready for merge) [#9949](https://github.com/badges/shields/issues/9949)
- Dependency updates

## server-2024-02-01

- feat: added up_message and down_message to [uptimerobotstatus] [#9662](https://github.com/badges/shields/issues/9662)
- Add [Hangar] Badges [#9800](https://github.com/badges/shields/issues/9800)
- sort categories by title (except core) [#9888](https://github.com/badges/shields/issues/9888)
- Add Support for [Nostr] Followers [#9870](https://github.com/badges/shields/issues/9870)
- [thunderstore] replace experimental API usage with newly available v1 API [#9886](https://github.com/badges/shields/issues/9886)
- Update [Gitea] defaults to gitea.com [#9872](https://github.com/badges/shields/issues/9872)
- [crates] MSRV Badge [#9871](https://github.com/badges/shields/issues/9871)
- Add [galaxytoolshed] Version [#8249](https://github.com/badges/shields/issues/8249)
- fix default style docs for social badges [#9869](https://github.com/badges/shields/issues/9869)
- Dependency updates

## server-2024-01-01

The most important changes in this release for users hosting their own instance are:

The shields docker image is now based on node 20:

- deploy on node 20 [#9799](https://github.com/badges/shields/issues/9799)

It is now possible to use [authentication for DockerHub](https://github.com/badges/shields/blob/master/doc/server-secrets.md#dockerhub) to allow higher API rate limit or access to private repos:

- call [docker] with auth [#9803](https://github.com/badges/shields/issues/9803)

### New Badges

- [Thunderstore] Add Thunderstore Badges [#9782](https://github.com/badges/shields/issues/9782)
- Add [Raycast] Badge [#9801](https://github.com/badges/shields/issues/9801)
- [GITEA] add new gitea service (release/languages) [#9781](https://github.com/badges/shields/issues/9781)
- Add [NpmStatDownloads] Badge [#9783](https://github.com/badges/shields/issues/9783)

### Frontend Changes

- improve documentation for [dynamicxml] service [#9798](https://github.com/badges/shields/issues/9798)
- add description to interval enums [#9854](https://github.com/badges/shields/issues/9854)
- convert 'style' param to enum [#9853](https://github.com/badges/shields/issues/9853)
- Ensure social category badges are rendered with social style and logo; affects [gitlab keybase lemmy modrinth thunderstore twitch] gist github reddit [#9859](https://github.com/badges/shields/issues/9859)

### Fixes

- [pub] Use official version endpoint for pub-service [#9802](https://github.com/badges/shields/issues/9802)
- cache weblate badges for longer [#9786](https://github.com/badges/shields/issues/9786)
- [Discourse] Update schema keys to use plural form (`topic_count` -> `topics_count`) [#9778](https://github.com/badges/shields/issues/9778)
- cache some badges for longer [#9785](https://github.com/badges/shields/issues/9785)
- increase page size for github release badge by semver [#9818](https://github.com/badges/shields/issues/9818)
- Dependency updates

## server-2023-12-04

- move from @renovate/pep440 to @renovatebot/pep440 [#9614](https://github.com/badges/shields/issues/9614)
- deprecate/fix [ansible] galaxy services [#9648](https://github.com/badges/shields/issues/9648)
- call [pepy] with auth [#9748](https://github.com/badges/shields/issues/9748)
- add meaningful descriptions including keywords [#9715](https://github.com/badges/shields/issues/9715)
- Dependency updates

## server-2023-11-01

- fix greasyfork 404 bug [#9632](https://github.com/badges/shields/issues/9632)
- Hacktoberfest 2023 support - resolves #9636 [#9637](https://github.com/badges/shields/issues/9637)
- switch to fixed OpenCollective images [#9615](https://github.com/badges/shields/issues/9615)
- Dependency updates

## server-2023-10-02

- add python package total downloads from [pepy] badge [#9564](https://github.com/badges/shields/issues/9564)
- deprecate [redmine] plugin rating badges [#9568](https://github.com/badges/shields/issues/9568)
- fix [bower] version badge [#9567](https://github.com/badges/shields/issues/9567)
- Add [PythonVersionFromToml] shield [#9516](https://github.com/badges/shields/issues/9516)
- Add [dub] score badge service [#9549](https://github.com/badges/shields/issues/9549)
- Dependency updates

## server-2023-09-04

- Fix [testspace] badges [#9525](https://github.com/badges/shields/issues/9525)
- fix rSt code example [#9528](https://github.com/badges/shields/issues/9528)
- Add dynamic TOML support via [DynamicToml] Service [#9517](https://github.com/badges/shields/issues/9517)
- cache [pypi] downloads for longer [#9522](https://github.com/badges/shields/issues/9522)
- [twitter] --> x [#9496](https://github.com/badges/shields/issues/9496)
- [bundlejs] add badge for the npm package size [#9055](https://github.com/badges/shields/issues/9055)
- Switch [OpenCollective] badges to use GraphQL and auth [#9387](https://github.com/badges/shields/issues/9387)
- [Pulsar] Add Pulsar Badges for Stargazers & Downloads [#8767](https://github.com/badges/shields/issues/8767)
- Add [CurseForge] badges [#9252](https://github.com/badges/shields/issues/9252)
- deploy on node 18 [#9385](https://github.com/badges/shields/issues/9385)
- allow calling [github] without auth [#9427](https://github.com/badges/shields/issues/9427)
- Dependency updates

## server-2023-08-01

- Convert `examples` arrays to `openApi` objects (part 1) [#9320](https://github.com/badges/shields/issues/9320)
- Migrate from docs.rs' builds API to status API [#9422](https://github.com/badges/shields/issues/9422)
- [OpenVSX] Fix OpenVSX API call for unversioned package URLs [#9408](https://github.com/badges/shields/issues/9408)
- Add support for [Lemmy] [#9368](https://github.com/badges/shields/issues/9368)
- upgrade to npm 9 [#9323](https://github.com/badges/shields/issues/9323)
- Go back to default YouTube cache [#9372](https://github.com/badges/shields/issues/9372)
- Add [GitHubDiscussionsSearch] and GitHubRepoDiscussionsSearch service [#9340](https://github.com/badges/shields/issues/9340)
- Allow user to filter github tags and releases [#9193](https://github.com/badges/shields/issues/9193)
- don't URL encode slash in [githubactionsworkflow] badge [#9322](https://github.com/badges/shields/issues/9322)
- add a bit of border to select boxes [#9348](https://github.com/badges/shields/issues/9348)
- deprecate [snyk] badges [#9349](https://github.com/badges/shields/issues/9349)
- increase max-age on [docker] badges, again [#9350](https://github.com/badges/shields/issues/9350) [#9369](https://github.com/badges/shields/issues/9369)
- Dependency updates

## server-2023-07-02

By far the most significant change in this release is the long-awaited launch of the re-designed frontend:

- migrate frontend to docusaurus [#9014](https://github.com/badges/shields/issues/9014)
- fix a load of spacing issues in frontend content [#9281](https://github.com/badges/shields/issues/9281)
- set a sensible meta description [#9283](https://github.com/badges/shields/issues/9283)
- chore(frontend): open homepage feature links in new tab [#9300](https://github.com/badges/shields/issues/9300)
- adapt opencollective images to theme background [#9298](https://github.com/badges/shields/issues/9298)
- temp fix: wrap code examples tabs in narrow browser windows [#9302](https://github.com/badges/shields/issues/9302)
- add a bit of border to text boxes [#9324](https://github.com/badges/shields/issues/9324)

Other changes in this release:

- cache [dockerpulls] badges for an hour [#9343](https://github.com/badges/shields/issues/9343)
- Mention YouTube API services and link to Google Privacy Policy [#9339](https://github.com/badges/shields/issues/9339)
- allow negative timestamps in relative [date] badge [#9321](https://github.com/badges/shields/issues/9321)
- upgrade to graphql 16 [#9290](https://github.com/badges/shields/issues/9290)
- remove obsolete travis .org examples [#9284](https://github.com/badges/shields/issues/9284)
- increase max age on reddit badges [#9282](https://github.com/badges/shields/issues/9282)
- feat: Add author filter option for [GithubCommitActivity] [#9251](https://github.com/badges/shields/issues/9251)
- Fix: [GithubCommitActivity] invalid branch error handling [#9258](https://github.com/badges/shields/issues/9258)
- Implement a pattern for dealing with upstream APIs which are slow on the first hit; affects [endpoint] [#9233](https://github.com/badges/shields/issues/9233)
- Delete old deprecated services [#9254](https://github.com/badges/shields/issues/9254)
- feat: add 'canceled' status to netlify deploy badge [#9240](https://github.com/badges/shields/issues/9240)
- increase default cache on youtube badges [#9238](https://github.com/badges/shields/issues/9238)
- embiggen youtube cache, again [#9250](https://github.com/badges/shields/issues/9250)
- Dependency updates

## server-2023-06-01

- feat: Add total commits to [GitHubCommitActivity] [#9196](https://github.com/badges/shields/issues/9196)
- set a custom error on 429 [#9159](https://github.com/badges/shields/issues/9159)
- deprecate [travis].org badges [#9171](https://github.com/badges/shields/issues/9171)
- count private sponsors on [GithubSponsors] badge [#9170](https://github.com/badges/shields/issues/9170)
- Dependency updates

## server-2023-05-01

**Removal:** For users who need to maintain a Github Token pool, storage has been provided via the `RedisTokenPersistence` and `REDIS_URL` settings. This feature was deprecated in `server-2023-03-01`. As of this release, the `RedisTokenPersistence` backend is now removed. If you are using this feature, you will need to migrate to using the `SQLTokenPersistence` backend for storage and provide a postgres connection string via the `POSTGRES_URL` setting. [#8922](https://github.com/badges/shields/issues/8922)

- fail to start server if there are duplicate service names [#9099](https://github.com/badges/shields/issues/9099)
- [SourceForge] Added badges for SourceForge [#9078](https://github.com/badges/shields/issues/9078) [#9102](https://github.com/badges/shields/issues/9102)
- crates: Use `?include=` to reduce crates.io backend load [#9081](https://github.com/badges/shields/issues/9081)
- Dependency updates

## server-2023-04-02

- [JenkinsCoverage] Update Jenkins Code Coverage API for new plugin version [#9010](https://github.com/badges/shields/issues/9010)
- [CTAN] fallback to date if version is empty [#9036](https://github.com/badges/shields/issues/9036)
- Update to [CTAN] API version 2.0 [#9016](https://github.com/badges/shields/issues/9016)
- handle missing statistics array in [VisualStudioMarketplace] badges [#8985](https://github.com/badges/shields/issues/8985)
- [Netlify] upgrade colors for SVG parsing [#8971](https://github.com/badges/shields/issues/8971)
- Fix [Vcpkg] version service for different version fields [#8945](https://github.com/badges/shields/issues/8945)
- only try to close pool if one exists [#8947](https://github.com/badges/shields/issues/8947)
- misc minor fixes to [githubsize node pypi] [#8946](https://github.com/badges/shields/issues/8946)
- Dependency updates

## server-2023-03-01

**Deprecation:** For users who need to maintain a Github Token pool, storage has been provided via the `RedisTokenPersistence` and `REDIS_URL` settings. As of this release, the `RedisTokenPersistence` backend is now deprecated and will be removed in a future release. If you are using this feature, you will need to migrate to using the `SQLTokenPersistence` backend for storage and provide a postgres connection string via the `POSTGRES_URL` setting. [#8922](https://github.com/badges/shields/issues/8922)

- fix: for crates.io versions, use max_stable_version if it exists [#8687](https://github.com/badges/shields/issues/8687)
- don't autofocus search [#8927](https://github.com/badges/shields/issues/8927)
- Add [Vcpkg] version service [#8923](https://github.com/badges/shields/issues/8923)
- fix: Set uid/gid in docker image to 0 [#8908](https://github.com/badges/shields/issues/8908)
- expose port 443 in Dockerfile [#8889](https://github.com/badges/shields/issues/8889)
- Dependency updates

## server-2023-02-01

- replace [twitter] badge with static fallback [#8842](https://github.com/badges/shields/issues/8842)
- Add various [Polymart] badges [#8811](https://github.com/badges/shields/issues/8811)
- update [githubpipenv] tests/examples [#8797](https://github.com/badges/shields/issues/8797)
- deprecate [apm] service [#8773](https://github.com/badges/shields/issues/8773)
- deprecate lgtm [#8771](https://github.com/badges/shields/issues/8771)
- Dependency updates

## server-2023-01-01

- Breaking change: Routes for GitHub workflows badge have changed. See https://github.com/badges/shields/issues/8671 for more details
- Behaviour change: In this release we fixed a long standing bug. GitHub badges were previously not reading the base URL from the `config.service.baseUri`.
  This release fixes that bug, bringing the code into line with the documented behaviour. This should not cause a behaviour change for most users,
  but users who had previously set a value in `config.service.baseUri` which was previously ignored could see this now have an effect.
  Users who configure their instance using env vars rather than yaml should see no change.
- Send `X-GitHub-Api-Version` when calling [GitHub] v3 API [#8669](https://github.com/badges/shields/issues/8669)
- add [VpmVersion] badge [#8755](https://github.com/badges/shields/issues/8755)
- Add [modrinth] game versions [#8673](https://github.com/badges/shields/issues/8673)
- fix debug logging of undefined query params [#8540](https://github.com/badges/shields/issues/8540), [#8757](https://github.com/badges/shields/issues/8757)
- fall back to classifiers if [pypi] license text is really long [#8690](https://github.com/badges/shields/issues/8690)
- allow passing key to [stackexchange] [#8539](https://github.com/badges/shields/issues/8539)
- Dependency updates

## server-2022-12-01

- fix: support logoColor to shield icons. [#8263](https://github.com/badges/shields/issues/8263)
- handle missing properties array in [VisualStudioMarketplaceVersion] [#8603](https://github.com/badges/shields/issues/8603)
- deprecate [wercker] service [#8642](https://github.com/badges/shields/issues/8642)
- Add [Coincap] Cryptocurrency badges [#8623](https://github.com/badges/shields/issues/8623)
- Add [modrinth] version [#8604](https://github.com/badges/shields/issues/8604)
- [factorio-mod-portal] services [#8625](https://github.com/badges/shields/issues/8625)
- [Coveralls] for GitLab [#8584](https://github.com/badges/shields/issues/8584), [#8644](https://github.com/badges/shields/issues/8644)
- Remove 'suggest badges' feature [#8311](https://github.com/badges/shields/issues/8311)
- Add [modrinth] followers [#8601](https://github.com/badges/shields/issues/8601)
- Update the [modrinth] API to v2 [#8600](https://github.com/badges/shields/issues/8600)
- tidy up [GitHubGist] routes [#8510](https://github.com/badges/shields/issues/8510)
- fix [flathub] version error handling [#8500](https://github.com/badges/shields/issues/8500)
- Dependency updates

## server-2022-11-01

- [Ansible] Add collection badge [#8578](https://github.com/badges/shields/issues/8578)
- [VisualStudioMarketplace] Add support to prerelease extensions version (Issue #8207) [#8561](https://github.com/badges/shields/issues/8561)
- feat: add [GitlabLastCommit] service [#8508](https://github.com/badges/shields/issues/8508)
- fix [swagger] service tests (allow 0 items in array) [#8564](https://github.com/badges/shields/issues/8564)
- fix codecov badge for non-default branch [#8565](https://github.com/badges/shields/issues/8565)
- Add [GitHubLastCommit] by committer badge [#8537](https://github.com/badges/shields/issues/8537)
- [GitHubReleaseDate] - published_at field [#8543](https://github.com/badges/shields/issues/8543)
- Fix [Testspace] with new "untested" value in case_counts array [#8544](https://github.com/badges/shields/issues/8544)
- fix: Support WAITING status for GitHub deployments [#8521](https://github.com/badges/shields/issues/8521)
- [Whatpulse] badge for a user and for a team [#8466](https://github.com/badges/shields/issues/8466)
- deprecate [pkgreview] service [#8499](https://github.com/badges/shields/issues/8499)
- Dependency updates

## server-2022-10-08

- deprecate [criterion] service [#8501](https://github.com/badges/shields/issues/8501)
- fix formatRelativeDate error handling; run [date] [#8497](https://github.com/badges/shields/issues/8497)
- allow/validate bitbucket_username / bitbucket_password in private config schema [#8472](https://github.com/badges/shields/issues/8472)
- fix [pub] points badge test and example [#8498](https://github.com/badges/shields/issues/8498)
- feat: add [GitlabLanguageCount] service [#8377](https://github.com/badges/shields/issues/8377)
- [GitHubGistStars] add GitHub Gist Stars [#8471](https://github.com/badges/shields/issues/8471)
- fix display/search of CII badge examples [#8473](https://github.com/badges/shields/issues/8473)
- feat: add 2022 support to GitHub Hacktoberfest [#8468](https://github.com/badges/shields/issues/8468)
- fix [GitLabCoverage] subgroup bug [#8401](https://github.com/badges/shields/issues/8401)
- implement ruby gems-specific version sort/color functions [#8434](https://github.com/badges/shields/issues/8434)
- Add `rc` to pre-release identifiers [#8435](https://github.com/badges/shields/issues/8435)
- add [GitHub] Number of commits between branches/tags/commits [#8394](https://github.com/badges/shields/issues/8394)
- add [Packagist] dependency version [#8371](https://github.com/badges/shields/issues/8371)
- fix Docker build status invalid response data bug [#8392](https://github.com/badges/shields/issues/8392)
- Dependency updates

## server-2022-09-04

- fix frontend compile for users running on Windows [#8350](https://github.com/badges/shields/issues/8350)
- [DockerSize] Docker image size multi arch [#8290](https://github.com/badges/shields/issues/8290)
- upgrade gatsby [#8334](https://github.com/badges/shields/issues/8334)
- Custom domains for [JitPack] artifacts [#8333](https://github.com/badges/shields/issues/8333)
- fix [dockerstars] service [#8316](https://github.com/badges/shields/issues/8316)
- [BountySource] Fix: Broken Badge generation for decimal activity values [#8315](https://github.com/badges/shields/issues/8315)
- feat: add [gitlabmergerequests] service [#8166](https://github.com/badges/shields/issues/8166)
- Fix terminology for [ROS] version service [#8292](https://github.com/badges/shields/issues/8292)
- feat: add [GitlabStars] service [#8209](https://github.com/badges/shields/issues/8209)
- Fix invalid `rst` format when `alt` or `target` is present [#8275](https://github.com/badges/shields/issues/8275)
- [GithubGistLastCommit] GitHub gist last commit [#8272](https://github.com/badges/shields/issues/8272)
- [GitHub] GitHub file size for a specific branch [#8262](https://github.com/badges/shields/issues/8262)
- Dependency updates

## server-2022-08-01

- [pypi] Add Framework Version Badges support [#8261](https://github.com/badges/shields/issues/8261)
- feat: add [GitlabForks] server [#8208](https://github.com/badges/shields/issues/8208)
- Update PyPI api according to https://warehouse.pypa.io/api-reference/json.html [#8251](https://github.com/badges/shields/issues/8251)
- Add [galaxytoolshed] Activity [#8164](https://github.com/badges/shields/issues/8164)
- [greasyfork] Add Greasy Fork rating badges [#8087](https://github.com/badges/shields/issues/8087)
- refactor(deps): Replace moment with dayjs [#8192](https://github.com/badges/shields/issues/8192)
- add spaces round pipe in [conda] badge [#8189](https://github.com/badges/shields/issues/8189)
- Add [ROS] version service [#8169](https://github.com/badges/shields/issues/8169)
- feat: add [gitlabissues] service [#8108](https://github.com/badges/shields/issues/8108)
- Dependency updates

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
