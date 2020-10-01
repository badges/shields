'use strict'

const prettyBytes = require('pretty-bytes')
const { NotFound } = require('..')
const BaseMicrobadgerService = require('./microbadger-base')

const documentation = `
<p>
  The MicroBadger API can sometimes be a bit temperamental when it comes to retrieving the size of your image.
  If the website indicates "Layer information not yet retrieved" for your image, Shields.io will display the size as unknown in its badge.
  In some cases, the size is also reported as 0.
</p>
<p>
  To speed things up on the MicroBadger side of things, you may want to hit their webhook manually.
  Simply go to your image's page on the MicroBadger website, click "Get the webhook" and follow the instructions listed there.
  Please be patient, it may still take several minutes for the information to be made available to Shields.io!
</p>
<p>
  Feel free to open an issue if you're still facing issues, but you may want to have a glance at some of these beforehand:
  <ul>
    <li>https://github.com/badges/shields/issues/3988</li>
    <li>https://github.com/badges/shields/issues/2532</li>
    <li>https://github.com/badges/shields/pull/1471#discussion_r165825062</li>
    <li>https://github.com/microscaling/microbadger/issues/38</li>
    <li>https://github.com/microscaling/microbadger/issues/47</li>
  </ul>
</p>
`

module.exports = class MicrobadgerSize extends BaseMicrobadgerService {
  static route = {
    base: 'microbadger/image-size',
    pattern: ':user/:repo/:tag*',
  }

  static examples = [
    {
      title: 'MicroBadger Size',
      pattern: ':user/:repo',
      namedParams: { user: 'fedora', repo: 'apache' },
      staticPreview: this.render({ size: 126000000 }),
      keywords: ['docker'],
      documentation,
    },
    {
      title: 'MicroBadger Size (tag)',
      pattern: ':user/:repo/:tag',
      namedParams: { user: 'fedora', repo: 'apache', tag: 'latest' },
      staticPreview: this.render({ size: 103000000 }),
      keywords: ['docker'],
      documentation,
    },
  ]

  static defaultBadgeData = {
    label: 'image size',
  }

  static render({ size }) {
    return {
      message: prettyBytes(parseInt(size)),
      color: 'blue',
    }
  }

  async handle({ user, repo, tag }) {
    const data = await this.fetch({ user, repo })
    const image = this.constructor.getImage(data, tag)
    if (image.DownloadSize === undefined) {
      throw new NotFound({ prettyMessage: 'unknown' })
    }
    return this.constructor.render({ size: image.DownloadSize })
  }
}
