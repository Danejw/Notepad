import { renderMarkdown } from './markdown.js';
import { handleFormattingKeydown } from './commands.js';
import { getDefaultViewState, loadViewState, saveViewState } from './viewState.js';

export class MarkdownSplitEditor {
  constructor(options) {
    const {
      mount,
      tabId,
      initialText = '',
      trustedMode = false,
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
    this.leftPane.value = initialText;

    this.rightPane = document.createElement('div');
    this.rightPane.className = 'markdown-preview';

    this.container.append(this.leftPane, this.rightPane);
    this.mount.appendChild(this.container);

    this.applySplitRatio();
    this.setPreviewEnabled(this.state.previewEnabled);

    this.leftPane.addEventListener('input', () => {
      this.render();
      this.persist({ cursorPosition: this.leftPane.selectionStart });
      this.onChange?.(this.leftPane.value);
    });

    this.leftPane.addEventListener('click', () => {
      this.persist({ cursorPosition: this.leftPane.selectionStart });
    });

    this.leftPane.addEventListener('keydown', (event) => {
      if (handleFormattingKeydown(event, this.leftPane)) {
        this.render();
      }
    });

    if (this.state.syncScrollEnabled) {
      this.leftPane.addEventListener('scroll', () => this.syncScroll());
    }

    this.leftPane.setSelectionRange(this.state.cursorPosition, this.state.cursorPosition);
    this.render();
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
    this.leftPane.style.width = enabled ? `${this.state.splitRatio * 100}%` : '100%';
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
    this.rightPane.innerHTML = renderMarkdown(this.leftPane.value, {
      trustedMode: this.trustedMode
    });
  }
}
