import React from 'react';
import { C } from '../../theme.js';

const ProfileField = ({ label, hint, children }) => (
  <div style={{ marginBottom:14 }}>
    <div style={{ display:'flex', alignItems:'baseline', gap:6, marginBottom:6 }}>
      <label style={{
        fontFamily:"system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif", fontWeight:900,
        fontSize:'.74rem', letterSpacing:'1.35px', color:C.TEXT_MUTED, textTransform:'uppercase',
      }}>
        {label}
      </label>
      {hint && <span style={{ fontFamily:"system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif", fontWeight:600, fontSize:'.72rem', color:C.TEXT_FAINT }}>({hint})</span>}
    </div>
    {children}
  </div>
);

export default ProfileField;
