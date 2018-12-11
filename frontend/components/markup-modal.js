import React from 'react'
import PropTypes from 'prop-types'
import Modal from 'react-modal'
import ClickToSelect from '@mapbox/react-click-to-select'
import { badgeUrlFromPath, badgeUrlFromPattern } from '../../lib/make-badge-url'
import generateAllMarkup from '../lib/generate-image-markup'
import { advertisedStyles } from '../../supported-features.json'

const nonBreakingSpace = '\u00a0'

export default class MarkupModal extends React.Component {
  static propTypes = {
    // This is an item from the `examples` array within the
    // `serviceDefinition` schema.
    // https://github.com/badges/shields/blob/master/services/service-definitions.js
    example: PropTypes.object,
    baseUrl: PropTypes.string.isRequired,
    onRequestClose: PropTypes.func.isRequired,
  }

  state = {
    badgeUrl: '',
    badgeUrlForProps: '',
    exampleUrl: '',
    link: '',
    style: 'flat',
  }

  get isOpen() {
    return this.props.example !== undefined
  }

  static urlsForProps(props) {
    const {
      example: { example },
      baseUrl,
    } = props

    let badgeUrl
    let exampleUrl
    // There are two alternatives for `example`. Refer to the schema in
    // `services/service-definitions.js`.
    if (example.pattern !== undefined) {
      const { pattern, namedParams, queryParams } = example
      badgeUrl = badgeUrlFromPath({
        path: pattern,
        queryParams,
      })
      exampleUrl = badgeUrlFromPattern({
        baseUrl,
        pattern,
        namedParams,
        queryParams,
      })
    } else {
      const { path, queryParams } = example
      badgeUrl = badgeUrlFromPath({
        path,
        queryParams,
      })
      exampleUrl = ''
    }

    return { badgeUrl, exampleUrl }
  }

  static getDerivedStateFromProps(props, state) {
    let urlsForProps, link
    if (props.example) {
      urlsForProps = MarkupModal.urlsForProps(props)
      link = props.example.example.link
    } else {
      urlsForProps = { badgeUrl: '', exampleUrl: '' }
      link = ''
    }

    if (urlsForProps.badgeUrl === state.badgeUrlForProps) {
      return null
    } else {
      return {
        ...urlsForProps,
        badgeUrlForProps: urlsForProps.badgeUrl,
        link,
      }
    }
  }

  generateBuiltBadgeUrl() {
    const { baseUrl } = this.props
    const { badgeUrl, style } = this.state

    return badgeUrlFromPath({
      baseUrl,
      path: badgeUrl,
      format: '', // `badgeUrl` already contains `.svg`.
      style: style === 'flat' ? undefined : style,
    })
  }

  renderLivePreview() {
    const { badgeUrl } = this.state
    const includesPlaceholders = badgeUrl.includes(':')

    if (includesPlaceholders) {
      return nonBreakingSpace
    } else {
      const livePreviewUrl = this.generateBuiltBadgeUrl()
      return <img className="badge-img" src={livePreviewUrl} />
    }
  }

  renderMarkup() {
    const {
      example: {
        example: { title },
      },
    } = this.props
    const { link } = this.state

    const builtBadgeUrl = this.generateBuiltBadgeUrl()
    const { markdown, reStructuredText, asciiDoc } = generateAllMarkup(
      builtBadgeUrl,
      link,
      title
    )

    return (
      <div>
        <p>
          URL&nbsp;
          <ClickToSelect>
            <input className="code clickable" readOnly value={builtBadgeUrl} />
          </ClickToSelect>
        </p>
        <p>
          Markdown&nbsp;
          <ClickToSelect>
            <input className="code clickable" readOnly value={markdown} />
          </ClickToSelect>
        </p>
        <p>
          reStructuredText&nbsp;
          <ClickToSelect>
            <input
              className="code clickable"
              readOnly
              value={reStructuredText}
            />
          </ClickToSelect>
        </p>
        <p>
          AsciiDoc&nbsp;
          <ClickToSelect>
            <input className="code clickable" readOnly value={asciiDoc} />
          </ClickToSelect>
        </p>
      </div>
    )
  }

  renderDocumentation() {
    const {
      example: { documentation },
    } = this.props

    return documentation ? (
      <div>
        <h4>Documentation</h4>
        <div dangerouslySetInnerHTML={{ __html: documentation }} />
      </div>
    ) : null
  }

  render() {
    const { isOpen } = this
    const { onRequestClose } = this.props
    const { link, badgeUrl, exampleUrl, style } = this.state

    const common = {
      autoComplete: 'off',
      autoCorrect: 'off',
      autoCapitalize: 'off',
      spellCheck: 'false',
    }

    return (
      <Modal
        isOpen={isOpen}
        onRequestClose={onRequestClose}
        contentLabel="Example Modal"
        ariaHideApp={false}
      >
        <form action="">
          <p>{isOpen && this.renderLivePreview()}</p>
          <p>
            <label>
              Link&nbsp;
              <input
                type="url"
                value={link}
                onChange={event => {
                  this.setState({ link: event.target.value })
                }}
                {...common}
              />
            </label>
          </p>
          <p>
            <label>
              Path&nbsp;
              <input
                type="url"
                value={badgeUrl}
                onChange={event => {
                  this.setState({ badgeUrl: event.target.value })
                }}
                {...common}
              />
            </label>
          </p>
          {exampleUrl && (
            <p>
              Example&nbsp;
              <ClickToSelect>
                <input className="code clickable" readOnly value={exampleUrl} />
              </ClickToSelect>
            </p>
          )}
          <p>
            <label>
              Style&nbsp;
              <select
                value={style}
                onChange={event => {
                  this.setState({ style: event.target.value })
                }}
              >
                {advertisedStyles.map(style => (
                  <option key={style} value={style}>
                    {style}
                  </option>
                ))}
              </select>
            </label>
          </p>
          {isOpen && this.renderMarkup()}
          {isOpen && this.renderDocumentation()}
        </form>
      </Modal>
    )
  }
}
