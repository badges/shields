'use strict'

const Joi = require('@hapi/joi')
const { renderBuildStatusBadge } = require('../build-status')
const JenkinsBase = require('./jenkins-base')
const {
  buildTreeParamQueryString,
  buildUrl,
  queryParamSchema,
} = require('./jenkins-common')

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

module.exports = class JenkinsBuild extends JenkinsBase {
  static get category() {
    return 'build'
  }

  static get route() {
    return {
      base: 'jenkins/build',
      pattern: ':protocol(http|https)/:host/:job+',
      queryParamSchema,
    }
  }

  static get examples() {
    return [
      {
        title: 'Jenkins',
        namedParams: {
          protocol: 'https',
          host: 'jenkins.qa.ubuntu.com',
          job:
            'view/Precise/view/All%20Precise/job/precise-desktop-amd64_default',
        },
        staticPreview: renderBuildStatusBadge({ status: 'passing' }),
      },
    ]
  }

  static get defaultBadgeData() {
    return {
      label: 'build',
    }
  }

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

  async handle({ protocol, host, job }, { disableStrictSSL }) {
    const json = await this.fetch({
      url: buildUrl({ protocol, host, job, lastCompletedBuild: false }),
      schema,
      qs: buildTreeParamQueryString('color'),
      disableStrictSSL,
    })
    const { status } = this.transform({ json })
    return this.constructor.render({ status })
  }
}
