export async function consultarGroq({ apiKey, systemPrompt, mensagens, timeoutMs = 20_000 }) {
  const ctrl = new AbortController();
  const timeoutId = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      signal: ctrl.signal,
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [{ role: 'system', content: systemPrompt }, ...mensagens],
        max_tokens: 1400,
        temperature: 0.35,
        top_p: 0.85,
        stream: false,
      }),
    });

    if (!response.ok) {
      const detalhe = await response.text();
      const error = new Error('Erro ao consultar o assistente. Tente novamente.');
      error.code = 'GROQ_HTTP_ERROR';
      error.status = response.status;
      error.detail = detalhe;
      throw error;
    }

    const data = await response.json();
    return data.choices?.[0]?.message?.content?.trim() || 'Não consegui gerar uma resposta.';
  } finally {
    clearTimeout(timeoutId);
  }
}
