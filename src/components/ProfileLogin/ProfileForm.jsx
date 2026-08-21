import React, { useState } from 'react';
import { saveProfile } from '../../utils/storage.js';
import Toast from '../../ui/Toast.jsx';
import { useI18n } from '../../hooks/useI18n.jsx';
import ProfileLanguageStep from './ProfileLanguageStep.jsx';
import ProfileDetailsStep from './ProfileDetailsStep.jsx';

const ProfileForm = ({ onSave, perfilAtual, onCancel, deferSave = false }) => {
  const editing = Boolean(perfilAtual);
  const [step, setStep] = useState(editing ? 1 : 0);
  const [nome, setNome] = useState(perfilAtual?.nome || '');
  const [reino, setReino] = useState(perfilAtual?.reino || '');
  const [fuso, setFuso] = useState(perfilAtual?.fuso || '');
  const [toast, setToast] = useState({ open:false, message:'', severity:'success' });
  const { t } = useI18n();

  const handleReino = r => {
    setReino(r.nome);
    setFuso(r.fuso);
  };

  const handleSave = () => {
    if (!nome.trim() || !reino.trim() || !fuso) {
      setToast({ open:true, message:t('profile.validation'), severity:'warning' });
      return;
    }
    const p = { nome:nome.trim(), reino, fuso };
    if (!deferSave) saveProfile(p);
    onSave?.(p);
  };

  if (step === 0) {
    return <ProfileLanguageStep onContinue={() => setStep(1)} />;
  }

  return (
    <>
      <Toast {...toast} onClose={() => setToast(current => ({ ...current, open:false }))} />
      <ProfileDetailsStep
        editing={editing}
        nome={nome}
        setNome={setNome}
        reino={reino}
        onReino={handleReino}
        fuso={fuso}
        onSave={handleSave}
        onBack={() => setStep(0)}
        onCancel={onCancel}
      />
    </>
  );
};

export default ProfileForm;
