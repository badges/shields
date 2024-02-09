import Joi from 'joi'
import { queryParam } from '../index.js'
import { renderBuildStatusBadge } from '../build-status.js'
import JenkinsBase from './jenkins-base.js'
import {
  buildTreeParamQueryString,
  buildUrl,
  queryParamSchema,
} from './jenkins-common.js'

// https://github.com/jenkinsci/jenkins/blob/master/core/src/main/java/hudson/model/BallColor.java#L56
const colorStatusMap = {
  red: 'failing',
  red_anime: 'building',
  yellow: 'unstable',
  yellow_anime: 'building',
  blue: 'passing',
  blue_anime: 'building',
  green: 'passing',
  green_anime: 'building',
  grey: 'not built',
  grey_anime: 'building',
  disabled: 'not built',
  disabled_anime: 'building',
  aborted: 'not built',
  aborted_anime: 'building',
  notbuilt: 'not built',
  notbuilt_anime: 'building',
}

const schema = Joi.object({
  color: Joi.allow(...Object.keys(colorStatusMap)).required(),
}).required()

export default class JenkinsBuild extends JenkinsBase {
  static category = 'build'

  static route = {
    base: 'jenkins',
    pattern: 'build',
    queryParamSchema,
  }

  static openApi = {
    '/jenkins/build': {
      get: {
        summary: 'Jenkins Build',
        parameters: [
          queryParam({
            name: 'jobUrl',
            example: 'https://ci.eclipse.org/jgit/job/jgit',
            required: true,
          }),
        ],
      },
    },
  }

  static defaultBadgeData = { label: 'build' }

  static render({ status }) {
    if (status === 'unstable') {
      return {
        message: status,
        color: 'yellow',
      }
    }

    return renderBuildStatusBadge({ status })
  }

  transform({ json }) {
    return { status: colorStatusMap[json.color] }
  }

  async handle(namedParams, { jobUrl }) {
    const json = await this.fetch({
      url: buildUrl({ jobUrl, lastCompletedBuild: false }),
      schema,
      searchParams: buildTreeParamQueryString('color'),
    })
    const { status } = this.transform({ json })
    return this.constructor.render({ status })
  }
}
