'use client';

import { useEffect } from 'react';
import { useAppStore } from '../store';

const isMac = typeof navigator !== 'undefined' && /Mac|iPod|iPhone|iPad/.test(navigator.userAgent);

function isInputFocused(): boolean {
  const el = document.activeElement;
  if (!el) return false;
  const tag = el.tagName.toLowerCase();
  if (tag === 'input' || tag === 'textarea' || tag === 'select') return true;
  if ((el as HTMLElement).isContentEditable) return true;
  return false;
}

export default function KeyboardShortcuts() {
  const setCmdkOpen = useAppStore((s) => s.setCmdkOpen);
  const setAiPanelOpen = useAppStore((s) => s.setAiPanelOpen);
  const aiPanelOpen = useAppStore((s) => s.aiPanelOpen);
  const setLayoutMode = useAppStore((s) => s.setLayoutMode);
  const setLanguageFilter = useAppStore((s) => s.setLanguageFilter);
  const commentarySidebarOpen = useAppStore((s) => s.commentarySidebarOpen);
  const setCommentarySidebarOpen = useAppStore((s) => s.setCommentarySidebarOpen);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      const mod = isMac ? e.metaKey : e.ctrlKey;

      // Cmd/Ctrl shortcuts (work even in inputs)
      if (mod) {
        switch (e.key.toLowerCase()) {
          case 'k':
            e.preventDefault();
            setCmdkOpen(true);
            return;
          case 'f':
            if (e.shiftKey) {
              e.preventDefault();
              window.location.href = '/search';
              return;
            }
            // Cmd+F alone: dispatch custom event for in-page search
            e.preventDefault();
            window.dispatchEvent(new CustomEvent('halacha:search-in-page'));
            return;
          case 'b':
            e.preventDefault();
            window.dispatchEvent(new CustomEvent('halacha:toggle-bookmark'));
            return;
          case '/':
            e.preventDefault();
            setAiPanelOpen(!aiPanelOpen);
            return;
        }
        return;
      }

      // Single-key shortcuts: skip if input is focused
      if (isInputFocused()) return;

      switch (e.key) {
        case '1':
          setLayoutMode('modern');
          window.dispatchEvent(new CustomEvent('halacha:layout-change', { detail: 'modern' }));
          break;
        case '2':
          setLayoutMode('traditional');
          window.dispatchEvent(new CustomEvent('halacha:layout-change', { detail: 'traditional' }));
          break;
        case '3':
          setLayoutMode('research');
          window.dispatchEvent(new CustomEvent('halacha:layout-change', { detail: 'research' }));
          break;
        case 'h':
        case 'H':
          setLanguageFilter('he');
          window.dispatchEvent(new CustomEvent('halacha:language-change', { detail: 'he' }));
          break;
        case 'e':
        case 'E':
          setLanguageFilter('en');
          window.dispatchEvent(new CustomEvent('halacha:language-change', { detail: 'en' }));
          break;
        case 'b':
        case 'B':
          setLanguageFilter('all');
          window.dispatchEvent(new CustomEvent('halacha:language-change', { detail: 'all' }));
          break;
        case '[':
          window.dispatchEvent(new CustomEvent('halacha:navigate-section', { detail: 'prev' }));
          break;
        case ']':
          window.dispatchEvent(new CustomEvent('halacha:navigate-section', { detail: 'next' }));
          break;
        case 't':
        case 'T':
          window.dispatchEvent(new CustomEvent('halacha:toggle-toc'));
          break;
        case 'c':
        case 'C':
          setCommentarySidebarOpen(!commentarySidebarOpen);
          break;
        case 'n':
        case 'N':
          window.dispatchEvent(new CustomEvent('halacha:add-note'));
          break;
        case 'd':
        case 'D':
          window.dispatchEvent(new CustomEvent('halacha:open-dictionary'));
          break;
        case '?':
          window.dispatchEvent(new CustomEvent('halacha:toggle-shortcut-help'));
          break;
        case 'Escape':
          setCmdkOpen(false);
          setAiPanelOpen(false);
          setCommentarySidebarOpen(false);
          window.dispatchEvent(new CustomEvent('halacha:close-panels'));
          break;
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [aiPanelOpen, commentarySidebarOpen, setCmdkOpen, setAiPanelOpen, setLayoutMode, setLanguageFilter, setCommentarySidebarOpen]);

  return null;
}
