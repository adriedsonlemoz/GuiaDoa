import React from 'react';
import { C } from '../../theme.js';

const Skeleton = ({ h = 80, radius = 12 }) => (
  <div style={{
    height: h, borderRadius: radius,
    background: `linear-gradient(90deg,${C.BG_CARD} 25%,${C.BG_SECONDARY} 50%,${C.BG_CARD} 75%)`,
    backgroundSize: '200% 100%',
    animation: 'shimmer 1.4s infinite',
  }} />
);


export default Skeleton;
