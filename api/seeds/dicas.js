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
];
