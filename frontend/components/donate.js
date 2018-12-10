import React from 'react'

export default class DonateBox extends React.Component {
  render() {
    return (
      <div>
        <div id="donate">
          Love Shields? Please consider{' '}
          <a href="https://opencollective.com/shields">donating</a> to sustain
          our activities
        </div>
        <style jsx>{`
          #donate {
            padding: 25px 50px;
          }
        `}</style>
      </div>
    )
  }
}
