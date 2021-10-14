import { InvalidResponse } from '../index.js'
import { BaseCratesService, keywords } from './crates-base.js'

export default class CratesLicense extends BaseCratesService {
  static category = 'license'
  static route = { base: 'crates/l', pattern: ':crate/:version?' }

  static examples = [
    {
      title: 'Crates.io',
      pattern: ':crate',
      namedParams: { crate: 'rustc-serialize' },
      staticPreview: this.render({ license: 'MIT/Apache-2.0' }),
      keywords,
    },
    {
      title: 'Crates.io',
      pattern: ':crate/:version',
      namedParams: { crate: 'rustc-serialize', version: '0.3.24' },
      staticPreview: this.render({ license: 'MIT/Apache-2.0' }),
      keywords,
    },
  ]

  static defaultBadgeData = { label: 'license', color: 'blue' }

  static render({ license: message }) {
    return { message }
  }

  static transform({ errors, version, versions }) {
    // crates.io returns a 200 response with an errors object in
    // error scenarios, e.g. https://crates.io/api/v1/crates/libc/0.1
    if (errors) {
      throw new InvalidResponse({ prettyMessage: errors[0].detail })
    }

    const license = version ? version.license : versions[0].license
    if (!license) {
      throw new InvalidResponse({ prettyMessage: 'invalid null license' })
    }

    return { license }
  }

  async handle({ crate, version }) {
    const json = await this.fetch({ crate, version })
    const { license } = this.constructor.transform(json)
    return this.constructor.render({ license })
  }
}
