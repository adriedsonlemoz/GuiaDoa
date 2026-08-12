import { useEffect, useMemo, useState } from 'react';
import { API_URL } from '../../config/api.js';
import { useI18n } from '../../hooks/useI18n.jsx';

const readJson = async response => {
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return response.json();
};

export default function useDicasFeed() {
  const { t, content } = useI18n();
  const [categorias, setCategorias] = useState([]);
  const [dicas, setDicas] = useState([]);
  const [filtroCat, setFiltroCat] = useState(null);
  const [busca, setBusca] = useState('');
  const [loading, setLoading] = useState(true);
  const [artigoAberto, setArtigoAberto] = useState(null);
  const [toast, setToast] = useState({ open: false, message: '', severity: 'info' });

  useEffect(() => {
    let active = true;
    setLoading(true);
    Promise.all([
      fetch(`${API_URL}/api/dicas/categorias`).then(readJson),
      fetch(`${API_URL}/api/dicas`).then(readJson),
    ]).then(([cats, feed]) => {
      if (!active) return;
      setCategorias(Array.isArray(cats) ? cats : []);
      setDicas(Array.isArray(feed) ? feed : []);
    }).catch(() => {
      if (active) setToast({ open: true, message: t('tips.load_error'), severity: 'error' });
    }).finally(() => {
      if (active) setLoading(false);
    });
    return () => { active = false; };
  }, [t]);

  const catMap = useMemo(() => Object.fromEntries(categorias.map(categoria => [categoria.slug, categoria])), [categorias]);
  const dicasFiltradas = useMemo(() => {
    const termo = busca.trim().toLocaleLowerCase();
    return dicas.filter(dica => {
      if (filtroCat && dica.categoria !== filtroCat) return false;
      if (!termo) return true;
      return [content(dica, 'titulo'), content(dica, 'resumo'), content(dica, 'conteudo')]
        .some(valor => String(valor || '').toLocaleLowerCase().includes(termo));
    });
  }, [dicas, filtroCat, busca, content]);
  const closeToast = () => setToast(current => ({ ...current, open: false }));

  return {
    categorias, dicas, dicasFiltradas, filtroCat, setFiltroCat, busca, setBusca, loading,
    artigoAberto, setArtigoAberto, toast, closeToast, catMap,
  };
}
