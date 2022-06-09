import Joi from 'joi'
import { BaseJsonService } from '../index.js'

const schema = Joi.object({
  label: Joi.string().required(),
  message: Joi.string().required(),
  url: Joi.string().uri().required(),
}).required()

const logoSvg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="32px" height="32px" viewBox="0 0 32 32" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
<title>Group</title>
<g id="Badge" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
  <g id="Group">
      <rect id="Rectangle" x="0" y="0" width="32" height="32"></rect>
      <g id="Group-35" transform="translate(2.200000, 0.000000)">
          <polygon id="hexbg" fill="#FFFFFF" points="27.4027184 23.9658252 27.4027184 7.98912621 13.7017476 0 0 7.98912621 0 23.9658252 13.7017476 31.9541748"></polygon>
          <polygon id="hexyellow" fill="#FDBD27" points="0 19.4027184 13.7017476 11.4050485 27.4027184 19.4027184 27.4027184 23.9875728 13.7017476 31.9697087 0 23.9875728"></polygon>
          <polygon id="hexorange" fill="#F28A00" points="0 23.9774757 13.7017476 15.9549515 27.4027184 23.9774757 13.7017476 31.9852427"></polygon>
          <polygon id="hexred" fill="#FF5869" points="13.7017476 32 23.2714563 26.4163107 13.7017476 20.8209709 4.13126214 26.4163107"></polygon>
          <g id="arrow" transform="translate(8.635340, 2.873786)">
              <polygon id="SVGID" fill="#00A1E2" points="5.07961165 6.90407767 5.07961165 0.00699029126 10.1001942 9.81436893"></polygon>
              <polygon id="SVGID-2" fill="#0F1C4D" points="5.07961165 6.90407767 5.07961165 0.00699029126 0.0598058252 9.81436893"></polygon>
          </g>
      </g>
  </g>
</g>
</svg>
`

export default class SonatypeLift extends BaseJsonService {
  static category = 'analysis'

  static route = {
    base: 'sonatype/lift',
    pattern: ':user/:repo',
  }

  static examples = [
    {
      title: 'Sonatype Lift Installed',
      namedParams: {
        user: 'foo',
        repo: 'bar',
      },
      staticPreview: {
        message: 'Sonatype Lift',
      },
    },
  ]

  static defaultBadgeData = {
    label: 'Sonatype Lift',
    color: 'blue',
  }

  static render({ label, message, url }) {
    return {
      label,
      message,
      link: [url],
      logoSvg,
    }
  }

  async fetch({ user, repo }) {
    const url = `https://lift.sonatype.com/api/badge/${user}/${repo}`
    return this._requestJson({
      schema,
      url,
      errorMessages: {
        404: 'error',
      },
    })
  }

  async handle({ user, repo }) {
    const { label, message, url } = await this.fetch({ user, repo })
    return this.constructor.render({ label, message, url })
  }
}
