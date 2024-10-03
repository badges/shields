import { createServiceFamily } from '../nuget/nuget-v2-service-family.js'

export default createServiceFamily({
  defaultLabel: 'chocolatey',
  serviceBaseUrl: 'chocolatey',
  apiBaseUrl: 'https://community.chocolatey.org/api/v2',
  title: 'Chocolatey',
  examplePackageName: 'git',
})
