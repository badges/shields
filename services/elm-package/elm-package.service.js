'use strict'

const Joi = require('@hapi/joi')
const { renderVersionBadge } = require('../version')
const { semver } = require('../validators')
const { BaseJsonService } = require('..')

const schema = Joi.object({ version: semver }).required()

module.exports = class ElmPackage extends BaseJsonService {
  static get category() {
    return 'version'
  }

  static get route() {
    return {
      base: 'elm-package/v',
      pattern: ':user/:packageName',
    }
  }

  static get examples() {
    return [
      {
        title: 'Elm package',
        namedParams: { user: 'elm', packageName: 'core' },
        staticPreview: this.render({ version: '1.0.2' }),
      },
    ]
  }

  static get defaultBadgeData() {
    return {
      label: 'elm package',
    }
  }

  static render(props) {
    return renderVersionBadge(props)
  }

  async handle({ user, packageName }) {
    const url = `https://package.elm-lang.org/packages/${user}/${packageName}/latest/elm.json`
    const { version } = await this._requestJson({
      schema,
      url,
      errorMessages: {
        404: 'package not found',
      },
    })
    return this.constructor.render({ version })
  }
}
