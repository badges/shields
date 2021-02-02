'use strict'

// const Joi = require('joi')
const t = (module.exports = require('../tester').createServiceTester())
const { isVPlusTripleDottedVersion } = require('../test-validators')

// https://dev.azure.com/dotnet/NuGetPackageExplorer/_packaging?_a=feed&feed=BuildPackages is a public Azure DevOps project
// that this badge will also use for testing purposes

t.create('named branch')
  .get(
    '/v/dotnet/NuGetPackageExplorer/BuildPackages/NuGetPackageExplorer.Core.json'
  )
  .expectBadge({
    label: 'Azure Artifacts NuGet',
    message: isVPlusTripleDottedVersion,
  })
//   .expectBadge({
//     label: 'Azure Artifacts NuGet',
//     // message: isBuildStatus,
//   })
