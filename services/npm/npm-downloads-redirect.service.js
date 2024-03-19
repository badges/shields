import { redirector } from '../index.js'

export default redirector({
  category: 'downloads',
  route: {
    base: 'npm/dt',
    pattern: ':packageName+',
  },
  transformPath: ({ packageName }) => `/npm/d18m/${packageName}`,
  dateAdded: new Date('2024-03-19'),
})
