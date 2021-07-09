import { deprecatedService } from '../index.js'

export default deprecatedService({
  category: 'rating',
  route: {
    base: 'libscore/s',
    pattern: ':various+',
  },
  label: 'libscore',
  dateAdded: new Date('2018-09-22'),
})
