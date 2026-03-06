import { describe, expect, it } from 'vitest';
import { renderMarkdown } from '../src/editor/markdown.js';

const sampleNote = `# Heading One

This has **bold**, *italic*, and a [link](https://example.com).

> Quoted text

- item one
- item two

- [x] done task
- [ ] pending task

| Name | Value |
| --- | --- |
| row | 1 |

![alt text](https://example.com/image.png)

\`\`\`js
const x = 1;
\`\`\`
`;

describe('markdown smoke conversion', () => {
  it('renders representative markdown structures', () => {
    const html = renderMarkdown(sampleNote);

    expect(html).toContain('<h1>Heading One</h1>');
    expect(html).toContain('<strong>bold</strong>');
    expect(html).toContain('<em>italic</em>');
    expect(html).toContain('<a href="https://example.com">link</a>');
    expect(html).toContain('<blockquote>');
    expect(html).toContain('<ul>');
    expect(html).toContain('<table>');
    expect(html).toContain('<img src="https://example.com/image.png" alt="alt text"');
    expect(html).toContain('<pre><code>');
    expect(html).toContain('checked type="checkbox"');
  });

  it('sanitizes potentially dangerous html by default', () => {
    const html = renderMarkdown('<img src="x" onerror="alert(1)"><script>alert(1)</script>');

    expect(html).toContain('<img src="x" />');
    expect(html).not.toContain('onerror');
    expect(html).not.toContain('<script>');
  });

  it('allows raw html in trusted mode', () => {
    const html = renderMarkdown('<span data-x="1">safe</span>', { trustedMode: true });

    expect(html).toContain('<span data-x="1">safe</span>');
  });
});
