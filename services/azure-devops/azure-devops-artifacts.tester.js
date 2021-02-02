'use strict'

// const Joi = require('joi')
const t = (module.exports = require('../tester').createServiceTester())
const {
  isVPlusTripleDottedVersion,
  isVPlusDottedVersionNClausesWithOptionalSuffix,
} = require('../test-validators')

// https://dev.azure.com/dotnet/NuGetPackageExplorer/_packaging?_a=feed&feed=BuildPackages is a public Azure DevOps project
// that this badge will also use for testing purposes

t.create('release package')
  .get(
    '/v/dotnet/NuGetPackageExplorer/BuildPackages/NuGetPackageExplorer.Core.json'
  )
  .expectBadge({
    label: 'Azure Artifacts NuGet',
    message: isVPlusTripleDottedVersion,
    color: 'blue',
  })

t.create('prerelease package')
  .get(
    '/vpre/dotnet/NuGetPackageExplorer/BuildPackages/Microsoft.Build.NuGetSdkResolver.json'
  )
  .expectBadge({
    label: 'Azure Artifacts NuGet',
    message: isVPlusDottedVersionNClausesWithOptionalSuffix,
    color: 'yellow',
  })
