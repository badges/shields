import { redirector } from '../index.js'

// https://github.com/badges/shields/issues/8138
export default redirector({
  category: 'build',
  route: {
    base: 'gitlab/v/contributor',
    pattern: ':project+',
  },
  transformPath: ({ project }) => `/gitlab/contributors/${project}`,
  dateAdded: new Date('2022-06-29'),
})
