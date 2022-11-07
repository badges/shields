import { redirector } from '../../index.js'

export default redirector({
  category: 'social',
  route: { base: 'github/stars/gists', pattern: ':gistId' },
  transformPath: ({ gistId }) => `/github/gist/stars/${gistId}`,
  dateAdded: new Date('2022-10-09'),
})
