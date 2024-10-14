'use strict'

const anafanafo = require('anafanafo')
const { brightness } = require('./color')
const { XmlElement, ElementList } = require('./xml')

// https://github.com/badges/shields/pull/1132
const FONT_SCALE_UP_FACTOR = 10
const FONT_SCALE_DOWN_VALUE = 'scale(.1)'

const FONT_FAMILY = 'Verdana,Geneva,DejaVu Sans,sans-serif'
const WIDTH_FONT = '11px Verdana'
const SOCIAL_FONT_FAMILY = 'Helvetica Neue,Helvetica,Arial,sans-serif'

function capitalize(s) {
  return `${s.charAt(0).toUpperCase()}${s.slice(1)}`
}

function colorsForBackground(color) {
  const brightnessThreshold = 0.69
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

function getLogoElement({ logo, horizPadding, badgeHeight, logoWidth }) {
  const logoHeight = 14
  if (!logo) return ''
  return new XmlElement({
    name: 'image',
    attrs: {
      x: horizPadding,
      y: 0.5 * (badgeHeight - logoHeight),
      width: logoWidth,
      height: logoHeight,
      'xlink:href': logo,
    },
  })
}

function renderBadge(
  { links, leftWidth, rightWidth, height, accessibleText },
  content,
) {
  const width = leftWidth + rightWidth
  const leftLink = links[0]
  const { hasLink } = hasLinks({ links })

  const title = hasLink
    ? ''
    : new XmlElement({ name: 'title', content: [accessibleText] })

  const body = shouldWrapBodyWithLink({ links })
    ? new XmlElement({
        name: 'a',
        content,
        attrs: { target: '_blank', 'xlink:href': leftLink },
      })
    : new ElementList({ content })

  const svgAttrs = {
    xmlns: 'http://www.w3.org/2000/svg',
    'xmlns:xlink': 'http://www.w3.org/1999/xlink',
    width,
    height,
  }
  if (!hasLink) {
    svgAttrs.role = 'img'
    svgAttrs['aria-label'] = accessibleText
  }

  const svg = new XmlElement({
    name: 'svg',
    content: [title, body],
    attrs: svgAttrs,
  })
  return svg.render()
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
    idSuffix = '',
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
    this.idSuffix = idSuffix

    this.logoElement = getLogoElement({
      logo,
      horizPadding,
      badgeHeight: this.constructor.height,
      logoWidth,
    })
    this.foregroundGroupElement = this.getForegroundGroupElement()
  }

  static render(params) {
    return new this(params).render()
  }

  getTextElement({ leftMargin, content, link, color, textWidth, linkWidth }) {
    if (!content.length) return ''

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
    const shadow = this.constructor.shadow ? shadowText : ''

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
      link: !shouldWrapBodyWithLink({ links: this.links })
        ? leftLink
        : undefined,
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
      color: this.color,
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
      attrs: { id: `r${this.idSuffix}` },
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
        fill: `url(#s${this.idSuffix})`,
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
        'font-size': 110,
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
          attrs: { offset: 0, 'stop-color': '#fff', 'stop-opacity': '.7' },
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
          attrs: { offset: 1, 'stop-color': '#000', 'stop-opacity': '.5' },
        }),
      ],
      attrs: { id: `s${this.idSuffix}`, x2: 0, y2: '100%' },
    })

    const clipPath = this.getClipPathElement(4)

    const backgroundGroup = this.getBackgroundGroupElement({
      withGradient: true,
      attrs: { 'clip-path': `url(#r${this.idSuffix})` },
    })

    return renderBadge(
      {
        links: this.links,
        leftWidth: this.leftWidth,
        rightWidth: this.rightWidth,
        accessibleText: this.accessibleText,
        height: this.constructor.height,
      },
      [gradient, clipPath, backgroundGroup, this.foregroundGroupElement],
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
          attrs: { offset: 0, 'stop-color': '#bbb', 'stop-opacity': '.1' },
        }),
        new XmlElement({
          name: 'stop',
          attrs: { offset: 1, 'stop-opacity': '.1' },
        }),
      ],
      attrs: { id: `s${this.idSuffix}`, x2: 0, y2: '100%' },
    })

    const clipPath = this.getClipPathElement(3)

    const backgroundGroup = this.getBackgroundGroupElement({
      withGradient: true,
      attrs: { 'clip-path': `url(#r${this.idSuffix})` },
    })

    return renderBadge(
      {
        links: this.links,
        leftWidth: this.leftWidth,
        rightWidth: this.rightWidth,
        accessibleText: this.accessibleText,
        height: this.constructor.height,
      },
      [gradient, clipPath, backgroundGroup, this.foregroundGroupElement],
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
      [backgroundGroup, this.foregroundGroupElement],
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
  idSuffix = '',
}) {
  // Social label is styled with a leading capital. Convert to caps here so
  // width can be measured using the correct characters.
  label = capitalize(label)

  const externalHeight = 20
  const internalHeight = 19
  const labelHorizPadding = 5
  const messageHorizPadding = 4
  const horizGutter = 6
  const totalLogoWidth = logoWidth + logoPadding
  const hasMessage = message.length

  const font = 'bold 11px Helvetica'
  const labelTextWidth = preferredWidthOf(label, { font })
  const messageTextWidth = preferredWidthOf(message, { font })
  const labelRectWidth = labelTextWidth + totalLogoWidth + 2 * labelHorizPadding
  const messageRectWidth = messageTextWidth + 2 * messageHorizPadding

  const [leftLink, rightLink] = links
  const { hasLeftLink, hasRightLink, hasLink } = hasLinks({ links })

  const accessibleText = createAccessibleText({ label, message })

  function getMessageBubble() {
    if (!hasMessage) return ''

    const messageBubbleMainX = labelRectWidth + horizGutter + 0.5
    const messageBubbleNotchX = labelRectWidth + horizGutter
    const content = [
      new XmlElement({
        name: 'rect',
        attrs: {
          x: messageBubbleMainX,
          y: 0.5,
          width: messageRectWidth,
          height: internalHeight,
          rx: 2,
          fill: '#fafafa',
        },
      }),
      new XmlElement({
        name: 'rect',
        attrs: {
          x: messageBubbleNotchX,
          y: 7.5,
          width: 0.5,
          height: 5,
          stroke: '#fafafa',
        },
      }),
      new XmlElement({
        name: 'path',
        attrs: {
          d: `M${messageBubbleMainX} 6.5 l-3 3v1 l3 3`,
          stroke: 'd5d5d5',
          fill: '#fafafa',
        },
      }),
    ]
    return new ElementList({ content })
  }

  function getLabelText() {
    const labelTextX =
      FONT_SCALE_UP_FACTOR *
      (totalLogoWidth + labelTextWidth / 2 + labelHorizPadding)
    const labelTextLength = FONT_SCALE_UP_FACTOR * labelTextWidth
    const shouldWrapWithLink = hasLeftLink && !shouldWrapBodyWithLink({ links })

    const rect = new XmlElement({
      name: 'rect',
      attrs: {
        id: `llink${idSuffix}`,
        stroke: '#d5d5d5',
        fill: `url(#a${idSuffix})`,
        x: '.5',
        y: '.5',
        width: labelRectWidth,
        height: internalHeight,
        rx: 2,
      },
    })
    const shadow = new XmlElement({
      name: 'text',
      content: [label],
      attrs: {
        'aria-hidden': 'true',
        x: labelTextX,
        y: 150,
        fill: '#fff',
        transform: FONT_SCALE_DOWN_VALUE,
        textLength: labelTextLength,
      },
    })
    const text = new XmlElement({
      name: 'text',
      content: [label],
      attrs: {
        x: labelTextX,
        y: 140,
        transform: FONT_SCALE_DOWN_VALUE,
        textLength: labelTextLength,
      },
    })

    return shouldWrapWithLink
      ? new XmlElement({
          name: 'a',
          content: [shadow, text, rect],
          attrs: { target: '_blank', 'xlink:href': leftLink },
        })
      : new ElementList({ content: [rect, shadow, text] })
  }

  function getMessageText() {
    if (!hasMessage) return ''

    const messageTextX =
      FONT_SCALE_UP_FACTOR *
      (labelRectWidth + horizGutter + messageRectWidth / 2)
    const messageTextLength = FONT_SCALE_UP_FACTOR * messageTextWidth

    const rect = new XmlElement({
      name: 'rect',
      attrs: {
        width: messageRectWidth + 1,
        x: labelRectWidth + horizGutter,
        height: internalHeight + 1,
        fill: 'rgba(0,0,0,0)',
      },
    })
    const shadow = new XmlElement({
      name: 'text',
      content: [message],
      attrs: {
        'aria-hidden': 'true',
        x: messageTextX,
        y: 150,
        fill: '#fff',
        transform: FONT_SCALE_DOWN_VALUE,
        textLength: messageTextLength,
      },
    })
    const text = new XmlElement({
      name: 'text',
      content: [message],
      attrs: {
        id: `rlink${idSuffix}`,
        x: messageTextX,
        y: 140,
        transform: FONT_SCALE_DOWN_VALUE,
        textLength: messageTextLength,
      },
    })

    return hasRightLink
      ? new XmlElement({
          name: 'a',
          content: [rect, shadow, text],
          attrs: { target: '_blank', 'xlink:href': rightLink },
        })
      : new ElementList({ content: [shadow, text] })
  }

  const style = new XmlElement({
    name: 'style',
    content: [
      `a:hover #llink${idSuffix}{fill:url(#b${idSuffix});stroke:#ccc}a:hover #rlink${idSuffix}{fill:#4183c4}`,
    ],
  })
  const gradients = new ElementList({
    content: [
      new XmlElement({
        name: 'linearGradient',
        content: [
          new XmlElement({
            name: 'stop',
            attrs: {
              offset: 0,
              'stop-color': '#fcfcfc',
              'stop-opacity': 0,
            },
          }),
          new XmlElement({
            name: 'stop',
            attrs: { offset: 1, 'stop-opacity': '.1' },
          }),
        ],
        attrs: { id: `a${idSuffix}`, x2: 0, y2: '100%' },
      }),
      new XmlElement({
        name: 'linearGradient',
        content: [
          new XmlElement({
            name: 'stop',
            attrs: { offset: 0, 'stop-color': '#ccc', 'stop-opacity': '.1' },
          }),
          new XmlElement({
            name: 'stop',
            attrs: { offset: 1, 'stop-opacity': '.1' },
          }),
        ],
        attrs: { id: `b${idSuffix}`, x2: 0, y2: '100%' },
      }),
    ],
  })
  const labelRect = new XmlElement({
    name: 'rect',
    attrs: {
      stroke: 'none',
      fill: '#fcfcfc',
      x: 0.5,
      y: 0.5,
      width: labelRectWidth,
      height: internalHeight,
      rx: 2,
    },
  })
  const messageBubble = getMessageBubble()
  const labelText = getLabelText()
  const messageText = getMessageText()
  const backgroundGroup = new XmlElement({
    name: 'g',
    content: [labelRect, messageBubble],
    attrs: { stroke: '#d5d5d5' },
  })
  const foregroundGroup = new XmlElement({
    name: 'g',
    content: [labelText, messageText],
    attrs: {
      'aria-hidden': `${!hasLink}`,
      fill: '#333',
      'text-anchor': 'middle',
      'font-family': SOCIAL_FONT_FAMILY,
      'text-rendering': 'geometricPrecision',
      'font-weight': 700,
      'font-size': '110px',
      'line-height': '14px',
    },
  })
  const logoElement = getLogoElement({
    logo,
    horizPadding: labelHorizPadding,
    badgeHeight: externalHeight,
    logoWidth,
  })

  return renderBadge(
    {
      links,
      leftWidth: labelRectWidth + 1,
      rightWidth: hasMessage ? horizGutter + messageRectWidth : 0,
      accessibleText,
      height: externalHeight,
    },
    [style, gradients, backgroundGroup, logoElement, foregroundGroup],
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

  const logoElement = getLogoElement({
    logo,
    horizPadding: logoMinX,
    badgeHeight: BADGE_HEIGHT,
    logoWidth,
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
      logoElement,
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
    [backgroundGroup, foregroundGroup],
  )
}

module.exports = {
  plastic: params => Plastic.render(params),
  flat: params => Flat.render(params),
  'flat-square': params => FlatSquare.render(params),
  social,
  'for-the-badge': forTheBadge,
}
