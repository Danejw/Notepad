const STORAGE_KEY_PREFIX = 'notepad:editor:view-state:';

function storageKey(tabId) {
  return `${STORAGE_KEY_PREFIX}${tabId}`;
}

export function getDefaultViewState() {
  return {
    cursorPosition: 0,
    splitRatio: 0.5,
    previewEnabled: true,
    syncScrollEnabled: true
  };
}

export function loadViewState(tabId) {
  const fallback = getDefaultViewState();
  if (!tabId || typeof localStorage === 'undefined') return fallback;

  try {
    const raw = localStorage.getItem(storageKey(tabId));
    if (!raw) return fallback;

    const parsed = JSON.parse(raw);
    return {
      ...fallback,
      ...parsed
    };
  } catch {
    return fallback;
  }
}

export function saveViewState(tabId, state) {
  if (!tabId || typeof localStorage === 'undefined') return;
  localStorage.setItem(storageKey(tabId), JSON.stringify(state));
}
