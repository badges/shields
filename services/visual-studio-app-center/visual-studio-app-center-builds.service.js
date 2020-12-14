'use strict'

const Joi = require('joi')
const { isBuildStatus, renderBuildStatusBadge } = require('../build-status')
const { NotFound } = require('..')
const {
  BaseVisualStudioAppCenterService,
  keywords,
  documentation,
} = require('./visual-studio-app-center-base')

const schema = Joi.array().items({
  result: isBuildStatus.required(),
})

module.exports = class VisualStudioAppCenterBuilds extends (
  BaseVisualStudioAppCenterService
) {
  static category = 'build'

  static route = {
    base: 'visual-studio-app-center/builds',
    pattern: ':owner/:app/:branch/:token',
  }

  static examples = [
    {
      title: 'Visual Studio App Center Builds',
      namedParams: {
        owner: 'jct',
        app: 'my-amazing-app',
        branch: 'master',
        token: 'ac70cv...',
      },
      staticPreview: renderBuildStatusBadge({ status: 'succeeded' }),
      keywords,
      documentation,
    },
  ]

  static defaultBadgeData = {
    label: 'build',
  }

  async handle({ owner, app, branch, token }) {
    const json = await this.fetch({
      token,
      schema,
      url: `https://api.appcenter.ms/v0.1/apps/${owner}/${app}/branches/${branch}/builds`,
    })
    if (json[0] === undefined)
      // Fetch will return a 200 with no data if no builds were found.
      throw new NotFound({ prettyMessage: 'no builds found' })
    return renderBuildStatusBadge({ status: json[0].result })
  }
}
