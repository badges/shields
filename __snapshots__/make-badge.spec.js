exports['The badge generator SVG should match snapshot 1'] = `
<svg
  xmlns="http://www.w3.org/2000/svg"
  xmlns:xlink="http://www.w3.org/1999/xlink"
  width="90"
  height="20"
  role="img"
  aria-label="cactus: grown"
>
  <title>cactus: grown</title>
  <linearGradient id="s" x2="0" y2="100%">
    <stop offset="0" stop-color="#bbb" stop-opacity=".1" />
    <stop offset="1" stop-opacity=".1" />
  </linearGradient>
  <clipPath id="r"><rect width="90" height="20" rx="3" fill="#fff" /></clipPath>
  <g clip-path="url(#r)">
    <rect width="45" height="20" fill="#555" />
    <rect x="45" width="45" height="20" fill="#4c1" />
    <rect width="90" height="20" fill="url(#s)" />
  </g>
  <g
    fill="#fff"
    text-anchor="middle"
    font-family="Verdana,Geneva,DejaVu Sans,sans-serif"
    text-rendering="geometricPrecision"
    font-size="110"
  >
    <text
      aria-hidden="true"
      x="235"
      y="150"
      fill="#010101"
      fill-opacity=".3"
      transform="scale(.1)"
      textLength="350"
    >
      cactus
    </text>
    <text x="235" y="140" transform="scale(.1)" fill="#fff" textLength="350">
      cactus
    </text>
    <text
      aria-hidden="true"
      x="665"
      y="150"
      fill="#010101"
      fill-opacity=".3"
      transform="scale(.1)"
      textLength="350"
    >
      grown
    </text>
    <text x="665" y="140" transform="scale(.1)" fill="#fff" textLength="350">
      grown
    </text>
  </g>
</svg>

`

exports['The badge generator "flat" template badge generation should match snapshots: message/label, no logo 1'] = `
<svg
  xmlns="http://www.w3.org/2000/svg"
  xmlns:xlink="http://www.w3.org/1999/xlink"
  width="90"
  height="20"
  role="img"
  aria-label="cactus: grown"
>
  <title>cactus: grown</title>
  <linearGradient id="s" x2="0" y2="100%">
    <stop offset="0" stop-color="#bbb" stop-opacity=".1" />
    <stop offset="1" stop-opacity=".1" />
  </linearGradient>
  <clipPath id="r"><rect width="90" height="20" rx="3" fill="#fff" /></clipPath>
  <g clip-path="url(#r)">
    <rect width="45" height="20" fill="#0f0" />
    <rect x="45" width="45" height="20" fill="#b3e" />
    <rect width="90" height="20" fill="url(#s)" />
  </g>
  <g
    fill="#fff"
    text-anchor="middle"
    font-family="Verdana,Geneva,DejaVu Sans,sans-serif"
    text-rendering="geometricPrecision"
    font-size="110"
  >
    <text
      aria-hidden="true"
      x="235"
      y="150"
      fill="#010101"
      fill-opacity=".3"
      transform="scale(.1)"
      textLength="350"
    >
      cactus
    </text>
    <text x="235" y="140" transform="scale(.1)" fill="#fff" textLength="350">
      cactus
    </text>
    <text
      aria-hidden="true"
      x="665"
      y="150"
      fill="#010101"
      fill-opacity=".3"
      transform="scale(.1)"
      textLength="350"
    >
      grown
    </text>
    <text x="665" y="140" transform="scale(.1)" fill="#fff" textLength="350">
      grown
    </text>
  </g>
</svg>

`

exports['The badge generator "flat" template badge generation should match snapshots: message/label, with logo 1'] = `
<svg
  xmlns="http://www.w3.org/2000/svg"
  xmlns:xlink="http://www.w3.org/1999/xlink"
  width="107"
  height="20"
  role="img"
  aria-label="cactus: grown"
>
  <title>cactus: grown</title>
  <linearGradient id="s" x2="0" y2="100%">
    <stop offset="0" stop-color="#bbb" stop-opacity=".1" />
    <stop offset="1" stop-opacity=".1" />
  </linearGradient>
  <clipPath id="r">
    <rect width="107" height="20" rx="3" fill="#fff" />
  </clipPath>
  <g clip-path="url(#r)">
    <rect width="62" height="20" fill="#0f0" />
    <rect x="62" width="45" height="20" fill="#b3e" />
    <rect width="107" height="20" fill="url(#s)" />
  </g>
  <g
    fill="#fff"
    text-anchor="middle"
    font-family="Verdana,Geneva,DejaVu Sans,sans-serif"
    text-rendering="geometricPrecision"
    font-size="110"
  >
    <image
      x="5"
      y="3"
      width="14"
      height="14"
      xlink:href="data:image/svg+xml;base64,PHN2ZyB4bWxu"
    />
    <text
      aria-hidden="true"
      x="405"
      y="150"
      fill="#010101"
      fill-opacity=".3"
      transform="scale(.1)"
      textLength="350"
    >
      cactus
    </text>
    <text x="405" y="140" transform="scale(.1)" fill="#fff" textLength="350">
      cactus
    </text>
    <text
      aria-hidden="true"
      x="835"
      y="150"
      fill="#010101"
      fill-opacity=".3"
      transform="scale(.1)"
      textLength="350"
    >
      grown
    </text>
    <text x="835" y="140" transform="scale(.1)" fill="#fff" textLength="350">
      grown
    </text>
  </g>
</svg>

`

exports['The badge generator "flat" template badge generation should match snapshots: message only, no logo 1'] = `
<svg
  xmlns="http://www.w3.org/2000/svg"
  xmlns:xlink="http://www.w3.org/1999/xlink"
  width="45"
  height="20"
  role="img"
  aria-label="grown"
>
  <title>grown</title>
  <linearGradient id="s" x2="0" y2="100%">
    <stop offset="0" stop-color="#bbb" stop-opacity=".1" />
    <stop offset="1" stop-opacity=".1" />
  </linearGradient>
  <clipPath id="r"><rect width="45" height="20" rx="3" fill="#fff" /></clipPath>
  <g clip-path="url(#r)">
    <rect width="0" height="20" fill="#b3e" />
    <rect x="0" width="45" height="20" fill="#b3e" />
    <rect width="45" height="20" fill="url(#s)" />
  </g>
  <g
    fill="#fff"
    text-anchor="middle"
    font-family="Verdana,Geneva,DejaVu Sans,sans-serif"
    text-rendering="geometricPrecision"
    font-size="110"
  >
    <text
      aria-hidden="true"
      x="225"
      y="150"
      fill="#010101"
      fill-opacity=".3"
      transform="scale(.1)"
      textLength="350"
    >
      grown
    </text>
    <text x="225" y="140" transform="scale(.1)" fill="#fff" textLength="350">
      grown
    </text>
  </g>
</svg>

`

exports['The badge generator "flat" template badge generation should match snapshots: message only, with logo 1'] = `
<svg
  xmlns="http://www.w3.org/2000/svg"
  xmlns:xlink="http://www.w3.org/1999/xlink"
  width="63"
  height="20"
  role="img"
  aria-label="grown"
>
  <title>grown</title>
  <linearGradient id="s" x2="0" y2="100%">
    <stop offset="0" stop-color="#bbb" stop-opacity=".1" />
    <stop offset="1" stop-opacity=".1" />
  </linearGradient>
  <clipPath id="r"><rect width="63" height="20" rx="3" fill="#fff" /></clipPath>
  <g clip-path="url(#r)">
    <rect width="0" height="20" fill="#555" />
    <rect x="0" width="63" height="20" fill="#b3e" />
    <rect width="63" height="20" fill="url(#s)" />
  </g>
  <g
    fill="#fff"
    text-anchor="middle"
    font-family="Verdana,Geneva,DejaVu Sans,sans-serif"
    text-rendering="geometricPrecision"
    font-size="110"
  >
    <image
      x="5"
      y="3"
      width="14"
      height="14"
      xlink:href="data:image/svg+xml;base64,PHN2ZyB4bWxu"
    />
    <text
      aria-hidden="true"
      x="405"
      y="150"
      fill="#010101"
      fill-opacity=".3"
      transform="scale(.1)"
      textLength="350"
    >
      grown
    </text>
    <text x="405" y="140" transform="scale(.1)" fill="#fff" textLength="350">
      grown
    </text>
  </g>
</svg>

`

exports['The badge generator "flat" template badge generation should match snapshots: message only, with logo and labelColor 1'] = `
<svg
  xmlns="http://www.w3.org/2000/svg"
  xmlns:xlink="http://www.w3.org/1999/xlink"
  width="69"
  height="20"
  role="img"
  aria-label="grown"
>
  <title>grown</title>
  <linearGradient id="s" x2="0" y2="100%">
    <stop offset="0" stop-color="#bbb" stop-opacity=".1" />
    <stop offset="1" stop-opacity=".1" />
  </linearGradient>
  <clipPath id="r"><rect width="69" height="20" rx="3" fill="#fff" /></clipPath>
  <g clip-path="url(#r)">
    <rect width="24" height="20" fill="#0f0" />
    <rect x="24" width="45" height="20" fill="#b3e" />
    <rect width="69" height="20" fill="url(#s)" />
  </g>
  <g
    fill="#fff"
    text-anchor="middle"
    font-family="Verdana,Geneva,DejaVu Sans,sans-serif"
    text-rendering="geometricPrecision"
    font-size="110"
  >
    <image
      x="5"
      y="3"
      width="14"
      height="14"
      xlink:href="data:image/svg+xml;base64,PHN2ZyB4bWxu"
    />
    <text
      aria-hidden="true"
      x="455"
      y="150"
      fill="#010101"
      fill-opacity=".3"
      transform="scale(.1)"
      textLength="350"
    >
      grown
    </text>
    <text x="455" y="140" transform="scale(.1)" fill="#fff" textLength="350">
      grown
    </text>
  </g>
</svg>

`

exports['The badge generator "flat" template badge generation should match snapshots: message/label, with links 1'] = `
<svg
  xmlns="http://www.w3.org/2000/svg"
  xmlns:xlink="http://www.w3.org/1999/xlink"
  width="90"
  height="20"
>
  <linearGradient id="s" x2="0" y2="100%">
    <stop offset="0" stop-color="#bbb" stop-opacity=".1" />
    <stop offset="1" stop-opacity=".1" />
  </linearGradient>
  <clipPath id="r"><rect width="90" height="20" rx="3" fill="#fff" /></clipPath>
  <g clip-path="url(#r)">
    <rect width="45" height="20" fill="#0f0" />
    <rect x="45" width="45" height="20" fill="#b3e" />
    <rect width="90" height="20" fill="url(#s)" />
  </g>
  <g
    fill="#fff"
    text-anchor="middle"
    font-family="Verdana,Geneva,DejaVu Sans,sans-serif"
    text-rendering="geometricPrecision"
    font-size="110"
  >
    <a target="_blank" xlink:href="https://shields.io/">
      <rect width="45" x="0" height="20" fill="rgba(0,0,0,0)" />
      <text
        aria-hidden="true"
        x="235"
        y="150"
        fill="#010101"
        fill-opacity=".3"
        transform="scale(.1)"
        textLength="350"
      >
        cactus
      </text>
      <text x="235" y="140" transform="scale(.1)" fill="#fff" textLength="350">
        cactus
      </text>
    </a>
    <a target="_blank" xlink:href="https://www.google.co.uk/">
      <rect width="45" x="45" height="20" fill="rgba(0,0,0,0)" />
      <text
        aria-hidden="true"
        x="665"
        y="150"
        fill="#010101"
        fill-opacity=".3"
        transform="scale(.1)"
        textLength="350"
      >
        grown
      </text>
      <text x="665" y="140" transform="scale(.1)" fill="#fff" textLength="350">
        grown
      </text>
    </a>
  </g>
</svg>

`

exports['The badge generator "flat" template badge generation should match snapshots: black text when the label color is light 1'] = `
<svg
  xmlns="http://www.w3.org/2000/svg"
  xmlns:xlink="http://www.w3.org/1999/xlink"
  width="90"
  height="20"
  role="img"
  aria-label="cactus: grown"
>
  <title>cactus: grown</title>
  <linearGradient id="s" x2="0" y2="100%">
    <stop offset="0" stop-color="#bbb" stop-opacity=".1" />
    <stop offset="1" stop-opacity=".1" />
  </linearGradient>
  <clipPath id="r"><rect width="90" height="20" rx="3" fill="#fff" /></clipPath>
  <g clip-path="url(#r)">
    <rect width="45" height="20" fill="#f3f3f3" />
    <rect x="45" width="45" height="20" fill="#000" />
    <rect width="90" height="20" fill="url(#s)" />
  </g>
  <g
    fill="#fff"
    text-anchor="middle"
    font-family="Verdana,Geneva,DejaVu Sans,sans-serif"
    text-rendering="geometricPrecision"
    font-size="110"
  >
    <text
      aria-hidden="true"
      x="235"
      y="150"
      fill="#ccc"
      fill-opacity=".3"
      transform="scale(.1)"
      textLength="350"
    >
      cactus
    </text>
    <text x="235" y="140" transform="scale(.1)" fill="#333" textLength="350">
      cactus
    </text>
    <text
      aria-hidden="true"
      x="665"
      y="150"
      fill="#010101"
      fill-opacity=".3"
      transform="scale(.1)"
      textLength="350"
    >
      grown
    </text>
    <text x="665" y="140" transform="scale(.1)" fill="#fff" textLength="350">
      grown
    </text>
  </g>
</svg>

`

exports['The badge generator "flat" template badge generation should match snapshots: black text when the message color is light 1'] = `
<svg
  xmlns="http://www.w3.org/2000/svg"
  xmlns:xlink="http://www.w3.org/1999/xlink"
  width="90"
  height="20"
  role="img"
  aria-label="cactus: grown"
>
  <title>cactus: grown</title>
  <linearGradient id="s" x2="0" y2="100%">
    <stop offset="0" stop-color="#bbb" stop-opacity=".1" />
    <stop offset="1" stop-opacity=".1" />
  </linearGradient>
  <clipPath id="r"><rect width="90" height="20" rx="3" fill="#fff" /></clipPath>
  <g clip-path="url(#r)">
    <rect width="45" height="20" fill="#000" />
    <rect x="45" width="45" height="20" fill="#e2ffe1" />
    <rect width="90" height="20" fill="url(#s)" />
  </g>
  <g
    fill="#fff"
    text-anchor="middle"
    font-family="Verdana,Geneva,DejaVu Sans,sans-serif"
    text-rendering="geometricPrecision"
    font-size="110"
  >
    <text
      aria-hidden="true"
      x="235"
      y="150"
      fill="#010101"
      fill-opacity=".3"
      transform="scale(.1)"
      textLength="350"
    >
      cactus
    </text>
    <text x="235" y="140" transform="scale(.1)" fill="#fff" textLength="350">
      cactus
    </text>
    <text
      aria-hidden="true"
      x="665"
      y="150"
      fill="#ccc"
      fill-opacity=".3"
      transform="scale(.1)"
      textLength="350"
    >
      grown
    </text>
    <text x="665" y="140" transform="scale(.1)" fill="#333" textLength="350">
      grown
    </text>
  </g>
</svg>

`

exports['The badge generator "flat-square" template badge generation should match snapshots: message/label, no logo 1'] = `
<svg
  xmlns="http://www.w3.org/2000/svg"
  xmlns:xlink="http://www.w3.org/1999/xlink"
  width="90"
  height="20"
  role="img"
  aria-label="cactus: grown"
>
  <title>cactus: grown</title>
  <g shape-rendering="crispEdges">
    <rect width="45" height="20" fill="#0f0" />
    <rect x="45" width="45" height="20" fill="#b3e" />
  </g>
  <g
    fill="#fff"
    text-anchor="middle"
    font-family="Verdana,Geneva,DejaVu Sans,sans-serif"
    text-rendering="geometricPrecision"
    font-size="110"
  >
    <text x="235" y="140" transform="scale(.1)" fill="#fff" textLength="350">
      cactus
    </text>
    <text x="665" y="140" transform="scale(.1)" fill="#fff" textLength="350">
      grown
    </text>
  </g>
</svg>

`

exports['The badge generator "flat-square" template badge generation should match snapshots: message/label, with logo 1'] = `
<svg
  xmlns="http://www.w3.org/2000/svg"
  xmlns:xlink="http://www.w3.org/1999/xlink"
  width="107"
  height="20"
  role="img"
  aria-label="cactus: grown"
>
  <title>cactus: grown</title>
  <g shape-rendering="crispEdges">
    <rect width="62" height="20" fill="#0f0" />
    <rect x="62" width="45" height="20" fill="#b3e" />
  </g>
  <g
    fill="#fff"
    text-anchor="middle"
    font-family="Verdana,Geneva,DejaVu Sans,sans-serif"
    text-rendering="geometricPrecision"
    font-size="110"
  >
    <image
      x="5"
      y="3"
      width="14"
      height="14"
      xlink:href="data:image/svg+xml;base64,PHN2ZyB4bWxu"
    />
    <text x="405" y="140" transform="scale(.1)" fill="#fff" textLength="350">
      cactus
    </text>
    <text x="835" y="140" transform="scale(.1)" fill="#fff" textLength="350">
      grown
    </text>
  </g>
</svg>

`

exports['The badge generator "flat-square" template badge generation should match snapshots: message only, no logo 1'] = `
<svg
  xmlns="http://www.w3.org/2000/svg"
  xmlns:xlink="http://www.w3.org/1999/xlink"
  width="45"
  height="20"
  role="img"
  aria-label="grown"
>
  <title>grown</title>
  <g shape-rendering="crispEdges">
    <rect width="0" height="20" fill="#b3e" />
    <rect x="0" width="45" height="20" fill="#b3e" />
  </g>
  <g
    fill="#fff"
    text-anchor="middle"
    font-family="Verdana,Geneva,DejaVu Sans,sans-serif"
    text-rendering="geometricPrecision"
    font-size="110"
  >
    <text x="225" y="140" transform="scale(.1)" fill="#fff" textLength="350">
      grown
    </text>
  </g>
</svg>

`

exports['The badge generator "flat-square" template badge generation should match snapshots: message only, with logo 1'] = `
<svg
  xmlns="http://www.w3.org/2000/svg"
  xmlns:xlink="http://www.w3.org/1999/xlink"
  width="63"
  height="20"
  role="img"
  aria-label="grown"
>
  <title>grown</title>
  <g shape-rendering="crispEdges">
    <rect width="0" height="20" fill="#555" />
    <rect x="0" width="63" height="20" fill="#b3e" />
  </g>
  <g
    fill="#fff"
    text-anchor="middle"
    font-family="Verdana,Geneva,DejaVu Sans,sans-serif"
    text-rendering="geometricPrecision"
    font-size="110"
  >
    <image
      x="5"
      y="3"
      width="14"
      height="14"
      xlink:href="data:image/svg+xml;base64,PHN2ZyB4bWxu"
    />
    <text x="405" y="140" transform="scale(.1)" fill="#fff" textLength="350">
      grown
    </text>
  </g>
</svg>

`

exports['The badge generator "flat-square" template badge generation should match snapshots: message only, with logo and labelColor 1'] = `
<svg
  xmlns="http://www.w3.org/2000/svg"
  xmlns:xlink="http://www.w3.org/1999/xlink"
  width="69"
  height="20"
  role="img"
  aria-label="grown"
>
  <title>grown</title>
  <g shape-rendering="crispEdges">
    <rect width="24" height="20" fill="#0f0" />
    <rect x="24" width="45" height="20" fill="#b3e" />
  </g>
  <g
    fill="#fff"
    text-anchor="middle"
    font-family="Verdana,Geneva,DejaVu Sans,sans-serif"
    text-rendering="geometricPrecision"
    font-size="110"
  >
    <image
      x="5"
      y="3"
      width="14"
      height="14"
      xlink:href="data:image/svg+xml;base64,PHN2ZyB4bWxu"
    />
    <text x="455" y="140" transform="scale(.1)" fill="#fff" textLength="350">
      grown
    </text>
  </g>
</svg>

`

exports['The badge generator "flat-square" template badge generation should match snapshots: message/label, with links 1'] = `
<svg
  xmlns="http://www.w3.org/2000/svg"
  xmlns:xlink="http://www.w3.org/1999/xlink"
  width="90"
  height="20"
>
  <g shape-rendering="crispEdges">
    <rect width="45" height="20" fill="#0f0" />
    <rect x="45" width="45" height="20" fill="#b3e" />
  </g>
  <g
    fill="#fff"
    text-anchor="middle"
    font-family="Verdana,Geneva,DejaVu Sans,sans-serif"
    text-rendering="geometricPrecision"
    font-size="110"
  >
    <a target="_blank" xlink:href="https://shields.io/">
      <rect width="45" x="0" height="20" fill="rgba(0,0,0,0)" />
      <text x="235" y="140" transform="scale(.1)" fill="#fff" textLength="350">
        cactus
      </text>
    </a>
    <a target="_blank" xlink:href="https://www.google.co.uk/">
      <rect width="45" x="45" height="20" fill="rgba(0,0,0,0)" />
      <text x="665" y="140" transform="scale(.1)" fill="#fff" textLength="350">
        grown
      </text>
    </a>
  </g>
</svg>

`

exports['The badge generator "flat-square" template badge generation should match snapshots: black text when the label color is light 1'] = `
<svg
  xmlns="http://www.w3.org/2000/svg"
  xmlns:xlink="http://www.w3.org/1999/xlink"
  width="90"
  height="20"
  role="img"
  aria-label="cactus: grown"
>
  <title>cactus: grown</title>
  <g shape-rendering="crispEdges">
    <rect width="45" height="20" fill="#f3f3f3" />
    <rect x="45" width="45" height="20" fill="#000" />
  </g>
  <g
    fill="#fff"
    text-anchor="middle"
    font-family="Verdana,Geneva,DejaVu Sans,sans-serif"
    text-rendering="geometricPrecision"
    font-size="110"
  >
    <text x="235" y="140" transform="scale(.1)" fill="#333" textLength="350">
      cactus
    </text>
    <text x="665" y="140" transform="scale(.1)" fill="#fff" textLength="350">
      grown
    </text>
  </g>
</svg>

`

exports['The badge generator "flat-square" template badge generation should match snapshots: black text when the message color is light 1'] = `
<svg
  xmlns="http://www.w3.org/2000/svg"
  xmlns:xlink="http://www.w3.org/1999/xlink"
  width="90"
  height="20"
  role="img"
  aria-label="cactus: grown"
>
  <title>cactus: grown</title>
  <g shape-rendering="crispEdges">
    <rect width="45" height="20" fill="#000" />
    <rect x="45" width="45" height="20" fill="#e2ffe1" />
  </g>
  <g
    fill="#fff"
    text-anchor="middle"
    font-family="Verdana,Geneva,DejaVu Sans,sans-serif"
    text-rendering="geometricPrecision"
    font-size="110"
  >
    <text x="235" y="140" transform="scale(.1)" fill="#fff" textLength="350">
      cactus
    </text>
    <text x="665" y="140" transform="scale(.1)" fill="#333" textLength="350">
      grown
    </text>
  </g>
</svg>

`

exports['The badge generator "plastic" template badge generation should match snapshots: message/label, no logo 1'] = `
<svg
  xmlns="http://www.w3.org/2000/svg"
  xmlns:xlink="http://www.w3.org/1999/xlink"
  width="90"
  height="18"
  role="img"
  aria-label="cactus: grown"
>
  <title>cactus: grown</title>
  <linearGradient id="s" x2="0" y2="100%">
    <stop offset="0" stop-color="#fff" stop-opacity=".7" />
    <stop offset=".1" stop-color="#aaa" stop-opacity=".1" />
    <stop offset=".9" stop-color="#000" stop-opacity=".3" />
    <stop offset="1" stop-color="#000" stop-opacity=".5" />
  </linearGradient>
  <clipPath id="r"><rect width="90" height="18" rx="4" fill="#fff" /></clipPath>
  <g clip-path="url(#r)">
    <rect width="45" height="18" fill="#0f0" />
    <rect x="45" width="45" height="18" fill="#b3e" />
    <rect width="90" height="18" fill="url(#s)" />
  </g>
  <g
    fill="#fff"
    text-anchor="middle"
    font-family="Verdana,Geneva,DejaVu Sans,sans-serif"
    text-rendering="geometricPrecision"
    font-size="110"
  >
    <text
      aria-hidden="true"
      x="235"
      y="140"
      fill="#010101"
      fill-opacity=".3"
      transform="scale(.1)"
      textLength="350"
    >
      cactus
    </text>
    <text x="235" y="130" transform="scale(.1)" fill="#fff" textLength="350">
      cactus
    </text>
    <text
      aria-hidden="true"
      x="665"
      y="140"
      fill="#010101"
      fill-opacity=".3"
      transform="scale(.1)"
      textLength="350"
    >
      grown
    </text>
    <text x="665" y="130" transform="scale(.1)" fill="#fff" textLength="350">
      grown
    </text>
  </g>
</svg>

`

exports['The badge generator "plastic" template badge generation should match snapshots: message/label, with logo 1'] = `
<svg
  xmlns="http://www.w3.org/2000/svg"
  xmlns:xlink="http://www.w3.org/1999/xlink"
  width="107"
  height="18"
  role="img"
  aria-label="cactus: grown"
>
  <title>cactus: grown</title>
  <linearGradient id="s" x2="0" y2="100%">
    <stop offset="0" stop-color="#fff" stop-opacity=".7" />
    <stop offset=".1" stop-color="#aaa" stop-opacity=".1" />
    <stop offset=".9" stop-color="#000" stop-opacity=".3" />
    <stop offset="1" stop-color="#000" stop-opacity=".5" />
  </linearGradient>
  <clipPath id="r">
    <rect width="107" height="18" rx="4" fill="#fff" />
  </clipPath>
  <g clip-path="url(#r)">
    <rect width="62" height="18" fill="#0f0" />
    <rect x="62" width="45" height="18" fill="#b3e" />
    <rect width="107" height="18" fill="url(#s)" />
  </g>
  <g
    fill="#fff"
    text-anchor="middle"
    font-family="Verdana,Geneva,DejaVu Sans,sans-serif"
    text-rendering="geometricPrecision"
    font-size="110"
  >
    <image
      x="5"
      y="2"
      width="14"
      height="14"
      xlink:href="data:image/svg+xml;base64,PHN2ZyB4bWxu"
    />
    <text
      aria-hidden="true"
      x="405"
      y="140"
      fill="#010101"
      fill-opacity=".3"
      transform="scale(.1)"
      textLength="350"
    >
      cactus
    </text>
    <text x="405" y="130" transform="scale(.1)" fill="#fff" textLength="350">
      cactus
    </text>
    <text
      aria-hidden="true"
      x="835"
      y="140"
      fill="#010101"
      fill-opacity=".3"
      transform="scale(.1)"
      textLength="350"
    >
      grown
    </text>
    <text x="835" y="130" transform="scale(.1)" fill="#fff" textLength="350">
      grown
    </text>
  </g>
</svg>

`

exports['The badge generator "plastic" template badge generation should match snapshots: message only, no logo 1'] = `
<svg
  xmlns="http://www.w3.org/2000/svg"
  xmlns:xlink="http://www.w3.org/1999/xlink"
  width="45"
  height="18"
  role="img"
  aria-label="grown"
>
  <title>grown</title>
  <linearGradient id="s" x2="0" y2="100%">
    <stop offset="0" stop-color="#fff" stop-opacity=".7" />
    <stop offset=".1" stop-color="#aaa" stop-opacity=".1" />
    <stop offset=".9" stop-color="#000" stop-opacity=".3" />
    <stop offset="1" stop-color="#000" stop-opacity=".5" />
  </linearGradient>
  <clipPath id="r"><rect width="45" height="18" rx="4" fill="#fff" /></clipPath>
  <g clip-path="url(#r)">
    <rect width="0" height="18" fill="#b3e" />
    <rect x="0" width="45" height="18" fill="#b3e" />
    <rect width="45" height="18" fill="url(#s)" />
  </g>
  <g
    fill="#fff"
    text-anchor="middle"
    font-family="Verdana,Geneva,DejaVu Sans,sans-serif"
    text-rendering="geometricPrecision"
    font-size="110"
  >
    <text
      aria-hidden="true"
      x="225"
      y="140"
      fill="#010101"
      fill-opacity=".3"
      transform="scale(.1)"
      textLength="350"
    >
      grown
    </text>
    <text x="225" y="130" transform="scale(.1)" fill="#fff" textLength="350">
      grown
    </text>
  </g>
</svg>

`

exports['The badge generator "plastic" template badge generation should match snapshots: message only, with logo 1'] = `
<svg
  xmlns="http://www.w3.org/2000/svg"
  xmlns:xlink="http://www.w3.org/1999/xlink"
  width="63"
  height="18"
  role="img"
  aria-label="grown"
>
  <title>grown</title>
  <linearGradient id="s" x2="0" y2="100%">
    <stop offset="0" stop-color="#fff" stop-opacity=".7" />
    <stop offset=".1" stop-color="#aaa" stop-opacity=".1" />
    <stop offset=".9" stop-color="#000" stop-opacity=".3" />
    <stop offset="1" stop-color="#000" stop-opacity=".5" />
  </linearGradient>
  <clipPath id="r"><rect width="63" height="18" rx="4" fill="#fff" /></clipPath>
  <g clip-path="url(#r)">
    <rect width="0" height="18" fill="#555" />
    <rect x="0" width="63" height="18" fill="#b3e" />
    <rect width="63" height="18" fill="url(#s)" />
  </g>
  <g
    fill="#fff"
    text-anchor="middle"
    font-family="Verdana,Geneva,DejaVu Sans,sans-serif"
    text-rendering="geometricPrecision"
    font-size="110"
  >
    <image
      x="5"
      y="2"
      width="14"
      height="14"
      xlink:href="data:image/svg+xml;base64,PHN2ZyB4bWxu"
    />
    <text
      aria-hidden="true"
      x="405"
      y="140"
      fill="#010101"
      fill-opacity=".3"
      transform="scale(.1)"
      textLength="350"
    >
      grown
    </text>
    <text x="405" y="130" transform="scale(.1)" fill="#fff" textLength="350">
      grown
    </text>
  </g>
</svg>

`

exports['The badge generator "plastic" template badge generation should match snapshots: message only, with logo and labelColor 1'] = `
<svg
  xmlns="http://www.w3.org/2000/svg"
  xmlns:xlink="http://www.w3.org/1999/xlink"
  width="69"
  height="18"
  role="img"
  aria-label="grown"
>
  <title>grown</title>
  <linearGradient id="s" x2="0" y2="100%">
    <stop offset="0" stop-color="#fff" stop-opacity=".7" />
    <stop offset=".1" stop-color="#aaa" stop-opacity=".1" />
    <stop offset=".9" stop-color="#000" stop-opacity=".3" />
    <stop offset="1" stop-color="#000" stop-opacity=".5" />
  </linearGradient>
  <clipPath id="r"><rect width="69" height="18" rx="4" fill="#fff" /></clipPath>
  <g clip-path="url(#r)">
    <rect width="24" height="18" fill="#0f0" />
    <rect x="24" width="45" height="18" fill="#b3e" />
    <rect width="69" height="18" fill="url(#s)" />
  </g>
  <g
    fill="#fff"
    text-anchor="middle"
    font-family="Verdana,Geneva,DejaVu Sans,sans-serif"
    text-rendering="geometricPrecision"
    font-size="110"
  >
    <image
      x="5"
      y="2"
      width="14"
      height="14"
      xlink:href="data:image/svg+xml;base64,PHN2ZyB4bWxu"
    />
    <text
      aria-hidden="true"
      x="455"
      y="140"
      fill="#010101"
      fill-opacity=".3"
      transform="scale(.1)"
      textLength="350"
    >
      grown
    </text>
    <text x="455" y="130" transform="scale(.1)" fill="#fff" textLength="350">
      grown
    </text>
  </g>
</svg>

`

exports['The badge generator "plastic" template badge generation should match snapshots: message/label, with links 1'] = `
<svg
  xmlns="http://www.w3.org/2000/svg"
  xmlns:xlink="http://www.w3.org/1999/xlink"
  width="90"
  height="18"
>
  <linearGradient id="s" x2="0" y2="100%">
    <stop offset="0" stop-color="#fff" stop-opacity=".7" />
    <stop offset=".1" stop-color="#aaa" stop-opacity=".1" />
    <stop offset=".9" stop-color="#000" stop-opacity=".3" />
    <stop offset="1" stop-color="#000" stop-opacity=".5" />
  </linearGradient>
  <clipPath id="r"><rect width="90" height="18" rx="4" fill="#fff" /></clipPath>
  <g clip-path="url(#r)">
    <rect width="45" height="18" fill="#0f0" />
    <rect x="45" width="45" height="18" fill="#b3e" />
    <rect width="90" height="18" fill="url(#s)" />
  </g>
  <g
    fill="#fff"
    text-anchor="middle"
    font-family="Verdana,Geneva,DejaVu Sans,sans-serif"
    text-rendering="geometricPrecision"
    font-size="110"
  >
    <a target="_blank" xlink:href="https://shields.io/">
      <rect width="45" x="0" height="18" fill="rgba(0,0,0,0)" />
      <text
        aria-hidden="true"
        x="235"
        y="140"
        fill="#010101"
        fill-opacity=".3"
        transform="scale(.1)"
        textLength="350"
      >
        cactus
      </text>
      <text x="235" y="130" transform="scale(.1)" fill="#fff" textLength="350">
        cactus
      </text>
    </a>
    <a target="_blank" xlink:href="https://www.google.co.uk/">
      <rect width="45" x="45" height="18" fill="rgba(0,0,0,0)" />
      <text
        aria-hidden="true"
        x="665"
        y="140"
        fill="#010101"
        fill-opacity=".3"
        transform="scale(.1)"
        textLength="350"
      >
        grown
      </text>
      <text x="665" y="130" transform="scale(.1)" fill="#fff" textLength="350">
        grown
      </text>
    </a>
  </g>
</svg>

`

exports['The badge generator "plastic" template badge generation should match snapshots: black text when the label color is light 1'] = `
<svg
  xmlns="http://www.w3.org/2000/svg"
  xmlns:xlink="http://www.w3.org/1999/xlink"
  width="90"
  height="18"
  role="img"
  aria-label="cactus: grown"
>
  <title>cactus: grown</title>
  <linearGradient id="s" x2="0" y2="100%">
    <stop offset="0" stop-color="#fff" stop-opacity=".7" />
    <stop offset=".1" stop-color="#aaa" stop-opacity=".1" />
    <stop offset=".9" stop-color="#000" stop-opacity=".3" />
    <stop offset="1" stop-color="#000" stop-opacity=".5" />
  </linearGradient>
  <clipPath id="r"><rect width="90" height="18" rx="4" fill="#fff" /></clipPath>
  <g clip-path="url(#r)">
    <rect width="45" height="18" fill="#f3f3f3" />
    <rect x="45" width="45" height="18" fill="#000" />
    <rect width="90" height="18" fill="url(#s)" />
  </g>
  <g
    fill="#fff"
    text-anchor="middle"
    font-family="Verdana,Geneva,DejaVu Sans,sans-serif"
    text-rendering="geometricPrecision"
    font-size="110"
  >
    <text
      aria-hidden="true"
      x="235"
      y="140"
      fill="#ccc"
      fill-opacity=".3"
      transform="scale(.1)"
      textLength="350"
    >
      cactus
    </text>
    <text x="235" y="130" transform="scale(.1)" fill="#333" textLength="350">
      cactus
    </text>
    <text
      aria-hidden="true"
      x="665"
      y="140"
      fill="#010101"
      fill-opacity=".3"
      transform="scale(.1)"
      textLength="350"
    >
      grown
    </text>
    <text x="665" y="130" transform="scale(.1)" fill="#fff" textLength="350">
      grown
    </text>
  </g>
</svg>

`

exports['The badge generator "plastic" template badge generation should match snapshots: black text when the message color is light 1'] = `
<svg
  xmlns="http://www.w3.org/2000/svg"
  xmlns:xlink="http://www.w3.org/1999/xlink"
  width="90"
  height="18"
  role="img"
  aria-label="cactus: grown"
>
  <title>cactus: grown</title>
  <linearGradient id="s" x2="0" y2="100%">
    <stop offset="0" stop-color="#fff" stop-opacity=".7" />
    <stop offset=".1" stop-color="#aaa" stop-opacity=".1" />
    <stop offset=".9" stop-color="#000" stop-opacity=".3" />
    <stop offset="1" stop-color="#000" stop-opacity=".5" />
  </linearGradient>
  <clipPath id="r"><rect width="90" height="18" rx="4" fill="#fff" /></clipPath>
  <g clip-path="url(#r)">
    <rect width="45" height="18" fill="#000" />
    <rect x="45" width="45" height="18" fill="#e2ffe1" />
    <rect width="90" height="18" fill="url(#s)" />
  </g>
  <g
    fill="#fff"
    text-anchor="middle"
    font-family="Verdana,Geneva,DejaVu Sans,sans-serif"
    text-rendering="geometricPrecision"
    font-size="110"
  >
    <text
      aria-hidden="true"
      x="235"
      y="140"
      fill="#010101"
      fill-opacity=".3"
      transform="scale(.1)"
      textLength="350"
    >
      cactus
    </text>
    <text x="235" y="130" transform="scale(.1)" fill="#fff" textLength="350">
      cactus
    </text>
    <text
      aria-hidden="true"
      x="665"
      y="140"
      fill="#ccc"
      fill-opacity=".3"
      transform="scale(.1)"
      textLength="350"
    >
      grown
    </text>
    <text x="665" y="130" transform="scale(.1)" fill="#333" textLength="350">
      grown
    </text>
  </g>
</svg>

`

exports['The badge generator "for-the-badge" template badge generation should match snapshots: message/label, no logo 1'] = `
<svg
  xmlns="http://www.w3.org/2000/svg"
  xmlns:xlink="http://www.w3.org/1999/xlink"
  width="146.75"
  height="28"
  role="img"
  aria-label="CACTUS: GROWN"
>
  <title>CACTUS: GROWN</title>
  <g shape-rendering="crispEdges">
    <rect width="72.5" height="28" fill="#0f0" />
    <rect x="72.5" width="74.25" height="28" fill="#b3e" />
  </g>
  <g
    fill="#fff"
    text-anchor="middle"
    font-family="Verdana,Geneva,DejaVu Sans,sans-serif"
    text-rendering="geometricPrecision"
    font-size="100"
  >
    <text transform="scale(.1)" x="362.5" y="175" textLength="485" fill="#fff">
      CACTUS
    </text>
    <text
      transform="scale(.1)"
      x="1096.25"
      y="175"
      textLength="502.5"
      fill="#fff"
      font-weight="bold"
    >
      GROWN
    </text>
  </g>
</svg>

`

exports['The badge generator "for-the-badge" template badge generation should match snapshots: message/label, with logo 1'] = `
<svg
  xmlns="http://www.w3.org/2000/svg"
  xmlns:xlink="http://www.w3.org/1999/xlink"
  width="163.75"
  height="28"
  role="img"
  aria-label="CACTUS: GROWN"
>
  <title>CACTUS: GROWN</title>
  <g shape-rendering="crispEdges">
    <rect width="89.5" height="28" fill="#0f0" />
    <rect x="89.5" width="74.25" height="28" fill="#b3e" />
  </g>
  <g
    fill="#fff"
    text-anchor="middle"
    font-family="Verdana,Geneva,DejaVu Sans,sans-serif"
    text-rendering="geometricPrecision"
    font-size="100"
  >
    <image
      x="9"
      y="7"
      width="14"
      height="14"
      xlink:href="data:image/svg+xml;base64,PHN2ZyB4bWxu"
    />
    <text transform="scale(.1)" x="532.5" y="175" textLength="485" fill="#fff">
      CACTUS
    </text>
    <text
      transform="scale(.1)"
      x="1266.25"
      y="175"
      textLength="502.5"
      fill="#fff"
      font-weight="bold"
    >
      GROWN
    </text>
  </g>
</svg>

`

exports['The badge generator "for-the-badge" template badge generation should match snapshots: message only, no logo 1'] = `
<svg
  xmlns="http://www.w3.org/2000/svg"
  xmlns:xlink="http://www.w3.org/1999/xlink"
  width="74.25"
  height="28"
  role="img"
  aria-label="GROWN"
>
  <title>GROWN</title>
  <g shape-rendering="crispEdges">
    <rect width="74.25" height="28" fill="#b3e" />
  </g>
  <g
    fill="#fff"
    text-anchor="middle"
    font-family="Verdana,Geneva,DejaVu Sans,sans-serif"
    text-rendering="geometricPrecision"
    font-size="100"
  >
    <text
      transform="scale(.1)"
      x="371.25"
      y="175"
      textLength="502.5"
      fill="#fff"
      font-weight="bold"
    >
      GROWN
    </text>
  </g>
</svg>

`

exports['The badge generator "for-the-badge" template badge generation should match snapshots: message only, with logo 1'] = `
<svg
  xmlns="http://www.w3.org/2000/svg"
  xmlns:xlink="http://www.w3.org/1999/xlink"
  width="94.25"
  height="28"
  role="img"
  aria-label="GROWN"
>
  <title>GROWN</title>
  <g shape-rendering="crispEdges">
    <rect width="94.25" height="28" fill="#b3e" />
  </g>
  <g
    fill="#fff"
    text-anchor="middle"
    font-family="Verdana,Geneva,DejaVu Sans,sans-serif"
    text-rendering="geometricPrecision"
    font-size="100"
  >
    <image
      x="9"
      y="7"
      width="14"
      height="14"
      xlink:href="data:image/svg+xml;base64,PHN2ZyB4bWxu"
    />
    <text
      transform="scale(.1)"
      x="571.25"
      y="175"
      textLength="502.5"
      fill="#fff"
      font-weight="bold"
    >
      GROWN
    </text>
  </g>
</svg>

`

exports['The badge generator "for-the-badge" template badge generation should match snapshots: message only, with logo and labelColor 1'] = `
<svg
  xmlns="http://www.w3.org/2000/svg"
  xmlns:xlink="http://www.w3.org/1999/xlink"
  width="106.25"
  height="28"
  role="img"
  aria-label="GROWN"
>
  <title>GROWN</title>
  <g shape-rendering="crispEdges">
    <rect width="32" height="28" fill="#0f0" />
    <rect x="32" width="74.25" height="28" fill="#b3e" />
  </g>
  <g
    fill="#fff"
    text-anchor="middle"
    font-family="Verdana,Geneva,DejaVu Sans,sans-serif"
    text-rendering="geometricPrecision"
    font-size="100"
  >
    <image
      x="9"
      y="7"
      width="14"
      height="14"
      xlink:href="data:image/svg+xml;base64,PHN2ZyB4bWxu"
    />
    <text
      transform="scale(.1)"
      x="691.25"
      y="175"
      textLength="502.5"
      fill="#fff"
      font-weight="bold"
    >
      GROWN
    </text>
  </g>
</svg>

`

exports['The badge generator "for-the-badge" template badge generation should match snapshots: message/label, with links 1'] = `
<svg
  xmlns="http://www.w3.org/2000/svg"
  xmlns:xlink="http://www.w3.org/1999/xlink"
  width="146.75"
  height="28"
>
  <g shape-rendering="crispEdges">
    <rect width="72.5" height="28" fill="#0f0" />
    <rect x="72.5" width="74.25" height="28" fill="#b3e" />
  </g>
  <g
    fill="#fff"
    text-anchor="middle"
    font-family="Verdana,Geneva,DejaVu Sans,sans-serif"
    text-rendering="geometricPrecision"
    font-size="100"
  >
    <a target="_blank" xlink:href="https://shields.io/">
      <rect width="72.5" height="28" fill="rgba(0,0,0,0)" />
      <text
        transform="scale(.1)"
        x="362.5"
        y="175"
        textLength="485"
        fill="#fff"
      >
        CACTUS
      </text>
    </a>
    <a target="_blank" xlink:href="https://www.google.co.uk/">
      <rect width="74.25" height="28" x="72.5" fill="rgba(0,0,0,0)" />
      <text
        transform="scale(.1)"
        x="1096.25"
        y="175"
        textLength="502.5"
        fill="#fff"
        font-weight="bold"
      >
        GROWN
      </text>
    </a>
  </g>
</svg>

`

exports['The badge generator "for-the-badge" template badge generation should match snapshots: black text when the label color is light 1'] = `
<svg
  xmlns="http://www.w3.org/2000/svg"
  xmlns:xlink="http://www.w3.org/1999/xlink"
  width="146.75"
  height="28"
  role="img"
  aria-label="CACTUS: GROWN"
>
  <title>CACTUS: GROWN</title>
  <g shape-rendering="crispEdges">
    <rect width="72.5" height="28" fill="#f3f3f3" />
    <rect x="72.5" width="74.25" height="28" fill="#000" />
  </g>
  <g
    fill="#fff"
    text-anchor="middle"
    font-family="Verdana,Geneva,DejaVu Sans,sans-serif"
    text-rendering="geometricPrecision"
    font-size="100"
  >
    <text transform="scale(.1)" x="362.5" y="175" textLength="485" fill="#333">
      CACTUS
    </text>
    <text
      transform="scale(.1)"
      x="1096.25"
      y="175"
      textLength="502.5"
      fill="#fff"
      font-weight="bold"
    >
      GROWN
    </text>
  </g>
</svg>

`

exports['The badge generator "for-the-badge" template badge generation should match snapshots: black text when the message color is light 1'] = `
<svg
  xmlns="http://www.w3.org/2000/svg"
  xmlns:xlink="http://www.w3.org/1999/xlink"
  width="146.75"
  height="28"
  role="img"
  aria-label="CACTUS: GROWN"
>
  <title>CACTUS: GROWN</title>
  <g shape-rendering="crispEdges">
    <rect width="72.5" height="28" fill="#000" />
    <rect x="72.5" width="74.25" height="28" fill="#e2ffe1" />
  </g>
  <g
    fill="#fff"
    text-anchor="middle"
    font-family="Verdana,Geneva,DejaVu Sans,sans-serif"
    text-rendering="geometricPrecision"
    font-size="100"
  >
    <text transform="scale(.1)" x="362.5" y="175" textLength="485" fill="#fff">
      CACTUS
    </text>
    <text
      transform="scale(.1)"
      x="1096.25"
      y="175"
      textLength="502.5"
      fill="#333"
      font-weight="bold"
    >
      GROWN
    </text>
  </g>
</svg>

`

exports['The badge generator "social" template badge generation should match snapshots: message/label, no logo 1'] = `
<svg
  xmlns="http://www.w3.org/2000/svg"
  xmlns:xlink="http://www.w3.org/1999/xlink"
  width="95"
  height="20"
  role="img"
  aria-label="Cactus: grown"
>
  <title>Cactus: grown</title>
  <style>
    a:hover #llink {
      fill: url(#b);
      stroke: #ccc;
    }
    a:hover #rlink {
      fill: #4183c4;
    }
  </style>
  <linearGradient id="a" x2="0" y2="100%">
    <stop offset="0" stop-color="#fcfcfc" stop-opacity="0" />
    <stop offset="1" stop-opacity=".1" />
  </linearGradient>
  <linearGradient id="b" x2="0" y2="100%">
    <stop offset="0" stop-color="#ccc" stop-opacity=".1" />
    <stop offset="1" stop-opacity=".1" />
  </linearGradient>
  <g stroke="#d5d5d5">
    <rect
      stroke="none"
      fill="#fcfcfc"
      x="0.5"
      y="0.5"
      width="47"
      height="19"
      rx="2"
    />
    <rect x="53.5" y="0.5" width="41" height="19" rx="2" fill="#fafafa" />
    <rect x="53" y="7.5" width="0.5" height="5" stroke="#fafafa" />
    <path d="M53.5 6.5 l-3 3v1 l3 3" stroke="d5d5d5" fill="#fafafa" />
  </g>
  <g
    aria-hidden="true"
    fill="#333"
    text-anchor="middle"
    font-family="Helvetica Neue,Helvetica,Arial,sans-serif"
    text-rendering="geometricPrecision"
    font-weight="700"
    font-size="110px"
    line-height="14px"
  >
    <rect
      id="llink"
      stroke="#d5d5d5"
      fill="url(#a)"
      x=".5"
      y=".5"
      width="47"
      height="19"
      rx="2"
    />
    <text
      aria-hidden="true"
      x="235"
      y="150"
      fill="#fff"
      transform="scale(.1)"
      textLength="370"
    >
      Cactus
    </text>
    <text x="235" y="140" transform="scale(.1)" textLength="370">Cactus</text>
    <text
      aria-hidden="true"
      x="735"
      y="150"
      fill="#fff"
      transform="scale(.1)"
      textLength="330"
    >
      grown
    </text>
    <text id="rlink" x="735" y="140" transform="scale(.1)" textLength="330">
      grown
    </text>
  </g>
</svg>

`

exports['The badge generator "social" template badge generation should match snapshots: message/label, with logo 1'] = `
<svg
  xmlns="http://www.w3.org/2000/svg"
  xmlns:xlink="http://www.w3.org/1999/xlink"
  width="112"
  height="20"
  role="img"
  aria-label="Cactus: grown"
>
  <title>Cactus: grown</title>
  <style>
    a:hover #llink {
      fill: url(#b);
      stroke: #ccc;
    }
    a:hover #rlink {
      fill: #4183c4;
    }
  </style>
  <linearGradient id="a" x2="0" y2="100%">
    <stop offset="0" stop-color="#fcfcfc" stop-opacity="0" />
    <stop offset="1" stop-opacity=".1" />
  </linearGradient>
  <linearGradient id="b" x2="0" y2="100%">
    <stop offset="0" stop-color="#ccc" stop-opacity=".1" />
    <stop offset="1" stop-opacity=".1" />
  </linearGradient>
  <g stroke="#d5d5d5">
    <rect
      stroke="none"
      fill="#fcfcfc"
      x="0.5"
      y="0.5"
      width="64"
      height="19"
      rx="2"
    />
    <rect x="70.5" y="0.5" width="41" height="19" rx="2" fill="#fafafa" />
    <rect x="70" y="7.5" width="0.5" height="5" stroke="#fafafa" />
    <path d="M70.5 6.5 l-3 3v1 l3 3" stroke="d5d5d5" fill="#fafafa" />
  </g>
  <image
    x="5"
    y="3"
    width="14"
    height="14"
    xlink:href="data:image/svg+xml;base64,PHN2ZyB4bWxu"
  />
  <g
    aria-hidden="true"
    fill="#333"
    text-anchor="middle"
    font-family="Helvetica Neue,Helvetica,Arial,sans-serif"
    text-rendering="geometricPrecision"
    font-weight="700"
    font-size="110px"
    line-height="14px"
  >
    <rect
      id="llink"
      stroke="#d5d5d5"
      fill="url(#a)"
      x=".5"
      y=".5"
      width="64"
      height="19"
      rx="2"
    />
    <text
      aria-hidden="true"
      x="405"
      y="150"
      fill="#fff"
      transform="scale(.1)"
      textLength="370"
    >
      Cactus
    </text>
    <text x="405" y="140" transform="scale(.1)" textLength="370">Cactus</text>
    <text
      aria-hidden="true"
      x="905"
      y="150"
      fill="#fff"
      transform="scale(.1)"
      textLength="330"
    >
      grown
    </text>
    <text id="rlink" x="905" y="140" transform="scale(.1)" textLength="330">
      grown
    </text>
  </g>
</svg>

`

exports['The badge generator "social" template badge generation should match snapshots: message only, no logo 1'] = `
<svg
  xmlns="http://www.w3.org/2000/svg"
  xmlns:xlink="http://www.w3.org/1999/xlink"
  width="59"
  height="20"
  role="img"
  aria-label="grown"
>
  <title>grown</title>
  <style>
    a:hover #llink {
      fill: url(#b);
      stroke: #ccc;
    }
    a:hover #rlink {
      fill: #4183c4;
    }
  </style>
  <linearGradient id="a" x2="0" y2="100%">
    <stop offset="0" stop-color="#fcfcfc" stop-opacity="0" />
    <stop offset="1" stop-opacity=".1" />
  </linearGradient>
  <linearGradient id="b" x2="0" y2="100%">
    <stop offset="0" stop-color="#ccc" stop-opacity=".1" />
    <stop offset="1" stop-opacity=".1" />
  </linearGradient>
  <g stroke="#d5d5d5">
    <rect
      stroke="none"
      fill="#fcfcfc"
      x="0.5"
      y="0.5"
      width="11"
      height="19"
      rx="2"
    />
    <rect x="17.5" y="0.5" width="41" height="19" rx="2" fill="#fafafa" />
    <rect x="17" y="7.5" width="0.5" height="5" stroke="#fafafa" />
    <path d="M17.5 6.5 l-3 3v1 l3 3" stroke="d5d5d5" fill="#fafafa" />
  </g>
  <g
    aria-hidden="true"
    fill="#333"
    text-anchor="middle"
    font-family="Helvetica Neue,Helvetica,Arial,sans-serif"
    text-rendering="geometricPrecision"
    font-weight="700"
    font-size="110px"
    line-height="14px"
  >
    <rect
      id="llink"
      stroke="#d5d5d5"
      fill="url(#a)"
      x=".5"
      y=".5"
      width="11"
      height="19"
      rx="2"
    />
    <text
      aria-hidden="true"
      x="55"
      y="150"
      fill="#fff"
      transform="scale(.1)"
      textLength="10"
    ></text>
    <text x="55" y="140" transform="scale(.1)" textLength="10"></text>
    <text
      aria-hidden="true"
      x="375"
      y="150"
      fill="#fff"
      transform="scale(.1)"
      textLength="330"
    >
      grown
    </text>
    <text id="rlink" x="375" y="140" transform="scale(.1)" textLength="330">
      grown
    </text>
  </g>
</svg>

`

exports['The badge generator "social" template badge generation should match snapshots: message only, with logo 1'] = `
<svg
  xmlns="http://www.w3.org/2000/svg"
  xmlns:xlink="http://www.w3.org/1999/xlink"
  width="73"
  height="20"
  role="img"
  aria-label="grown"
>
  <title>grown</title>
  <style>
    a:hover #llink {
      fill: url(#b);
      stroke: #ccc;
    }
    a:hover #rlink {
      fill: #4183c4;
    }
  </style>
  <linearGradient id="a" x2="0" y2="100%">
    <stop offset="0" stop-color="#fcfcfc" stop-opacity="0" />
    <stop offset="1" stop-opacity=".1" />
  </linearGradient>
  <linearGradient id="b" x2="0" y2="100%">
    <stop offset="0" stop-color="#ccc" stop-opacity=".1" />
    <stop offset="1" stop-opacity=".1" />
  </linearGradient>
  <g stroke="#d5d5d5">
    <rect
      stroke="none"
      fill="#fcfcfc"
      x="0.5"
      y="0.5"
      width="25"
      height="19"
      rx="2"
    />
    <rect x="31.5" y="0.5" width="41" height="19" rx="2" fill="#fafafa" />
    <rect x="31" y="7.5" width="0.5" height="5" stroke="#fafafa" />
    <path d="M31.5 6.5 l-3 3v1 l3 3" stroke="d5d5d5" fill="#fafafa" />
  </g>
  <image
    x="5"
    y="3"
    width="14"
    height="14"
    xlink:href="data:image/svg+xml;base64,PHN2ZyB4bWxu"
  />
  <g
    aria-hidden="true"
    fill="#333"
    text-anchor="middle"
    font-family="Helvetica Neue,Helvetica,Arial,sans-serif"
    text-rendering="geometricPrecision"
    font-weight="700"
    font-size="110px"
    line-height="14px"
  >
    <rect
      id="llink"
      stroke="#d5d5d5"
      fill="url(#a)"
      x=".5"
      y=".5"
      width="25"
      height="19"
      rx="2"
    />
    <text
      aria-hidden="true"
      x="195"
      y="150"
      fill="#fff"
      transform="scale(.1)"
      textLength="10"
    ></text>
    <text x="195" y="140" transform="scale(.1)" textLength="10"></text>
    <text
      aria-hidden="true"
      x="515"
      y="150"
      fill="#fff"
      transform="scale(.1)"
      textLength="330"
    >
      grown
    </text>
    <text id="rlink" x="515" y="140" transform="scale(.1)" textLength="330">
      grown
    </text>
  </g>
</svg>

`

exports['The badge generator "social" template badge generation should match snapshots: message only, with logo and labelColor 1'] = `
<svg
  xmlns="http://www.w3.org/2000/svg"
  xmlns:xlink="http://www.w3.org/1999/xlink"
  width="73"
  height="20"
  role="img"
  aria-label="grown"
>
  <title>grown</title>
  <style>
    a:hover #llink {
      fill: url(#b);
      stroke: #ccc;
    }
    a:hover #rlink {
      fill: #4183c4;
    }
  </style>
  <linearGradient id="a" x2="0" y2="100%">
    <stop offset="0" stop-color="#fcfcfc" stop-opacity="0" />
    <stop offset="1" stop-opacity=".1" />
  </linearGradient>
  <linearGradient id="b" x2="0" y2="100%">
    <stop offset="0" stop-color="#ccc" stop-opacity=".1" />
    <stop offset="1" stop-opacity=".1" />
  </linearGradient>
  <g stroke="#d5d5d5">
    <rect
      stroke="none"
      fill="#fcfcfc"
      x="0.5"
      y="0.5"
      width="25"
      height="19"
      rx="2"
    />
    <rect x="31.5" y="0.5" width="41" height="19" rx="2" fill="#fafafa" />
    <rect x="31" y="7.5" width="0.5" height="5" stroke="#fafafa" />
    <path d="M31.5 6.5 l-3 3v1 l3 3" stroke="d5d5d5" fill="#fafafa" />
  </g>
  <image
    x="5"
    y="3"
    width="14"
    height="14"
    xlink:href="data:image/svg+xml;base64,PHN2ZyB4bWxu"
  />
  <g
    aria-hidden="true"
    fill="#333"
    text-anchor="middle"
    font-family="Helvetica Neue,Helvetica,Arial,sans-serif"
    text-rendering="geometricPrecision"
    font-weight="700"
    font-size="110px"
    line-height="14px"
  >
    <rect
      id="llink"
      stroke="#d5d5d5"
      fill="url(#a)"
      x=".5"
      y=".5"
      width="25"
      height="19"
      rx="2"
    />
    <text
      aria-hidden="true"
      x="195"
      y="150"
      fill="#fff"
      transform="scale(.1)"
      textLength="10"
    ></text>
    <text x="195" y="140" transform="scale(.1)" textLength="10"></text>
    <text
      aria-hidden="true"
      x="515"
      y="150"
      fill="#fff"
      transform="scale(.1)"
      textLength="330"
    >
      grown
    </text>
    <text id="rlink" x="515" y="140" transform="scale(.1)" textLength="330">
      grown
    </text>
  </g>
</svg>

`

exports['The badge generator "social" template badge generation should match snapshots: message/label, with links 1'] = `
<svg
  xmlns="http://www.w3.org/2000/svg"
  xmlns:xlink="http://www.w3.org/1999/xlink"
  width="95"
  height="20"
>
  <style>
    a:hover #llink {
      fill: url(#b);
      stroke: #ccc;
    }
    a:hover #rlink {
      fill: #4183c4;
    }
  </style>
  <linearGradient id="a" x2="0" y2="100%">
    <stop offset="0" stop-color="#fcfcfc" stop-opacity="0" />
    <stop offset="1" stop-opacity=".1" />
  </linearGradient>
  <linearGradient id="b" x2="0" y2="100%">
    <stop offset="0" stop-color="#ccc" stop-opacity=".1" />
    <stop offset="1" stop-opacity=".1" />
  </linearGradient>
  <g stroke="#d5d5d5">
    <rect
      stroke="none"
      fill="#fcfcfc"
      x="0.5"
      y="0.5"
      width="47"
      height="19"
      rx="2"
    />
    <rect x="53.5" y="0.5" width="41" height="19" rx="2" fill="#fafafa" />
    <rect x="53" y="7.5" width="0.5" height="5" stroke="#fafafa" />
    <path d="M53.5 6.5 l-3 3v1 l3 3" stroke="d5d5d5" fill="#fafafa" />
  </g>
  <g
    aria-hidden="false"
    fill="#333"
    text-anchor="middle"
    font-family="Helvetica Neue,Helvetica,Arial,sans-serif"
    text-rendering="geometricPrecision"
    font-weight="700"
    font-size="110px"
    line-height="14px"
  >
    <a target="_blank" xlink:href="https://shields.io/">
      <text
        aria-hidden="true"
        x="235"
        y="150"
        fill="#fff"
        transform="scale(.1)"
        textLength="370"
      >
        Cactus
      </text>
      <text x="235" y="140" transform="scale(.1)" textLength="370">Cactus</text>
      <rect
        id="llink"
        stroke="#d5d5d5"
        fill="url(#a)"
        x=".5"
        y=".5"
        width="47"
        height="19"
        rx="2"
      />
    </a>
    <a target="_blank" xlink:href="https://www.google.co.uk/">
      <rect width="42" x="53" height="20" fill="rgba(0,0,0,0)" />
      <text
        aria-hidden="true"
        x="735"
        y="150"
        fill="#fff"
        transform="scale(.1)"
        textLength="330"
      >
        grown
      </text>
      <text id="rlink" x="735" y="140" transform="scale(.1)" textLength="330">
        grown
      </text>
    </a>
  </g>
</svg>

`

exports['The badge generator badges with logos should always produce the same badge badge with logo 1'] = `
<svg
  xmlns="http://www.w3.org/2000/svg"
  xmlns:xlink="http://www.w3.org/1999/xlink"
  width="113"
  height="20"
  role="img"
  aria-label="label: message"
>
  <title>label: message</title>
  <linearGradient id="s" x2="0" y2="100%">
    <stop offset="0" stop-color="#bbb" stop-opacity=".1" />
    <stop offset="1" stop-opacity=".1" />
  </linearGradient>
  <clipPath id="r">
    <rect width="113" height="20" rx="3" fill="#fff" />
  </clipPath>
  <g clip-path="url(#r)">
    <rect width="54" height="20" fill="#555" />
    <rect x="54" width="59" height="20" fill="#4c1" />
    <rect width="113" height="20" fill="url(#s)" />
  </g>
  <g
    fill="#fff"
    text-anchor="middle"
    font-family="Verdana,Geneva,DejaVu Sans,sans-serif"
    text-rendering="geometricPrecision"
    font-size="110"
  >
    <image
      x="5"
      y="3"
      width="14"
      height="14"
      xlink:href="data:image/svg+xml;base64,PHN2ZyB4bWxu"
    />
    <text
      aria-hidden="true"
      x="365"
      y="150"
      fill="#010101"
      fill-opacity=".3"
      transform="scale(.1)"
      textLength="270"
    >
      label
    </text>
    <text x="365" y="140" transform="scale(.1)" fill="#fff" textLength="270">
      label
    </text>
    <text
      aria-hidden="true"
      x="825"
      y="150"
      fill="#010101"
      fill-opacity=".3"
      transform="scale(.1)"
      textLength="490"
    >
      message
    </text>
    <text x="825" y="140" transform="scale(.1)" fill="#fff" textLength="490">
      message
    </text>
  </g>
</svg>

`
