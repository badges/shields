import { createServiceFamily } from '../nuget/nuget-v2-service-family.js'

export default createServiceFamily({
  name: 'ResharperPlugin',
  defaultLabel: 'resharper',
  serviceBaseUrl: 'resharper',
  apiBaseUrl: 'https://resharper-plugins.jetbrains.com/api/v2',
  title: 'JetBrains ReSharper plugins',
  examplePackageName: 'StyleCop.StyleCop',
})
