'use strict'

const anafanafo = require('anafanafo')
const { brightness } = require('./color')
const { XmlElement, NullElement, ElementList, escapeXml } = require('./xml')

// https://github.com/badges/shields/pull/1132
const FONT_SCALE_UP_FACTOR = 10
const FONT_SCALE_DOWN_VALUE = 'scale(.1)'

const FONT_FAMILY = 'Verdana,Geneva,DejaVu Sans,sans-serif'
const WIDTH_FONT = '11px Verdana'
const socialFontFamily =
  'font-family="Helvetica Neue,Helvetica,Arial,sans-serif"'
const brightnessThreshold = 0.69

function capitalize(s) {
  return `${s.charAt(0).toUpperCase()}${s.slice(1)}`
}

function colorsForBackground(color) {
  if (brightness(color) <= brightnessThreshold) {
    return { textColor: '#fff', shadowColor: '#010101' }
  } else {
    return { textColor: '#333', shadowColor: '#ccc' }
  }
}

function roundUpToOdd(val) {
  return val % 2 === 0 ? val + 1 : val
}

function preferredWidthOf(str, options) {
  // Increase chances of pixel grid alignment.
  return roundUpToOdd(anafanafo(str, options) | 0)
}

function createAccessibleText({ label, message }) {
  const labelPrefix = label ? `${label}: ` : ''
  return labelPrefix + message
}

function hasLinks({ links }) {
  const [leftLink, rightLink] = links || []
  const hasLeftLink = leftLink && leftLink.length
  const hasRightLink = rightLink && rightLink.length
  const hasLink = hasLeftLink && hasRightLink
  return { hasLink, hasLeftLink, hasRightLink }
}

function shouldWrapBodyWithLink({ links }) {
  const { hasLeftLink, hasRightLink } = hasLinks({ links })
  return hasLeftLink && !hasRightLink
}

function renderAriaAttributes({ accessibleText, links }) {
  const { hasLink } = hasLinks({ links })
  return hasLink ? '' : `role="img" aria-label="${escapeXml(accessibleText)}"`
}

function renderTitle({ accessibleText, links }) {
  const { hasLink } = hasLinks({ links })
  return hasLink ? '' : `<title>${escapeXml(accessibleText)}</title>`
}

function renderLogo({
  logo,
  badgeHeight,
  horizPadding,
  logoWidth = 14,
  logoPadding = 0,
}) {
  if (logo) {
    const logoHeight = 14
    const y = (badgeHeight - logoHeight) / 2
    const x = horizPadding
    return {
      hasLogo: true,
      totalLogoWidth: logoWidth + logoPadding,
      renderedLogo: `<image x="${x}" y="${y}" width="${logoWidth}" height="${logoHeight}" xlink:href="${escapeXml(
        logo
      )}"/>`,
    }
  } else {
    return { hasLogo: false, totalLogoWidth: 0, renderedLogo: '' }
  }
}

function renderBadge(
  { links, leftWidth, rightWidth, height, accessibleText },
  main
) {
  const width = leftWidth + rightWidth
  const leftLink = escapeXml(links[0])

  return `
    <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${width}" height="${height}" ${renderAriaAttributes(
    { links, accessibleText }
  )}>

    ${renderTitle({ accessibleText, links })}
    ${
      shouldWrapBodyWithLink({ links })
        ? `<a target="_blank" xlink:href="${leftLink}">${main}</a>`
        : main
    }
    </svg>`
}

class Badge {
  static get height() {
    throw new Error('Not implemented')
  }

  static get verticalMargin() {
    throw new Error('Not implemented')
  }

  static get shadow() {
    throw new Error('Not implemented')
  }

  constructor({
    label,
    message,
    links,
    logo,
    logoWidth,
    logoPadding,
    color = '#4c1',
    labelColor,
  }) {
    const horizPadding = 5
    const hasLogo = !!logo
    const totalLogoWidth = logoWidth + logoPadding
    const accessibleText = createAccessibleText({ label, message })

    const hasLabel = label.length || labelColor
    if (labelColor == null) {
      labelColor = '#555'
    }
    labelColor = hasLabel || hasLogo ? labelColor : color

    const labelMargin = totalLogoWidth + 1
    const labelWidth = label.length
      ? preferredWidthOf(label, { font: WIDTH_FONT })
      : 0
    const leftWidth = hasLabel
      ? labelWidth + 2 * horizPadding + totalLogoWidth
      : 0

    const messageWidth = preferredWidthOf(message, { font: WIDTH_FONT })
    let messageMargin = leftWidth - (message.length ? 1 : 0)
    if (!hasLabel) {
      if (hasLogo) {
        messageMargin = messageMargin + totalLogoWidth + horizPadding
      } else {
        messageMargin = messageMargin + 1
      }
    }
    let rightWidth = messageWidth + 2 * horizPadding
    if (hasLogo && !hasLabel) {
      rightWidth += totalLogoWidth + horizPadding - 1
    }

    const width = leftWidth + rightWidth

    this.horizPadding = horizPadding
    this.hasLogo = hasLogo
    this.labelMargin = labelMargin
    this.messageMargin = messageMargin
    this.links = links
    this.labelWidth = labelWidth
    this.messageWidth = messageWidth
    this.leftWidth = leftWidth
    this.rightWidth = rightWidth
    this.width = width
    this.labelColor = labelColor
    this.color = color
    this.label = label
    this.message = message
    this.accessibleText = accessibleText
    this.logo = logo
    this.logoWidth = logoWidth

    this.logoElement = this.getLogoElement()
    this.foregroundGroupElement = this.getForegroundGroupElement()
  }

  static render(params) {
    return new this(params).render()
  }

  getLogoElement() {
    const logoHeight = 14
    if (!this.hasLogo) {
      return new NullElement()
    }
    return new XmlElement({
      name: 'image',
      attrs: {
        x: this.horizPadding,
        y: 0.5 * (this.constructor.height - logoHeight),
        width: this.logoWidth,
        height: logoHeight,
        'xlink:href': this.logo,
      },
    })
  }

  getTextElement({ leftMargin, content, link, color, textWidth, linkWidth }) {
    if (!content.length) {
      return new NullElement()
    }

    const { textColor, shadowColor } = colorsForBackground(color)
    const x =
      FONT_SCALE_UP_FACTOR * (leftMargin + 0.5 * textWidth + this.horizPadding)

    const text = new XmlElement({
      name: 'text',
      content: [content],
      attrs: {
        x,
        y: 140 + this.constructor.verticalMargin,
        transform: FONT_SCALE_DOWN_VALUE,
        fill: textColor,
        textLength: FONT_SCALE_UP_FACTOR * textWidth,
      },
    })

    const shadowText = new XmlElement({
      name: 'text',
      content: [content],
      attrs: {
        'aria-hidden': 'true',
        x,
        y: 150 + this.constructor.verticalMargin,
        fill: shadowColor,
        'fill-opacity': '.3',
        transform: FONT_SCALE_DOWN_VALUE,
        textLength: FONT_SCALE_UP_FACTOR * textWidth,
      },
    })
    const shadow = this.constructor.shadow ? shadowText : new NullElement()

    if (!link) {
      return new ElementList({ content: [shadow, text] })
    }

    const rect = new XmlElement({
      name: 'rect',
      attrs: {
        width: linkWidth,
        x: leftMargin > 1 ? leftMargin + 1 : 0,
        height: this.constructor.height,
        fill: 'rgba(0,0,0,0)',
      },
    })
    return new XmlElement({
      name: 'a',
      content: [rect, shadow, text],
      attrs: { target: '_blank', 'xlink:href': link },
    })
  }

  getLabelElement() {
    const leftLink = this.links[0]
    return this.getTextElement({
      leftMargin: this.labelMargin,
      content: this.label,
      link: !shouldWrapBodyWithLink({ links: this.links }) && leftLink,
      color: this.labelColor,
      textWidth: this.labelWidth,
      linkWidth: this.leftWidth,
    })
  }

  getMessageElement() {
    const rightLink = this.links[1]
    return this.getTextElement({
      leftMargin: this.messageMargin,
      content: this.message,
      link: rightLink,
      color: this.messageColor,
      textWidth: this.messageWidth,
      linkWidth: this.rightWidth,
    })
  }

  getClipPathElement(rx) {
    return new XmlElement({
      name: 'clipPath',
      content: [
        new XmlElement({
          name: 'rect',
          attrs: {
            width: this.width,
            height: this.constructor.height,
            rx,
            fill: '#fff',
          },
        }),
      ],
      attrs: { id: 'r' },
    })
  }

  getBackgroundGroupElement({ withGradient, attrs }) {
    const leftRect = new XmlElement({
      name: 'rect',
      attrs: {
        width: this.leftWidth,
        height: this.constructor.height,
        fill: this.labelColor,
      },
    })
    const rightRect = new XmlElement({
      name: 'rect',
      attrs: {
        x: this.leftWidth,
        width: this.rightWidth,
        height: this.constructor.height,
        fill: this.color,
      },
    })
    const gradient = new XmlElement({
      name: 'rect',
      attrs: {
        width: this.width,
        height: this.constructor.height,
        fill: 'url(#s)',
      },
    })
    const content = withGradient
      ? [leftRect, rightRect, gradient]
      : [leftRect, rightRect]
    return new XmlElement({ name: 'g', content, attrs })
  }

  getForegroundGroupElement() {
    return new XmlElement({
      name: 'g',
      content: [
        this.logoElement,
        this.getLabelElement(),
        this.getMessageElement(),
      ],
      attrs: {
        fill: '#fff',
        'text-anchor': 'middle',
        'font-family': FONT_FAMILY,
        'text-rendering': 'geometricPrecision',
        'font-size': '110',
      },
    })
  }

  render() {
    throw new Error('Not implemented')
  }
}

class Plastic extends Badge {
  static get height() {
    return 18
  }

  static get verticalMargin() {
    return -10
  }

  static get shadow() {
    return true
  }

  render() {
    const gradient = new XmlElement({
      name: 'linearGradient',
      content: [
        new XmlElement({
          name: 'stop',
          attrs: { offset: '0', 'stop-color': '#fff', 'stop-opacity': '.7' },
        }),
        new XmlElement({
          name: 'stop',
          attrs: { offset: '.1', 'stop-color': '#aaa', 'stop-opacity': '.1' },
        }),
        new XmlElement({
          name: 'stop',
          attrs: { offset: '.9', 'stop-color': '#000', 'stop-opacity': '.3' },
        }),
        new XmlElement({
          name: 'stop',
          attrs: { offset: '1', 'stop-color': '#000', 'stop-opacity': '.5' },
        }),
      ],
      attrs: { id: 's', x2: '0', y2: '100%' },
    })

    const clipPath = this.getClipPathElement(4)

    const backgroundGroup = this.getBackgroundGroupElement({
      withGradient: true,
      attrs: { 'clip-path': 'url(#r)' },
    })

    return renderBadge(
      {
        links: this.links,
        leftWidth: this.leftWidth,
        rightWidth: this.rightWidth,
        accessibleText: this.accessibleText,
        height: this.constructor.height,
      },
      [
        gradient.render(),
        clipPath.render(),
        backgroundGroup.render(),
        this.foregroundGroupElement.render(),
      ].join('')
    )
  }
}

class Flat extends Badge {
  static get height() {
    return 20
  }

  static get verticalMargin() {
    return 0
  }

  static get shadow() {
    return true
  }

  render() {
    const gradient = new XmlElement({
      name: 'linearGradient',
      content: [
        new XmlElement({
          name: 'stop',
          attrs: { offset: '0', 'stop-color': '#bbb', 'stop-opacity': '.1' },
        }),
        new XmlElement({
          name: 'stop',
          attrs: { offset: '1', 'stop-opacity': '.1' },
        }),
      ],
      attrs: { id: 's', x2: '0', y2: '100%' },
    })

    const clipPath = this.getClipPathElement(3)

    const backgroundGroup = this.getBackgroundGroupElement({
      withGradient: true,
      attrs: { 'clip-path': 'url(#r)' },
    })

    return renderBadge(
      {
        links: this.links,
        leftWidth: this.leftWidth,
        rightWidth: this.rightWidth,
        accessibleText: this.accessibleText,
        height: this.constructor.height,
      },
      [
        gradient.render(),
        clipPath.render(),
        backgroundGroup.render(),
        this.foregroundGroupElement.render(),
      ].join('')
    )
  }
}

class FlatSquare extends Badge {
  static get height() {
    return 20
  }

  static get verticalMargin() {
    return 0
  }

  static get shadow() {
    return false
  }

  render() {
    const backgroundGroup = this.getBackgroundGroupElement({
      withGradient: false,
      attrs: { 'shape-rendering': 'crispEdges' },
    })

    return renderBadge(
      {
        links: this.links,
        leftWidth: this.leftWidth,
        rightWidth: this.rightWidth,
        accessibleText: this.accessibleText,
        height: this.constructor.height,
      },
      [backgroundGroup.render(), this.foregroundGroupElement.render()].join('')
    )
  }
}

function social({
  label,
  message,
  links = [],
  logo,
  logoWidth,
  logoPadding,
  color = '#4c1',
  labelColor = '#555',
}) {
  // Social label is styled with a leading capital. Convert to caps here so
  // width can be measured using the correct characters.
  label = capitalize(label)

  const externalHeight = 20
  const internalHeight = 19
  const labelHorizPadding = 5
  const messageHorizPadding = 4
  const horizGutter = 6
  const { totalLogoWidth, renderedLogo } = renderLogo({
    logo,
    badgeHeight: externalHeight,
    horizPadding: labelHorizPadding,
    logoWidth,
    logoPadding,
  })
  const hasMessage = message.length

  const font = 'bold 11px Helvetica'
  const labelTextWidth = preferredWidthOf(label, { font })
  const messageTextWidth = preferredWidthOf(message, { font })
  const labelRectWidth = labelTextWidth + totalLogoWidth + 2 * labelHorizPadding
  const messageRectWidth = messageTextWidth + 2 * messageHorizPadding

  let [leftLink, rightLink] = links
  leftLink = escapeXml(leftLink)
  rightLink = escapeXml(rightLink)
  const { hasLeftLink, hasRightLink, hasLink } = hasLinks({ links })

  const accessibleText = createAccessibleText({ label, message })

  function renderMessageBubble() {
    const messageBubbleMainX = labelRectWidth + horizGutter + 0.5
    const messageBubbleNotchX = labelRectWidth + horizGutter
    return `
      <rect x="${messageBubbleMainX}" y="0.5" width="${messageRectWidth}" height="${internalHeight}" rx="2" fill="#fafafa"/>
      <rect x="${messageBubbleNotchX}" y="7.5" width="0.5" height="5" stroke="#fafafa"/>
      <path d="M${messageBubbleMainX} 6.5 l-3 3v1 l3 3" stroke="d5d5d5" fill="#fafafa"/>
    `
  }

  function renderLabelText() {
    const labelTextX =
      10 * (totalLogoWidth + labelTextWidth / 2 + labelHorizPadding)
    const labelTextLength = 10 * labelTextWidth
    const escapedLabel = escapeXml(label)
    const shouldWrapWithLink = hasLeftLink && !shouldWrapBodyWithLink({ links })

    const rect = `<rect id="llink" stroke="#d5d5d5" fill="url(#a)" x=".5" y=".5" width="${labelRectWidth}" height="${internalHeight}" rx="2" />`
    const shadow = `<text aria-hidden="true" x="${labelTextX}" y="150" fill="#fff" transform="scale(.1)" textLength="${labelTextLength}">${escapedLabel}</text>`
    const text = `<text x="${labelTextX}" y="140" transform="scale(.1)" textLength="${labelTextLength}">${escapedLabel}</text>`

    return shouldWrapWithLink
      ? `
        <a target="_blank" xlink:href="${leftLink}">
          ${shadow}
          ${text}
          ${rect}
        </a>
      `
      : `
      ${rect}
      ${shadow}
      ${text}
    `
  }

  function renderMessageText() {
    const messageTextX =
      10 * (labelRectWidth + horizGutter + messageRectWidth / 2)
    const messageTextLength = 10 * messageTextWidth
    const escapedMessage = escapeXml(message)

    const rect = `<rect width="${messageRectWidth + 1}" x="${
      labelRectWidth + horizGutter
    }" height="${internalHeight + 1}" fill="rgba(0,0,0,0)" />`
    const shadow = `<text aria-hidden="true" x="${messageTextX}" y="150" fill="#fff" transform="scale(.1)" textLength="${messageTextLength}">${escapedMessage}</text>`
    const text = `<text id="rlink" x="${messageTextX}" y="140" transform="scale(.1)" textLength="${messageTextLength}">${escapedMessage}</text>`

    return hasRightLink
      ? `
        <a target="_blank" xlink:href="${rightLink}">
          ${rect}
          ${shadow}
          ${text}
        </a>
      `
      : `
      ${shadow}
      ${text}
    `
  }

  return renderBadge(
    {
      links,
      leftWidth: labelRectWidth + 1,
      rightWidth: hasMessage ? horizGutter + messageRectWidth : 0,
      accessibleText,
      height: externalHeight,
    },
    `
    <style>a:hover #llink{fill:url(#b);stroke:#ccc}a:hover #rlink{fill:#4183c4}</style>
    <linearGradient id="a" x2="0" y2="100%">
      <stop offset="0" stop-color="#fcfcfc" stop-opacity="0"/>
      <stop offset="1" stop-opacity=".1"/>
    </linearGradient>
    <linearGradient id="b" x2="0" y2="100%">
      <stop offset="0" stop-color="#ccc" stop-opacity=".1"/>
      <stop offset="1" stop-opacity=".1"/>
    </linearGradient>
    <g stroke="#d5d5d5">
      <rect stroke="none" fill="#fcfcfc" x="0.5" y="0.5" width="${labelRectWidth}" height="${internalHeight}" rx="2"/>
      ${hasMessage ? renderMessageBubble() : ''}
    </g>
    ${renderedLogo}
    <g aria-hidden="${!hasLink}" fill="#333" text-anchor="middle" ${socialFontFamily} text-rendering="geometricPrecision" font-weight="700" font-size="110px" line-height="14px">
      ${renderLabelText()}
      ${hasMessage ? renderMessageText() : ''}
    </g>
    `
  )
}

function forTheBadge({
  label,
  message,
  links,
  logo,
  logoWidth,
  color = '#4c1',
  labelColor,
}) {
  const FONT_SIZE = 10
  const BADGE_HEIGHT = 28
  const LOGO_HEIGHT = 14
  const TEXT_MARGIN = 12
  const LOGO_MARGIN = 9
  const LOGO_TEXT_GUTTER = 6
  const LETTER_SPACING = 1.25

  // Prepare content. For the Badge is styled in all caps. It's important to to
  // convert to uppercase first so the widths can be measured using the correct
  // symbols.
  label = label.toUpperCase()
  message = message.toUpperCase()

  const [leftLink, rightLink] = links
  const { hasLeftLink, hasRightLink } = hasLinks({ links })

  const outLabelColor = labelColor || '#555'

  // Compute text width.
  // TODO: This really should count the symbols rather than just using `.length`.
  // https://mathiasbynens.be/notes/javascript-unicode
  // This is not using `preferredWidthOf()` as it tends to produce larger
  // inconsistencies in the letter spacing. The badges look fine, however if you
  // replace `textLength` with `letterSpacing` in the rendered SVG, you can see
  // the discrepancy. Ideally, swapping out `textLength` for `letterSpacing`
  // should not affect the appearance.
  const labelTextWidth = label.length
    ? (anafanafo(label, { font: `${FONT_SIZE}px Verdana` }) | 0) +
      LETTER_SPACING * label.length
    : 0
  const messageTextWidth = message.length
    ? (anafanafo(message, { font: `bold ${FONT_SIZE}px Verdana` }) | 0) +
      LETTER_SPACING * message.length
    : 0

  // Compute horizontal layout.
  // If a `labelColor` is set, the logo is always set against it, even when
  // there is no label. When `needsLabelRect` is true, render a label rect and a
  // message rect; when false, only a message rect.
  const hasLabel = Boolean(label.length)
  const needsLabelRect = hasLabel || (logo && labelColor)
  let logoMinX, labelTextMinX
  if (logo) {
    logoMinX = LOGO_MARGIN
    labelTextMinX = logoMinX + logoWidth + LOGO_TEXT_GUTTER
  } else {
    labelTextMinX = TEXT_MARGIN
  }
  let labelRectWidth, messageTextMinX, messageRectWidth
  if (needsLabelRect) {
    if (hasLabel) {
      labelRectWidth = labelTextMinX + labelTextWidth + TEXT_MARGIN
    } else {
      labelRectWidth = 2 * LOGO_MARGIN + logoWidth
    }
    messageTextMinX = labelRectWidth + TEXT_MARGIN
    messageRectWidth = 2 * TEXT_MARGIN + messageTextWidth
  } else {
    if (logo) {
      messageTextMinX = TEXT_MARGIN + logoWidth + LOGO_TEXT_GUTTER
      messageRectWidth =
        2 * TEXT_MARGIN + logoWidth + LOGO_TEXT_GUTTER + messageTextWidth
    } else {
      messageTextMinX = TEXT_MARGIN
      messageRectWidth = 2 * TEXT_MARGIN + messageTextWidth
    }
  }

  const logoElement = new XmlElement({
    name: 'image',
    attrs: {
      x: logoMinX,
      y: 0.5 * (BADGE_HEIGHT - LOGO_HEIGHT),
      width: logoWidth,
      height: LOGO_HEIGHT,
      'xlink:href': logo,
    },
  })

  function getLabelElement() {
    const { textColor } = colorsForBackground(outLabelColor)
    const midX = labelTextMinX + 0.5 * labelTextWidth
    const text = new XmlElement({
      name: 'text',
      content: [label],
      attrs: {
        transform: FONT_SCALE_DOWN_VALUE,
        x: FONT_SCALE_UP_FACTOR * midX,
        y: 175,
        textLength: FONT_SCALE_UP_FACTOR * labelTextWidth,
        fill: textColor,
      },
    })

    if (hasLeftLink && !shouldWrapBodyWithLink({ links })) {
      const rect = new XmlElement({
        name: 'rect',
        attrs: {
          width: labelRectWidth,
          height: BADGE_HEIGHT,
          fill: 'rgba(0,0,0,0)',
        },
      })
      return new XmlElement({
        name: 'a',
        content: [rect, text],
        attrs: {
          target: '_blank',
          'xlink:href': leftLink,
        },
      })
    } else {
      return text
    }
  }

  function getMessageElement() {
    const { textColor } = colorsForBackground(color)
    const midX = messageTextMinX + 0.5 * messageTextWidth
    const text = new XmlElement({
      name: 'text',
      content: [message],
      attrs: {
        transform: FONT_SCALE_DOWN_VALUE,
        x: FONT_SCALE_UP_FACTOR * midX,
        y: 175,
        textLength: FONT_SCALE_UP_FACTOR * messageTextWidth,
        fill: textColor,
        'font-weight': 'bold',
      },
    })

    if (hasRightLink) {
      const rect = new XmlElement({
        name: 'rect',
        attrs: {
          width: messageRectWidth,
          height: BADGE_HEIGHT,
          x: labelRectWidth || 0,
          fill: 'rgba(0,0,0,0)',
        },
      })
      return new XmlElement({
        name: 'a',
        content: [rect, text],
        attrs: {
          target: '_blank',
          'xlink:href': rightLink,
        },
      })
    } else {
      return text
    }
  }

  let backgroundContent
  if (needsLabelRect) {
    backgroundContent = [
      new XmlElement({
        name: 'rect',
        attrs: {
          width: labelRectWidth,
          height: BADGE_HEIGHT,
          fill: outLabelColor,
        },
      }),
      new XmlElement({
        name: 'rect',
        attrs: {
          x: labelRectWidth,
          width: messageRectWidth,
          height: BADGE_HEIGHT,
          fill: color,
        },
      }),
    ]
  } else {
    backgroundContent = [
      new XmlElement({
        name: 'rect',
        attrs: {
          width: messageRectWidth,
          height: BADGE_HEIGHT,
          fill: color,
        },
      }),
    ]
  }

  const backgroundGroup = new XmlElement({
    name: 'g',
    content: backgroundContent,
    attrs: {
      'shape-rendering': 'crispEdges',
    },
  })
  const foregroundGroup = new XmlElement({
    name: 'g',
    content: [
      logo ? logoElement : '',
      hasLabel ? getLabelElement() : '',
      getMessageElement(),
    ],
    attrs: {
      fill: '#fff',
      'text-anchor': 'middle',
      'font-family': FONT_FAMILY,
      'text-rendering': 'geometricPrecision',
      'font-size': FONT_SCALE_UP_FACTOR * FONT_SIZE,
    },
  })

  // Render.
  return renderBadge(
    {
      links,
      leftWidth: labelRectWidth || 0,
      rightWidth: messageRectWidth,
      accessibleText: createAccessibleText({ label, message }),
      height: BADGE_HEIGHT,
    },
    [backgroundGroup.render(), foregroundGroup.render()].join('')
  )
}

module.exports = {
  plastic: params => Plastic.render(params),
  flat: params => Flat.render(params),
  'flat-square': params => FlatSquare.render(params),
  social,
  'for-the-badge': forTheBadge,
}
