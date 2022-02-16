import { deprecatedService } from '../index.js'

export default deprecatedService({
  category: 'dependencies',
  route: {
    base: 'requires',
    format: '(?:.+?)',
  },
  label: 'requirements',
  dateAdded: new Date('2022-02-05'),
})
