'use strict'

const { loadServiceClasses } = require('../services')

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
    examples: [],
  },
  {
    category: {
      id: 'downloads',
      name: 'Downloads',
    },
    examples: [
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
    examples: [],
  },
  {
    category: {
      id: 'license',
      name: 'License',
    },
    examples: [
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
    examples: [],
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
