'use strict'

const { BaseJsonService} = require('..')
const Joi = require('joi')
const { nonNegativeInteger } = require('../validators')
const { metric } = require('../text-formatters')

const schema = Joi.object({
  additions: nonNegativeInteger,
  deletions: nonNegativeInteger,
}).required()

module.exports = class PullAdditionsDeletions extends BaseJsonService {

  static get category() {
    return 'issue-tracking'
  }

  static get route() {
    return {
      base: 'github/pulls/detail/additions-deletions',
      pattern: ':owner/:repo/:pr',
    }
  }

  static get examples() {
    return [
      {
        title: 'Github PR\'s additions-deletions',
        namedParams: {
          owner: 'badges',
          repo: 'shields',
          pr: '3443'
        },
        staticPreview: {
          label: '+654',
          message: '-43',
          color: 'red',
          labelColor: 'brightgreen',
        }, 
      }, 
    ] 
  } 

  static get defaultBadgeData() { 
  	return { 
  		label: 'reddit', 
  	}
  }

  static render({ owner, repo, pull, additions, deletions }) {
    return {
      label: `+${additions}`,
      message: `-${deletions}`,
      color: 'red',
      labelColor: 'brightgreen',
      link: [`https://www.github.com/${owner}/${repo}/pulls/${pull}`],
    }
  }

  async fetch({ owner, repo, pull }) {
    return this._requestJson({
      schema,
      url: `https://api.github.com/repos/${owner}/${repo}/pulls/${pull}`,
      errorMessages: {
        404: 'Repo or PR not found',
      },
    })
  }

  transform(json) {
    const additions = json.additions
    const deletions = json.deletions
    if (additions  === undefined && deleitions === udefined) {
      throw new NotFound({ prettyMessage: 'Repo or PR not found' })
    }
    return {
      additions,
      deletions
    }
  }

  async handle({ owner, repo, pull }) {
    const json = await this.fetch({ owner, repo, pull })
    const { additions, deletions} = this.transform(json)
    return this.constructor.render({
      additions,
      deletions,
    })
  }
}