import { deprecatedService } from '../index.js'

export default deprecatedService({
  category: 'build',
  route: {
    base: 'shippable',
    format: '(?:.+?)',
  },
  label: 'shippable',
  dateAdded: new Date('2022-03-12'),
})
