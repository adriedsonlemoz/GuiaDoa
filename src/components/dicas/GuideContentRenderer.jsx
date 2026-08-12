import React from 'react';
import { C } from '../../theme.js';
import { applyDicaVariables } from './dicaGameUtils.js';

const emojiHeading = /^([\p{Extended_Pictographic}\u200d\ufe0f\s]{1,8})(.+)$/u;
const bullet = /^-\s+(.+)/;

function splitSections(text) {
  return String(text || '')
    .split(/\n\s*---\s*\n/g)
    .map(block => block.trim())
    .filter(Boolean);
}

function isHeading(line) {
  const value = line.trim();
  return value.length <= 84 && emojiHeading.test(value) && !/[.!?]$/.test(value);
}

function renderInline(text) {
  const parts = String(text).split(/(→|=)/g);
  return parts.map((part, index) => (part === '→' || part === '=')
    ? <strong key={index} style={{ color: C.ACCENT, padding: '0 3px' }}>{part}</strong>
    : <React.Fragment key={index}>{part}</React.Fragment>);
}

function ContentBlock({ lines }) {
  const out = [];
  let list = [];
  const flushList = () => {
    if (!list.length) return;
    out.push(
      <div key={`list-${out.length}`} style={{ display: 'grid', gap: 7, margin: '10px 0 14px' }}>
        {list.map((item, idx) => (
          <div key={idx} style={{ display: 'flex', gap: 9, alignItems: 'flex-start', padding: '7px 9px', borderRadius: 9, background: 'rgba(200,168,74,.08)' }}>
            <span style={{ color: C.ACCENT, fontWeight: 900, lineHeight: 1.5 }}>•</span>
            <span className="font-nunito" style={{ color: C.TEXT_SECONDARY, fontSize: '.82rem', lineHeight: 1.55 }}>{renderInline(item)}</span>
          </div>
        ))}
      </div>,
    );
    list = [];
  };

  lines.forEach((raw, idx) => {
    const line = raw.trim();
    if (!line) { flushList(); return; }
    const item = line.match(bullet);
    if (item) { list.push(item[1]); return; }
    flushList();

    if (isHeading(line)) {
      out.push(
        <h3 key={idx} className="font-cinzel" style={{ margin: '17px 0 8px', color: C.TEXT_PRIMARY, fontSize: '.93rem', lineHeight: 1.35 }}>
          {line}
        </h3>,
      );
      return;
    }

    if (/^Total:/i.test(line) || /^(Mais |More |No nível|At level)/i.test(line) && line.includes('→')) {
      out.push(
        <div key={idx} className="font-nunito" style={{ margin: '8px 0', padding: '9px 11px', borderLeft: `3px solid ${C.ACCENT}`, background: 'rgba(200,168,74,.09)', color: C.TEXT_PRIMARY, fontWeight: 800, fontSize: '.82rem', lineHeight: 1.5 }}>
          {renderInline(line)}
        </div>,
      );
      return;
    }

    out.push(
      <p key={idx} className="font-nunito" style={{ margin: '7px 0', color: C.TEXT_SECONDARY, fontSize: '.82rem', lineHeight: 1.68 }}>
        {renderInline(line)}
      </p>,
    );
  });
  flushList();
  return out;
}

export default function GuideContentRenderer({ content, variables }) {
  const sections = splitSections(applyDicaVariables(content, variables));
  return (
    <div>
      {sections.map((section, index) => {
        const lines = section.split('\n');
        const first = lines[0]?.trim() || '';
        const callout = first.startsWith('«') || first.startsWith('⚠️');
        if (callout) {
          return (
            <div key={index} style={{ margin: '0 0 16px', padding: '13px 14px', borderRadius: 12, border: `1px solid ${C.ACCENT}55`, background: 'linear-gradient(135deg, rgba(200,168,74,.14), rgba(200,168,74,.05))' }}>
              <ContentBlock lines={lines} />
            </div>
          );
        }
        const hasTitle = isHeading(first);
        return (
          <section key={index} style={{ margin: index ? '18px 0 0' : 0, padding: '16px 15px', borderRadius: 14, border: `1px solid ${C.BORDER_SOFT}`, background: C.BG_CARD, boxShadow: '0 3px 12px rgba(62,47,28,.06)' }}>
            {hasTitle && (
              <h2 className="font-cinzel" style={{ margin: '0 0 10px', color: C.TEXT_PRIMARY, fontSize: '1rem', lineHeight: 1.35 }}>
                {first}
              </h2>
            )}
            <ContentBlock lines={hasTitle ? lines.slice(1) : lines} />
          </section>
        );
      })}
    </div>
  );
}
