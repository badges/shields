'use strict'

const OpencollectiveBase = require('./opencollective-base')

const documentation = `<h3>How to get the tierId</h3>
<p>According to <a target="_blank" href="https://developer.opencollective.com/#/api/collectives?id=get-members-per-tier">open collectives documentation</a>, you can find the tierId by looking at the URL after clicking on a Tier Card on the collective page. (e.g. tierId for https://opencollective.com/shields/order/2988 is 2988)</p>`

module.exports = class OpencollectiveByTier extends OpencollectiveBase {
  static get examples() {
    return [
      {
        title: 'open collective members by tier',
        namedParams: { collective: 'shields', tierId: '2988' },
        staticPreview: this.render(8, 'monthly backers'),
        keywords: ['opencollective'],
        documentation,
      },
    ]
  }

  static get defaultBadgeData() {
    return {
      label: 'unknown tier',
    }
  }

  static get route() {
    return this.buildRoute('tier', true)
  }

  async handle({ collective, tierId }) {
    const result = await this.fetchCollectiveBackersCount(collective, {
      tierId,
    })
    if (result.tier) {
      if (!result.tier.endsWith('s')) result.tier += 's'
    } else result.tier = 'new tier'
    return this.constructor.render(result.backersCount, result.tier)
  }
}
