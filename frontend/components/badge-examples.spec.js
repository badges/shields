import React from 'react'
import { shallow } from 'enzyme'
import BadgeExamples from './badge-examples'

import '../enzyme-conf.spec'

const exampleServiceDefinitions = [
  {
    examples: [
      {
        title: 'Mozilla Add-on',
        example: {
          pattern: '/amo/d/:addonId',
          namedParams: {
            addonId: 'dustman',
          },
          queryParams: {},
        },
        preview: {
          label: 'downloads',
          message: '12k',
          color: 'brightgreen',
        },
        keywords: ['amo', 'firefox'],
      },
    ],
  },
  {
    examples: [
      {
        title: 'Mozilla Add-on',
        example: {
          pattern: '/amo/rating/:addonId',
          namedParams: {
            addonId: 'dustman',
          },
          queryParams: {},
        },
        preview: {
          label: 'rating',
          message: '4/5',
          color: 'brightgreen',
        },
        keywords: ['amo', 'firefox'],
      },
      {
        title: 'Mozilla Add-on',
        example: {
          pattern: '/amo/stars/:addonId',
          namedParams: {
            addonId: 'dustman',
          },
          queryParams: {},
        },
        preview: {
          label: 'stars',
          message: '★★★★☆',
          color: 'brightgreen',
        },
        keywords: ['amo', 'firefox'],
      },
    ],
  },
  {
    examples: [
      {
        title: 'Mozilla Add-on',
        example: {
          pattern: '/amo/users/:addonId',
          namedParams: {
            addonId: 'dustman',
          },
          queryParams: {},
        },
        preview: {
          label: 'users',
          message: '750',
          color: 'blue',
        },
        keywords: ['amo', 'firefox'],
      },
    ],
  },
  {
    examples: [
      {
        title: 'Mozilla Add-on',
        example: {
          pattern: '/amo/v/:addonId',
          namedParams: {
            addonId: 'dustman',
          },
          queryParams: {},
        },
        preview: {
          label: 'mozilla add-on',
          message: 'v2.1.0',
          color: 'blue',
        },
        keywords: ['amo', 'firefox'],
      },
    ],
  },
]

describe('<BadgeExamples />', function() {
  it('renders with no examples', function() {
    shallow(
      <BadgeExamples
        baseUrl="https://example.shields.io"
        definitions={[]}
        onClick={() => {}}
      />
    )
  })

  it('renders an array of examples', function() {
    shallow(
      <BadgeExamples
        baseUrl="https://example.shields.io"
        definitions={exampleServiceDefinitions}
        onClick={() => {}}
      />
    )
  })
})
