import React from 'react';
import { C } from '../../../theme.js';

const SectionDivider = ({ label }) => (
  <div className="flex items-center gap-2 my-3">
    <div className="flex-1 h-px" style={{ background:`linear-gradient(90deg,transparent,${C.BORDER})` }} />
    <span style={{ color:C.ACCENT, fontSize:'.72rem' }}>◆</span>
    <span className="font-nunito font-bold text-[0.72rem] tracking-widest whitespace-nowrap uppercase" style={{ color:C.TEXT_MUTED }}>{label}</span>
    <span style={{ color:C.ACCENT, fontSize:'.72rem' }}>◆</span>
    <div className="flex-1 h-px" style={{ background:`linear-gradient(270deg,transparent,${C.BORDER})` }} />
  </div>
);


export default SectionDivider;
