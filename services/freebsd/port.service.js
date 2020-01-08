'use strict'

const { renderVersionBadge } = require('../version')
const { BaseService, InvalidResponse } = require('..')

module.exports = class FreebsdPort extends BaseService {
  static get category() {
    return 'version'
  }

  static get route() {
    return {
      base: 'freebsd',
      pattern: ':category/:name',
    }
  }

  static get examples() {
    return [
      {
        title: 'FreeBSD port version',
        namedParams: {
          category: 'www',
          name: 'phalcon4',
        },
        staticPreview: renderVersionBadge({ version: '4.0.0' }),
      },
    ]
  }

  static get defaultBadgeData() {
    return { label: 'freebsd port' }
  }

  async fetch({ category, name }) {
    return this._request({
      url: `https://raw.githubusercontent.com/freebsd/freebsd-ports/master/${category}/${name}/Makefile`,
    })
  }

  async handle({ category, name }) {
    const { buffer } = await this.fetch({
      category,
      name,
    })
    try {
      const portversion = buffer.match(/PORTVERSION=\t([0-9.a-zA-Z]+)/im)
      const distversion = buffer.match(/DISTVERSION=\t([0-9.a-zA-Z]+)/im)
      let v
      if (portversion && portversion.length > 0) {
        v = portversion[1]
      } else if (distversion && distversion.length > 0) {
        v = distversion[1]
      } else {
        throw new InvalidResponse({
          prettyMessage: 'metadata in unexpected format',
        })
      }
      return renderVersionBadge({ version: v })
    } catch (e) {
      throw new InvalidResponse({
        prettyMessage: 'metadata in unexpected format',
      })
    }
  }
}
