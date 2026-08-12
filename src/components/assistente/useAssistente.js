import { useCallback, useMemo, useState } from 'react';
import { useI18n } from '../../hooks/useI18n.jsx';
import { API_URL, PENSANDO_KEYS, shuffleSugestoes } from './config.js';
import { fmtHora } from './markdown.jsx';

export default function useAssistente() {
  const { t, locale } = useI18n();
  const [mensagens, setMensagens] = useState([]);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState('');
  const [intencao, setIntencao] = useState('');
  const [pensando, setPensando] = useState('');
  const sugestoes = useMemo(() => shuffleSugestoes(t), [t, locale]);

  const enviar = useCallback(async (pergunta) => {
    setErro('');
    const thinkingKey = PENSANDO_KEYS[Math.floor(Math.random() * PENSANDO_KEYS.length)];
    setPensando(t(thinkingKey));
    const novaMsg = { role: 'user', content: pergunta, hora: fmtHora() };
    setMensagens((m) => [...m, novaMsg]);
    setLoading(true);

    const historico = mensagens.map((m) => ({ role: m.role, content: m.content }));

    try {
      const res = await fetch(`${API_URL}/api/assistente`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pergunta, historico, locale }),
      });
      const data = await res.json();
      if (!res.ok || data.erro) throw new Error(data.mensagem || data.erro || `Erro ${res.status}`);
      if (data.intencao) setIntencao(data.intencao);
      setMensagens((m) => [
        ...m,
        { role: 'assistant', content: data.resposta, hora: fmtHora(), intencao: data.intencao },
      ]);
    } catch (e) {
      setErro(e.message || t('assistant.error_contact'));
    } finally {
      setLoading(false);
      setPensando('');
    }
  }, [mensagens, locale, t]);

  const reenviar = useCallback(() => {
    const ultima = [...mensagens].reverse().find((m) => m.role === 'user');
    if (!ultima || loading) return;
    setErro('');
    setMensagens((m) => {
      const idx = m
        .map((x, i) => (x.content === ultima.content && x.hora === ultima.hora ? i : -1))
        .filter((i) => i !== -1)
        .pop();
      return idx !== undefined ? m.filter((_, i) => i !== idx) : m;
    });
    enviar(ultima.content);
  }, [mensagens, loading, enviar]);

  const limpar = useCallback(() => {
    setMensagens([]);
    setErro('');
    setIntencao('');
  }, []);

  return { mensagens, loading, erro, intencao, pensando, sugestoes, enviar, reenviar, limpar };
}
