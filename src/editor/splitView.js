import { renderMarkdown } from './markdown.js';
import { formattingCommands, handleFormattingKeydown } from './commands.js';
import { getDefaultViewState, loadViewState, saveViewState } from './viewState.js';

export class MarkdownSplitEditor {
  constructor(options) {
    const {
      mount,
      tabId,
      initialText = '',
      trustedMode = false,
      placeholder = 'Start typing your note...',
      onChange
    } = options;

    this.mount = mount;
    this.tabId = tabId;
    this.onChange = onChange;
    this.state = { ...getDefaultViewState(), ...loadViewState(tabId) };
    this.trustedMode = trustedMode;

    this.container = document.createElement('div');
    this.container.className = 'markdown-split-editor';

    this.leftPane = document.createElement('textarea');
    this.leftPane.className = 'markdown-input';
    this.leftPane.placeholder = placeholder;
    this.leftPane.spellcheck = true;
    this.leftPane.value = initialText;

    this.rightPane = document.createElement('div');
    this.rightPane.className = 'markdown-preview';
    this.rightPane.dataset.placeholder = 'Preview updates as you type.';

    this.container.append(this.leftPane, this.rightPane);
    this.mount.appendChild(this.container);

    this.applySplitRatio();
    this.setPreviewEnabled(this.state.previewEnabled);

    this.leftPane.addEventListener('input', () => {
      this.handleValueChange();
    });

    this.leftPane.addEventListener('click', () => {
      this.persist({ cursorPosition: this.leftPane.selectionStart });
    });

    this.leftPane.addEventListener('keyup', () => {
      this.persist({ cursorPosition: this.leftPane.selectionStart });
    });

    this.leftPane.addEventListener('keydown', (event) => {
      if (handleFormattingKeydown(event, this.leftPane)) {
        this.handleValueChange();
      }
    });

    this.leftPane.addEventListener('scroll', () => this.syncScroll());

    const initialCursorPosition = Math.max(0, Math.min(this.state.cursorPosition, this.leftPane.value.length));
    this.leftPane.setSelectionRange(initialCursorPosition, initialCursorPosition);
    this.render();
  }

  getValue() {
    return this.leftPane.value;
  }

  setValue(value, options = {}) {
    const { cursorPosition = 0, focus = false } = options;
    this.leftPane.value = value ?? '';
    const nextCursorPosition = Math.max(0, Math.min(cursorPosition, this.leftPane.value.length));
    this.leftPane.setSelectionRange(nextCursorPosition, nextCursorPosition);
    this.handleValueChange();

    if (focus) {
      this.focus();
    }
  }

  focus() {
    this.leftPane.focus();
  }

  applyCommand(commandName, ...args) {
    const command = formattingCommands[commandName];
    if (!command) {
      return false;
    }

    command(this.leftPane, ...args);
    this.handleValueChange();
    this.focus();
    return true;
  }

  setTrustedMode(enabled) {
    this.trustedMode = enabled;
    this.render();
  }

  setSplitRatio(ratio) {
    this.persist({ splitRatio: Math.max(0.2, Math.min(0.8, ratio)) });
    this.applySplitRatio();
  }

  applySplitRatio() {
    const left = this.state.splitRatio * 100;
    this.leftPane.style.width = `${left}%`;
    this.rightPane.style.width = `${100 - left}%`;
  }

  setPreviewEnabled(enabled) {
    this.persist({ previewEnabled: enabled });
    this.rightPane.style.display = enabled ? 'block' : 'none';

    if (enabled) {
      this.applySplitRatio();
      return;
    }

    this.leftPane.style.width = '100%';
  }

  setSyncScrollEnabled(enabled) {
    this.persist({ syncScrollEnabled: enabled });
  }

  syncScroll() {
    if (!this.state.syncScrollEnabled) return;

    const maxInputScroll = this.leftPane.scrollHeight - this.leftPane.clientHeight;
    const maxPreviewScroll = this.rightPane.scrollHeight - this.rightPane.clientHeight;
    if (maxInputScroll <= 0 || maxPreviewScroll <= 0) return;

    const scrollFactor = this.leftPane.scrollTop / maxInputScroll;
    this.rightPane.scrollTop = scrollFactor * maxPreviewScroll;
  }

  persist(patch) {
    this.state = {
      ...this.state,
      ...patch
    };

    saveViewState(this.tabId, this.state);
  }

  render() {
    const value = this.leftPane.value;

    this.rightPane.innerHTML = renderMarkdown(value, {
      trustedMode: this.trustedMode
    });
    this.rightPane.dataset.empty = String(!value.trim());
  }

  handleValueChange() {
    this.render();
    this.persist({ cursorPosition: this.leftPane.selectionStart });
    this.onChange?.(this.leftPane.value);
  }
}
