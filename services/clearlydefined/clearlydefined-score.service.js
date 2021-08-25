import { floorCount as floorCountColor } from '../color-formatters.js'
import { BaseClearlyDefinedService, keywords } from './clearlydefined-base.js'

export default class ClearlyDefinedScore extends BaseClearlyDefinedService {
  static category = 'license'
  static route = { base: 'clearlydefined', pattern: ':type/:provider/:namespace/:name/:revision' }

  static examples = [
    {
      title: 'ClearlyDefined',
      pattern: ':type/:provider/:namespace/:name/:revision',
      namedParams: { type: 'npm', provider: 'npmjs', namespace: '-', name: 'jquery', revision: '3.4.1' },
      staticPreview: this.render({ score: 88 }),
      keywords,
    },
  ]

  static render({ score }) {
    score = Math.round(score)
    return {
      label: 'ClearlyDefined',
      message: `${score}/100`,
      color: floorCountColor(score, 40, 60, 100),
    }
  }

  async handle({ type, provider, namespace, name, revision }) {
    const data = await this.fetch({ type, provider, namespace, name, revision })
    return this.constructor.render({ score: data.score.effective })
  }
}
