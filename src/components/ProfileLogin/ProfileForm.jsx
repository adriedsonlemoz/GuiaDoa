import React, { useState } from 'react';
import { saveProfile } from '../../utils/storage.js';
import Toast from '../../ui/Toast.jsx';
import { useTorneioTimer } from '../../hooks/useTorneioTimer.js';
import { useI18n, LOCALES_DISPONIVEIS } from '../../hooks/useI18n.jsx';
import ProfileLanguageStep from './ProfileLanguageStep.jsx';
import ProfileDetailsStep from './ProfileDetailsStep.jsx';
import { getProfileCopy } from './profileCopy.js';

const ProfileForm = ({ onSave, perfilAtual, onCancel }) => {
  const editing = Boolean(perfilAtual);
  const [step, setStep] = useState(editing ? 1 : 0);
  const [nome, setNome] = useState(perfilAtual?.nome || '');
  const [reino, setReino] = useState(perfilAtual?.reino || '');
  const [fuso, setFuso] = useState(perfilAtual?.fuso || '');
  const [playerId, setPlayerId] = useState(perfilAtual?.playerId || '');
  const [toast, setToast] = useState({ open:false, message:'', severity:'success' });
  const { locale, setLocale } = useI18n();
  const copy = getProfileCopy(locale);

  const match = fuso ? fuso.match(/UTC([+-]?\d+)/) : null;
  const offset = match ? parseInt(match[1], 10) : 0;
  const { horaLocal } = useTorneioTimer(fuso ? offset : null);

  const handleReino = r => {
    setReino(r.nome);
    setFuso(r.fuso);
  };

  const handleSave = () => {
    if (!nome.trim() || !reino.trim() || !fuso) {
      setToast({ open:true, message:copy.validation, severity:'warning' });
      return;
    }
    const p = { nome:nome.trim(), reino, fuso, playerId:playerId.trim() };
    saveProfile(p);
    onSave?.(p);
  };

  if (step === 0) {
    return (
      <ProfileLanguageStep
        locale={locale}
        locales={LOCALES_DISPONIVEIS}
        onSelect={(code) => { setLocale(code); setStep(1); }}
      />
    );
  }

  return (
    <>
      <Toast {...toast} onClose={() => setToast(t => ({ ...t, open:false }))} />
      <ProfileDetailsStep
        copy={copy}
        editing={editing}
        nome={nome}
        setNome={setNome}
        playerId={playerId}
        setPlayerId={setPlayerId}
        reino={reino}
        onReino={handleReino}
        fuso={fuso}
        horaLocal={horaLocal}
        onSave={handleSave}
        onBack={() => setStep(0)}
        onCancel={onCancel}
      />
    </>
  );
};

export default ProfileForm;
