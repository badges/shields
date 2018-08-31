'use strict'

const { fetchFromSvgAsPromise } = require('../../lib/svg-badge-parser')
const BaseHTTPService = require('../base-http')
const { NotFound } = require('../errors')

module.exports = class ReadTheDocs extends BaseHTTPService {
  static get category() {
    return 'build'
  }

  static get url() {
    return {
      base: 'readthedocs',
      format: '([^/]+)(?:/(.+))?',
      capture: ['project', 'version'],
    }
  }

  static get examples() {
    return [
      {
        title: 'Read the Docs',
        previewUrl: 'pip',
        keywords: ['documentation'],
      },
      {
        title: 'Read the Docs (version)',
        previewUrl: 'pip/stable',
        keywords: ['documentation'],
      },
    ]
  }

  static get defaultBadgeData() {
    return {
      label: 'docs',
    }
  }

  static render({ status }) {
    let color
    if (status === 'passing') {
      color = 'brightgreen'
    } else if (status === 'failing') {
      color = 'red'
    } else if (status === 'unknown') {
      color = 'yellow'
    } else {
      color = 'red'
    }

    return {
      message: status,
      color,
    }
  }

  async handle({ project, version }) {
    const status = await fetchFromSvgAsPromise(this, {
      url: `https://readthedocs.org/projects/${encodeURIComponent(
        project
      )}/badge/`,
    })

    if (status === 'unknown') {
      throw new NotFound({ prettyMessage: 'project or build not found' })
    }

    return this.constructor.render({ status })
  }
}
