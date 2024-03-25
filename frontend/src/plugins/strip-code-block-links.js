const { visit } = require('unist-util-visit')

function stripCodeBlockLinks() {
  /*
  Docusaurus 3 uses [remark-gfm](https://github.com/remarkjs/remark-gfm)
  One of the "features" of remark-gfm is that it automatically looks for URLs
  and email addresses, and automatically wraps them in <a> tags.

  This happens even if the URL is inside a <code> block.
  This behaviour is
  a) mostly unhelpful and
  b) non-configurable

  This plugin removes <a> tags which appear inside a <code> block.
  */
  return tree => {
    visit(tree, ['mdxJsxTextElement', 'mdxJsxFlowElement', 'element'], node => {
      if (node.name === 'code' || node.tagName === 'code') {
        const links = node.children.filter(child => child.tagName === 'a')
        links.forEach(link => {
          const linkText = link.children.map(child => child.value).join('')
          const linkIndex = node.children.indexOf(link)
          node.children.splice(linkIndex, 1, { type: 'text', value: linkText })
        })
      }
    })
  }
}

module.exports = stripCodeBlockLinks
