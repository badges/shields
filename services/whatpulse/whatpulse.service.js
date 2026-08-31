import { retiredService } from '../index.js'

export default retiredService({
  category: 'activity',
  label: 'whatpulse',
  route: {
    base: 'whatpulse',
    pattern: ':various+',
  },
  dateAdded: new Date('2026-08-02'),
})
