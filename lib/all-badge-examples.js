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
    examples: [],
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
    examples: [],
  },
  {
    category: {
      id: 'rating',
      name: 'Rating',
    },
    examples: [],
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
        title: 'JetBrains ReSharper Plugins',
        previewUrl: '/resharper/v/ReSharper.Nuke.svg',
      },
      {
        title: 'JetBrains ReSharper Plugins Pre-release',
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
    examples: [],
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
