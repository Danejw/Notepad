function insertAroundSelection(textarea, prefix, suffix = prefix, placeholder = '') {
  const { selectionStart, selectionEnd, value } = textarea;
  const selected = value.slice(selectionStart, selectionEnd);
  const innerText = selected || placeholder;
  const replacement = `${prefix}${innerText}${suffix}`;

  textarea.setRangeText(replacement, selectionStart, selectionEnd, 'end');
  const nextStart = selectionStart + prefix.length;
  const nextEnd = nextStart + innerText.length;
  textarea.setSelectionRange(nextStart, nextEnd);
}

function insertLinePrefix(textarea, prefix) {
  const { selectionStart, selectionEnd, value } = textarea;
  const start = value.lastIndexOf('\n', selectionStart - 1) + 1;
  const endBreak = value.indexOf('\n', selectionEnd);
  const end = endBreak === -1 ? value.length : endBreak;

  const segment = value.slice(start, end);
  const replacement = segment
    .split('\n')
    .map((line) => `${prefix}${line}`)
    .join('\n');

  textarea.setRangeText(replacement, start, end, 'end');
}

export const formattingCommands = {
  bold: (textarea) => insertAroundSelection(textarea, '**', '**', 'bold text'),
  italic: (textarea) => insertAroundSelection(textarea, '*', '*', 'italic text'),
  heading1: (textarea) => insertLinePrefix(textarea, '# '),
  heading2: (textarea) => insertLinePrefix(textarea, '## '),
  heading3: (textarea) => insertLinePrefix(textarea, '### '),
  bulletList: (textarea) => insertLinePrefix(textarea, '- '),
  blockquote: (textarea) => insertLinePrefix(textarea, '> '),
  taskList: (textarea) => insertLinePrefix(textarea, '- [ ] '),
  codeBlock: (textarea) => insertAroundSelection(textarea, '\n```\n', '\n```\n', 'code'),
  link: (textarea, href = 'https://') => {
    const { selectionStart, selectionEnd, value } = textarea;
    const selected = value.slice(selectionStart, selectionEnd) || 'link text';
    const replacement = `[${selected}](${href})`;
    textarea.setRangeText(replacement, selectionStart, selectionEnd, 'end');
    textarea.setSelectionRange(selectionStart + 1, selectionStart + 1 + selected.length);
  }
};

export const defaultKeybindings = {
  'Mod-b': 'bold',
  'Mod-i': 'italic',
  'Mod-1': 'heading1',
  'Mod-2': 'heading2',
  'Mod-3': 'heading3',
  'Mod-Shift-c': 'codeBlock',
  'Mod-k': 'link'
};

function normalizedKey(event) {
  const parts = [];
  if (event.ctrlKey || event.metaKey) parts.push('Mod');
  if (event.shiftKey) parts.push('Shift');
  parts.push(event.key.length === 1 ? event.key.toLowerCase() : event.key);
  return parts.join('-');
}

export function handleFormattingKeydown(event, textarea, keybindings = defaultKeybindings) {
  const key = normalizedKey(event);
  const commandName = keybindings[key];

  if (!commandName || !formattingCommands[commandName]) {
    return false;
  }

  event.preventDefault();
  formattingCommands[commandName](textarea);
  return true;
}
