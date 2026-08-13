import React from 'react';
import { useGameData } from '../../data/GameDataContext.jsx';
import { useI18n } from '../../hooks/useI18n.jsx';
import { GameInfoTable, GamePanel, GameSectionTitle } from '../shared/GameChrome.jsx';

function parseTempo(str) {
  if (!str || !str.trim()) return 0;
  let min = 0;
  const d = str.match(/(\d+)\s*d/i);
  const h = str.match(/(\d+)\s*h/i);
  const m = str.match(/(\d+)\s*m/i);
  if (d) min += parseInt(d[1],10) * 24 * 60;
  if (h) min += parseInt(h[1],10) * 60;
  if (m) min += parseInt(m[1],10);
  return min;
}

function formatDuracao(totalMin) {
  if (totalMin <= 0) return null;
  const d = Math.floor(totalMin / (24 * 60));
  const h = Math.floor((totalMin % (24 * 60)) / 60);
  const m = totalMin % 60;
  return [d ? `${d}d` : '', h ? `${h}h` : '', m ? `${m}m` : ''].filter(Boolean).join(' ');
}

export default function PesquisaDetalhe({ slug }) {
  const { t, content } = useI18n();
  const { pesquisas } = useGameData();
  const pesquisa = pesquisas.find(p => p.slug === slug) || null;

  if (!pesquisa) return <div style={{ padding:24, textAlign:'center', color:'#a5231b' }}>⚠️ {t('research.not_found')}</div>;

  const totalMinutos = pesquisa.niveis.reduce((acc,n) => acc + parseTempo(n.tempo), 0);
  const duracaoTotal = formatDuracao(totalMinutos);
  const rows = pesquisa.niveis.map(nv => ({
    key: nv.nivel,
    label: `${t('common.level')} ${nv.nivel}`,
    value: nv.tempo?.trim() || '—',
  }));

  return (
    <div style={{ maxWidth:620, margin:'0 auto', paddingBottom:20 }}>
      <GamePanel>
        <div className="game-detail-hero" style={{ gridTemplateColumns:'minmax(0,1fr) 92px' }}>
          <div style={{ minWidth:0 }}>
            <h1 className="game-detail-title">{content(pesquisa,'nome')}</h1>
            <div className="game-list-meta" style={{ marginTop:4 }}>
              {pesquisa.categoria} • {t('research.max_level')} {pesquisa.nivelMax}
            </div>
            <p className="game-detail-copy">{content(pesquisa,'descricao') || t('research.no_description')}</p>
          </div>
          <div>
            <div className="game-thumb" style={{ width:92, height:92, fontSize:'2.6rem' }}>{pesquisa.icone || '🔬'}</div>
            <div style={{ marginTop:4, textAlign:'center', fontFamily:"system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif", fontWeight:700, color:'#4e3d26', fontSize:'.72rem' }}>
              {t('research.max_level')} {pesquisa.nivelMax}
            </div>
          </div>
        </div>

        {duracaoTotal ? (
          <div style={{ padding:'10px 12px', display:'flex', justifyContent:'space-between', gap:12, alignItems:'center', borderTop:'1px solid rgba(117,91,51,.22)' }}>
            <span style={{ color:'#6a5434', fontFamily:"system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif", fontSize:'.72rem', fontWeight:700 }}>⏱ {t('research.total_duration')}</span>
            <strong style={{ color:'#315d5b', fontSize:'.8rem' }}>{duracaoTotal}</strong>
          </div>
        ) : null}
      </GamePanel>

      <div style={{ marginTop:10 }}>
        <GameSectionTitle>{t('common.levels')}</GameSectionTitle>
        <GameInfoTable rows={rows} />
      </div>

      {!pesquisa.niveis.some(n => n.tempo?.trim()) ? (
        <div style={{ marginTop:8, color:'#806d4d', fontSize:'.66rem', fontStyle:'italic', textAlign:'center' }}>{t('research.times_later')}</div>
      ) : null}
    </div>
  );
}
