import React, { useState } from 'react';
import GameHeader from './shared/GameHeader.jsx';
import Toast from '../ui/Toast.jsx';
import { useI18n } from '../hooks/useI18n.jsx';

const PIX='adriedson@outlook.com';
export default function Doacao(){
  const { t }=useI18n(); const [toast,setToast]=useState({open:false,message:'',severity:'success'});
  const copy=async()=>{try{await navigator.clipboard.writeText(PIX);setToast({open:true,message:t('donation.pix_copied'),severity:'success'});}catch{setToast({open:true,message:t('errors.copy_failed'),severity:'error'});}};
  return <div className="max-w-md mx-auto pb-6"><Toast {...toast} onClose={()=>setToast(v=>({...v,open:false}))}/>
    <div className="tw-card mb-3"><GameHeader title={t('donation.title')} /><div className="donation-intro"><span>💎</span><p>{t('donation.intro')}</p></div></div>
    <div className="tw-card donation-card"><h2>{t('donation.pix_title')}</h2><p>{t('donation.pix_help')}</p><div className="donation-key"><small>{t('about.pix_key')}</small><strong>{PIX}</strong></div><button className="btn-gold w-full" onClick={copy}>{t('about.copy_pix')}</button></div>
    <div className="tw-card donation-future"><strong>{t('donation.future_title')}</strong><p>{t('donation.future_help')}</p><div><span>PayPal</span><span>{t('realms.not_informed')}</span></div><div><span>{t('donation.crypto')}</span><span>{t('realms.not_informed')}</span></div></div>
  </div>;
}
