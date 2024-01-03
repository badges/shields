import { deprecatedService } from '../index.js'

const TravisPhpVersion = deprecatedService({
  category: 'platform-support',
  route: {
    base: 'travis/php-v',
    pattern: ':params+',
  },
  label: 'php',
  dateAdded: new Date('2023-05-13'),
})

export default TravisPhpVersion
