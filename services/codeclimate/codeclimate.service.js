import { retiredService } from '../index.js'

export const CodeClimate = retiredService({
  category: 'analysis',
  route: {
    base: 'codeclimate',
    pattern: ':various+',
  },
  label: 'codeclimate',
  dateAdded: new Date('2025-11-02'),
})
