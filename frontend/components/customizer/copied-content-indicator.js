import React, { useState, useImperativeHandle, forwardRef } from 'react'
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
function CopiedContentIndicator({ copiedContent, children }, ref) {
  const [pose, setPose] = useState('hidden')

  useImperativeHandle(ref, () => ({
    trigger() {
      setPose('effectStart')
    },
  }))

  function handlePoseComplete() {
    if (pose === 'effectStart') {
      setPose('effectEnd')
    } else {
      setPose('hidden')
    }
  }

  return (
    <ContentAnchor>
      <PosedContentContainer onPoseComplete={handlePoseComplete} pose={pose}>
        {copiedContent}
      </PosedContentContainer>
      {children}
    </ContentAnchor>
  )
}
// eslint-disable-next-line no-func-assign
CopiedContentIndicator = forwardRef(CopiedContentIndicator)
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
export default CopiedContentIndicator
