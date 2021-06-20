import { deprecatedService } from '../index.js'

export default deprecatedService({
  category: 'dependencies',
  route: {
    base: 'bithound',
    pattern: ':various*',
  },
  label: 'bithound',
  dateAdded: new Date('2018-07-08'),
})
