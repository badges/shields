import { deprecatedService } from '../index.js'

export const VsoBuildRedirector = deprecatedService({
  category: 'build',
  label: 'vso',
  route: {
    base: 'vso/build',
    pattern: ':organization/:projectId/:definitionId/:branch*',
  },
  dateAdded: new Date('2025-12-20'),
  issueUrl: 'https://github.com/badges/shields/pull/11583',
})
export const VsoReleaseRedirector = deprecatedService({
  category: 'build',
  label: 'vso',
  route: {
    base: 'vso/release',
    pattern: ':organization/:projectId/:definitionId/:environmentId',
  },
  dateAdded: new Date('2025-12-20'),
  issueUrl: 'https://github.com/badges/shields/pull/11583',
})
