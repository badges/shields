import { deprecatedService } from '../index.js'

export default deprecatedService({
  category: 'build',
  route: {
    base: 'continuousphp',
    pattern: ':various+',
  },
  label: 'continuousphp',
  dateAdded: new Date('2020-12-12'),
})
