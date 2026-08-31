import { retiredService } from '../index.js'

export default retiredService({
  category: 'downloads',
  route: {
    base: 'wikiapiary',
    pattern: ':various+',
  },
  label: 'wikiapiary',
  dateAdded: new Date('2025-11-30'),
})
