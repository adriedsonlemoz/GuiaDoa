import { useState, useRef, useCallback, useEffect } from 'react';

export function useBuilder() {
  const [activeColor, setActiveColorRaw] = useState('C4A9FF');
  const [hexInput,    setHexInput]       = useState('C4A9FF');
  const [cpicker,     setCpicker]        = useState('#c4a9ff');
  const [savedColors, setSavedColors]    = useState(() => {
    try { return JSON.parse(localStorage.getItem('ctb_saved') || '[]'); } catch { return []; }
  });
  const [toast,    setToast]    = useState('');
  const [toastVis, setToastVis] = useState(false);
  const toastTimer = useRef(null);

  useEffect(() => {
    try { localStorage.setItem('ctb_saved', JSON.stringify(savedColors)); } catch {}
  }, [savedColors]);

  const showToast = useCallback((msg) => {
    setToast(msg); setToastVis(true);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToastVis(false), 2000);
  }, []);

  const setActive = useCallback((hex6) => {
    const h = hex6.replace('#', '').toUpperCase();
    setActiveColorRaw(h);
    setHexInput(h);
    setCpicker('#' + h.toLowerCase());
  }, []);

  const saveColor = useCallback((hex) => {
    const h = hex.replace('#', '').toUpperCase();
    let result = 'ok';
    setSavedColors(prev => {
      if (prev.map(c => c.replace('#','').toUpperCase()).includes(h)) { result = 'existe'; return prev; }
      if (prev.length >= 20)                                          { result = 'cheio';  return prev; }
      return [...prev, '#' + h];
    });
    return result;
  }, []);

  const removeColor = useCallback((hex) => {
    const norm = h => h.replace('#', '').toLowerCase();
    setSavedColors(prev => prev.filter(c => norm(c) !== norm(hex)));
  }, []);

  return {
    activeColor, setActive,
    hexInput, setHexInput,
    cpicker, setCpicker,
    savedColors,
    saveColor, removeColor,
    toast, toastVis, showToast,
  };
}
