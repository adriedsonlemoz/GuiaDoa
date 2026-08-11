import React from 'react';

/**
 * Cabeçalho padrão dos módulos — tema AoE3 colonial.
 */
const GameHeader = ({ title, fontSize = '0.82rem', subtitle }) => (
  <div
    className="relative overflow-hidden text-center px-4 py-2.5"
    style={{
      background: 'linear-gradient(180deg, #EAE0C8 0%, #E0D4B0 100%)',
      borderBottom: '1.5px solid #C8A84A',
    }}
  >
    {/* Brilho superior */}
    <div className="absolute top-0 left-[10%] right-[10%] h-px"
      style={{ background: 'linear-gradient(90deg, transparent, rgba(255,248,230,0.8), transparent)' }} />

    {/* Sombra inferior */}
    <div className="absolute bottom-0 left-0 right-0 h-px"
      style={{ background: 'linear-gradient(90deg, transparent 5%, #D8C888 30%, #C8A84A 50%, #D8C888 70%, transparent 95%)' }} />

    {/* Ornamentos de canto */}
    <span className="absolute top-1.5 left-2 text-aoe-gold opacity-70 text-xs">◆</span>
    <span className="absolute top-1.5 right-2 text-aoe-gold opacity-70 text-xs">◆</span>

    {/* Título */}
    <p
      className="font-cinzel font-bold uppercase tracking-widest text-aoe-dark leading-tight m-0 overflow-hidden text-ellipsis whitespace-nowrap"
      style={{ fontSize }}
    >
      {title}
    </p>

    {/* Subtítulo */}
    {subtitle && (
      <p className="font-nunito italic text-aoe-muted mt-0.5 m-0 leading-tight" style={{ fontSize: '0.72rem' }}>
        {subtitle}
      </p>
    )}
  </div>
);

export default GameHeader;
