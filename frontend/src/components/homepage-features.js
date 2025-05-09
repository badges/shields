import React from 'react'
import clsx from 'clsx'
import styles from './homepage-features.module.css'

const FeatureList = [
  {
    title: 'Dynamic badges',
    description: (
      <>
        <img
          alt="build:passing"
          src="https://img.shields.io/badge/build-passing-brightgreen"
        />
        <br />
        Show metrics for your project. We've got badges for hundreds of
        services.
      </>
    ),
  },
  {
    title: 'Static Badges',
    description: (
      <>
        Create a badge with
        <br />
        <img
          alt="any text you like"
          src="https://img.shields.io/badge/any%20text-you%20like-blue"
        />
      </>
    ),
  },
  {
    title: 'Badge-Maker NPM library',
    description: (
      <>
        Render badges in your own application using our{' '}
        <a
          href="https://www.npmjs.com/package/badge-maker"
          rel="noreferrer"
          target="_blank"
        >
          NPM library
        </a>
        <br />
        <code>npm install badge-maker</code>
      </>
    ),
  },
  {
    title: 'Host your own instance',
    description: (
      <>
        Host a shields instance behind your firewall with our{' '}
        <a
          href="https://registry.hub.docker.com/r/shieldsio/shields/"
          rel="noreferrer"
          target="_blank"
        >
          docker image
        </a>
      </>
    ),
  },
  {
    title: 'Love Shields?',
    description: (
      <>
        Please consider <a href="/donate">donating</a> to sustain our activities
      </>
    ),
  },
]

function Feature({ title, description }) {
  return (
    <div className={clsx('col col--6')}>
      <div className="text--center padding-horiz--md padding-vert--lg">
        <h3>{title}</h3>
        <p>{description}</p>
      </div>
    </div>
  )
}

export default function HomepageFeatures() {
  return (
    <section className={styles.features}>
      <div className="container">
        <div className="row">
          {FeatureList.map((props, idx) => (
            <Feature key={idx} {...props} />
          ))}
        </div>
      </div>
    </section>
  )
}
