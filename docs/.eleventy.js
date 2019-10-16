const path = require('path');
const pluginSyntaxHighlight = require('@11ty/eleventy-plugin-syntaxhighlight');
const markdownIt = require('markdown-it');
const markdownItTocAndAnchor = require('markdown-it-toc-and-anchor').default;

module.exports = function(eleventyConfig) {
  eleventyConfig.setTemplateFormats([ 'md', 'njk' ]);
  eleventyConfig.addPassthroughCopy('docs/styles');
  eleventyConfig.addPassthroughCopy('docs/images');

  eleventyConfig.addPlugin(pluginSyntaxHighlight);

  eleventyConfig.setLibrary('md', markdownIt({
    html: true
  }).use(markdownItTocAndAnchor, {
    anchorClassName: 'heading-anchor',
    tocClassName: 'toc'
  }));
  
  eleventyConfig.addFilter('relUrl', (url, pageUrl) => {
    if(pageUrl.endsWith('.html')) {
      pageUrl = path.dirname(pageUrl);
    }
    let rel = path.relative(pageUrl, url);
    if(rel[0] !== '.') rel = './' + rel;
    return rel;
  })

  return {
    data: {
      dir: 'docs/_data'
    }
  };
};