import React from 'react';
import LanguageChooser from '../language/LanguageChooser.jsx';

export default function ProfileLanguageStep({ onContinue }) {
  return <LanguageChooser setup onDone={onContinue} />;
}
