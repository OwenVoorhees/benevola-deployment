import React, { useState, useEffect, useId } from 'react';
import { useDesign } from './DesignContext';
import { BRAND_PRESETS } from './brand';
import './switcher.css';

/* Preview chrome, deliberately neutral so it does not read as part of any
   design it sits on top of. Hidden entirely once config.LOCKED is set. */

function ColorRow({ role, label, value, onChange }) {
  const id = useId();
  return (
    <div className="dsw-color">
      <label className="dsw-color-label" htmlFor={id}>{label}</label>
      <span className="dsw-color-well" style={{ '--well': value }}>
        <input
          id={id}
          type="color"
          value={value}
          onChange={e => onChange(role, e.target.value)}
          aria-label={`${label} colour`}
        />
      </span>
      <output className="dsw-color-hex" htmlFor={id}>{value}</output>
    </div>
  );
}

export default function DesignSwitcher() {
  const {
    design, setDesign, designs, locked, theme, toggleTheme,
    brand, setBrand, setBrandColor, resetBrand, brandPreset, tunable,
  } = useDesign();
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
                    <span className="dsw-option-name">
                      {d.name}
                      {d.tunable && <span className="dsw-option-tag" title="Accepts a custom brand colour">colour</span>}
                    </span>
                    <span className="dsw-option-tagline">{d.tagline}</span>
                  </span>
                </button>
              </li>
            ))}
          </ul>

          {/* Only the tunable designs read the brand variables, so offering the
              picker anywhere else would be a control that does nothing. */}
          {tunable && (
            <div className="dsw-brand">
              <div className="dsw-brand-head">
                <span className="dsw-panel-title">Colour</span>
                <button className="dsw-reset" onClick={resetBrand}>Reset</button>
              </div>

              <ColorRow role="primary"   label="Primary"   value={brand.primary}   onChange={setBrandColor} />
              <ColorRow role="secondary" label="Secondary" value={brand.secondary} onChange={setBrandColor} />

              <div className="dsw-presets" role="group" aria-label="Colour presets">
                {BRAND_PRESETS.map(p => (
                  <button
                    key={p.id}
                    className={'dsw-preset' + (p.id === brandPreset ? ' is-active' : '')}
                    style={{ '--a': p.primary, '--b': p.secondary }}
                    onClick={() => setBrand(p)}
                    aria-pressed={p.id === brandPreset}
                    title={p.name}
                  >
                    <span className="dsw-sr">{p.name}</span>
                  </button>
                ))}
              </div>

              <p className="dsw-brand-note">
                Primary drives actions. Secondary drives gradients and accents.
              </p>
            </div>
          )}

          <p className="dsw-hint">Deep link with <code>?design={design}</code></p>
        </div>
      )}

      <button
        className="dsw-trigger"
        onClick={() => setOpen(o => !o)}
        aria-expanded={open}
        title="Switch design (Ctrl/Cmd + Shift + D)"
      >
        <span
          className="dsw-trigger-dot"
          style={active?.tunable ? { background: brand.primary, boxShadow: `0 0 0 3px ${brand.primary}2e` } : undefined}
        />
        <span className="dsw-trigger-label">{active?.name ?? 'Design'}</span>
      </button>
    </div>
  );
}
