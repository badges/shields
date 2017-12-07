import React from 'react';
import Head from 'next/head';

const description = `We serve fast and scalable informational images as badges
for GitHub, Travis CI, Jenkins, WordPress and many more services. Use them to
track the state of your projects, or for promotional purposes.`;

export default () => (
  <Head>
    <title>Shields.io: Quality metadata badges for open source projects</title>
    <meta charSet="utf-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <meta name="description" content={description} />
    <link rel="icon" type="image/png" href="favicon.png" />
    <link href="static/main.css" rel="stylesheet" />
    <link href="https://fonts.googleapis.com/css?family=Lekton" rel="stylesheet" />
  </Head>
);
