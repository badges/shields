import React from 'react'
import PropTypes from 'prop-types'
import styled, { css } from 'styled-components'

const BuilderOuterContainer = styled.div`
  margin-top: 5px;
  margin-bottom: 5px;
`

// The inner container is inline-block so that its width matches its columns.
const BuilderInnerContainer = styled.div`
  display: inline-block;

  padding: 11px 14px 10px;

  border-radius: 4px;
  background: #eef;
`

const BuilderContainer = ({ children }) => (
  <BuilderOuterContainer>
    <BuilderInnerContainer>{children}</BuilderInnerContainer>
  </BuilderOuterContainer>
)
BuilderContainer.propTypes = {
  children: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.node),
    PropTypes.node,
  ]),
}

export { BuilderContainer }
