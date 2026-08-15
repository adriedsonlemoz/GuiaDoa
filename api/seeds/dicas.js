import { ANTROPOS_SEED } from './campanha.js';


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
      const result = guide.resultado === 'possiveis_perdas' ? risk : guide.resultado === 'sem_perdas' ? safe : '';
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

const ANTROPOS_ATTACK_TUTORIAL_PT = `«⚠️ Este tutorial usa as marchas confirmadas que já estão cadastradas em Mapa & Campanha para Antropos Nv.1–10.
Se a sua pesquisa estiver abaixo do nível indicado, não trate a marcha como segura. No mobile não existe Antropos Nv.11 neste guia.»

🧭 Antes de apertar Atacar

Se você nunca atacou Antropos, pense em quatro perguntas simples:

- Qual é o nível exato do Antropos?
- Qual método sem perdas você já consegue montar?
- Suas pesquisas atingem os níveis mínimos da receita?
- Você está misturando tropas que não deveriam estar juntas?

Abra Mapa & Campanha → Antropos → escolha o nível. A ficha já mostra inimigos, recursos, itens possíveis e as marchas confirmadas.

Regra para iniciante: se você não consegue cumprir a receita inteira, desça um nível. É melhor farmar um Antropos mais baixo sem perdas do que improvisar uma marcha e perder horas de treinamento.

---

🕵️ Fedor e espionagem: por que ele merece atenção

No método tradicional, Fedor é a quantidade que usamos como referência para a espionagem.

Espione primeiro com a mesma quantidade de Espiões que existem de Fedor, ou mais. Depois envie a marcha principal com 1 Espião + sua tropa ofensiva.

Esse 1 Espião é a perda esperada da marcha; a ideia é preservar a tropa principal quando a configuração estiver correta.

Quantidade de Fedor cadastrada em cada nível:

${fedorRows('pt-BR')}

Exemplo: Antropos Nv.6 possui 10.000 Fedor → espione com 10.000 Espiões ou mais → depois envie 1 Espião + a marcha ofensiva escolhida.

Se você usar uma das tropas especiais de 500 unidades explicadas abaixo, não precisa fazer essa espionagem prévia.

---

✨ Caminho mais simples: 500 tropas especiais

Se você já desbloqueou uma destas tropas, este é o método mais fácil de entender para farming:

- 500 Medusas
- 500 Esmagadores Colossais
- 500 Sapos Tóxicos
- 500 Centauros Infernais
- 500 Fadas da Selva
- 500 Caçadores de Almas

Para a configuração cadastrada no GUIA, mantenha no mínimo:

- Metalurgia Nv.4
- Medicina Nv.4
- Calibração de Armas Nv.4

Com essas condições atendidas, o método está marcado como sem perdas e dispensa espionagem prévia.

Se você ainda não possui essas tropas, use um dos métodos abaixo.

---

🏹 Método com Arqueiros (LBM)

Arqueiros são um dos métodos mais acessíveis porque funcionam com apoio de transporte e pesquisas específicas.

Nos níveis em que aparecem duas opções de apoio, use Carregadores OU Transportes Blindados — nunca os dois juntos. Se optar por Transportes Blindados, o guia permite até 10% a mais como margem extra de segurança.

Não misture Arqueiros, que são tropas de ataque à distância, com tropas rápidas de combate corpo a corpo como SSD/BD na mesma marcha. Essa combinação pode causar perdas nas tropas rápidas.

Marchas confirmadas:

${attackGuideRows('arqueiros-lbm', 'pt-BR')}

Como ler uma linha: “Nv.3 → 600 Arqueiros + 1.815 Carregadores OU 72 Transportes Blindados | Metalurgia 4 · Medicina 4 · Calibração de Armas 5” significa que você escolhe apenas uma das duas opções de transporte e precisa ter pelo menos esses níveis de pesquisa.

---

🔥 Método com Lava Jaws (LJ)

Lava Jaws exigem quantidades muito menores de tropas principais, mas usam Transportes Blindados como apoio.

Marchas cadastradas:

${attackGuideRows('lava-jaws-lj8', 'pt-BR')}

A referência confirmada informa que as pesquisas relevantes devem estar em níveis altos, 9 ou 10, mas não detalha nesta tabela quais pesquisas correspondem a cada marcha. O GUIA não inventa esse detalhe: trate Lava Jaws como método de conta mais avançada e confira suas pesquisas de combate antes de enviar.

---

🐲 Método com Dragões de Ataque Rápido (SSD)

Dragões de Ataque Rápido são uma ótima ponte entre o começo do Realm e marchas mais avançadas. Aqui a quantidade sozinha não basta: Metalurgia, Medicina e a pesquisa de dragões indicada na receita fazem parte do método.

Marchas cadastradas:

${attackGuideRows('dragoes-ataque-rapido-ssd', 'pt-BR')}

Atenção especial ao Nv.9: as duas configurações cadastradas estão marcadas como POSSÍVEIS PERDAS. Não trate Antropos Nv.9 com SSD como marcha garantida sem perdas.

No Nv.10, o método cadastrado usa 200.000 SSD + Serpente Mefítica e exige Metalurgia 10, Medicina 10 e Dragoria 9.

Nunca misture SSD com Arqueiros ou outras tropas de ataque à distância na mesma marcha. O próprio conjunto de estratégias do projeto alerta que essa mistura pode provocar perdas nas tropas rápidas.

---

🔬 O que as pesquisas fazem

As pesquisas não são decoração da receita. Se o método pede um nível, trate aquele número como mínimo.

🔩 Metalurgia
Cada nível aumenta ataque e defesa das tropas em 5%, conforme o cadastro atual do módulo Pesquisas.

💊 Medicina
Cada nível aumenta a Vida das tropas em 5%.

🎯 Calibração de Armas
Aumenta o alcance das tropas de longo alcance. Por isso aparece principalmente nas receitas de Arqueiros.

🐉 Dragoria
Nas receitas de SSD, siga o nível indicado para a pesquisa de dragões. Não substitua esse requisito por outra pesquisa só porque o número é parecido.

Exemplo: se a receita pede Metalurgia 7, Medicina 7 e Dragoria 8 e você possui 7 / 6 / 8, a marcha ainda NÃO atende ao método confirmado porque Medicina está abaixo do mínimo.

---

🧠 Qual método escolher?

Use esta ordem simples:

- Tem Medusa, Esmagador Colossal, Sapo Tóxico, Centauro Infernal, Fada da Selva ou Caçador de Almas? → 500 unidades + pesquisas 4/4/4 é o caminho mais simples.
- Não tem? Veja se consegue montar a receita de Lava Jaws do nível.
- Não tem Lava Jaws? Confira a tabela de Arqueiros e use os transportes corretos.
- Está no começo e já desbloqueou SSD? Use a receita exata do nível e confira todas as pesquisas antes de enviar.
- Nenhuma receita cabe na sua conta? Ataque um nível mais baixo.

A melhor marcha não é a que tem mais poder; é a que atende aos requisitos sem desperdiçar tropas.

---

❌ Erros que mais causam perdas

- Atacar um nível diferente do que você consultou.
- Ignorar uma pesquisa porque “falta só um nível”.
- Misturar Carregadores e Transportes Blindados quando a receita manda escolher um deles.
- Misturar Arqueiros com SSD/BD na mesma marcha.
- Copiar a quantidade da tropa principal e esquecer o apoio.
- Usar SSD no Nv.9 achando que a receita é garantida sem perdas.
- Aumentar ou trocar a composição no improviso sem saber o efeito.

Se estiver em dúvida, volte ao Mapa & Campanha e compare sua marcha linha por linha com o método cadastrado.

---

✅ Checklist de 20 segundos

Antes de enviar:

- Nível do Antropos correto? ✓
- Quantidade da tropa principal correta? ✓
- Apoio correto? ✓
- Pesquisas iguais ou acima do mínimo? ✓
- Nenhuma tropa incompatível misturada? ✓
- O método está marcado como “Sem perdas”? ✓

Se todas as respostas forem sim, envie a marcha. Se alguma for não, ajuste primeiro.

Depois do ataque, confira o relatório. Ele é a melhor confirmação de que sua configuração continua funcionando na sua conta e no Realm atual.`;

const ANTROPOS_ATTACK_TUTORIAL_EN = `«⚠️ This tutorial uses the confirmed marches already stored in Map & Campaign for Anthropus Lv.1–10.
If your research is below the listed level, do not treat the march as safe. This mobile guide does not include Anthropus Lv.11.»

🧭 Before tapping Attack

If you have never attacked Anthropus, ask four simple questions:

- What is the exact Anthropus level?
- Which zero-loss method can you already build?
- Do your research levels meet the recipe minimums?
- Are you mixing troops that should not be used together?

Open Map & Campaign → Anthropus → choose the level. The page already shows enemies, resources, possible items, and confirmed marches.

Beginner rule: if you cannot meet the full recipe, attack a lower level. Farming a lower Anthropus without losses is better than improvising and losing hours of training.

---

🕵️ Fedor and scouting: why it matters

In the traditional method, the Fedor amount is used as the scouting reference.

Scout first with the same number of Spies as Fedor, or more. Then send the main march with 1 Spy + your offensive troop.

That 1 Spy is the expected march loss; the goal is to preserve the main troops when the setup is correct.

Fedor amount stored for each level:

${fedorRows('en-US')}

Example: Anthropus Lv.6 has 10,000 Fedor → scout with 10,000 Spies or more → then send 1 Spy + your chosen offensive march.

If you use one of the 500-unit special troop methods below, prior scouting is not required.

---

✨ Easiest route: 500 special troops

If you have already unlocked one of these troops, this is the easiest farming method to understand:

- 500 Snake-headed Maidens
- 500 Colossal Smashers
- 500 Toxic Toads
- 500 Infernal Centaurs
- 500 Forest Fairies
- 500 Soul Hunters

For the setup stored in GUIA, keep at least:

- Metallurgy Lv.4
- Medicine Lv.4
- Weapons Calibration Lv.4

With those requirements met, this method is marked as zero loss and does not require prior scouting.

If you do not own these troops yet, use one of the methods below.

---

🏹 Longbowmen (LBM) method

Longbowmen are one of the more accessible methods because they work with transport support and specific research levels.

When two support options are shown, use Porters OR Armored Transports — never both. If using Armored Transports, the guide allows up to 10% extra as an additional safety margin.

Do not mix ranged Longbowmen with fast melee troops such as SSD/BD in the same march. That combination may cause losses among the speed troops.

Confirmed marches:

${attackGuideRows('arqueiros-lbm', 'en-US')}

How to read a line: “Lv.3 → 600 Longbowmen + 1,815 Porters OR 72 Armored Transports | Metallurgy 4 · Medicine 4 · Weapons Calibration 5” means you choose only one transport option and must meet at least those research levels.

---

🔥 Lava Jaws (LJ) method

Lava Jaws need far fewer main troops but use Armored Transports as support.

Stored marches:

${attackGuideRows('lava-jaws-lj8', 'en-US')}

The confirmed reference says relevant research should be at high levels, 9 or 10, but this table does not specify the exact research mix for each march. GUIA does not invent that detail: treat Lava Jaws as an advanced-account method and check your combat research before sending.

---

🐲 Swift Strike Dragons (SSD) method

Swift Strike Dragons are a useful bridge between early Realm development and advanced marches. Quantity alone is not enough: Metallurgy, Medicine, and the dragon research listed in the recipe are part of the method.

Stored marches:

${attackGuideRows('dragoes-ataque-rapido-ssd', 'en-US')}

Pay special attention to Lv.9: both stored setups are marked as POSSIBLE LOSSES. Do not treat SSD against Anthropus Lv.9 as a guaranteed zero-loss march.

At Lv.10, the stored method uses 200,000 SSD + Mephitic Serpent and requires Metallurgy 10, Medicine 10, and Dragonry 9.

Never mix SSD with Longbowmen or other ranged troops in the same march. The project's own strategy set warns that this combination may cause speed-troop losses.

---

🔬 What the research does

Research is not decoration in a recipe. If a method lists a level, treat it as a minimum.

🔩 Metallurgy
Each level increases troop attack and defense by 5%, according to the current Research module data.

💊 Medicine
Each level increases troop Life by 5%.

🎯 Weapons Calibration
Increases the range of ranged troops. That is why it appears mainly in Longbowmen recipes.

🐉 Dragonry
For SSD recipes, follow the listed dragon-research level. Do not replace that requirement with another research just because the number looks similar.

Example: if the recipe requires Metallurgy 7, Medicine 7, and Dragonry 8 and you have 7 / 6 / 8, the confirmed method is NOT met because Medicine is below the minimum.

---

🧠 Which method should I choose?

Use this simple order:

- Have Snake-headed Maiden, Colossal Smasher, Toxic Toad, Infernal Centaur, Forest Fairy, or Soul Hunter? → 500 units + 4/4/4 research is the easiest route.
- No? Check whether you can build the Lava Jaws recipe for the level.
- No Lava Jaws? Check the Longbowmen table and use the correct transport.
- Still early and already unlocked SSD? Use the exact recipe for the level and verify every research requirement.
- None of the recipes fit your account? Attack a lower level.

The best march is not the one with the most power; it is the one that meets the requirements without wasting troops.

---

❌ Mistakes that most often cause losses

- Attacking a different level from the one you checked.
- Ignoring a research requirement because it is “only one level short”.
- Mixing Porters and Armored Transports when the recipe says to choose one.
- Mixing Longbowmen with SSD/BD in the same march.
- Copying the main troop amount and forgetting support troops.
- Using SSD at Lv.9 as if it were guaranteed zero loss.
- Changing the composition without understanding the effect.

When in doubt, return to Map & Campaign and compare your march line by line with the stored method.

---

✅ 20-second checklist

Before sending:

- Correct Anthropus level? ✓
- Correct main troop amount? ✓
- Correct support? ✓
- Research at or above the minimum? ✓
- No incompatible troops mixed together? ✓
- Is the method marked “Zero loss”? ✓

If every answer is yes, send the march. If any answer is no, fix it first.

After the attack, check the battle report. It is the best confirmation that the setup still works for your account and current Realm.`;

export const DICAS_SEED = [
  {
    slug: 'guia-inicial-construcoes',
    titulo: '🐉 Guia para Início de Realm',
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
- Dia {{agua_dia}} → o Dragão da Água libera 4 espaços adicionais; uma boa opção é usá-los para completar 5 Casas no total.
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

Quando o Dragão da Água for liberado no dia {{agua_dia}}, os 4 espaços adicionais podem ser usados para construir mais 4 Casas.

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

Campos de níveis mais altos são importantes para fragmentos, itens e evolução. O catálogo atual do GUIA confirma, por exemplo, fragmentos do Dragão Beladona em Campos de Floresta do Nv.{{beladona_min}} ao Nv.{{beladona_max}}.

Confira sempre a ficha de cada dragão: nem todos possuem a mesma forma de obtenção.

Ataque Campos diariamente sempre que puder. Eles podem fornecer Carnes para evolução de dragões e outros itens úteis durante o crescimento.

Também não ignore os Antropos. O módulo Mapa & Campanha já possui os níveis 1–10 com:

- composição inimiga
- recursos obtidos
- itens/recompensas possíveis
- marchas confirmadas sem perdas

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
        titulo: '🐉 Beginner Realm Guide',
        resumo: 'A practical roadmap for the first days: city layout, population, troops, dragons, Fields, Anthropus, defense, and steady growth.',
        conteudo: `«⚠️ This guide is a starting recommendation, not an Alliance rule.
Adapt your city and upgrade order to your playstyle, available time, and account goals.»

🧭 Quick route for the first days

- Day 1 → start with 1 House and decide whether to prioritize Garrisons, Healing Fountains, or a balance between both.
- Day {{agua_dia}} → the Water Dragon unlocks 4 additional spaces; using them to reach 5 Houses total is a strong option.
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

When the Water Dragon unlocks on day {{agua_dia}}, its 4 additional spaces can be used for 4 more Houses.

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

Higher-level Fields are important for fragments, items, and progression. The current GUIA catalog confirms, for example, Belladonna Dragon fragments in Forest Fields from Lv.{{beladona_min}} to Lv.{{beladona_max}}.

Always check each dragon's page: not every dragon has the same acquisition method.

Attack Fields daily whenever possible. They can provide Meat for dragon progression and other useful items while the account grows.

Do not ignore Anthropus either. The Map & Campaign module already contains levels 1–10 with:

- enemy composition
- obtained resources
- possible items/rewards
- confirmed zero-loss marches

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
    resumo: 'Tutorial para iniciantes com decisão passo a passo, espionagem contra Fedor, 500 tropas especiais, Arqueiros, Lava Jaws, SSD e as pesquisas mínimas de cada método.',
    categoria: 'iniciante',
    tipo: 'tutorial',
    leituraMin: 14,
    destaque: true,
    ativo: true,
    ordem: 1,
    relacionados: {
      modulos: ['campanha', 'tropas', 'pesquisas', 'itens'],
      edificios: [],
      tropas: ['Espiões', 'Arqueiros', 'Carregadores', 'Transportes Blindados', 'Dragões de Ataque Rápido', 'Medusa', 'Esmagadores Colossais', 'Sapo Tóxico', 'Centauros Infernais', 'Fada da Selva', 'Caçador de Almas'],
      dragoes: [],
      pesquisas: ['Metalurgia', 'Medicina', 'Calibração de Armas', 'Dragoria'],
      reinos: [],
    },
    conteudo: ANTROPOS_ATTACK_TUTORIAL_PT,
    i18n: {
      'en-US': {
        titulo: '⚔️ How to Attack Anthropus Without Losses',
        resumo: 'A beginner-friendly step-by-step tutorial covering Fedor scouting, 500-unit special troops, Longbowmen, Lava Jaws, SSD, and the minimum research for each method.',
        conteudo: ANTROPOS_ATTACK_TUTORIAL_EN,
      },
    },
  },
];
