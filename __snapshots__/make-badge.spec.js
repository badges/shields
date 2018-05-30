exports['The badge generator SVG should always produce the same SVG (unless we have changed something!) 1'] = `
<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="88" height="20"><linearGradient id="b" x2="0" y2="100%"><stop offset="0" stop-color="#bbb" stop-opacity=".1"/><stop offset="1" stop-opacity=".1"/></linearGradient><clipPath id="a"><rect width="88" height="20" rx="3" fill="#fff"/></clipPath><g clip-path="url(#a)"><path fill="#555" d="M0 0h45v20H0z"/><path fill="#4c1" d="M45 0h43v20H45z"/><path fill="url(#b)" d="M0 0h88v20H0z"/></g><g fill="#fff" text-anchor="middle" font-family="DejaVu Sans,Verdana,Geneva,sans-serif" font-size="110"><text x="235" y="150" fill="#010101" fill-opacity=".3" transform="scale(.1)" textLength="350">cactus</text><text x="235" y="140" transform="scale(.1)" textLength="350">cactus</text><text x="655" y="150" fill="#010101" fill-opacity=".3" transform="scale(.1)" textLength="330">grown</text><text x="655" y="140" transform="scale(.1)" textLength="330">grown</text></g> </svg>
`

exports['The badge generator JSON should always produce the same JSON (unless we have changed something!) 1'] = `
{
  "name": "cactus",
  "value": "grown"
}
`
