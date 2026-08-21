import React, { useEffect, useState } from 'react';
import { getProfile, getTermoAceito, saveProfile } from '../utils/storage.js';
import { useToast } from '../hooks/useToast.js';
import TermosDialog from './ProfileLogin/TermosDialog.jsx';
import ProfileForm from './ProfileLogin/ProfileForm.jsx';
import AlertaModal from './shared/AlertaModal.jsx';
import Toast from '../ui/Toast.jsx';
import { C } from '../theme.js';
import AssistenteTatico from './AssistenteTatico.jsx';
import { useI18n } from '../hooks/useI18n.jsx';
import ConfiguracoesIdioma from './ProfileLogin/ConfiguracoesIdioma.jsx';
import HomeDivider from './home/HomeDivider.jsx';
import HomeProfileCard from './home/HomeProfileCard.jsx';
import HomeToolsGrid from './home/HomeToolsGrid.jsx';
import EventHomeHighlight from './eventos/EventHomeHighlight.jsx';
import { useGameData } from '../data/GameDataContext.jsx';

const Home = ({ setRoute }) => {
  const [profile, setProfile] = useState(() => getProfile());
  const [termoAceito, setTermoAceito] = useState(() => getTermoAceito());
  const [alertaModal, setAlertaModal] = useState({ open: false, msg: '' });
  const { toast, closeToast } = useToast();
  const [verIdioma, setVerIdioma] = useState(false);
  const [editarPerfil, setEditarPerfil] = useState(false);
  const { t } = useI18n();
  const { reinos = [] } = useGameData();

  // Mantém o fuso salvo no perfil sincronizado com o catálogo canônico do reino.
  // O nome do reino continua sendo a chave legível do perfil local.
  useEffect(() => {
    if (!profile?.reino || !reinos.length) return;
    const aliases = { manre:'mamre', redforn:'redfern', siera:'sierra', solange:'solace' };
    const key = value => {
      const normalized = String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
      return aliases[normalized] || normalized;
    };
    const realm = reinos.find(item => key(item.nome) === key(profile.reino));
    if (!realm?.fuso || (realm.fuso === profile.fuso && realm.nome === profile.reino)) return;
    const updated = { ...profile, reino:realm.nome, fuso:realm.fuso };
    saveProfile(updated);
    setProfile(updated);
  }, [profile, reinos]);

  if (!profile) {
    return <><TermosDialog open={!termoAceito} onAceitar={() => setTermoAceito(true)} />{termoAceito && <ProfileForm onSave={setProfile} />}</>;
  }

  const handleTool = id => {
    setRoute(id);
  };

  return (
    <div style={{ maxWidth:520, margin:'0 auto', paddingBottom:16 }}>
      <Toast {...toast} onClose={closeToast} />
      <AlertaModal open={alertaModal.open} message={alertaModal.msg} onClose={() => setAlertaModal({ open: false, msg: '' })} />
      <HomeProfileCard profile={profile} onLanguage={() => setVerIdioma(true)} onEdit={() => setEditarPerfil(true)} />
      <div style={{ animation:'reveal-up .35s .12s ease both' }}>
        <EventHomeHighlight realmName={profile.reino} onOpen={() => setRoute('eventos')} />
        <HomeDivider label={t('home.arsenal.titulo')} />
        <HomeToolsGrid t={t} onTool={handleTool} />
        <div style={{ marginTop: 12 }}><HomeDivider label={t('home.conselheiro.titulo')} /><AssistenteTatico /></div>
      </div>
      {editarPerfil && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9999, overflowY: 'auto', background: C.BG_MAIN }}>
          <ProfileForm perfilAtual={profile} onSave={updated => { setProfile(updated); setEditarPerfil(false); }} onCancel={() => setEditarPerfil(false)} />
        </div>
      )}
      {verIdioma && <div style={{ position: 'fixed', inset: 0, zIndex: 9998 }}><ConfiguracoesIdioma onVoltar={() => setVerIdioma(false)} /></div>}
    </div>
  );
};

export default Home;
