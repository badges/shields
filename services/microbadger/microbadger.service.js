import { deprecatedService } from '../index.js'

export default deprecatedService({
  category: 'build',
  route: {
    base: 'microbadger',
    pattern: ':various+',
  },
  label: 'microbadger',
  dateAdded: new Date('2021-07-03'),
})
