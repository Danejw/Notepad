import MarkdownIt from 'markdown-it';
import markdownItTaskLists from 'markdown-it-task-lists';
import sanitizeHtml from 'sanitize-html';

const DEFAULT_SANITIZE_OPTIONS = {
  allowedTags: sanitizeHtml.defaults.allowedTags.concat([
    'img',
    'table',
    'thead',
    'tbody',
    'tr',
    'th',
    'td',
    'input'
  ]),
  allowedAttributes: {
    ...sanitizeHtml.defaults.allowedAttributes,
    a: ['href', 'name', 'target', 'rel', 'title'],
    img: ['src', 'alt', 'title'],
    input: ['type', 'checked', 'disabled']
  },
  allowedSchemes: ['http', 'https', 'mailto', 'tel']
};

const renderer = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: true,
  breaks: false
})
  .use(markdownItTaskLists, { enabled: true, label: true })
  .enable(['table', 'fence']);

export function renderMarkdown(markdownText, options = {}) {
  const { trustedMode = false, sanitizeOptions = DEFAULT_SANITIZE_OPTIONS } = options;
  const rawHtml = renderer.render(markdownText ?? '');

  if (trustedMode) {
    return rawHtml;
  }

  return sanitizeHtml(rawHtml, sanitizeOptions);
}

export function markdownToHtml(markdownText, options) {
  return renderMarkdown(markdownText, options);
}

export { DEFAULT_SANITIZE_OPTIONS };
