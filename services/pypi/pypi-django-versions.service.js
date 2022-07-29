import { redirector } from '../index.js'

export default redirector({
  category: 'platform-support',
  route: {
    base: 'pypi/djversions',
    pattern: ':packageName*',
  },
  transformPath: ({ packageName }) =>
    `/pypi/frameworkversions/Django/${packageName}`,
  dateAdded: new Date('2022-07-28'),
})
