import React from 'react'
import PropTypes from 'prop-types'
import posed from 'react-pose'
import styled, { css } from 'styled-components'

const Container = styled.span`
  position: relative;
  display: inline-block;
`

const Bogus = styled.span`
  position: 'absolute';
  top: '-10px';
  pointer-events: none;
  left: 50%;
  transform: translateX(-50%);
`

const CopiedContent = posed(Bogus)({
  init: {
    position: 'absolute',
    top: '-10px',
    width: '100vw',

    pointerEvents: 'none',
  },
  copied: {
    position: 'absolute',
    top: '-75px',
    width: '100vw',

    opacity: 0.5,

    pointerEvents: 'none',
  },
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
    // this.setState({ isActive: false })
  }

  render() {
    return (
      <Container>
        {this.state.isActive && (
          <CopiedContent
            initialPose="init"
            pose="copied"
            onPoseComplete={this.handlePoseComplete}
          >
            {this.props.copiedContent}
          </CopiedContent>
        )}
        {this.props.children}
      </Container>
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
