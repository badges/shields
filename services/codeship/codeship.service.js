import { retiredService } from '../index.js'

export default retiredService({
  category: 'build',
  route: {
    base: 'codeship',
    pattern: ':various+',
  },
  label: 'codeship',
  dateAdded: new Date('2026-03-07'),
})
