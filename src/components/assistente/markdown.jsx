import React from 'react';

export const fmtHora = () => {
  const d = new Date();
  return d.getHours().toString().padStart(2, '0') + ':' + d.getMinutes().toString().padStart(2, '0');
};

const parseBold = (texto, cor) =>
  texto.split(/(\*\*\*?.+?\*\*\*?)/g).map((p, i) =>
    /^\*\*\*?.+?\*\*\*?$/.test(p)
      ? <strong key={i} style={{ color: cor, fontWeight: 900 }}>{p.replace(/\*+/g, '')}</strong>
      : p
  );

export const parseMarkdown = (texto, isUser) => {
  const corNegrito = isUser ? 'rgba(255,255,255,0.95)' : '#C8A84A';
  const corTitulo = isUser ? 'rgba(255,255,255,0.95)' : '#E0C060';

  return texto.split('\n').map((linha, li) => {
    if (!linha.trim()) return <div key={li} style={{ height: 4 }} />;

    if (/^[▸━]/.test(linha)) {
      return (
        <p key={li} style={{ margin: '6px 0 2px', fontWeight: 900, fontSize: '0.72rem', color: corTitulo }}>
          {parseBold(linha, corNegrito)}
        </p>
      );
    }

    if (/^\s*([•\-*]|\d+\.)\s/.test(linha)) {
      return (
        <div key={li} style={{ display: 'flex', gap: 5, alignItems: 'flex-start', margin: '1px 0' }}>
          <span style={{ color: corNegrito, fontWeight: 900, flexShrink: 0, lineHeight: 1.55 }}>›</span>
          <span style={{ fontSize: '0.75rem', lineHeight: 1.55 }}>
            {parseBold(linha.replace(/^\s*([•\-*]|\d+\.)\s*/, ''), corNegrito)}
          </span>
        </div>
      );
    }

    return (
      <p key={li} style={{ margin: '2px 0', fontSize: '0.76rem', lineHeight: 1.55 }}>
        {parseBold(linha, corNegrito)}
      </p>
    );
  });
};
