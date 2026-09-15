import React, { useState } from 'react';

export default function CollapsibleSection({ title, meta = '', defaultOpen = false, className = '', children }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <section className={`campaign-report-section campaign-collapsible ${className} ${open ? 'is-open' : 'is-closed'}`}>
      <button type="button" className="campaign-collapse-trigger" onClick={() => setOpen(value => !value)} aria-expanded={open}>
        <span>{title}</span>
        <span className="campaign-collapse-side">
          {meta !== '' && <small>{meta}</small>}
          <b aria-hidden="true">{open ? '⌃' : '⌄'}</b>
        </span>
      </button>
      {open && <div className="campaign-collapse-body">{children}</div>}
    </section>
  );
}
