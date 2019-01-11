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

  will-change: opacity, top;

  pointer-events: none;
`

const PosedContentContainer = posed(ContentContainer)({
  hidden: { opacity: 0, transition: { duration: 100 } },
  effectStart: { top: '-10px', opacity: 1.0, transition: { duration: 0 } },
  effectEnd: { top: '-75px', opacity: 0.5 },
})

// When `trigger()` is called, render copied content that floats up, then
// disappears.
export default class CopiedContentIndicator extends React.Component {
  state = {
    pose: 'hidden',
  }

  trigger() {
    this.setState({ pose: 'effectStart' })
  }

  handlePoseComplete = () => {
    const { pose } = this.state
    if (pose === 'effectStart') {
      this.setState({ pose: 'effectEnd' })
    } else {
      this.setState({ pose: 'hidden' })
    }
  }

  render() {
    const { pose } = this.state
    return (
      <ContentAnchor>
        <PosedContentContainer
          pose={pose}
          onPoseComplete={this.handlePoseComplete}
        >
          {this.props.copiedContent}
        </PosedContentContainer>
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
