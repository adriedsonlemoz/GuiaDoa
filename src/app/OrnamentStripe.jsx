import React from 'react';
import { C } from '../theme.js';

export default function OrnamentStripe({ opacity = 1 }) {
  return (
    <div style={{
      height: 1,
      width: '100%',
      opacity,
      background: `linear-gradient(90deg, transparent 0%, ${C.BORDER_SOFT} 5%, ${C.BORDER} 20%, ${C.ACCENT} 40%, ${C.BORDER_STRONG} 50%, ${C.ACCENT} 60%, ${C.BORDER} 80%, ${C.BORDER_SOFT} 95%, transparent 100%)`,
    }} />
  );
}
