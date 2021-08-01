import { ServiceTester } from '../tester.js'

export const t = new ServiceTester({
  id: 'WebsiteRedirect',
  title: 'WebsiteRedirect',
  pathPrefix: '',
})

t.create('Website with custom messages')
  .get('/website-up-down/https/www.google.com.svg')
  .expectRedirect(
    `/website.svg?down_message=down&up_message=up&url=${encodeURIComponent(
      'https://www.google.com'
    )}`
  )

t.create('Website with custom messages and colors')
  .get('/website-up-down-yellow-gray/https/www.google.com.svg')
  .expectRedirect(
    `/website.svg?down_color=gray&down_message=down&up_color=yellow&up_message=up&url=${encodeURIComponent(
      'https://www.google.com'
    )}`
  )

t.create('Website to queryParam with custom messages and colors')
  .get(
    '/website/https/www.google.com.svg?down_color=gray&down_message=down&up_color=yellow&up_message=up'
  )
  .expectRedirect(
    `/website.svg?down_color=gray&down_message=down&up_color=yellow&up_message=up&url=${encodeURIComponent(
      'https://www.google.com'
    )}`
  )
