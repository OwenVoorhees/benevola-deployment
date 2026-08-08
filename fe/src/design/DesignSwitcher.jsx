import React, { useState, useEffect } from 'react';
import { useDesign } from './DesignContext';
import './switcher.css';

/* Preview chrome, deliberately neutral so it does not read as part of any
   design it sits on top of. Hidden entirely once config.LOCKED is set. */

export default function DesignSwitcher() {
  const { design, setDesign, designs, locked, theme, toggleTheme } = useDesign();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    function onKey(e) {
      if (e.key === 'D' && e.shiftKey && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen(o => !o);
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  if (locked) return null;

  const active = designs.find(d => d.id === design);

  return (
    <div className={'dsw' + (open ? ' dsw--open' : '')}>
      {open && (
        <div className="dsw-panel" role="group" aria-label="Design variant">
          <div className="dsw-panel-head">
            <span className="dsw-panel-title">Design</span>
            <button className="dsw-theme" onClick={toggleTheme}>
              {theme === 'light' ? 'Light' : 'Dark'}
            </button>
          </div>

          <ul className="dsw-list">
            {designs.map(d => (
              <li key={d.id}>
                <button
                  className={'dsw-option' + (d.id === design ? ' is-active' : '')}
                  onClick={() => setDesign(d.id)}
                  aria-pressed={d.id === design}
                >
                  <span className="dsw-option-label">{d.label}</span>
                  <span className="dsw-option-text">
                    <span className="dsw-option-name">{d.name}</span>
                    <span className="dsw-option-tagline">{d.tagline}</span>
                  </span>
                </button>
              </li>
            ))}
          </ul>

          <p className="dsw-hint">Deep link with <code>?design={design}</code></p>
        </div>
      )}

      <button
        className="dsw-trigger"
        onClick={() => setOpen(o => !o)}
        aria-expanded={open}
        title="Switch design (Ctrl/Cmd + Shift + D)"
      >
        <span className="dsw-trigger-dot" />
        <span className="dsw-trigger-label">{active?.name ?? 'Design'}</span>
      </button>
    </div>
  );
}
