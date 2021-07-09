import { createServiceFamily } from '../nuget/nuget-v2-service-family.js'

export default createServiceFamily({
  name: 'ResharperPlugin',
  defaultLabel: 'resharper',
  serviceBaseUrl: 'resharper',
  apiBaseUrl: 'https://resharper-plugins.jetbrains.com/api/v2',
  odataFormat: 'xml',
  title: 'JetBrains ReSharper plugins',
  examplePackageName: 'StyleCop.StyleCop',
  exampleVersion: '2017.2.0',
  examplePrereleaseVersion: '2017.3.0-pre0001',
  exampleDownloadCount: 9e4,
})
