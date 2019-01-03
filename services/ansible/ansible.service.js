'use strict'

const Joi = require('joi')
const BaseJsonService = require('../base-json')
const { downloadCount } = require('../../lib/color-formatters')
const { metric } = require('../../lib/text-formatters')
const { nonNegativeInteger } = require('../validators')

const ansibleRoleSchema = Joi.object({
  download_count: nonNegativeInteger,
  name: Joi.string().required(),
  summary_fields: Joi.object({
    namespace: Joi.object({
      name: Joi.string().required(),
    }),
  }),
}).required()

class AnsibleGalaxyRole extends BaseJsonService {
  async fetch({ roleId }) {
    const url = `https://galaxy.ansible.com/api/v1/roles/${roleId}/`
    return this._requestJson({
      url,
      schema: ansibleRoleSchema,
    })
  }
}

class AnsibleGalaxyRoleDownloads extends AnsibleGalaxyRole {
  static render({ downloads }) {
    return {
      message: metric(downloads),
      color: downloadCount(downloads),
    }
  }

  async handle({ roleId }) {
    const json = await this.fetch({ roleId })
    return this.constructor.render({ downloads: json.download_count })
  }

  static get defaultBadgeData() {
    return { label: 'role downloads' }
  }

  static get category() {
    return 'downloads'
  }

  static get route() {
    return {
      base: 'ansible/role/d',
      pattern: ':roleId',
    }
  }

  static get examples() {
    return [
      {
        title: `Ansible Role`,
        pattern: ':roleId',
        exampleUrl: '3078',
        staticExample: this.render({ downloads: 76 }),
      },
    ]
  }
}

class AnsibleGalaxyRoleName extends AnsibleGalaxyRole {
  static render({ name }) {
    return { message: name, color: 'blue' }
  }

  async handle({ roleId }) {
    const json = await this.fetch({ roleId })
    const name = `${json.summary_fields.namespace.name}.${json.name}`
    return this.constructor.render({ name })
  }

  static get defaultBadgeData() {
    return { label: 'role' }
  }

  static get category() {
    return 'other'
  }

  static get route() {
    return {
      base: 'ansible/role',
      format: '(.+)',
      capture: ['roleId'],
    }
  }

  static get examples() {
    return [
      {
        title: `Ansible Role`,
        pattern: ':roleId',
        exampleUrl: '3078',
        staticExample: this.render({
          name: 'ansible-roles.sublimetext3_packagecontrol',
        }),
      },
    ]
  }
}

module.exports = {
  AnsibleGalaxyRoleDownloads,
  AnsibleGalaxyRoleName,
}
