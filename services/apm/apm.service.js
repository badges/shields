import { deprecatedService } from '../index.js'

const APMDownloads = deprecatedService({
  category: 'downloads',
  route: {
    base: 'apm/dm',
    pattern: ':various*',
  },
  label: 'downloads',
  dateAdded: new Date('2023-01-04'),
})

const APMVersion = deprecatedService({
  category: 'version',
  route: {
    base: 'apm/v',
    pattern: ':various*',
  },
  label: 'apm',
  dateAdded: new Date('2023-01-04'),
})

const APMLicense = deprecatedService({
  category: 'license',
  route: {
    base: 'apm/l',
    pattern: ':various*',
  },
  label: 'license',
  dateAdded: new Date('2023-01-04'),
})

export { APMDownloads, APMVersion, APMLicense }
