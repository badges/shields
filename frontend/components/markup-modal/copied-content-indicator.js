import React from 'react'
import PropTypes from 'prop-types'
import posed from 'react-pose'
import styled from 'styled-components'

const ContentAnchor = styled.span`
  position: relative;
  display: inline-block;
`

// 100vw allows providing styled content which is wider than its container.
const ContentContainer = styled.span`
  width: 100vw;

  position: absolute;
  left: 50%;
  transform: translateX(-50%);

  pointer-events: none;
`

const PosedContentContainer = posed(ContentContainer)({
  init: { top: '-10px' },
  copied: { top: '-75px', opacity: 0.5 },
})

// When `trigger()` is called, render copied content that floats up, then
// disappears.
export default class CopiedContentIndicator extends React.Component {
  state = {
    isActive: false,
  }

  trigger() {
    this.setState({ isActive: true })
  }

  handlePoseComplete = () => {
    this.setState({ isActive: false })
  }

  render() {
    return (
      <ContentAnchor>
        {this.state.isActive && (
          <PosedContentContainer
            initialPose="init"
            pose="copied"
            onPoseComplete={this.handlePoseComplete}
          >
            {this.props.copiedContent}
          </PosedContentContainer>
        )}
        {this.props.children}
      </ContentAnchor>
    )
  }
}
CopiedContentIndicator.propTypes = {
  copiedContent: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.node),
    PropTypes.node,
  ]),
  children: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.node),
    PropTypes.node,
  ]),
}
