import { deprecatedService } from '../index.js'

export default deprecatedService({
  category: 'build',
  route: {
    base: 'codeship',
    pattern: ':various+',
  },
  label: 'codeship',
  dateAdded: new Date('2026-03-07'),
})
