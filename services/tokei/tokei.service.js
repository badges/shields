import { deprecatedService } from '../index.js'

export const Tokei = deprecatedService({
  category: 'size',
  route: {
    base: 'tokei/lines',
    pattern: ':various*',
  },
  label: 'tokei',
  dateAdded: new Date('2023-09-17'),
})
