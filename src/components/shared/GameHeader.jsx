import React from 'react';

/**
 * Cabeçalho interno de módulo. O título global já vive na barra superior;
 * aqui mostramos apenas uma seção de contexto em estilo pergaminho/aba do jogo.
 */
const GameHeader = ({ title, subtitle }) => (
  <section className="game-module-header">
    <div className="game-module-header-title">{title}</div>
    {subtitle ? <p className="game-module-header-subtitle">{subtitle}</p> : null}
  </section>
);

export default GameHeader;
