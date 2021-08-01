import Joi from 'joi'
import { metric } from '../text-formatters.js'
import { nonNegativeInteger } from '../validators.js'
import { BaseJsonService } from '../index.js'

const schema = Joi.object({
  lines: nonNegativeInteger,
}).required()

const documentation = `
<p>
  The <code>provider</code> is the domain name of git host.
  If no TLD is provided, <code>.com</code> will be added.
  For example, setting <code>gitlab</code> or <code>bitbucket.org</code> as the
  provider also works.
  <br><br>
  Tokei will automatically count all files with a recognized extension. It will
  automatically ignore files and folders in <code>.ignore</code> files. If you
  want to ignore files or folders specifically for tokei, add them to the
  <code>.tokeignore</code> in the root of your repository.
  See 
    <a href="https://github.com/XAMPPRocky/tokei#excluding-folders">https://github.com/XAMPPRocky/tokei#excluding-folders</a>
  for more info.
</p>
`

export default class Tokei extends BaseJsonService {
  static category = 'size'

  static route = { base: 'tokei/lines', pattern: ':provider/:user/:repo' }

  static examples = [
    {
      title: 'Lines of code',
      namedParams: {
        provider: 'github',
        user: 'badges',
        repo: 'shields',
      },
      staticPreview: this.render({ lines: 119500 }),
      keywords: ['loc', 'tokei'],
      documentation,
    },
  ]

  static defaultBadgeData = {
    label: 'total lines',
    color: 'blue',
  }

  static render({ lines }) {
    return { message: metric(lines) }
  }

  async fetch({ provider, user, repo }) {
    // This request uses the tokei-rs (https://github.com/XAMPPRocky/tokei_rs) API.
    //
    // By default, the API returns an svg, but when the Accept HTTP header is set to
    // `application/json`, it sends json data. The `_requestJson` method
    // automatically sets the Accept Header to what we need, so we don't need to
    // specify it here.
    //
    // This behaviour of the API is "documented" here:
    // https://github.com/XAMPPRocky/tokei_rs/issues/8#issuecomment-475071147
    return this._requestJson({
      schema,
      url: `https://tokei.rs/b1/${provider}/${user}/${repo}`,
      errorMessages: {
        400: 'repo not found',
      },
    })
  }

  async handle({ provider, user, repo }) {
    const { lines } = await this.fetch({ provider, user, repo })
    return this.constructor.render({ lines })
  }
}
