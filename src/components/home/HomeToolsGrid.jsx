import React from 'react';
import { HOME_TOOLS } from './homeTools.js';

export default function HomeToolsGrid({ t, onTool }) {
  return (
    <div className="game-home-grid">
      {HOME_TOOLS.map((tool, index) => (
        <button
          key={tool.id}
          onClick={() => onTool(tool.id)}
          className="game-home-tool"
          style={{ animation:`tool-in .28s ${0.08 + index * 0.025}s ease both` }}
        >
          <span className="game-home-tool-icon" aria-hidden="true">{tool.icon}</span>
          <span className="game-home-tool-name">{t(tool.tKey)}</span>
          <span className="game-home-tool-sub">{t(tool.subKey)}</span>
        </button>
      ))}
    </div>
  );
}
