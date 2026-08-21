import { ANTROPOS_SEED, GRODZ_SEED, GRODZ_MECHANICS } from './campanha.js';
import { DRAGON_CAPTURE_MAP } from './dragonCapture.js';
import { DRAGOES_SEED } from './dragoes.js';


const fmtGuideNumber = (value, locale = 'pt-BR') => new Intl.NumberFormat(locale).format(Number(value || 0));

function localField(item, field, locale) {
  if (!item) return '';
  if (locale !== 'pt-BR') return item?.i18n?.[locale]?.[field] || item?.[field] || '';
  return item?.[field] || '';
}

function guideResearchText(guide, locale) {
  return (guide?.pesquisas || []).map(item => `${localField(item, 'nome', locale)} ${item.nivel}`).join(' · ');
}

function guideSupportText(guide, locale) {
  const items = guide?.apoios || [];
  if (!items.length) return '';
  const joiner = locale === 'pt-BR' ? ' OU ' : ' OR ';
  return items.map(item => `${fmtGuideNumber(item.quantidade, locale)} ${localField(item, 'nome', locale)}`).join(joiner);
}

function attackGuideRows(codePrefix, locale = 'pt-BR') {
  const levelWord = locale === 'pt-BR' ? 'Nv.' : 'Lv.';
  const risk = locale === 'pt-BR' ? '⚠ possíveis perdas' : '⚠ possible losses';
  const safe = locale === 'pt-BR' ? '✓ sem perdas' : '✓ zero loss';
  const incomplete = locale === 'pt-BR' ? '⚠ configuração isolada não confirmada' : '⚠ standalone setup not confirmed';
  const rows = [];
  for (const entry of ANTROPOS_SEED) {
    const guides = (entry.guiasAtaque || []).filter(g => codePrefix === 'dragoes-ataque-rapido-ssd'
      ? String(g.codigo || '').startsWith(codePrefix)
      : String(g.codigo || '') === codePrefix);
    guides.forEach((guide, idx) => {
      const troop = localField(guide, 'tropaPrincipal', locale) || guide.tropaPrincipal;
      const main = guide.quantidade == null
        ? (locale === 'pt-BR' ? 'quantidade pendente' : 'amount pending')
        : `${fmtGuideNumber(guide.quantidade, locale)} ${troop}`;
      const support = guideSupportText(guide, locale);
      const companion = localField(guide, 'complemento', locale);
      const research = guideResearchText(guide, locale);
      const result = guide.resultado === 'possiveis_perdas' ? risk : guide.resultado === 'sem_perdas' ? safe : guide.resultado === 'incompleto' ? incomplete : '';
      const alt = idx > 0 ? (locale === 'pt-BR' ? ' alternativa' : ' alternative') : '';
      const pieces = [main, support, companion].filter(Boolean).join(' + ');
      rows.push(`- ${levelWord} ${entry.nivel}${alt} → ${pieces}${research ? ` | ${research}` : ''}${result ? ` | ${result}` : ''}`);
    });
  }
  return rows.join('\n');
}

function fedorRows(locale = 'pt-BR') {
  const levelWord = locale === 'pt-BR' ? 'Nv.' : 'Lv.';
  const none = locale === 'pt-BR' ? 'sem Fedor' : 'no Fedor';
  return ANTROPOS_SEED.map(entry => {
    const fedor = (entry.tropas || []).find(t => t.nome === 'Fedor');
    return `- ${levelWord} ${entry.nivel} → ${fedor ? fmtGuideNumber(fedor.quantidade, locale) : none}`;
  }).join('\n');
}

const dragonById = new Map(DRAGOES_SEED.map(dragon => [dragon.id, dragon]));

function captureTutorialRows(locale = 'pt-BR') {
  const level = locale === 'pt-BR' ? 'Nv.' : 'Lv.';
  return Object.values(DRAGON_CAPTURE_MAP)
    .sort((a,b) => `${a.campo.subtipo}:${a.dragonId}`.localeCompare(`${b.campo.subtipo}:${b.dragonId}`))
    .map(capture => {
      const dragon = dragonById.get(capture.dragonId);
      const dragonName = locale === 'pt-BR' ? dragon?.nome : (dragon?.i18n?.[locale]?.nome || dragon?.nome);
      const itemName = locale === 'pt-BR' ? capture.item.nome : (capture.item?.i18n?.[locale]?.nome || capture.item.nome);
      const fieldName = locale === 'pt-BR' ? capture.campo.nome : (capture.campo?.i18n?.[locale]?.nome || capture.campo.nome);
      return `- ${dragonName} → ${capture.quantidade} ${itemName} → ${fieldName} ${level}${capture.nivelMin}–${capture.nivelMax}`;
    }).join('\n');
}

const ANTROPOS_ATTACK_TUTORIAL_PT = `«⚠️ Estas são recomendações baseadas nas configurações confirmadas do GUIA. Você pode testar outros métodos também.
As quantidades principais recebem 20% de margem de segurança. As tropas premium de 500 unidades permanecem com 500.»

🧭 Antes de atacar

Abra Mapa & Campanha → Antropos → escolha o nível. A ficha mostra inimigos, recursos, recompensas e as recomendações já calculadas.

Use somente uma tropa ofensiva por marcha entre as três opções abaixo:

- Arqueiros / LBM
- Lava Jaws / Magmassauros
- Dragões de Ataque Rápido / SSD

Carregadores e Transportes Blindados não contam como segunda tropa ofensiva: entram apenas para transportar recursos.

---

✨ Opção premium: 500 tropas especiais

Se você já possui uma destas tropas, mantenha 500 unidades, sem aplicar os 20%:

- 500 Medusas
- 500 Esmagadores Colossais
- 500 Sapos Tóxicos
- 500 Centauros Infernais
- 500 Fadas da Selva
- 500 Caçadores de Almas

Para a configuração cadastrada no GUIA, mantenha no mínimo Metalurgia 4, Medicina 4 e Calibração de Armas 4.

---

📦 Como o transporte é calculado

O GUIA soma todos os recursos cadastrados no Antropos e calcula quanto a própria tropa ofensiva consegue carregar.

Capacidade por unidade:

- Arqueiro / LBM → 25
- Lava Jaws / Magmassauro → 10
- SSD → 100
- Carregador → 200
- Transporte Blindado → 5.000

Fórmula:

Recursos restantes = recursos do Antropos − capacidade da tropa ofensiva

Depois o GUIA mostra a quantidade exata de Transportes Blindados OU Carregadores necessária para completar a carga. Escolha apenas uma das duas opções.

Se a tropa principal já consegue carregar tudo, nenhum transporte é acrescentado.

---

🏹 Arqueiros / LBM

A quantidade-base confirmada recebe 20% a mais. Exemplo: 100 vira 120.

${attackGuideRows('arqueiros-lbm', 'pt-BR')}

---

🔥 Lava Jaws / Magmassauros

Também recebem 20% sobre a quantidade-base. Não misture Lava Jaws com outra tropa ofensiva.

${attackGuideRows('lava-jaws-lj8', 'pt-BR')}

A referência original recomenda pesquisas de combate altas para Lava Jaws, mas não informa a combinação exata por nível; o GUIA não inventa esse dado.

---

🐲 Dragões de Ataque Rápido / SSD

${attackGuideRows('dragoes-ataque-rapido-ssd', 'pt-BR')}

No Nv.9 a referência continua marcada como possíveis perdas. O acréscimo de 20% é uma margem e não transforma esse ataque em garantia de perdas zero.

No Nv.10 a única referência anterior misturava SSD com Serpente Mefítica. Como agora não usamos combinações ofensivas, a quantidade de SSD sozinho fica marcada como não confirmada em vez de ser inventada.

---

🕵️ Fedor e espionagem

A tática de espionagem continua como orientação adicional e não é uma quarta composição ofensiva.

${fedorRows('pt-BR')}

Se quiser usar o método tradicional, espione com quantidade de Espiões igual ou superior ao Fedor do nível. Depois siga a sua marcha escolhida.

---

✅ Checklist rápido

- Escolhi apenas uma tropa ofensiva? ✓
- O GUIA já acrescentou 20%? ✓
- Escolhi Blindados OU Carregadores, nunca os dois? ✓
- A capacidade total cobre todos os recursos? ✓
- Minhas pesquisas atendem ao mínimo indicado? ✓
- Se for SSD Nv.9, aceitei o aviso de possíveis perdas? ✓

Depois do ataque, confira o relatório. Recomendações ajudam a reduzir risco, mas você também pode testar outros métodos.`;

const ANTROPOS_ATTACK_TUTORIAL_EN = `«⚠️ These are recommendations based on GUIA's confirmed setups. You can test other methods too.
Main troop amounts receive a 20% safety margin. The premium 500-unit setups remain at 500.»

🧭 Before attacking

Open Map & Campaign → Anthropus → choose the level. The page shows enemies, resources, rewards, and the calculated recommendations.

Use only one offensive troop per march from these three options:

- Longbowmen / LBM
- Lava Jaws
- Swift Strike Dragons / SSD

Porters and Armored Transports are not a second offensive troop; they are used only to carry resources.

---

✨ Premium option: 500 special troops

If you already own one of these troops, keep the amount at 500 without adding 20%:

- 500 Snake-headed Maidens
- 500 Colossal Smashers
- 500 Toxic Toads
- 500 Infernal Centaurs
- 500 Forest Fairies
- 500 Soul Hunters

For the setup stored in GUIA, keep at least Metallurgy 4, Medicine 4, and Weapons Calibration 4.

---

📦 How transport is calculated

GUIA adds all resources stored for the Anthropus level and calculates how much the offensive troop can carry by itself.

Carry capacity per unit:

- Longbowman / LBM → 25
- Lava Jaws → 10
- SSD → 100
- Porter → 200
- Armored Transport → 5,000

Formula:

Remaining resources = Anthropus resources − offensive troop carry capacity

GUIA then shows the exact amount of Armored Transports OR Porters needed to complete the load. Choose only one option.

If the main troop can already carry everything, no transport is added.

---

🏹 Longbowmen / LBM

The confirmed base amount receives 20% extra. Example: 100 becomes 120.

${attackGuideRows('arqueiros-lbm', 'en-US')}

---

🔥 Lava Jaws

They also receive 20% over the confirmed base amount. Do not mix Lava Jaws with another offensive troop.

${attackGuideRows('lava-jaws-lj8', 'en-US')}

The original reference recommends high combat research for Lava Jaws but does not specify the exact mix by level; GUIA does not invent that data.

---

🐲 Swift Strike Dragons / SSD

${attackGuideRows('dragoes-ataque-rapido-ssd', 'en-US')}

At Lv.9 the reference remains marked as possible losses. The 20% increase is a margin and does not turn it into a guaranteed zero-loss attack.

At Lv.10 the only previous reference mixed SSD with a Mephitic Serpent. Since offensive combinations are now removed, the standalone SSD amount is marked unconfirmed instead of being invented.

---

🕵️ Fedor scouting

The scouting tactic remains an additional orientation and is not a fourth offensive setup.

${fedorRows('en-US')}

If you want to use the traditional method, scout with at least as many Spies as the level has Fedor, then send the offensive march you selected.

---

✅ Quick checklist

- Did I choose only one offensive troop? ✓
- Has GUIA already added the 20% margin? ✓
- Did I choose Armored Transports OR Porters, never both? ✓
- Does the total carry capacity cover all resources? ✓
- Do my research levels meet the listed minimums? ✓
- For SSD Lv.9, did I accept the possible-loss warning? ✓

Check the battle report after attacking. Recommendations help reduce risk, but you can test other methods too.`;

const DRAGON_CAPTURE_TUTORIAL_PT = `«🐉 Todos os dragões capturáveis cadastrados aqui exigem 100 itens do próprio dragão.
Os dados abaixo vêm diretamente das recompensas dos Campos, para que Campo, Dragão e Tutorial permaneçam sincronizados.»

🧭 Como capturar

1. Abra Mapa & Campanha → Campos.
2. Entre no Campo indicado para o dragão desejado.
3. Ataque os níveis de 6 a 10.
4. Reúna 100 itens de captura do dragão.
5. Use os 100 itens para capturá-lo no sistema correspondente do jogo.

A Savana é a única exceção de recompensas em níveis baixos: ela também possui recompensa nos Nv.1–5. Porém o Emblema do Dragão do Trovão aparece nos Nv.6–10.

---

📚 Dragões, itens e Campos

${captureTutorialRows('pt-BR')}

---

💧 Dragão da Água

Em conta nova ou Realm elegível, o Dragão da Água pode ser recebido como recompensa de novo usuário, normalmente associada ao 2º dia.

Se a conta for antiga e não tiver recebido essa recompensa, ele também pode ser capturado: reúna 100 Emblemas do Dragão da Água atacando Lagos Nv.6–10.

---

⚡ Dragão do Trovão

O Emblema do Dragão do Trovão foi confirmado na Savana. Para capturá-lo, reúna 100 emblemas atacando Savanas Nv.6–10.

---

⚔️ Qual tropa usar nos Campos?

Campos são mais simples que Antropos. Uma opção prática já mostrada pelo GUIA é usar 500 unidades de uma das tropas premium compatíveis, quando você possuir essas tropas e as pesquisas necessárias.

Você também pode testar marchas menores ou outros métodos. O objetivo deste tutorial é indicar onde obter os itens, não afirmar que existe uma única composição obrigatória para todos os jogadores.

---

🔗 Informação conectada

Na página de cada dragão capturável, a aba Como obter mostra:

- item necessário
- quantidade: 100
- Campo correto
- níveis 6–10
- botão para abrir este tutorial
- botão para abrir diretamente o tipo de Campo

O Grande Dragão não aparece nesta lista porque faz parte da progressão inicial e não precisa ser capturado.`;

const DRAGON_CAPTURE_TUTORIAL_EN = `«🐉 Every capturable dragon registered here requires 100 of its own capture item.
The data below comes directly from Field rewards so Field, Dragon, and Tutorial stay synchronized.»

🧭 How to capture

1. Open Map & Campaign → Fields.
2. Open the Field listed for the dragon you want.
3. Attack levels 6 through 10.
4. Collect 100 of that dragon's capture item.
5. Use the 100 items to capture it through the corresponding game system.

Savannah is the only Field with rewards at low levels as well: it also has rewards at Lv.1–5. The Thunder Dragon Emblem itself appears at Lv.6–10.

---

📚 Dragons, items, and Fields

${captureTutorialRows('en-US')}

---

💧 Water Dragon

On a new account or eligible Realm, the Water Dragon may be received as a new-user reward, normally associated with day 2.

If an older account did not receive that reward, it can also be captured: collect 100 Water Dragon Emblems by attacking Lake Fields from Lv.6–10.

---

⚡ Thunder Dragon

The Thunder Dragon Emblem is confirmed in Savannah. To capture it, collect 100 emblems by attacking Savannah Fields from Lv.6–10.

---

⚔️ What troop should I use against Fields?

Fields are easier than Anthropus. One practical option already shown by GUIA is 500 units of one compatible premium troop, when you own those troops and meet the research requirements.

You can also test smaller marches or other methods. This tutorial's purpose is to show where to get the items, not to claim one mandatory march for every player.

---

🔗 Connected information

On each capturable dragon's How to get tab, GUIA shows:

- required item
- quantity: 100
- correct Field
- levels 6–10
- button to open this tutorial
- button to open the Field type directly

The Great Dragon is not on this list because it is part of initial progression and does not need to be captured.`;


function grodzLevelRows(locale = 'pt-BR') {
  const levelWord = locale === 'pt-BR' ? 'Nv.' : 'Lv.';
  const gameLabel = locale === 'pt-BR' ? 'jogo recomenda' : 'game recommends';
  const enemyLabel = locale === 'pt-BR' ? 'inimigo' : 'enemy';
  const noGameRecommendation = locale === 'pt-BR' ? 'nenhuma tropa exibida' : 'no troop shown';
  const healthBar = locale === 'pt-BR' ? 'Grodz — barra de vida, sem tropas definidas' : 'Grodz — health bar, no defined troops';
  const troopName = troop => localField(troop, 'nome', locale) || troop?.nome || '';
  const troopList = troops => (troops || []).map(troop => `${fmtGuideNumber(troop.quantidade, locale)} ${troopName(troop)}`).join(' + ');
  return GRODZ_SEED.map(entry => {
    const enemy = entry.grodz?.inimigoTipo === 'barra_vida' ? healthBar : troopList(entry.tropas);
    const official = troopList(entry.grodz?.recomendacaoJogo) || noGameRecommendation;
    return `- ${levelWord} ${entry.nivel} → ${gameLabel}: ${official} | ${enemyLabel}: ${enemy}`;
  }).join('\n');
}

const GRODZ_TUTORIAL_PT = `«🛡️ A Campanha de Grodz possui 10 níveis. Os níveis 1–9 servem como progressão; no Nv.10 você enfrenta o próprio Grodz e pode obter partes de armadura de dragão.»

🧭 Como entrar

1. Abra Missões.
2. Entre na aba Campanha.
3. Avance pelos níveis de Grodz.
4. No ataque, você pode selecionar um dragão caso queira a armadura daquele dragão específico.
5. Se não selecionar nenhum dragão, a armadura recebida será aleatória entre os dragões que você possui.

Ataque normal e Devastar compartilham o mesmo contador diário de ${GRODZ_MECHANICS.limiteDiarioCompartilhado} ações.

Exemplo: 10 ataques normais + 15 usos de Devastar = 25 ações consumidas e 74 restantes.

---

🐉 Como funciona a armadura

Se você selecionar um dragão antes do ataque, a peça de armadura obtida será daquele dragão.

Se você não selecionar nenhum dragão, o jogo escolhe aleatoriamente uma armadura entre os dragões que você já possui.

As partes continuam aleatórias e podem se repetir. Fazer vários ataques não garante receber uma peça diferente em cada tentativa.

---

🔥 Recomendação principal do GUIA — Nv.1–9

Use ${fmtGuideNumber(GRODZ_MECHANICS.tropaPrincipal.quantidade)} Magmassauros (Lava Jaws).

Essa configuração foi testada pelo GUIA e é a recomendação principal para passar os níveis 1 a ${GRODZ_MECHANICS.tropaPrincipal.nivelMaxSemPerdas} sem perdas.

Você pode usar outras tropas se preferir, mas a recomendação exibida é a configuração já testada pelo GUIA.

---

☠️ Nv.10 — Grodz

O Nv.10 não possui uma quantidade de tropas inimigas conhecida. Grodz é representado por uma barra de vida, e não por uma composição normal de tropas.

Recomendação do GUIA:

- ${fmtGuideNumber(GRODZ_MECHANICS.nivel10.magmassauros)} Magmassauros
- ${fmtGuideNumber(GRODZ_MECHANICS.nivel10.ogrosGranito)} Ogros de Granito

Envie as duas tropas juntas na mesma marcha.

⚠️ Perdas são esperadas no Nv.10. Você pode usar outras tropas, mas essa é a formação recomendada pelo GUIA. Tropas elegíveis perdidas podem seguir para as Fontes de Recuperação conforme as regras do jogo.

---

📊 Inimigos por nível

${grodzLevelRows('pt-BR')}

Os Nv.8 e 9 estão registrados como Dragões de Combate. No Nv.10 não existe composição de tropas definida: o inimigo é o próprio Grodz, mostrado por uma barra de vida.

---

💥 Ticket de Campanha de Devastar

O item usado no modo Devastar se chama **Ticket de Campanha de Devastar**.

- os materiais necessários são obtidos atacando Zyrvorthians
- o Ticket é produzido na Loja de Surpresas
- a produção leva ${GRODZ_MECHANICS.devastarTempoHoras} horas
- depois, volte à Campanha e escolha Devastar
- escolha quantos Tickets deseja usar
- selecione um dragão se quiser a armadura dele; sem selecionar, a armadura será aleatória entre seus dragões

⚠️ Devastar não possui um contador separado. Ataques normais e Devastar consomem juntos as mesmas ${GRODZ_MECHANICS.limiteDiarioCompartilhado} ações diárias.

---

🎁 Recompensa do Nv.10

Ao derrotar Grodz no nível final, você pode obter uma parte de armadura de dragão. As peças são aleatórias e podem se repetir.

O GUIA também mantém conectados os registros de armadura, dragões, Magmassauros, Ogros de Granito e o Ticket de Campanha de Devastar para que futuras correções sejam feitas em um único lugar.`;

const GRODZ_TUTORIAL_EN = `«🛡️ The Grodz Campaign has 10 levels. Levels 1–9 are progression stages; at Lv.10 you fight Grodz himself and can obtain dragon armor parts.»

🧭 How to enter

1. Open Missions.
2. Open the Campaign tab.
3. Progress through the Grodz levels.
4. When attacking, you may select a dragon if you want armor for that specific dragon.
5. If you select no dragon, the armor reward is random among dragons you own.

Normal attacks and Devastate share the same daily counter of ${GRODZ_MECHANICS.limiteDiarioCompartilhado} actions.

Example: 10 normal attacks + 15 Devastate uses = 25 actions consumed and 74 remaining.

---

🐉 How armor works

If you select a dragon before attacking, the armor part you receive belongs to that dragon.

If you select no dragon, the game randomly chooses armor for one of the dragons you already own.

Armor parts remain random and may repeat. Multiple attacks do not guarantee a different part every time.

---

🔥 GUIA main recommendation — Lv.1–9

Use ${fmtGuideNumber(GRODZ_MECHANICS.tropaPrincipal.quantidade, 'en-US')} Lava Jaws (Lava Jaws).

This setup has been tested by GUIA and is the main recommendation for clearing levels 1 through ${GRODZ_MECHANICS.tropaPrincipal.nivelMaxSemPerdas} with zero losses.

You can use other troops if you prefer, but the displayed recommendation is the setup already tested by GUIA.

---

☠️ Lv.10 — Grodz

Lv.10 has no known enemy troop count. Grodz is represented by a health bar rather than a normal troop composition.

GUIA recommendation:

- ${fmtGuideNumber(GRODZ_MECHANICS.nivel10.magmassauros, 'en-US')} Lava Jaws
- ${fmtGuideNumber(GRODZ_MECHANICS.nivel10.ogrosGranito, 'en-US')} Granite Ogres

Send both troop types together in the same march.

⚠️ Losses are expected at Lv.10. Other troops can be used, but this is GUIA's recommended formation. Eligible lost troops may go to Recovery Pools according to game rules.

---

📊 Enemies by level

${grodzLevelRows('en-US')}

Lv.8 and 9 are registered as Battle Dragons. At Lv.10 there is no defined troop composition: the enemy is Grodz himself, shown as a health bar.

---

💥 Devastate Campaign Ticket

The item used by Devastate is the **Devastate Campaign Ticket**.

- required materials are obtained by attacking Zyrvorthians
- the Ticket is produced in the Surprise Shop
- production takes ${GRODZ_MECHANICS.devastarTempoHoras} hours
- then return to Campaign and choose Devastate
- choose how many Tickets to use
- select a dragon if you want its armor; with no dragon selected, armor is random among your dragons

⚠️ Devastate does not have a separate counter. Normal attacks and Devastate together consume the same ${GRODZ_MECHANICS.limiteDiarioCompartilhado} daily actions.

---

🎁 Lv.10 reward

Defeating Grodz at the final level can grant a dragon armor part. Parts are random and may repeat.

GUIA also keeps armor, dragons, Lava Jaws, Granite Ogres, and the Devastate Campaign Ticket connected so future corrections are maintained from a single source.`;

export const DICAS_SEED = [
  {
    slug: 'guia-inicial-construcoes',
    titulo: '🐉 Guia para Iniciante',
    resumo: 'Um roteiro prático para os primeiros dias: cidade, população, tropas, dragões, Campos, Antropos, defesa e rotina de crescimento.',
    categoria: 'iniciante',
    tipo: 'guia',
    leituraMin: 10,
    destaque: true,
    ativo: true,
    ordem: 0,
    relacionados: {
      modulos: ['edificios', 'ilhas', 'tropas', 'pesquisas', 'dragoes', 'campanha', 'itens', 'torneios'],
      edificios: ['FonteDaCura', 'Guarnicao', 'Casa', 'Cofre', 'Teatro', 'Viveiro'],
      tropas: ['Dragões de Ataque Rápido', 'Dragões de Combate', 'Medusa', 'Esmagadores Colossais', 'Sapo Tóxico', 'Centauros Infernais', 'Fada da Selva', 'Caçador de Almas'],
      dragoes: ['dragao_agua', 'dragao_beladona', 'dragao_terra', 'dragao_fogo'],
      pesquisas: [],
      reinos: [],
    },
    conteudo: `«⚠️ Este guia é uma orientação para começar bem, não uma regra da Alliance.
Adapte a cidade e a ordem de evolução ao seu estilo de jogo, ao tempo disponível e ao objetivo da conta.»

🧭 Rota rápida para os primeiros dias

- Dia 1 → comece com 1 Casa e decida se quer priorizar Guarnições, Fontes de Cura ou equilíbrio entre as duas.
- Conta nova ou Realm elegível → o Dragão da Água pode chegar pela recompensa de novo usuário e libera 4 espaços adicionais; se sua conta não recebeu a recompensa, capture-o com 100 Emblemas do Dragão da Água em Lagos Nv.6–10.
- Todos os dias → construa, pesquise, treine, ataque Campos e Antropos e evolua seus dragões aos poucos.
- Guarde recursos, aceleradores e itens quando puder aproveitar melhor em torneios.
- Não aumente poder apenas por aumentar: priorize desbloqueios e melhorias que tragam benefício real.

---

🏰 Guarnições, Fontes, Cofre e Teatro

Uma das primeiras decisões é definir o equilíbrio entre treinamento e recuperação.

⚔️ Mais Guarnições = melhor capacidade de treinamento

As Guarnições são usadas para treinar tropas. Ter mais Guarnições permite distribuir melhor o treinamento e desenvolver o exército mais rapidamente.

💧 Mais Fontes de Cura = maior capacidade de recuperação

As Fontes aumentam a quantidade de tropas que podem ser atendidas na recuperação. Como referência conectada ao módulo de Edifícios, uma Fonte no Nv.35 possui capacidade para {{fonte_n35}} tropas.

⚖️ Não existe uma única configuração correta

Mais Guarnições → prioriza produção de tropas
Mais Fontes → prioriza preservação e recuperação do exército
Equilíbrio → mantém os dois benefícios sem especializar totalmente a cidade

🔐 Cofre e 🎭 Teatro são opcionais para o desenvolvimento inicial.

O Cofre protege parte dos recursos armazenados e o Teatro aumenta a felicidade da população, mas ambos ocupam espaço. Construa se esses efeitos fizerem sentido para a sua conta.

⚠️ O Viveiro é diferente: ele pode ser necessário para desbloquear tropas dracônicas. Por exemplo, Dragões de Ataque Rápido exigem Viveiro Nv.{{ssd_viveiro}} e Dragões de Combate exigem Viveiro Nv.{{bd_viveiro}}.

---

🏠 Casas e população

Não é necessário preencher vários espaços com Casas logo no começo.

Comece com 1 Casa.

Quando você obtiver o Dragão da Água — pela recompensa de novo usuário em conta/Realm elegível ou capturando-o com 100 Emblemas em Lagos Nv.6–10 — os 4 espaços adicionais podem ser usados para construir mais 4 Casas.

1 Casa inicial + 4 Casas do Dragão da Água → 5 Casas

As Casas fornecem população. Essa população é usada tanto no treinamento de tropas quanto como trabalhadores na produção de recursos.

A ideia é preservar os espaços iniciais para construções mais importantes e ampliar as Casas quando os espaços extras estiverem disponíveis.

---

🏝️ Ilhas adicionais e especialização

Quando suas ilhas secundárias estiverem disponíveis, você pode especializá-las em vez de repetir a mesma distribuição em todas.

Uma sugestão possível:

- 1 ilha focada em Guarnições
- 2 ilhas focadas em Fontes de Cura

Com todas as expansões, uma configuração desse tipo pode chegar a 38 Fontes e 17 Guarnições contando a cidade principal.

No Nv.35, 38 Fontes representam aproximadamente {{fontes_38}} tropas de capacidade antes de bônus adicionais.

Isso é apenas um exemplo. Quem prefere treinamento intenso pode inverter a prioridade e construir mais Guarnições.

---

🐉 Dragões, Campos e Antropos

Capture e desenvolva seus dragões aos poucos. Não é necessário tentar obter tudo nos primeiros dias.

Campos de níveis mais altos são importantes para emblemas, itens e evolução. O catálogo atual do GUIA confirma, por exemplo, Emblemas do Dragão Beladona em Campos de Floresta do Nv.{{beladona_min}} ao Nv.{{beladona_max}}.

Confira sempre a ficha de cada dragão: nem todos possuem a mesma forma de obtenção.

Ataque Campos diariamente sempre que puder. Eles podem fornecer Carnes para evolução de dragões e outros itens úteis durante o crescimento.

Também não ignore os Antropos. O módulo Mapa & Campanha já possui os níveis 1–10 com:

- composição inimiga
- recursos obtidos
- itens/recompensas possíveis
- recomendações de ataque com status de risco confirmado

Use esse módulo antes de atacar para escolher o nível e a marcha adequada ao que sua conta já possui.

---

⚔️ Tropas para começar

Duas tropas muito úteis para o início são:

🐲 Dragões de Ataque Rápido

Requisitos atuais cadastrados no GUIA:

- Guarnição Nv.{{ssd_guarnicao}}
- Viveiro Nv.{{ssd_viveiro}}
- Formação Rápida Nv.{{ssd_formacao}}
- Dragoria Nv.{{ssd_dragoria}}

🐲 Dragões de Combate

Requisitos atuais cadastrados no GUIA:

- Guarnição Nv.{{bd_guarnicao}}
- Forja Nv.{{bd_forja}}
- Viveiro Nv.{{bd_viveiro}}
- Formação Rápida Nv.{{bd_formacao}}
- Dragoria Nv.{{bd_dragoria}}

Os Dragões de Ataque Rápido chegam antes e já ajudam nos primeiros ataques. Os Dragões de Combate exigem uma estrutura maior, mas são um próximo passo natural.

Depois, escolha seus próximos desbloqueios de acordo com a estratégia. Hoplitas e Ogros de Granito podem ser objetivos úteis; não existe necessidade de correr para Espelhos de Fogo antes de a base estar preparada.

---

✨ Tropas que simplificam o farming

Conforme o jogo avança, algumas tropas tornam o farming muito mais simples.

O método já confirmado no Mapa & Campanha utiliza 500 unidades de qualquer uma destas tropas em alvos compatíveis:

- Medusa
- Esmagadores Colossais
- Sapo Tóxico
- Centauros Infernais
- Fada da Selva
- Caçador de Almas

Para essa configuração, mantenha pelo menos:

- Metalurgia Nv.4
- Medicina Nv.4
- Calibração de Armas Nv.4

Com essas tropas você deixa de depender tanto das unidades iniciais e pode farmar com mais segurança. Consulte o nível do alvo no Mapa & Campanha antes de enviar a marcha.

---

🛡️ Não defenda ataques sem necessidade

Esse é um dos cuidados mais importantes no começo do Realm.

Não defenda automaticamente todo ataque que chegar à sua cidade.

Contra um adversário muito mais forte, perder alguns recursos pode custar muito menos do que perder um exército que levou horas ou dias para ser treinado.

No início, recursos, população e tropas ainda são limitados. Uma defesa mal escolhida pode atrasar bastante o desenvolvimento.

Escolha suas batalhas. Defenda quando existir uma razão real para isso, não apenas porque recebeu um ataque.

Também evite evoluir o Castelo apenas para aumentar poder. Castelos altos chamam atenção e o poder por si só não substitui tropas, pesquisas e uma cidade bem organizada.

---

📦 Guarde recursos e itens para o momento certo

Não é necessário consumir imediatamente tudo o que a conta recebe.

Sempre que possível, acumule:

- recursos
- aceleradores
- itens de evolução
- recompensas que possam ser usadas durante torneios

Você pode ficar temporariamente atrás de outros jogadores em poder, mas usar esses itens durante um torneio permite evoluir a conta e ainda receber recompensas pelo mesmo progresso.

---

💎 Se você utiliza Rubis

Quem utiliza Rubis para acelerar treinamento e evolução pode considerar uma cidade com mais Fontes de Cura.

Se o treinamento pode ser acelerado quando necessário, preservar o exército já construído pode ser mais valioso do que dedicar todos os espaços disponíveis a Guarnições.

Isso não torna uma configuração obrigatória; apenas muda o equilíbrio entre velocidade de reposição e capacidade de recuperação.

---

📈 Rotina simples de crescimento

Uma rotina consistente vale mais do que tentar fazer tudo de uma vez.

- mantenha construções evoluindo
- avance pesquisas úteis para seus próximos desbloqueios
- mantenha tropas em treinamento
- ataque Campos e Antropos diariamente
- desenvolva os dragões gradualmente
- guarde itens quando houver vantagem em usar durante torneios
- confira o Mapa & Campanha antes de farmar níveis mais altos
- evite batalhas que não trazem benefício

Cresça no seu ritmo. O objetivo dos primeiros dias é construir uma base que continue funcionando quando o Realm estiver mais competitivo.

---

⚠️ Resumo

Mais Fontes → maior capacidade de recuperação

Mais Guarnições → treinamento mais forte

1 Casa no início → mais 4 quando liberar o Dragão da Água

Campos + Antropos → farming diário, recursos, itens e progressão

Dragões de Ataque Rápido → ótimo primeiro objetivo de tropa dracônica

Dragões de Combate → próximo passo quando a estrutura permitir

500 tropas especiais + pesquisas adequadas → farming sem perdas em alvos compatíveis

Evitar defesas ruins → preserva o recurso mais caro do início: seu exército

Não existe necessidade de fazer tudo imediatamente. Desenvolva uma base sólida, aproveite os sistemas do jogo e, acima de tudo, divirta-se. 🐉`,
    i18n: {
      'en-US': {
        titulo: '🐉 Beginner Guide',
        resumo: 'A practical roadmap for the first days: city layout, population, troops, dragons, Fields, Anthropus, defense, and steady growth.',
        conteudo: `«⚠️ This guide is a starting recommendation, not an Alliance rule.
Adapt your city and upgrade order to your playstyle, available time, and account goals.»

🧭 Quick route for the first days

- Day 1 → start with 1 House and decide whether to prioritize Garrisons, Healing Fountains, or a balance between both.
- New account or eligible Realm → the Water Dragon may come from the new-user reward and unlocks 4 additional spaces; if your account did not receive that reward, capture it with 100 Water Dragon Emblems from Lake Fields Lv.6–10.
- Every day → build, research, train, attack Fields and Anthropus, and develop your dragons gradually.
- Save resources, speedups, and items when they can be used more efficiently during tournaments.
- Do not raise power only for the number itself: prioritize unlocks and upgrades that provide a real benefit.

---

🏰 Garrisons, Fountains, Vault, and Theater

One of the first decisions is balancing training and recovery.

⚔️ More Garrisons = stronger training capacity

Garrisons are used to train troops. Having more Garrisons lets you distribute training better and develop your army faster.

💧 More Healing Fountains = greater recovery capacity

Fountains increase the amount of troops that can be handled during recovery. Using the value currently connected to the Buildings module, a Lv.35 Fountain has capacity for {{fonte_n35}} troops.

⚖️ There is no single correct setup

More Garrisons → prioritizes troop production
More Fountains → prioritizes army preservation and recovery
Balanced setup → keeps both benefits without fully specializing the city

🔐 Vault and 🎭 Theater are optional for early development.

The Vault protects part of your stored resources and the Theater increases population happiness, but both use building space. Build them when those effects are valuable to your account.

⚠️ The Nursery is different: it may be required to unlock dragon troops. Swift Strike Dragons require a Lv.{{ssd_viveiro}} Nursery and Battle Dragons require a Lv.{{bd_viveiro}} Nursery.

---

🏠 Houses and population

You do not need to fill many spaces with Houses at the beginning.

Start with 1 House.

When you obtain the Water Dragon — through the new-user reward on an eligible account/Realm or by capturing it with 100 Water Dragon Emblems from Lake Fields Lv.6–10 — its 4 additional spaces can be used for 4 more Houses.

1 starting House + 4 Water Dragon Houses → 5 Houses

Houses provide population. Population is used both for troop training and as workers in resource production.

The idea is to preserve early spaces for more important buildings and expand Houses when the additional spaces become available.

---

🏝️ Additional islands and specialization

When your secondary islands become available, you can specialize them instead of repeating the same layout everywhere.

One possible plan:

- 1 island focused on Garrisons
- 2 islands focused on Healing Fountains

With all expansions, a setup like this can reach 38 Fountains and 17 Garrisons when combined with the Main City.

At Lv.35, 38 Fountains represent approximately {{fontes_38}} troops of capacity before additional bonuses.

This is only an example. Players focused on heavy training can reverse the priority and build more Garrisons.

---

🐉 Dragons, Fields, and Anthropus

Capture and develop your dragons gradually. There is no need to obtain everything during the first days.

Higher-level Fields are important for emblems, items, and progression. The current GUIA catalog confirms, for example, Nightshade Dragon Emblems in Forest Fields from Lv.{{beladona_min}} to Lv.{{beladona_max}}.

Always check each dragon's page: not every dragon has the same acquisition method.

Attack Fields daily whenever possible. They can provide Meat for dragon progression and other useful items while the account grows.

Do not ignore Anthropus either. The Map & Campaign module already contains levels 1–10 with:

- enemy composition
- obtained resources
- possible items/rewards
- attack recommendations with confirmed risk status

Use that module before attacking to choose a level and a march that matches what your account already owns.

---

⚔️ Troops to start with

Two very useful early troops are:

🐲 Swift Strike Dragons

Current requirements stored in GUIA:

- Garrison Lv.{{ssd_guarnicao}}
- Nursery Lv.{{ssd_viveiro}}
- Rapid Formation Lv.{{ssd_formacao}}
- Dragonry Lv.{{ssd_dragoria}}

🐲 Battle Dragons

Current requirements stored in GUIA:

- Garrison Lv.{{bd_guarnicao}}
- Forge Lv.{{bd_forja}}
- Nursery Lv.{{bd_viveiro}}
- Rapid Formation Lv.{{bd_formacao}}
- Dragonry Lv.{{bd_dragoria}}

Swift Strike Dragons arrive earlier and already help with the first attacks. Battle Dragons require more infrastructure but are a natural next step.

After that, choose further unlocks according to your strategy. Hoplites and Granite Ogres can be useful goals; there is no need to rush Fire Mirrors before the account foundation is ready.

---

✨ Troops that simplify farming

As the game progresses, some troops make farming much easier.

The setup already confirmed in Map & Campaign uses 500 units of any of these troops on compatible targets:

- Snake-headed Maiden
- Colossal Smashers
- Toxic Toad
- Infernal Centaurs
- Forest Fairy
- Soul Hunter

For this setup, keep at least:

- Metallurgy Lv.4
- Medicine Lv.4
- Weapons Calibration Lv.4

With these troops you become less dependent on early units and can farm more safely. Check the target level in Map & Campaign before sending the march.

---

🛡️ Do not defend attacks without a reason

This is one of the most important precautions at the beginning of a Realm.

Do not automatically defend every attack that reaches your city.

Against a much stronger opponent, losing some resources may cost far less than losing an army that took hours or days to train.

Early on, resources, population, and troops are still limited. A poorly chosen defense can delay development significantly.

Choose your battles. Defend when there is a real reason to do so, not simply because an attack arrived.

Also avoid upgrading the Castle only to increase power. High-level Castles attract attention, and power by itself does not replace troops, research, and a well-organized city.

---

📦 Save resources and items for the right moment

You do not need to consume everything the account receives immediately.

Whenever possible, stockpile:

- resources
- speedups
- evolution items
- rewards that can be used during tournaments

You may temporarily stay below other players in power, but using those items during a tournament lets you develop the account while also receiving rewards for the same progress.

---

💎 If you use Rubies

Players who use Rubies to accelerate training and development may consider a city with more Healing Fountains.

If training can be accelerated when needed, preserving the army you already built may be more valuable than dedicating every available space to Garrisons.

This does not make one setup mandatory; it simply changes the balance between replacement speed and recovery capacity.

---

📈 Simple growth routine

Consistency is more valuable than trying to do everything at once.

- keep buildings upgrading
- advance research needed for your next unlocks
- keep troops training
- attack Fields and Anthropus daily
- develop dragons gradually
- save items when tournaments provide extra value
- check Map & Campaign before farming higher levels
- avoid battles that provide no meaningful benefit

Grow at your own pace. The goal of the first days is to build a foundation that continues working when the Realm becomes more competitive.

---

⚠️ Summary

More Fountains → greater recovery capacity

More Garrisons → stronger training

1 House at the start → 4 more when the Water Dragon unlocks

Fields + Anthropus → daily farming, resources, items, and progression

Swift Strike Dragons → excellent first dragon-troop goal

Battle Dragons → next step when the infrastructure is ready

500 special troops + appropriate research → zero-loss farming on compatible targets

Avoiding bad defenses → protects the most expensive early resource: your army

There is no need to do everything immediately. Build a solid foundation, use the game's systems well, and above all, have fun. 🐉`,
      },
    },
  },
  {
    slug: 'tutorial-atacar-antropos',
    titulo: '⚔️ Como Atacar Antropos sem Perdas',
    resumo: 'Tutorial conectado aos dados dos Antropos: 500 tropas premium, LBM, Lava Jaws e SSD, com margem de 20% e transporte calculado para recolher todos os recursos.',
    categoria: 'iniciante',
    tipo: 'tutorial',
    leituraMin: 14,
    destaque: true,
    ativo: true,
    ordem: 1,
    relacionados: {
      modulos: ['campanha', 'tropas', 'pesquisas', 'itens'],
      edificios: [],
      tropas: ['Espiões', 'Arqueiros', 'Lava Jaws (LJ)', 'Carregadores', 'Transportes Blindados', 'Dragões de Ataque Rápido', 'Medusa', 'Esmagadores Colossais', 'Sapo Tóxico', 'Centauros Infernais', 'Fada da Selva', 'Caçador de Almas'],
      dragoes: [],
      pesquisas: ['Metalurgia', 'Medicina', 'Calibração de Armas', 'Dragoria'],
      reinos: [],
    },
    conteudo: ANTROPOS_ATTACK_TUTORIAL_PT,
    i18n: {
      'en-US': {
        titulo: '⚔️ How to Attack Anthropus Without Losses',
        resumo: 'A data-connected Anthropus tutorial with 500-unit premium troops, LBM, Lava Jaws and SSD, a 20% safety margin, and transport calculated to carry every resource.',
        conteudo: ANTROPOS_ATTACK_TUTORIAL_EN,
      },
    },
  },
  {
    slug: 'tutorial-capturar-dragoes',
    titulo: '🐉 Como Capturar Dragões nos Campos',
    resumo: 'Veja quais Campos atacar, os níveis corretos e os 100 itens necessários para capturar cada dragão, com os dados sincronizados ao catálogo de Dragões.',
    categoria: 'iniciante',
    tipo: 'tutorial',
    leituraMin: 8,
    destaque: true,
    ativo: true,
    ordem: 2,
    relacionados: {
      modulos: ['dragoes', 'campanha', 'tropas', 'itens'],
      edificios: [],
      tropas: ['Medusa', 'Esmagadores Colossais', 'Sapo Tóxico', 'Centauros Infernais', 'Fada da Selva', 'Caçador de Almas'],
      dragoes: Object.keys(DRAGON_CAPTURE_MAP),
      pesquisas: ['Metalurgia', 'Medicina', 'Calibração de Armas'],
      reinos: [],
    },
    conteudo: DRAGON_CAPTURE_TUTORIAL_PT,
    i18n: {
      'en-US': {
        titulo: '🐉 How to Capture Dragons in Fields',
        resumo: 'See which Fields to attack, the correct levels, and the 100 items required for each dragon, synchronized with the Dragon catalog.',
        conteudo: DRAGON_CAPTURE_TUTORIAL_EN,
      },
    },
  },
  {
    slug: 'tutorial-campanha-grodz',
    titulo: '🛡️ Como atacar o Grodz e obter armaduras',
    resumo: 'Aprenda os 10 níveis de Grodz, a recomendação de ataque, como obter armaduras e como usar o Ticket de Campanha de Devastar.',
    categoria: 'grodz',
    tipo: 'tutorial',
    leituraMin: 9,
    destaque: true,
    ativo: true,
    ordem: 0,
    relacionados: {
      modulos: ['campanha', 'tropas', 'dragoes', 'itens'],
      edificios: [],
      tropas: ['Magmassauros', 'Ogros de Granito'],
      dragoes: ['grande_dragao', 'dragao_agua', 'dragao_terra', 'dragao_fogo'],
      pesquisas: [],
      reinos: [],
    },
    conteudo: GRODZ_TUTORIAL_PT,
    i18n: {
      'en-US': {
        titulo: '🛡️ How to attack Grodz and obtain armor',
        resumo: 'Learn all 10 Grodz levels, the recommended marches, how to obtain armor, and how to use the Devastate Campaign Ticket.',
        conteudo: GRODZ_TUTORIAL_EN,
      },
    },
  },
  {
    slug: 'tutorial-defesa-inimigos',
    titulo: '🛡️ Como se defender dos seus inimigos',
    resumo: 'Aprenda a usar Tratado de Cessar-fogo, Paz do Dragão e teleportes, preserve suas tropas e calcule quanto precisa para manter a cidade protegida.',
    categoria: 'iniciante',
    tipo: 'tutorial',
    leituraMin: 8,
    destaque: true,
    ativo: true,
    ordem: 3,
    relacionados: {
      modulos: ['campanha', 'itens', 'dragoes', 'reinos'],
      edificios: [],
      tropas: [],
      dragoes: ['dragao_agua'],
      pesquisas: [],
      itens: ['protecao-do-dragao','tratado-cessar-fogo','paz-do-dragao','teleportador-sombrio','teleportador-direcionado','estilhaco-poeira-estelar-astrax','astrax-olho-do-vazio','pena-aetherion','garra-trovao-aetherion'],
      reinos: [],
    },
    conteudo: `🛡️ Escolha a defesa certa
Existem várias maneiras de evitar que um inimigo destrua seu exército. Proteção, teleporte e uma boa gestão dos recursos servem a situações diferentes.

---

⏳ Tratado de Cessar-fogo — 12 horas
O Tratado de Cessar-fogo impede você de atacar e de ser atacado por 12 horas. Use quando não estiver lutando nem marchando.

A Proteção do Dragão não é o escudo: ela é o material usado para fabricar o Tratado.

- complete as 5 missões diárias para receber 2 Proteções do Dragão por dia
- 2 Proteções do Dragão + 100.000 Pedra + 100.000 Ouro = 1 Tratado de Cessar-fogo
- cada Tratado leva 4 horas para ser produzido na Loja de Surpresas
- só com as missões diárias, você consegue material para 1 Tratado de 12h por dia

O planejador no fim deste tutorial calcula automaticamente quantos Tratados, materiais, Pedra e Ouro você precisa.

Exemplo de 7 dias de proteção contínua:
- 14 Tratados de 12h
- 28 Proteções do Dragão
- 14 dias de missões diárias para juntar esses materiais sem Zyrvorthian
- 1.400.000 Pedra + 1.400.000 Ouro
- 56 horas de produção se os 14 Tratados forem produzidos em sequência

---

🐲 Use o Zyrvorthian para conseguir mais Tratados
Os materiais exclusivos dos Chefes da Calamidade permitem produzir Tratados sem depender apenas das duas Proteções do Dragão recebidas no dia.

Astrax:
- 25 Estilhaços de Poeira Estelar de Astrax + 1 Astrax, o Olho do Vazio = 1 Tratado

Aetherion:
- 20 Penas de Aetherion + 1 Garra de Trovão de Aetherion = 1 Tratado

Cada chefe usa materiais próprios. Materiais de um chefe não são usados na loja de outro.

---

🐉 Paz do Dragão — 3 dias
A Paz do Dragão impede atacar e ser atacado por 3 dias. Ela aparece como uma habilidade/opção do Dragão da Água.

- pode ser comprada por 40 Rubis
- também pode ser obtida em arcas ou recompensas de torneios
- é útil quando você ficará ausente por mais tempo e quer uma proteção prolongada

Não confunda a Paz do Dragão de 3 dias com o Tratado de Cessar-fogo de 12 horas.

---

🌑 Teleportador Sombrio
O Teleportador Sombrio custa 30 Rubis e move sua cidade para uma localização aleatória no mapa.

É uma boa saída quando um inimigo já sabe exatamente onde você está. Você desaparece daquela posição, mas isso não torna sua cidade impossível de encontrar. Se atacar o mesmo inimigo novamente, ele poderá localizar você outra vez.

---

🧭 Teleportador Direcionado
O Teleportador Direcionado custa 75 Rubis. Em vez de mandar sua cidade para um ponto aleatório, ele permite escolher uma localização disponível no mapa.

Use quando quiser controlar para onde vai: afastar-se de uma aliança inimiga, ficar perto de aliados ou escolher uma área mais conveniente.

---

📦 Não vire um alvo lucrativo
Evite acumular uma quantidade enorme de recursos expostos sem necessidade. Quanto mais comida, madeira, pedra, metal e ouro disponíveis para saque, maior o incentivo para alguém voltar a atacar sua cidade.

Produza e acumule conforme o que pretende gastar. Se houver risco de ataque, gastar recursos em construções, pesquisas e treinamento pode ser melhor do que deixá-los parados.

---

⚔️ Nem todo ataque deve ser defendido
Se o atacante for muito mais forte, defender apenas para “tentar” pode custar o seu exército inteiro.

Perder alguns recursos pode ser menos prejudicial do que perder todas as tropas. Reconstruir um exército do zero leva tempo e pode travar seu crescimento.

Preserve suas tropas quando a defesa não tiver chance real. Use proteção ou teleporte quando isso for mais vantajoso.

---

🌐 Horário do servidor e do Reino
A referência canônica do jogo é o servidor UTC+0. A virada diária acontece às 00:00 UTC+0 e o horário de cada Reino deve ser convertido a partir dessa base, respeitando corretamente quando a conversão cai no dia anterior ou seguinte.

Horários específicos que ainda não foram confirmados permanecem em branco. O GUIA não usa Brasília como referência interna e não inventa horários ausentes.

---

✅ Resumo rápido
- 12h: Tratado de Cessar-fogo
- 3 dias: Paz do Dragão
- fuga imediata aleatória: Teleportador Sombrio
- mudança planejada de posição: Teleportador Direcionado
- não acumule recursos sem necessidade
- não sacrifique seu exército em uma defesa que você sabe que não consegue vencer
- use o Zyrvorthian para produzir mais Tratados quando precisar de proteção além do limite das missões diárias`,
    i18n: {
      'en-US': {
        titulo: '🛡️ How to defend yourself from enemies',
        resumo: 'Learn how to use Ceasefire Treaties, Dragon Peace and teleports, preserve your troops, and calculate what you need to keep your city protected.',
      },
    },
  }
];
