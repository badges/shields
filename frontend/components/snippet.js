import React from 'react'
import PropTypes from 'prop-types'
import ClickToSelect from '@mapbox/react-click-to-select'
import { CopyToClipboard } from 'react-copy-to-clipboard'
import styled, { css } from 'styled-components'
import posed from 'react-pose'
import coalesce from '../../lib/coalesce'

const CodeContainer = styled.span`
  position: relative;

  vertical-align: middle;
  display: inline-block;

  ${({ truncate }) =>
    truncate &&
    css`
      max-width: 40%;
      overflow: hidden;
      text-overflow: ellipsis;
    `};
`

const StyledCode = styled.code`
  line-height: 1.2em;
  padding: 0.1em 0.3em;

  border-radius: 4px;
  ${({ withBackground }) =>
    withBackground !== false &&
    css`
      background: #eef;
    `} font-family: Lekton;
  font-size: ${({ fontSize }) => fontSize};

  white-space: nowrap;
`

const Snippet = ({ snippet, truncate = false, fontSize }) => (
  <CodeContainer truncate={truncate}>
    <ClickToSelect>
      <StyledCode fontSize={fontSize}>{snippet}</StyledCode>
    </ClickToSelect>
  </CodeContainer>
)
Snippet.propTypes = {
  snippet: PropTypes.string.isRequired,
  truncate: PropTypes.bool,
  fontSize: PropTypes.string,
}

const CopiedLink = posed.span({
  init: {
    pointerEvents: 'none',
    position: 'absolute',
    top: '-10px',
  },
  copied: {
    pointerEvents: 'none',
    position: 'absolute',
    top: '-75px',
    opacity: 0,
  },
})

class Snippet2 extends React.Component {
  state = {
    copied: false,
  }

  handleCopied = () => {
    this.setState({ copied: true })
  }

  handlePoseComplete = () => {
    this.setState({ copied: false })
  }

  renderCopiedLink() {
    // Render a copied link that floats up from the text box, then disappears
    // (by setting `copied` back to `false`).
    const { snippet, fontSize } = this.props
    return (
      <CopiedLink
        initialPose="init"
        pose="copied"
        onPoseComplete={this.handlePoseComplete}
      >
        <StyledCode fontSize={fontSize} withBackground={false}>
          {snippet}
        </StyledCode>
      </CopiedLink>
    )
  }

  render() {
    const { snippet, snippetToCopy, truncate, fontSize } = this.props
    const { copied } = this.state
    return (
      <CodeContainer truncate={truncate}>
        {copied && this.renderCopiedLink()}
        <CopyToClipboard
          text={coalesce(snippetToCopy, snippet)}
          onCopy={this.handleCopied}
        >
          <StyledCode fontSize={fontSize}>{snippet}</StyledCode>
        </CopyToClipboard>
      </CodeContainer>
    )
  }
}
Snippet2.defaultProps = {
  truncate: false,
}

Snippet2.propTypes = {
  snippet: PropTypes.string.isRequired,
  snippetToCopy: PropTypes.string,
  truncate: PropTypes.bool,
  fontSize: PropTypes.string,
}

export { Snippet, StyledCode, Snippet2 }
