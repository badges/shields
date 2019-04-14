'use strict'

const Joi = require('joi')
const { renderBuildStatusBadge } = require('../build-status')
const JenkinsBase = require('./jenkins-base')

// https://github.com/jenkinsci/jenkins/blob/master/core/src/main/java/hudson/model/BallColor.java#L56
const schema = Joi.object({
  color: Joi.allow(
    'red',
    'red_anime',
    'yellow',
    'yellow_anime',
    'blue',
    'blue_anime',
    // green included for backwards compatibility
    'green',
    'green_anime',
    'grey',
    'grey_anime',
    'disabled',
    'disabled_anime',
    'aborted',
    'aborted_anime',
    'notbuilt',
    'notbuilt_anime'
  ).required(),
}).required()

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

module.exports = class JenkinsBuild extends JenkinsBase {
  static get category() {
    return 'build'
  }

  static get defaultBadgeData() {
    return {
      label: 'build',
    }
  }

  static get route() {
    return {
      base: 'jenkins/s',
      pattern: ':protocol(http|https)/:host+/:job+',
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

  async handle({ protocol, host, job }) {
    const jobPrefix = job.indexOf('/') > -1 ? '' : 'job/'
    const json = await this.fetch({
      url: `${protocol}://${host}/${jobPrefix}${job}/api/json`,
      schema,
      qs: { tree: 'color' },
    })
    const { status } = this.transform({ json })
    return this.constructor.render({ status })
  }
}
