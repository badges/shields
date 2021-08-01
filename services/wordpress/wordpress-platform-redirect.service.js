import { redirector } from '../index.js'

export default redirector({
  category: 'platform-support',
  route: {
    base: 'wordpress/v',
    pattern: ':slug',
  },
  transformPath: ({ slug }) => `/wordpress/plugin/tested/${slug}`,
  dateAdded: new Date('2019-04-17'),
})
