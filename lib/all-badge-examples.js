'use strict'

const { loadServiceClasses } = require('../services')

const githubDoc = `
<p>
  If your GitHub badge errors, it might be because you hit GitHub's rate limits.
  <br>
  You can increase Shields.io's rate limit by
  <a href="https://img.shields.io/github-auth">going to this page</a> to add
  Shields as a GitHub application on your GitHub account.
</p>
`

const allBadgeExamples = [
  {
    category: {
      id: 'build',
      name: 'Build',
    },
    examples: [],
  },
  {
    category: {
      id: 'chat',
      name: 'Chat',
    },
    examples: [],
  },
  {
    category: {
      id: 'dependencies',
      name: 'Dependencies',
    },
    examples: [],
  },
  {
    category: {
      id: 'size',
      name: 'Size',
    },
    examples: [
      {
        title: 'GitHub code size in bytes',
        previewUrl: '/github/languages/code-size/badges/shields.svg',
        keywords: ['GitHub', 'byte', 'code', 'size'],
        documentation: githubDoc,
      },
      {
        title: 'GitHub repo size in bytes',
        previewUrl: '/github/repo-size/badges/shields.svg',
        keywords: ['GitHub', 'repo', 'size'],
        documentation: githubDoc,
      },
      {
        title: 'GitHub file size',
        previewUrl:
          '/github/size/webcaetano/craft/build/phaser-craft.min.js.svg',
        keywords: ['GitHub', 'file', 'size'],
        documentation: githubDoc,
      },
    ],
  },
  {
    category: {
      id: 'downloads',
      name: 'Downloads',
    },
    examples: [
      {
        title: 'GitHub All Releases',
        previewUrl: '/github/downloads/atom/atom/total.svg',
        keywords: ['github'],
        documentation: githubDoc,
      },
      {
        title: 'GitHub Releases',
        previewUrl: '/github/downloads/atom/atom/latest/total.svg',
        keywords: ['github'],
        documentation: githubDoc,
      },
      {
        title: 'GitHub Pre-Releases',
        previewUrl: '/github/downloads-pre/atom/atom/latest/total.svg',
        keywords: ['github'],
        documentation: githubDoc,
      },
      {
        title: 'GitHub Releases (by Release)',
        previewUrl: '/github/downloads/atom/atom/v0.190.0/total.svg',
        keywords: ['github'],
        documentation: githubDoc,
      },
      {
        title: 'GitHub Releases (by Asset)',
        previewUrl: '/github/downloads/atom/atom/latest/atom-amd64.deb.svg',
        keywords: ['github'],
        documentation: githubDoc,
      },
      {
        title: 'GitHub Pre-Releases (by Asset)',
        previewUrl: '/github/downloads-pre/atom/atom/latest/atom-amd64.deb.svg',
        keywords: ['github'],
        documentation: githubDoc,
      },
      {
        title: 'Chocolatey',
        previewUrl: '/chocolatey/dt/scriptcs.svg',
      },
      {
        title: 'NuGet',
        previewUrl: '/nuget/dt/Microsoft.AspNetCore.Mvc.svg',
      },
      {
        title: 'MyGet',
        previewUrl: '/myget/mongodb/dt/MongoDB.Driver.Core.svg',
      },
      {
        title: 'MyGet tenant',
        previewUrl:
          '/dotnet.myget/dotnet-coreclr/dt/Microsoft.DotNet.CoreCLR.svg',
      },
      {
        title: 'PowerShell Gallery',
        previewUrl: '/powershellgallery/dt/ACMESharp.svg',
      },
      {
        title: 'Crates.io',
        previewUrl: '/crates/d/rustc-serialize.svg',
        keywords: ['Rust'],
      },
      {
        title: 'Crates.io',
        previewUrl: '/crates/dv/rustc-serialize.svg',
        keywords: ['Rust'],
      },
      {
        title: 'Puppet Forge',
        previewUrl: '/puppetforge/dt/camptocamp/openldap.svg',
      },
      {
        title: 'Mozilla Add-on',
        previewUrl: '/amo/d/dustman.svg',
        keywords: ['amo', 'firefox'],
      },
      {
        title: 'Visual Studio Marketplace',
        previewUrl: '/vscode-marketplace/d/ritwickdey.LiveServer.svg',
        keywords: ['vscode-marketplace'],
      },
      {
        title: 'JetBrains IntelliJ plugins',
        previewUrl: '/jetbrains/plugin/d/1347-scala.svg',
        keywords: ['jetbrains', 'plugin'],
      },
      {
        title: 'JetBrains ReSharper plugins',
        previewUrl: '/resharper/dt/ReSharper.Nuke.svg',
        keywords: ['jetbrains', 'plugin'],
      },
    ],
  },
  {
    category: {
      id: 'funding',
      name: 'Funding',
    },
    examples: [
      {
        title: 'Chrome Web Store',
        previewUrl:
          '/chrome-web-store/price/ogffaloegjglncjfehdfplabnoondfjo.svg',
        keywords: ['chrome'],
      },
    ],
  },
  {
    category: {
      id: 'issue-tracking',
      name: 'Issue Tracking',
    },
    examples: [
      {
        title: 'GitHub issues',
        previewUrl: '/github/issues/badges/shields.svg',
        keywords: ['GitHub', 'issue'],
        documentation: githubDoc,
      },
      {
        title: 'GitHub issues',
        previewUrl: '/github/issues-raw/badges/shields.svg',
        keywords: ['GitHub', 'issue'],
        documentation: githubDoc,
      },
      {
        title: 'GitHub pull requests',
        previewUrl: '/github/issues-pr/cdnjs/cdnjs.svg',
        keywords: ['GitHub', 'pullrequest', 'pr'],
        documentation: githubDoc,
      },
      {
        title: 'GitHub pull requests',
        previewUrl: '/github/issues-pr-raw/cdnjs/cdnjs.svg',
        keywords: ['GitHub', 'pullrequest', 'pr'],
        documentation: githubDoc,
      },
      {
        title: 'GitHub closed issues',
        previewUrl: '/github/issues-closed/badges/shields.svg',
        keywords: ['GitHub', 'issue'],
        documentation: githubDoc,
      },
      {
        title: 'GitHub closed issues',
        previewUrl: '/github/issues-closed-raw/badges/shields.svg',
        keywords: ['GitHub', 'issue'],
        documentation: githubDoc,
      },
      {
        title: 'GitHub closed pull requests',
        previewUrl: '/github/issues-pr-closed/cdnjs/cdnjs.svg',
        keywords: ['GitHub', 'pullrequest', 'pr'],
        documentation: githubDoc,
      },
      {
        title: 'GitHub closed pull requests',
        previewUrl: '/github/issues-pr-closed-raw/cdnjs/cdnjs.svg',
        keywords: ['GitHub', 'pullrequest', 'pr'],
        documentation: githubDoc,
      },
      {
        title: 'GitHub issues by-label',
        previewUrl: '/github/issues/badges/shields/service-badge.svg',
        keywords: ['GitHub', 'issue', 'label'],
        documentation: githubDoc,
      },
      {
        title: 'GitHub issues by-label',
        previewUrl: '/github/issues-raw/badges/shields/service-badge.svg',
        keywords: ['GitHub', 'issue', 'label'],
        documentation: githubDoc,
      },
      {
        title: 'GitHub pull requests by-label',
        previewUrl: '/github/issues-pr/badges/shields/service-badge.svg',
        keywords: ['GitHub', 'pullrequests', 'label'],
        documentation: githubDoc,
      },
      {
        title: 'GitHub pull requests by-label',
        previewUrl: '/github/issues-pr-raw/badges/shields/service-badge.svg',
        keywords: ['GitHub', 'pullrequests', 'label'],
        documentation: githubDoc,
      },
      {
        title: 'GitHub issue/pull request state',
        previewUrl: '/github/issues/detail/s/badges/shields/979.svg',
        keywords: ['GitHub', 'issue', 'pullrequest', 'detail'],
        documentation: githubDoc,
      },
      {
        title: 'GitHub issue/pull request title',
        previewUrl: '/github/issues/detail/title/badges/shields/1290.svg',
        keywords: ['GitHub', 'issue', 'pullrequest', 'detail'],
        documentation: githubDoc,
      },
      {
        title: 'GitHub issue/pull request author',
        previewUrl: '/github/issues/detail/u/badges/shields/979.svg',
        keywords: ['GitHub', 'issue', 'pullrequest', 'detail'],
        documentation: githubDoc,
      },
      {
        title: 'GitHub issue/pull request label',
        previewUrl: '/github/issues/detail/label/badges/shields/979.svg',
        keywords: ['GitHub', 'issue', 'pullrqeuest', 'detail'],
        documentation: githubDoc,
      },
      {
        title: 'GitHub issue/pull request comments',
        previewUrl: '/github/issues/detail/comments/badges/shields/979.svg',
        keywords: ['GitHub', 'issue', 'pullrequest', 'detail'],
        documentation: githubDoc,
      },
      {
        title: 'GitHub issue/pull request age',
        previewUrl: '/github/issues/detail/age/badges/shields/979.svg',
        keywords: ['GitHub', 'issue', 'pullrequest', 'detail'],
        documentation: githubDoc,
      },
      {
        title: 'GitHub issue/pull request last update',
        previewUrl: '/github/issues/detail/last-update/badges/shields/979.svg',
        keywords: ['GitHub', 'issue', 'pullrequest', 'detail'],
        documentation: githubDoc,
      },
    ],
  },
  {
    category: {
      id: 'license',
      name: 'License',
    },
    examples: [
      {
        title: 'GitHub',
        previewUrl: '/github/license/mashape/apistatus.svg',
        keywords: ['GitHub', 'license'],
        documentation: githubDoc,
      },
      {
        title: 'Crates.io',
        previewUrl: '/crates/l/rustc-serialize.svg',
        keywords: ['Rust'],
      },
      {
        title: 'Packagist',
        previewUrl: '/packagist/l/doctrine/orm.svg',
        keywords: ['PHP'],
      },
      {
        title: 'Bower',
        previewUrl: '/bower/l/bootstrap.svg',
      },
      {
        title: 'CPAN',
        previewUrl: '/cpan/l/Config-Augeas.svg',
        keywords: ['perl'],
      },
      {
        title: 'CRAN',
        previewUrl: '/cran/l/devtools.svg',
        keywords: ['R'],
      },
      {
        title: 'DUB',
        previewUrl: '/dub/l/vibe-d.svg',
        keywords: ['dub'],
      },
    ],
  },
  {
    category: {
      id: 'rating',
      name: 'Rating',
    },
    examples: [
      {
        title: 'Chrome Web Store',
        previewUrl:
          '/chrome-web-store/rating/ogffaloegjglncjfehdfplabnoondfjo.svg',
        keywords: ['chrome'],
      },
      {
        title: 'Chrome Web Store',
        previewUrl:
          '/chrome-web-store/stars/ogffaloegjglncjfehdfplabnoondfjo.svg',
        keywords: ['chrome'],
      },
      {
        title: 'Chrome Web Store',
        previewUrl:
          '/chrome-web-store/rating-count/ogffaloegjglncjfehdfplabnoondfjo.svg',
        keywords: ['chrome'],
      },
      {
        title: 'Mozilla Add-on',
        previewUrl: '/amo/rating/dustman.svg',
        keywords: ['amo', 'firefox'],
      },
      {
        title: 'Mozilla Add-on',
        previewUrl: '/amo/stars/dustman.svg',
        keywords: ['amo', 'firefox'],
      },
      {
        title: 'Plugin on redmine.org',
        previewUrl:
          '/redmine/plugin/rating/redmine_xlsx_format_issue_exporter.svg',
        keywords: ['redmine', 'plugin'],
      },
      {
        title: 'Plugin on redmine.org',
        previewUrl:
          '/redmine/plugin/stars/redmine_xlsx_format_issue_exporter.svg',
        keywords: ['redmine', 'plugin'],
      },
      {
        title: 'Vaadin Directory',
        previewUrl: '/vaadin-directory/rating/vaadinvaadin-grid.svg',
        keywords: ['vaadin-directory', 'vaadin directory', 'rating'],
      },
      {
        title: 'Vaadin Directory',
        previewUrl: '/vaadin-directory/stars/vaadinvaadin-grid.svg',
        keywords: ['vaadin-directory', 'vaadin directory', 'star', 'stars'],
      },
      {
        title: 'Vaadin Directory',
        previewUrl: '/vaadin-directory/rating-count/vaadinvaadin-grid.svg',
        keywords: [
          'vaadin-directory',
          'vaadin directory',
          'rating-count',
          'rating count',
        ],
      },
      {
        title: 'Visual Studio Marketplace',
        previewUrl: '/vscode-marketplace/r/ritwickdey.LiveServer.svg',
        keywords: ['vscode-marketplace'],
      },
      {
        title: 'StackExchange',
        previewUrl: '/stackexchange/tex/r/951.svg',
      },
    ],
  },
  {
    category: {
      id: 'social',
      name: 'Social',
    },
    examples: [
      {
        title: 'GitHub forks',
        previewUrl: '/github/forks/badges/shields.svg?style=social&label=Fork',
        documentation: githubDoc,
      },
      {
        title: 'GitHub stars',
        previewUrl: '/github/stars/badges/shields.svg?style=social&label=Stars',
        documentation: githubDoc,
      },
      {
        title: 'GitHub watchers',
        previewUrl:
          '/github/watchers/badges/shields.svg?style=social&label=Watch',
        documentation: githubDoc,
      },
      {
        title: 'GitHub followers',
        previewUrl: '/github/followers/espadrine.svg?style=social&label=Follow',
        documentation: githubDoc,
      },
    ],
  },
  {
    category: {
      id: 'version',
      name: 'Version',
    },
    examples: [
      {
        title: 'LuaRocks',
        previewUrl: '/luarocks/v/mpeterv/luacheck.svg',
        keywords: ['lua'],
      },
      {
        title: 'Hackage',
        previewUrl: '/hackage/v/lens.svg',
      },
      {
        title: 'Crates.io',
        previewUrl: '/crates/v/rustc-serialize.svg',
        keywords: ['Rust'],
      },
      {
        title: 'Packagist',
        previewUrl: '/packagist/v/symfony/symfony.svg',
        keywords: ['PHP'],
      },
      {
        title: 'Packagist Pre Release',
        previewUrl: '/packagist/vpre/symfony/symfony.svg',
        keywords: ['PHP'],
      },
      {
        title: 'GitHub tag (latest SemVer)',
        previewUrl: '/github/tag/expressjs/express.svg',
        documentation: githubDoc,
      },
      {
        title: 'GitHub tag (latest SemVer pre-release)',
        previewUrl: '/github/tag-pre/expressjs/express.svg',
        documentation: githubDoc,
      },
      {
        title: 'GitHub tag (latest by date)',
        previewUrl: '/github/tag-date/expressjs/express.svg',
        documentation: githubDoc,
      },
      {
        title: 'GitHub package version',
        previewUrl: '/github/package-json/v/badges/shields.svg',
        documentation: githubDoc,
      },
      {
        title: 'GitHub manifest version',
        previewUrl: '/github/manifest-json/v/RedSparr0w/IndieGala-Helper.svg',
        documentation: githubDoc,
      },
      {
        title: 'GitHub release',
        previewUrl: '/github/release/qubyte/rubidium.svg',
        documentation: githubDoc,
      },
      {
        title: 'GitHub (pre-)release',
        previewUrl: '/github/release-pre/qubyte/rubidium.svg',
        documentation: githubDoc,
      },
      {
        title: 'GitHub commits',
        previewUrl: '/github/commits-since/SubtitleEdit/subtitleedit/3.4.7.svg',
        keywords: ['GitHub', 'commit'],
        documentation: githubDoc,
      },
      {
        title: 'GitHub commits (since latest release)',
        previewUrl:
          '/github/commits-since/SubtitleEdit/subtitleedit/latest.svg',
        keywords: ['GitHub', 'commit'],
        documentation: githubDoc,
      },
      {
        title: 'NuGet',
        previewUrl: '/nuget/v/Nuget.Core.svg',
      },
      {
        title: 'NuGet Pre Release',
        previewUrl: '/nuget/vpre/Microsoft.AspNet.Mvc.svg',
      },
      {
        title: 'MyGet',
        previewUrl: '/myget/mongodb/v/MongoDB.Driver.Core.svg',
      },
      {
        title: 'MyGet Pre Release',
        previewUrl: '/myget/yolodev/vpre/YoloDev.Dnx.FSharp.svg',
      },
      {
        title: 'MyGet tenant',
        previewUrl:
          '/dotnet.myget/dotnet-coreclr/v/Microsoft.DotNet.CoreCLR.svg',
      },
      {
        title: 'Chocolatey',
        previewUrl: '/chocolatey/v/git.svg',
      },
      {
        title: 'PowerShell Gallery',
        previewUrl: '/powershellgallery/v/Zyborg.Vault.svg',
      },
      {
        title: 'Puppet Forge',
        previewUrl: '/puppetforge/v/vStone/percona.svg',
      },
      {
        title: 'Sonatype Nexus (Releases)',
        previewUrl:
          '/nexus/r/https/oss.sonatype.org/com.google.guava/guava.svg',
      },
      {
        title: 'Sonatype Nexus (Snapshots)',
        previewUrl:
          '/nexus/s/https/oss.sonatype.org/com.google.guava/guava.svg',
      },
      {
        title: 'CPAN',
        previewUrl: '/cpan/v/Config-Augeas.svg',
        keywords: ['perl'],
      },
      {
        title: 'CRAN',
        previewUrl: '/cran/v/devtools.svg',
        keywords: ['R'],
      },
      {
        title: 'DUB',
        previewUrl: '/dub/v/vibe-d.svg',
        keywords: ['dub'],
      },
      {
        title: 'Chrome Web Store',
        previewUrl: '/chrome-web-store/v/ogffaloegjglncjfehdfplabnoondfjo.svg',
        keywords: ['chrome'],
      },
      {
        title: 'Mozilla Add-on',
        previewUrl: '/amo/v/dustman.svg',
        keywords: ['amo', 'firefox'],
      },
      {
        title: 'Visual Studio Marketplace',
        previewUrl: '/vscode-marketplace/v/ritwickdey.LiveServer.svg',
        keywords: ['vscode-marketplace'],
      },

      {
        title: 'JetBrains IntelliJ Plugins',
        previewUrl: '/jetbrains/plugin/v/9630-a8translate.svg',
      },
      {
        title: 'JetBrains ReSharper Plugins',
        previewUrl: '/resharper/v/ReSharper.Nuke.svg',
      },
      {
        title: 'JetBrains ReSharper Plugins Pre-release',
        previewUrl: '/resharper/vpre/ReSharper.Nuke.svg',
      },
      {
        title: 'Vaadin Directory',
        previewUrl: '/vaadin-directory/v/vaadinvaadin-grid.svg',
        keywords: [
          'vaadin-directory',
          'vaadin directory',
          'version',
          'latest version',
        ],
      },
    ],
  },
  {
    category: {
      id: 'platform-support',
      name: 'Platform & Version Support',
    },
    examples: [],
  },
  {
    category: {
      id: 'monitoring',
      name: 'Monitoring',
    },
    examples: [],
  },
  {
    category: {
      id: 'other',
      name: 'Other',
    },
    examples: [
      {
        title: 'GitHub Release Date',
        previewUrl: '/github/release-date/SubtitleEdit/subtitleedit.svg',
        keywords: ['GitHub', 'release', 'date'],
        documentation: githubDoc,
      },
      {
        title: 'GitHub (Pre-)Release Date',
        previewUrl: '/github/release-date-pre/Cockatrice/Cockatrice.svg',
        keywords: ['GitHub', 'release', 'date'],
        documentation: githubDoc,
      },
      {
        title: 'GitHub pull request check state',
        previewUrl: '/github/status/s/pulls/badges/shields/1110.svg',
        keywords: ['GitHub', 'pullrequest', 'detail', 'check'],
        documentation: githubDoc,
      },
      {
        title: 'GitHub pull request check contexts',
        previewUrl: '/github/status/contexts/pulls/badges/shields/1110.svg',
        keywords: ['GitHub', 'pullrequest', 'detail', 'check'],
        documentation: githubDoc,
      },
      {
        title: 'GitHub commit merge status',
        previewUrl:
          '/github/commit-status/badges/shields/master/5d4ab86b1b5ddfb3c4a70a70bd19932c52603b8c.svg',
        keywords: ['GitHub', 'commit', 'branch', 'merge'],
        documentation: githubDoc,
      },
      {
        title: 'GitHub contributors',
        previewUrl: '/github/contributors/cdnjs/cdnjs.svg',
        keywords: ['GitHub', 'contributor'],
        documentation: githubDoc,
      },
      {
        title: 'GitHub search hit counter',
        previewUrl: '/github/search/torvalds/linux/goto.svg',
        keywords: ['GitHub', 'search', 'hit', 'counter'],
        documentation: githubDoc,
      },
      {
        title: 'GitHub commit activity the past week, 4 weeks, year',
        previewUrl: '/github/commit-activity/y/eslint/eslint.svg',
        keywords: ['GitHub', 'commit', 'commits', 'activity'],
        documentation: githubDoc,
      },
      {
        title: 'GitHub last commit',
        previewUrl: '/github/last-commit/google/skia.svg',
        keywords: ['GitHub', 'last', 'latest', 'commit'],
        documentation: githubDoc,
      },
      {
        title: 'GitHub last commit (branch)',
        previewUrl: '/github/last-commit/google/skia/infra/config.svg',
        keywords: ['GitHub', 'last', 'latest', 'commit'],
        documentation: githubDoc,
      },
      {
        title: 'GitHub top language',
        previewUrl: '/github/languages/top/badges/shields.svg',
        keywords: ['GitHub', 'top', 'language'],
        documentation: githubDoc,
      },
      {
        title: 'GitHub language count',
        previewUrl: '/github/languages/count/badges/shields.svg',
        keywords: ['GitHub', 'language', 'count'],
        documentation: githubDoc,
      },
      {
        title: 'Puppet Forge',
        previewUrl: '/puppetforge/e/camptocamp/openssl.svg',
      },
      {
        title: 'Puppet Forge',
        previewUrl: '/puppetforge/f/camptocamp/openssl.svg',
      },
      {
        title: 'Puppet Forge',
        previewUrl: '/puppetforge/rc/camptocamp.svg',
      },
      {
        title: 'Puppet Forge',
        previewUrl: '/puppetforge/mc/camptocamp.svg',
      },
      {
        title: 'Chrome Web Store',
        previewUrl:
          '/chrome-web-store/users/ogffaloegjglncjfehdfplabnoondfjo.svg',
        keywords: ['chrome'],
      },
      {
        title: 'Mozilla Add-on',
        previewUrl: '/amo/users/dustman.svg',
        keywords: ['amo', 'firefox'],
      },
      {
        title: 'Vaadin Directory',
        previewUrl: '/vaadin-directory/status/vaadinvaadin-grid.svg',
        keywords: ['vaadin-directory', 'vaadin directory', 'status'],
      },
      {
        title: 'Vaadin Directory',
        previewUrl: '/vaadin-directory/release-date/vaadinvaadin-grid.svg',
        keywords: [
          'vaadin-directory',
          'vaadin directory',
          'date',
          'latest release date',
        ],
      },
      {
        title: 'StackExchange',
        previewUrl: '/stackexchange/stackoverflow/t/augeas.svg',
      },
    ],
  },
]

function findCategory(wantedCategory) {
  return allBadgeExamples.find(
    thisCat => thisCat.category.id === wantedCategory
  )
}

function loadExamples() {
  loadServiceClasses().forEach(ServiceClass => {
    const prepared = ServiceClass.prepareExamples()
    if (prepared.length === 0) {
      return
    }
    const category = findCategory(ServiceClass.category)
    if (category === undefined) {
      throw Error(
        `Unknown category ${ServiceClass.category} referenced in ${
          ServiceClass.name
        }`
      )
    }
    category.examples = category.examples.concat(prepared)
  })
}
loadExamples()

module.exports = allBadgeExamples
module.exports.findCategory = findCategory
