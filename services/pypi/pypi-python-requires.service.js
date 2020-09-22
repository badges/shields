'use strict'

const PypiBase = require('./pypi-base')
const { parsePyRequires } = require('./pypi-helpers')

module.exports = class PypiPythonRequires extends PypiBase {
  static get category() {
    return 'platform-support'
  }

  static get route() {
    return this.buildRoute('pypi/pyrequires')
  }

  static get examples() {
    return [
      {
        title: 'PyPI - Python Requires',
        pattern: ':packageName',
        namedParams: { packageName: 'Django' },
        staticPreview: this.render({ versions: '>=3.5, <=3.7' }),
      },
    ]
  }

  static get defaultBadgeData() {
    return { label: 'python' }
  }

  static render({ version }) {
    if (version) {
      return {
        message: version,
        color: 'blue',
      }
    } else {
      return {
        message: 'missing',
        color: 'red',
      }
    }
  }

  async handle({ egg }) {
    const packageData = await this.fetch({ egg })

    const version = parsePyRequires(
      packageData,
      /^(([><~]=?\d(?:\.\d)?(?:\.[*\d])?)(, )?)+$/
    )

    return this.constructor.render({ version })
  }
}
