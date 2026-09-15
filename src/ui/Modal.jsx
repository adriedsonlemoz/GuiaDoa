import React from 'react';
import { createPortal } from 'react-dom';

/**
 * Modal genérico — substitui MUI Dialog.
 * Props: open, onClose (opcional), children, maxWidth (px, default 360), className
 */
const Modal = ({ open, onClose, children, maxWidth = 360, className = '' }) => {
  if (!open) return null;

  return createPortal(
    <div className="tw-backdrop" onClick={onClose}>
      <div
        className={`tw-card relative w-full ${className}`}
        style={{ maxWidth }}
        onClick={e => e.stopPropagation()}
      >
        {children}
      </div>
    </div>,
    document.body
  );
};

export default Modal;
