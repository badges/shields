import { deprecatedService } from '../index.js'

export default deprecatedService({
  category: 'build',
  route: {
    base: 'beerpay',
    pattern: ':various+',
  },
  label: 'beerpay',
  dateAdded: new Date('2021-07-03'),
})
