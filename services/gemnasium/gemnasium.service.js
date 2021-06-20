import { deprecatedService } from '../index.js'

export default deprecatedService({
  category: 'dependencies',
  route: {
    base: 'gemnasium',
    pattern: ':various+',
  },
  label: 'gemnasium',
  dateAdded: new Date('2018-05-15'),
})
