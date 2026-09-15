import React from 'react';
import LanguageChooser from '../language/LanguageChooser.jsx';

export default function ConfiguracoesIdioma({ onVoltar }) {
  return <LanguageChooser onBack={onVoltar} onDone={onVoltar} />;
}
