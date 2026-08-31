import { retiredService } from '../index.js'

export default retiredService({
  category: 'social',
  route: {
    base: 'youtube',
    pattern: ':various+',
  },
  label: 'youtube',
  dateAdded: new Date('2026-08-23'),
})
