import React, { useState } from 'react';
import { C } from '../theme.js';

const RARIDADES = ['Incomum', 'Raro', 'Épico', 'Lendário', 'Mitológico'];
const RARITY_COLORS = { 'Incomum': '#5A8A5C', 'Raro': '#5C7FA3', 'Épico': '#8B6BAE', 'Lendário': '#C87A2C', 'Mitológico': '#A83C2C' };
const CUSTO_BASE_FOSSEIS = [5, 8, 12, 18, 30];
const MULT_F = { 'Incomum': 1, 'Raro': 2, 'Épico': 4, 'Lendário': 8, 'Mitológico': 15 };
const MULT_P = { 'Incomum': 0, 'Raro': 1, 'Épico': 2, 'Lendário': 4, 'Mitológico': 8 };
const MULT_R = { 'Incomum': 0, 'Raro': 0, 'Épico': 1, 'Lendário': 2, 'Mitológico': 4 };

const getCusto = (r, n) => {
  const idx = (n - 1) % 5;
  return { foss: CUSTO_BASE_FOSSEIS[idx] * MULT_F[r], poc: CUSTO_BASE_FOSSEIS[idx] * MULT_P[r], rel: CUSTO_BASE_FOSSEIS[idx] * MULT_R[r] };
};

const ATRIBUTOS = [
  { nome: 'Vida',                  icon: '❤️', cor: '#C85C5C', tipo: 'ofensivo',  desc: 'Aumenta a vida da tropa. Pode acumular com o aumento de vida via nível.' },
  { nome: 'Ataque Elemental',      icon: '⚡', cor: '#C87A2C', tipo: 'ofensivo',  desc: 'Ataques de perto e à distância causam dano elemental extra.' },
  { nome: 'Impulso Elemental',     icon: '🔥', cor: '#D08A3C', tipo: 'ofensivo',  contra: 'Barreira Elemental',  desc: 'Aumenta o dano elemental extra. Combatido pela Barreira Elemental.' },
  { nome: 'Barreira Elemental',    icon: '🛡️', cor: '#5C7FA3', tipo: 'defensivo', contra: 'Impulso Elemental',   desc: 'Reduz dano elemental recebido. Combatido pelo Impulso Elemental.' },
  { nome: 'Bombardeio Elemental',  icon: '💥', cor: '#8B6BAE', tipo: 'ofensivo',  contra: 'Confronto Elemental', critico: '250%', desc: 'Permite dano elemental crítico (250% de dano). Combatido pelo Confronto Elemental.' },
  { nome: 'Confronto Elemental',   icon: '🔰', cor: '#5A8A5C', tipo: 'defensivo', contra: 'Bombardeio Elemental', desc: 'Reduz chance de receber golpes elementais críticos. Combatido pelo Bombardeio.' },
  { nome: 'Bloqueio Elemental',    icon: '🪬', cor: '#5C7FA3', tipo: 'defensivo', contra: 'Ruptura Elemental',   bloqueio: '60%', desc: 'Chance de bloquear 60% do dano elemental. Combatido pela Ruptura Elemental.' },
  { nome: 'Ruptura Elemental',     icon: '⚔️', cor: '#A83C2C', tipo: 'ofensivo',  contra: 'Bloqueio Elemental',  desc: 'Reduz a chance de bloqueio do alvo. Combatido pelo Bloqueio Elemental.' },
];

const CATEGORIAS = [
  { cat: 1, tropas: 'Minotauros, Arqueiros, Dragões de Ataque Rápido' },
  { cat: 2, tropas: 'Dragões de Combate' },
  { cat: 3, tropas: 'Andarilhos da Areia, Hoplitas' },
  { cat: 4, tropas: 'Gigantes, Abissais, Terrores do Pântano' },
  { cat: 5, tropas: 'Espelhos de Fogo, Bigas de Fogo, Serpente Vingativa, Canhão Elétrico, Amarande' },
  { cat: 6, tropas: 'Ogro de Granito, Serpente Arsênica, Dragonete da Tempestade, Magmassauros, Guerreiro do Magma' },
  { cat: 7, tropas: 'Titã Petrificado, Dragão do Veneno, Golem do Trovão, Gigante do Gelo, Leviatã Ártico, Cavaleiro Dragão, Centauros Infernais, Condenadores, Cavaleiros Espectrais' },
  { cat: 8, tropas: 'Perseguidor das Sombras, Escaravelho de Guerra, Arruinador Dimensional, Megalibgwilia, Medusa, Gatuno Alado' },
  { cat: 9, tropas: 'Esmagadores Colossais, Fantasma do Trovão, Lordes da Lava' },
];

const REGRAS = [
  { icon: '⚗️', title: 'Custo de Aperfeiçoamento', text: 'Aperfeiçoe suas tropas para aumentar atributos ao custo de Fósseis, Poções e Relíquias.' },
  { icon: '💾', title: 'Salve Sempre', text: 'Atributos aperfeiçoados devem ser salvos para surtir efeito. Nunca feche sem salvar!' },
  { icon: '⬆️', title: 'Subir de Nível', text: 'Assim que o máximo dos atributos for alcançado, poderá subir o nível usando itens específicos.' },
  { icon: '⭐', title: 'Promoção de Raridade', text: 'Pode promover suas tropas ao próximo nível de raridade após cada 5 níveis.' },
  { icon: '💡', title: 'Poder de Aperfeiçoamento', text: 'Aperfeiçoamentos garantem poder extra (Poder de Aperfeiçoamento), não aumenta directamente o poder das tropas.' },
];

const SectionDivider = ({ label }) => (
  <div className="flex items-center gap-2 my-3">
    <div className="flex-1 h-px" style={{ background: `linear-gradient(90deg, transparent, ${C.BORDER})` }} />
    <span style={{ color: C.ACCENT, fontSize: '0.7rem' }}>◆</span>
    {label && <span className="font-nunito font-bold text-[0.65rem] tracking-widest whitespace-nowrap" style={{ color: C.TEXT_MUTED }}>{label}</span>}
    {label && <span style={{ color: C.ACCENT, fontSize: '0.7rem' }}>◆</span>}
    <div className="flex-1 h-px" style={{ background: `linear-gradient(270deg, transparent, ${C.BORDER})` }} />
  </div>
);

// ── Calculadora ─────────────────────────────────────────────────────────────
const Calculadora = () => {
  const [raridade,  setRaridade]  = useState('Épico');
  const [nivelDe,   setNivelDe]   = useState('1');
  const [nivelAte,  setNivelAte]  = useState('5');
  const [resultado, setResultado] = useState(null);
  const [showDetail, setShowDetail] = useState(false);

  const calcular = () => {
    const de  = Math.max(1, parseInt(nivelDe)  || 1);
    const ate = Math.max(de, parseInt(nivelAte) || de);
    let totalF = 0, totalP = 0, totalR = 0;
    const detalhe = [];
    for (let n = de; n <= ate; n++) {
      const c = getCusto(raridade, n);
      totalF += c.foss; totalP += c.poc; totalR += c.rel;
      detalhe.push({ nivel: n, ...c });
    }
    setResultado({ totalF, totalP, totalR, detalhe, de, ate, raridade });
    setShowDetail(false);
  };

  const cor = RARITY_COLORS[raridade];

  return (
    <div className="tw-card mb-3" style={{ borderLeft: `5px solid ${cor}` }}>
      <div className="p-3">
        <p className="font-nunito font-black text-sm m-0 mb-3 pb-2" style={{ color: C.TEXT_PRIMARY, borderBottom: `1.5px solid ${C.BORDER_SOFT}` }}>
          🧮 Calculadora de Pedras por Nível
        </p>

        {/* Raridade */}
        <div className="flex gap-1.5 flex-wrap mb-3">
          {RARIDADES.map(r => (
            <button
              key={r}
              onClick={() => setRaridade(r)}
              className="font-nunito font-bold text-[0.72rem] rounded-full px-2.5 py-1 transition-all border-none cursor-pointer"
              style={{
                border: `1.5px solid ${raridade === r ? RARITY_COLORS[r] : C.BORDER_SOFT}`,
                background: raridade === r ? `${RARITY_COLORS[r]}22` : C.BG_INPUT,
                color: raridade === r ? RARITY_COLORS[r] : C.TEXT_MUTED,
              }}
            >
              {r}
            </button>
          ))}
        </div>

        {/* Inputs nível */}
        <div className="grid grid-cols-2 gap-2 mb-3">
          <div>
            <label className="font-nunito font-bold text-[0.65rem] tracking-wide block mb-1" style={{ color: C.TEXT_MUTED }}>NÍVEL ATUAL (DE)</label>
            <input type="number" min={1} max={25} className="tw-input text-center" value={nivelDe} onChange={e => setNivelDe(e.target.value)} />
          </div>
          <div>
            <label className="font-nunito font-bold text-[0.65rem] tracking-wide block mb-1" style={{ color: C.TEXT_MUTED }}>NÍVEL DESEJADO (ATÉ)</label>
            <input type="number" min={1} max={25} className="tw-input text-center" value={nivelAte} onChange={e => setNivelAte(e.target.value)} />
          </div>
        </div>

        <button className="btn-navy btn-lg w-full mb-3" onClick={calcular}>⚗️ Calcular Custo Total</button>

        {resultado && (
          <div style={{ animation: 'reveal-up 0.3s ease both' }}>
            {/* Totais */}
            <div className="flex gap-2 mb-2.5 flex-wrap">
              {[
                { label: 'Fósseis',   value: resultado.totalF, cor: C.ATTACK,  icon: '🦴' },
                { label: 'Poções',    value: resultado.totalP, cor: C.DEFENSE, icon: '🧪' },
                { label: 'Relíquias', value: resultado.totalR, cor: C.POWER,   icon: '💎' },
              ].map(item => (
                <div key={item.label} className="flex-1 p-2.5 rounded-lg text-center"
                  style={{ background: C.BG_CARD, border: `1.5px solid ${item.cor}55`, borderBottom: `3px solid ${item.cor}`, minWidth: 72 }}>
                  <p className="text-xl leading-none m-0">{item.icon}</p>
                  <p className="font-nunito font-black text-lg leading-tight m-0" style={{ color: item.cor }}>{item.value.toLocaleString('pt-BR')}</p>
                  <p className="font-nunito font-bold text-[0.62rem] uppercase m-0" style={{ color: C.TEXT_MUTED }}>{item.label}</p>
                </div>
              ))}
            </div>

            {/* Resumo */}
            <div className="py-1.5 px-3 mb-2.5 rounded-lg text-center"
              style={{ background: `${cor}15`, border: `1px solid ${cor}44` }}>
              <p className="font-nunito font-black text-[0.78rem] m-0" style={{ color: cor }}>
                {resultado.raridade} · Nível {resultado.de} → {resultado.ate} ({resultado.ate - resultado.de + 1} níveis)
              </p>
            </div>

            {/* Detalhes accordion */}
            <button
              className="w-full font-nunito font-bold text-[0.72rem] tracking-wider py-2 rounded-lg transition-all border-none cursor-pointer"
              style={{ background: C.BG_SECONDARY, border: `1px solid ${C.BORDER_SOFT}`, color: C.TEXT_MUTED }}
              onClick={() => setShowDetail(v => !v)}
            >
              {showDetail ? '▾' : '▸'} VER DETALHES POR NÍVEL
            </button>

            {showDetail && (
              <div className="overflow-x-auto mt-2">
                <table className="w-full">
                  <thead>
                    <tr style={{ background: C.BG_SECONDARY }}>
                      {['Nível', '🦴 Fósseis', '🧪 Poções', '💎 Relíquias'].map(h => (
                        <th key={h} className="tw-th text-center">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {resultado.detalhe.map((row, i) => (
                      <tr key={row.nivel} style={{ background: i % 2 === 0 ? C.BG_CARD : C.BG_SECONDARY }}>
                        <td className="tw-td text-center font-bold" style={{ color: cor }}>{row.nivel}</td>
                        <td className="tw-td text-center">{row.foss.toLocaleString('pt-BR')}</td>
                        <td className="tw-td text-center">{row.poc.toLocaleString('pt-BR')}</td>
                        <td className="tw-td text-center">{row.rel.toLocaleString('pt-BR')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// ── Componente principal ─────────────────────────────────────────────────────
const AprimoramentoTropas = () => (
  <div className="max-w-2xl mx-auto pb-4" style={{ animation: 'reveal-up 0.4s ease both' }}>

    {/* Header */}
    <div className="tw-card text-center px-4 py-3 mb-3 relative">
      <span className="absolute top-1.5 left-2" style={{ color: C.ACCENT, fontSize: 11, opacity: 0.7 }}>◆</span>
      <span className="absolute top-1.5 right-2" style={{ color: C.ACCENT, fontSize: 11, opacity: 0.7 }}>◆</span>
      <p className="font-nunito font-bold text-xs tracking-widest uppercase m-0" style={{ color: C.TEXT_PRIMARY }}>Aprimoramento de Tropas</p>
      <p className="font-nunito italic text-[0.7rem] m-0 mt-0.5" style={{ color: C.TEXT_MUTED }}>Fortaleça suas unidades com Fósseis, Poções e Relíquias</p>
    </div>

    <SectionDivider label="CALCULADORA" />
    <Calculadora />

    <SectionDivider label="COMO FUNCIONA" />
    <div className="grid grid-cols-1 gap-2 mb-3">
      {REGRAS.map((r, i) => (
        <div key={i} className="flex gap-2.5 items-start p-3 rounded-lg"
          style={{ background: C.BG_SECONDARY, border: `1px solid ${C.BORDER_SOFT}`, borderLeft: `4px solid ${C.ACCENT}` }}>
          <span className="text-xl leading-none shrink-0 mt-0.5">{r.icon}</span>
          <div>
            <p className="font-nunito font-black text-[0.82rem] m-0 mb-0.5" style={{ color: C.TEXT_PRIMARY }}>{r.title}</p>
            <p className="font-nunito text-[0.75rem] font-semibold leading-snug m-0" style={{ color: C.TEXT_SECONDARY }}>{r.text}</p>
          </div>
        </div>
      ))}
    </div>

    <SectionDivider label="ATRIBUTOS" />
    <div className="mb-3 space-y-2">
      {ATRIBUTOS.map(attr => (
        <div key={attr.nome} className="p-3 rounded-lg" style={{ border: `1.5px solid ${attr.cor}44`, borderLeft: `4px solid ${attr.cor}`, background: C.BG_CARD }}>
          <div className="flex items-start gap-2">
            <div className="w-9 h-9 shrink-0 flex items-center justify-center text-lg rounded-lg"
              style={{ background: `${attr.cor}18`, border: `1.5px solid ${attr.cor}44` }}>
              {attr.icon}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                <span className="font-nunito font-black text-[0.85rem]" style={{ color: attr.cor }}>{attr.nome}</span>
                <span className="font-nunito font-bold text-[0.6rem] px-1.5 py-0.5 rounded-full"
                  style={{
                    background: attr.tipo === 'ofensivo' ? '#A83C2C22' : '#5C7FA322',
                    color: attr.tipo === 'ofensivo' ? '#A83C2C' : '#5C7FA3',
                    border: `1px solid ${attr.tipo === 'ofensivo' ? '#A83C2C44' : '#5C7FA344'}`,
                  }}>
                  {attr.tipo === 'ofensivo' ? '⚔️ Ofensivo' : '🛡️ Defensivo'}
                </span>
                {attr.critico && <span className="font-nunito font-bold text-[0.6rem] px-1.5 py-0.5 rounded-full" style={{ background: '#8B6BAE22', color: '#8B6BAE', border: '1px solid #8B6BAE44' }}>Crítico: {attr.critico}</span>}
                {attr.bloqueio && <span className="font-nunito font-bold text-[0.6rem] px-1.5 py-0.5 rounded-full" style={{ background: '#5C7FA322', color: '#5C7FA3', border: '1px solid #5C7FA344' }}>Bloqueia: {attr.bloqueio}</span>}
              </div>
              <p className="font-nunito font-semibold text-[0.75rem] leading-snug m-0 mb-1" style={{ color: C.TEXT_SECONDARY }}>{attr.desc}</p>
              {attr.contra && (
                <p className="font-nunito text-[0.68rem] m-0">
                  <span style={{ color: C.TEXT_MUTED }}>Combatido por: </span>
                  <span className="font-black" style={{ color: C.ACCENT_DEEP }}>{attr.contra}</span>
                </p>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>

    <SectionDivider label="CATEGORIAS DE TROPAS" />
    <div className="grid grid-cols-1 gap-2 mb-3">
      {CATEGORIAS.map(cat => (
        <div key={cat.cat} className="p-3 rounded-lg" style={{ border: `1px solid ${C.BORDER_SOFT}`, background: C.BG_SECONDARY }}>
          <span className="inline-block font-nunito font-black text-[0.72rem] px-2 py-0.5 rounded mb-1.5"
            style={{ background: C.ACCENT, color: '#FFF8EE' }}>
            CAT {cat.cat}
          </span>
          <p className="font-nunito font-semibold text-[0.78rem] leading-snug m-0" style={{ color: C.TEXT_SECONDARY }}>{cat.tropas}</p>
        </div>
      ))}
    </div>

    {/* Aviso */}
    <div className="p-3 rounded-xl" style={{ border: `1.5px dashed ${C.WARNING}`, background: `${C.WARNING}10` }}>
      <div className="flex gap-2.5 items-start">
        <span className="text-2xl shrink-0">⚠️</span>
        <div>
          <p className="font-nunito font-black text-[0.82rem] m-0 mb-0.5" style={{ color: C.WARNING }}>ATENÇÃO — Salve no Arsenal!</p>
          <p className="font-nunito font-semibold text-[0.75rem] leading-snug m-0" style={{ color: C.TEXT_SECONDARY }}>
            O poder do aperfeiçoamento aumenta o seu poder total, mas pode causar variações no ranking global. Sempre salve suas tropas antes de fechar.
          </p>
        </div>
      </div>
    </div>
  </div>
);

export default AprimoramentoTropas;
