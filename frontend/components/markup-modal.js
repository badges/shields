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
    const { example, baseUrl } = props

    if (!example) {
      return {}
    }

    // There are two alternatives for `example`. Refer to the schema in
    // `services/service-definitions.js`.
    let badgeUrl
    let exampleUrl
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
    const {
      badgeUrl: badgeUrlForProps = '',
      exampleUrl: exampleUrlForProps = '',
    } = MarkupModal.urlsForProps(props)

    const { badgeUrlForProps: prevBadgeUrlForProps } = state

    if (badgeUrlForProps === prevBadgeUrlForProps) {
      return null
    }

    const { example: { link = '' } = {} } = props
    return {
      badgeUrl: badgeUrlForProps,
      exampleUrl: exampleUrlForProps,
      badgeUrlForProps,
      link,
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
      example: { title },
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
    const { link, badgeUrl, exampleUrl, style } = this.state

    const common = {
      autoComplete: 'off',
      autoCorrect: 'off',
      autoCapitalize: 'off',
      spellCheck: 'false',
    }

    return (
      <Modal
        isOpen={this.isOpen}
        onRequestClose={this.props.onRequestClose}
        contentLabel="Example Modal"
        ariaHideApp={false}
      >
        <form action="">
          <p>{this.isOpen && this.renderLivePreview()}</p>
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
          {this.isOpen && this.renderMarkup()}
          {this.isOpen && this.renderDocumentation()}
        </form>
      </Modal>
    )
  }
}
