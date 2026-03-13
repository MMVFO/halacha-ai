'use client';

import { useEffect, useState } from 'react';

const isMac = typeof navigator !== 'undefined' && /Mac|iPod|iPhone|iPad/.test(navigator.userAgent);
const mod = isMac ? '\u2318' : 'Ctrl';

interface ShortcutEntry {
  keys: string[];
  label: string;
}

const sections: { title: string; shortcuts: ShortcutEntry[] }[] = [
  {
    title: 'Navigation',
    shortcuts: [
      { keys: [mod, 'K'], label: 'Open command palette' },
      { keys: [mod, 'F'], label: 'Search in current work' },
      { keys: [mod, 'Shift', 'F'], label: 'Global search' },
      { keys: ['['], label: 'Previous section' },
      { keys: [']'], label: 'Next section' },
      { keys: ['Esc'], label: 'Close any open panel' },
    ],
  },
  {
    title: 'Layout & Display',
    shortcuts: [
      { keys: ['1'], label: 'Modern layout' },
      { keys: ['2'], label: 'Traditional layout' },
      { keys: ['3'], label: 'Research layout' },
      { keys: ['H'], label: 'Hebrew only' },
      { keys: ['E'], label: 'English only' },
      { keys: ['B'], label: 'Both languages' },
    ],
  },
  {
    title: 'Panels & Tools',
    shortcuts: [
      { keys: [mod, '/'], label: 'Toggle AI assistant' },
      { keys: [mod, 'B'], label: 'Toggle bookmark' },
      { keys: ['T'], label: 'Toggle table of contents' },
      { keys: ['C'], label: 'Toggle commentary sidebar' },
      { keys: ['N'], label: 'Add note on selection' },
      { keys: ['D'], label: 'Dictionary lookup' },
      { keys: ['?'], label: 'Show this help' },
    ],
  },
];

export default function ShortcutHelp() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    function handleToggle() {
      setOpen((prev) => !prev);
    }
    function handleClose() {
      setOpen(false);
    }
    window.addEventListener('halacha:toggle-shortcut-help', handleToggle);
    window.addEventListener('halacha:close-panels', handleClose);
    return () => {
      window.removeEventListener('halacha:toggle-shortcut-help', handleToggle);
      window.removeEventListener('halacha:close-panels', handleClose);
    };
  }, []);

  if (!open) return null;

  return (
    <div
      className="shortcut-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget) setOpen(false);
      }}
      role="dialog"
      aria-modal="true"
      aria-label="Keyboard shortcuts"
    >
      <div className="shortcut-modal">
        <div className="shortcut-modal-header">
          <h2 className="shortcut-modal-title">Keyboard Shortcuts</h2>
          <button
            className="shortcut-modal-close"
            onClick={() => setOpen(false)}
            aria-label="Close shortcuts help"
          >
            &times;
          </button>
        </div>

        {sections.map((section) => (
          <div key={section.title} className="shortcut-section">
            <h3 className="shortcut-section-title">{section.title}</h3>
            <div className="shortcut-grid">
              {section.shortcuts.map((shortcut) => (
                <div key={shortcut.label} className="shortcut-item">
                  <span className="shortcut-label">{shortcut.label}</span>
                  <span className="shortcut-keys">
                    {shortcut.keys.map((key, i) => (
                      <span key={i}>
                        {i > 0 && <span style={{ color: 'var(--text-muted)', fontSize: 10, margin: '0 1px' }}>+</span>}
                        <kbd className="shortcut-kbd">{key}</kbd>
                      </span>
                    ))}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
