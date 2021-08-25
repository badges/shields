import { floorCount as floorCountColor } from '../color-formatters.js'
import { BaseClearlyDefinedService, keywords } from './clearlydefined-base.js'

export default class ClearlyDefinedScore extends BaseClearlyDefinedService {
  static category = 'license'
  static route = { base: 'clearlydefined', pattern: ':type/:provider/:namespace/:name/:revision' }

  static examples = [
    {
      title: 'ClearlyDefined',
      pattern: ':type/:provider/:namespace/:name/:revision',
      namedParams: { type: 'git', provider: 'github', namespace: 'jquery', name: 'jquery', revision: '75f7e963708b60f37a42b777f35825d33c4f8e7a' },
      staticPreview: this.render({ score: 80 }),
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
