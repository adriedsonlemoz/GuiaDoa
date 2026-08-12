import { useCallback, useState } from 'react';
import { API_URL, PENSANDO_MSGS, shuffleSugestoes } from './config.js';
import { fmtHora } from './markdown.jsx';

export default function useAssistente() {
  const [mensagens, setMensagens] = useState([]);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState('');
  const [intencao, setIntencao] = useState('');
  const [pensando, setPensando] = useState('');
  const [sugestoes] = useState(() => shuffleSugestoes());

  const enviar = useCallback(async (pergunta) => {
    setErro('');
    setPensando(PENSANDO_MSGS[Math.floor(Math.random() * PENSANDO_MSGS.length)]);
    const novaMsg = { role: 'user', content: pergunta, hora: fmtHora() };
    setMensagens((m) => [...m, novaMsg]);
    setLoading(true);

    const historico = mensagens.map((m) => ({ role: m.role, content: m.content }));

    try {
      const res = await fetch(`${API_URL}/api/assistente`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pergunta, historico }),
      });
      const data = await res.json();
      if (!res.ok || data.erro) throw new Error(data.mensagem || data.erro || `Erro ${res.status}`);
      if (data.intencao) setIntencao(data.intencao);
      setMensagens((m) => [
        ...m,
        { role: 'assistant', content: data.resposta, hora: fmtHora(), intencao: data.intencao },
      ]);
    } catch (e) {
      setErro(e.message || 'Erro ao contatar o assistente.');
    } finally {
      setLoading(false);
      setPensando('');
    }
  }, [mensagens]);

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
