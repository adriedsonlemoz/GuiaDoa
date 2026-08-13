import React from 'react';

export function GamePanel({ children, className = '', style }) {
  return <section className={`game-panel ${className}`.trim()} style={style}>{children}</section>;
}

export function GameTabs({ tabs, value, onChange, compact = false }) {
  return (
    <div className={`game-tabs${compact ? ' game-tabs-compact' : ''}`} role="tablist">
      {tabs.map(tab => (
        <button
          key={tab.id}
          type="button"
          role="tab"
          aria-selected={value === tab.id}
          className={`game-tab${value === tab.id ? ' is-active' : ''}`}
          onClick={() => onChange(tab.id)}
        >
          {tab.icon ? <span aria-hidden="true">{tab.icon}</span> : null}
          <span>{tab.label}</span>
        </button>
      ))}
    </div>
  );
}

export function GameSectionTitle({ children, aside }) {
  return (
    <div className="game-section-title">
      <span>{children}</span>
      {aside ? <span className="game-section-title-aside">{aside}</span> : null}
    </div>
  );
}

export function GameActionButton({ children, tone = 'blue', className = '', ...props }) {
  return (
    <button className={`game-action game-action-${tone} ${className}`.trim()} type="button" {...props}>
      {children}
    </button>
  );
}

export function GameInfoTable({ rows, headers }) {
  return (
    <div className="game-info-table-wrap">
      {headers?.length ? (
        <div className="game-info-table-head" style={{ gridTemplateColumns: `repeat(${headers.length}, minmax(0, 1fr))` }}>
          {headers.map(header => <span key={header}>{header}</span>)}
        </div>
      ) : null}
      <div className="game-info-table-body">
        {rows.map((row, index) => (
          <div key={row.key || index} className="game-info-table-row">
            <span className="game-info-label">{row.icon ? `${row.icon} ` : ''}{row.label}</span>
            <span className="game-info-value">{row.value}</span>
            {row.next !== undefined ? <span className="game-info-next">{row.next}</span> : null}
          </div>
        ))}
      </div>
    </div>
  );
}
