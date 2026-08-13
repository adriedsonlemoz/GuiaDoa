import React from 'react';

export default function HomeDivider({ label, extra }) {
  return (
    <div className="game-home-divider">
      <span>{label}</span>
      {extra ? <div style={{ flexShrink:0 }}>{extra}</div> : null}
    </div>
  );
}
