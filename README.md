# Markdown Notepad

A lightweight markdown notepad with split-view editing, live preview, local autosave, formatting shortcuts, and safe HTML sanitization by default.

## What changed in this version

- A more usable browser notepad in `demo.html` with:
  - local autosave
  - import/export for `.md` and `.txt`
  - formatting toolbar
  - preview and sync-scroll toggles
  - live word, character, line, and reading-time status
- A built-in local web server so you can run the app with `npm run dev` on Windows.
- The core editor still exports the reusable module API from `src/editor/`.

## Download, install, and run on Windows

### 1. Download the project

Choose one option:

#### Option A: Download the ZIP from your Git host

1. Open the repository page in your browser.
2. Select **Code** > **Download ZIP**.
3. Extract the ZIP to a folder such as `C:\Projects\Notepad`.

#### Option B: Clone with Git

If Git is installed, open PowerShell and run:

```powershell
git clone <your-repository-url> C:\Projects\Notepad
cd C:\Projects\Notepad
```

### 2. Install Node.js

Install Node.js 18 or newer on Windows. If Node is not installed yet, install the current LTS release, then reopen PowerShell.

Check that it is available:

```powershell
node -v
npm -v
```

### 3. Install dependencies

From the project folder, run:

```powershell
npm install
```

### 4. Start the notepad

Run the local server:

```powershell
npm run dev
```

Then open this address in your browser:

```text
http://127.0.0.1:4173
```

### 5. Stop the app

In the PowerShell window that is running the server, press `Ctrl+C`.

## Quick usage

- Type in the left pane and watch the preview update on the right.
- Use the toolbar or keyboard shortcuts to format markdown faster.
- Use **Import file** to load a `.md` or `.txt` note.
- Use **Export .md** to save the current note to disk.
- The demo autosaves the current note in your browser on that device.

## Keyboard shortcuts

When focus is in the editor textarea:

- `Ctrl+B` or `Cmd+B`: bold
- `Ctrl+I` or `Cmd+I`: italic
- `Ctrl+1`: heading 1
- `Ctrl+2`: heading 2
- `Ctrl+3`: heading 3
- `Ctrl+Shift+C`: fenced code block
- `Ctrl+K`: insert link

## Installation for development

```powershell
npm install
npm test
npm run dev
```

## Module usage

### Render markdown directly

```js
import { renderMarkdown } from './src/editor/index.js';

const html = renderMarkdown('# Hello **Markdown**');
```

Use trusted mode only when the source content is trusted:

```js
const html = renderMarkdown('<b>raw html</b>', { trustedMode: true });
```

### Mount the split-view editor

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

editor.setSplitRatio(0.6);
editor.setPreviewEnabled(true);
editor.setSyncScrollEnabled(true);
editor.setTrustedMode(false);
editor.applyCommand('bold');
```

Useful instance methods:

- `editor.getValue()`
- `editor.setValue(markdown, options)`
- `editor.focus()`
- `editor.applyCommand(commandName, ...args)`
- `editor.setSplitRatio(ratio)`
- `editor.setPreviewEnabled(enabled)`
- `editor.setSyncScrollEnabled(enabled)`
- `editor.setTrustedMode(enabled)`

## Project structure

```text
src/editor/
  commands.js
  index.js
  markdown.js
  splitView.js
  viewState.js
scripts/
  serve.js
tests/
  markdown.smoke.test.js
demo.html
package.json
```

## Notes on safety

- Rendered markdown is sanitized by default.
- `trustedMode: true` bypasses sanitization and should only be used for trusted input.
