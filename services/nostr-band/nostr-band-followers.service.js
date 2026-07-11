import { retiredService } from '../index.js'

export default retiredService({
  category: 'social',
  route: {
    base: 'nostrband/followers',
    pattern: ':npub',
  },
  label: 'nostrband',
  dateAdded: new Date('2025-11-22'),
})
