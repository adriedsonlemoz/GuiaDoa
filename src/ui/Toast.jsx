import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';

const SEV_COLORS = {
  success: { bg: '#5A8A5C', border: '#3A6A3C' },
  error:   { bg: '#A83C2C', border: '#6A1C0C' },
  warning: { bg: '#C87A2C', border: '#8A5010' },
  info:    { bg: '#3B5C8C', border: '#1C3A5E' },
};

const SEV_ICONS = {
  success: '✓',
  error:   '✕',
  warning: '⚠',
  info:    'ℹ',
};

/**
 * Toast flutuante — substitui MUI Snackbar + Alert.
 * Props: open, message, severity, onClose, duration (ms, default 3000)
 */
const Toast = ({ open, message, severity = 'success', onClose, duration = 3000 }) => {
  useEffect(() => {
    if (!open) return;
    const t = setTimeout(onClose, duration);
    return () => clearTimeout(t);
  }, [open, duration, onClose]);

  if (!open) return null;

  const col = SEV_COLORS[severity] || SEV_COLORS.info;

  return createPortal(
    <div className="fixed top-3 left-1/2 -translate-x-1/2 z-[70] pointer-events-none px-2 w-full max-w-sm">
      <div
        className="flex items-center gap-2 px-3 py-2.5 rounded-lg border text-white font-nunito font-bold text-sm shadow-xl"
        style={{ backgroundColor: col.bg, borderColor: col.border }}
      >
        <span className="text-base leading-none">{SEV_ICONS[severity]}</span>
        <span className="flex-1">{message}</span>
      </div>
    </div>,
    document.body
  );
};

export default Toast;
