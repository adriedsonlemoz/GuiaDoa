import React, { useState } from 'react';
import { useI18n } from '../../hooks/useI18n.jsx';

async function writeClipboard(text) {
  if (navigator.clipboard?.writeText) return navigator.clipboard.writeText(text);
  const el=document.createElement('textarea'); el.value=text; el.style.position='fixed'; el.style.opacity='0'; document.body.appendChild(el); el.select(); document.execCommand('copy'); el.remove();
}

export default function TutorialCopyButton({ text, getText, className = 'btn-ghost btn-sm' }) {
  const { t } = useI18n();
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    const value = typeof getText === 'function' ? getText() : text;
    if (!String(value || '').trim()) return;
    try { await writeClipboard(String(value).trim()); setCopied(true); window.setTimeout(()=>setCopied(false),1600); }
    catch { setCopied(false); }
  };
  return <button type="button" className={className} onClick={copy}>{copied ? `✓ ${t('tutorial.copy_done')}` : `⧉ ${t('tutorial.copy')}`}</button>;
}
