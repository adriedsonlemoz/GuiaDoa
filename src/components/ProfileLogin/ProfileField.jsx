import React from 'react';

const ProfileField = ({ label, hint, children }) => (
  <div style={{ marginBottom: 14 }}>
    <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 6 }}>
      <label style={{
        fontFamily: '"Nunito",sans-serif', fontWeight: 900,
        fontSize: '0.63rem', letterSpacing: '1.5px',
        color: C.TEXT_MUTED, textTransform: 'uppercase',
      }}>
        {label}
      </label>
      {hint && (
        <span style={{
          fontFamily: '"Nunito",sans-serif', fontWeight: 600,
          fontSize: '0.6rem', color: C.TEXT_FAINT,
          textTransform: 'none', letterSpacing: 0,
        }}>
          ({hint})
        </span>
      )}
    </div>
    {children}
  </div>
);

export default ProfileField;
