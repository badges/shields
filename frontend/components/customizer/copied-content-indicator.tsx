import React, { useState, useImperativeHandle, forwardRef } from 'react'
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

export interface CopiedContentIndicatorHandle {
  trigger: () => void
}

// When `trigger()` is called, render copied content that floats up, then
// disappears.
function _CopiedContentIndicator(
  {
    copiedContent,
    children,
  }: { copiedContent: JSX.Element; children: JSX.Element | JSX.Element[] },
  ref: React.Ref<CopiedContentIndicatorHandle>
) {
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
const CopiedContentIndicator = forwardRef(_CopiedContentIndicator)
export default CopiedContentIndicator
