# Notepad Editor Module

A lightweight JavaScript markdown editor module that provides:

- **Split-view markdown editing** (source on the left, rendered preview on the right).
- **Live markdown rendering** with support for:
  - headings
  - emphasis (bold/italic)
  - lists
  - links
  - images
  - tables
  - fenced code blocks
  - blockquotes
  - task lists
- **Formatting commands + keybindings** for common authoring tasks.
- **Safe rendering defaults** via HTML sanitization, with optional trusted mode.
- **Per-tab view state persistence** (cursor position, split ratio, preview visibility, sync-scroll preference).
- **Smoke tests** for representative markdown conversion + sanitization behavior.

## What was built

The implementation is organized under `src/editor/`:

- `markdown.js`
  - Configures `markdown-it` + `markdown-it-task-lists`.
  - Exposes `renderMarkdown()` and `markdownToHtml()`.
  - Sanitizes output by default using `sanitize-html`.
  - Supports a `trustedMode` toggle to allow raw HTML output.

- `splitView.js`
  - Exposes `MarkdownSplitEditor`.
  - Renders a split layout:
    - left: editable `<textarea>` markdown input
    - right: rendered preview pane
  - Supports optional synchronized scrolling.
  - Persists and restores tab-specific editor view state.

- `commands.js`
  - Provides formatting commands:
    - bold
    - italic
    - heading1/heading2/heading3
    - codeBlock
    - link
  - Includes default keybindings:
    - `Mod-b`, `Mod-i`, `Mod-1`, `Mod-2`, `Mod-3`, `Mod-Shift-c`, `Mod-k`

- `viewState.js`
  - Provides helpers to load/save per-tab view state from `localStorage`.

- `index.js`
  - Exports the module API surface.

A minimal browser demo is available at `demo.html`.

---

## Installation

### Prerequisites

- Node.js 18+ (recommended)
- npm

### Install dependencies

```bash
npm install
```

---

## Usage

### 1) Run tests

```bash
npm test
```

### 2) Use the markdown renderer directly

```js
import { renderMarkdown } from './src/editor/index.js';

const html = renderMarkdown('# Hello **Markdown**');
```

Use trusted mode only when content source is trusted:

```js
const html = renderMarkdown('<b>raw html</b>', { trustedMode: true });
```

### 3) Mount the split-view editor

```js
import { MarkdownSplitEditor } from './src/editor/index.js';

const mount = document.getElementById('app');

const editor = new MarkdownSplitEditor({
  mount,
  tabId: 'note-123',
  initialText: '# My Note\n\nStart typing...',
  trustedMode: false,
  onChange: (value) => {
    console.log('Updated markdown:', value);
  }
});

// Optional controls
editor.setSplitRatio(0.6);         // 60% editor, 40% preview
editor.setPreviewEnabled(true);    // show/hide preview
editor.setSyncScrollEnabled(true); // sync editor/preview scrolling
editor.setTrustedMode(false);      // toggle sanitized/trusted rendering
```

### 4) Keyboard formatting shortcuts

When focus is in the editor textarea:

- `Mod-b` → bold
- `Mod-i` → italic
- `Mod-1` → H1
- `Mod-2` → H2
- `Mod-3` → H3
- `Mod-Shift-c` → fenced code block
- `Mod-k` → link insertion

(`Mod` means `Ctrl` on Windows/Linux and `Cmd` on macOS.)

### 5) Open the demo in a browser

Serve the repository root with any static server, for example:

```bash
python -m http.server 4173
```

Then open:

- `http://127.0.0.1:4173/demo.html`

---

## Notes on safety

- By default, rendered markdown is sanitized.
- `trustedMode: true` bypasses sanitization and should only be used for trusted inputs.

---

## Project structure

```text
src/editor/
  commands.js
  index.js
  markdown.js
  splitView.js
  viewState.js
tests/
  markdown.smoke.test.js
demo.html
package.json
```
