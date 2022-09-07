import Joi from 'joi'
import { redirector } from '../index.js'
import { optionalUrl } from '../validators.js'

const queryParamSchema = Joi.object({
  server: optionalUrl,
}).required()

export default redirector({
  category: 'platform-support',
  route: {
    base: 'packagist/php-v',
    pattern: ':user/:repo/:version?',
    queryParamSchema,
  },
  transformPath: ({ user, repo, version }) =>
    `/packagist/dependency-v/${user}/${repo}${version ? `/${version}` : ''}`,
  dateAdded: new Date('2022-09-07'),
})
