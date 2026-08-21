import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { eventStatus, phaseEventDay, formatUtcDay, buildEventShareText, occurrenceForRealm } from '../src/components/eventos/eventUtils.js';
import { formatRealmAge, realmAgeParts } from '../src/utils/realmAge.js';

const read = p => fs.readFileSync(p, 'utf8');

test('módulo público de Eventos continua vinculado ao reino selecionado', () => {
  const routes = read('src/app/routes.jsx');
  const home = read('src/components/Home.jsx');
  const eventos = read('src/components/Eventos.jsx');
  assert.match(routes, /case 'eventos'/);
  assert.match(home, /EventHomeHighlight/);
  assert.match(eventos, /occurrenceForRealm/);
  assert.match(eventos, /confirmedRealms/);
  assert.match(eventos, /not_confirmed_rule/);
});

test('Home recalcula o relógio e remove automaticamente evento encerrado', () => {
  const homeEvent = read('src/components/eventos/EventHomeHighlight.jsx');
  assert.match(homeEvent, /setInterval/);
  assert.match(homeEvent, /15000/);
  const occurrence={confirmado:true,inicioServidor:'2026-08-20T00:00:00Z',fimServidor:'2026-08-21T00:00:00Z'};
  assert.equal(eventStatus(occurrence,new Date('2026-08-20T23:59:59Z')),'ativo');
  assert.equal(eventStatus(occurrence,new Date('2026-08-21T00:00:00Z')),'encerrado');
});

test('ausência de ocorrência significa não confirmado e não cria evento global', () => {
  const event={ocorrencias:[{reinoNome:'Zulanka',confirmado:true}]};
  assert.equal(occurrenceForRealm(event,'Corvith'),null);
  assert.equal(eventStatus(null),'nao_confirmado');
});

test('fases calculam Dia X e dia da semana a partir das datas', () => {
  const occurrence={inicioServidor:'2026-08-20T00:00:00Z',fimServidor:'2026-08-27T00:00:00Z'};
  const phase={inicioServidor:'2026-08-21T00:00:00Z',fimServidor:'2026-08-22T00:00:00Z'};
  assert.equal(phaseEventDay(phase,occurrence),2);
  assert.match(formatUtcDay(phase.inicioServidor,'pt-BR'),/sexta-feira/i);
  assert.match(formatUtcDay(phase.inicioServidor,'en-US'),/Friday/i);
});

test('lista pública de fases usa hierarquia legível e status calculado', () => {
  const phases=read('src/components/eventos/EventPhaseList.jsx');
  const css=read('src/index.css');
  assert.match(phases,/event-phase-kicker/);
  assert.match(phases,/events\.event_day/);
  assert.match(phases,/formatUtcDay/);
  assert.match(phases,/phaseStatus/);
  assert.match(css,/event-phase-kicker\{[^}]*\.72rem/);
  assert.match(css,/event-phase-summary-main>strong\{[^}]*\.79rem/);
  assert.doesNotMatch(css,/event-phase-summary-main>strong\{[^}]*\.4[0-9]rem/);
});

test('botão Copiar gera instruções com todos os reinos confirmados, fases e regras', () => {
  const text=buildEventShareText({
    nome:'Evento',servidorFuso:'UTC',horarioReset:'00:00',
    ocorrencias:[{reinoNome:'Corvith',confirmado:true},{reinoNome:'Zulanka',confirmado:true}],
    fases:[{nome:'Fase 1',inicioServidor:'2026-08-21T00:00:00Z',fimServidor:'2026-08-22T00:00:00Z'}],
    regras:[{texto:'Complete a meta.'}],
  },{reinoNome:'Zulanka',inicioServidor:'2026-08-20T00:00:00Z',fimServidor:'2026-08-27T00:00:00Z'});
  assert.match(text,/Corvith, Zulanka/);
  assert.match(text,/Fase 1/);
  assert.match(text,/› Complete a meta\./);
  assert.match(read('src/components/Eventos.jsx'),/events\.copy_instructions/);
});

test('recompensas estruturadas podem abrir conteúdo relacionado do guia', () => {
  const rewards=read('src/components/eventos/EventRewards.jsx');
  assert.match(rewards,/guiadoa_open_troop/);
  assert.match(rewards,/guiadoa_open_item/);
  assert.match(rewards,/dragao_/);
  assert.match(rewards,/pesquisa_/);
  assert.match(rewards,/event-reward-item is-linked/);
});

test('Admin de Eventos virou página de gerenciamento com seções independentes', () => {
  const admin=read('api/admin/js/admin-eventos.js');
  const index=read('api/admin/index.html');
  assert.match(admin,/Informações gerais/);
  assert.match(admin,/Datas e fases/);
  assert.match(admin,/Reinos/);
  assert.match(admin,/Recompensas/);
  assert.match(admin,/Regras/);
  assert.match(admin,/Histórico/);
  assert.match(index,/admin-eventos-datas\.js/);
  assert.match(index,/admin-eventos-reinos\.js/);
  assert.match(index,/admin-eventos-recompensas\.js/);
});

test('Admin permite selecionar individualmente e usar atalho das quatro aberturas confirmadas mais recentes', () => {
  const realms=read('api/admin/js/admin-eventos-reinos.js');
  assert.match(realms,/Selecionar 4 com abertura mais recente/);
  assert.match(realms,/filter\(r=>r\.aberturaEm\)/);
  assert.match(realms,/new Date\(b\.aberturaEm\)-new Date\(a\.aberturaEm\)/);
  assert.match(realms,/slice\(0,4\)/);
  assert.match(realms,/EVENTO_REINOS_SELECTED/);
  assert.match(realms,/Sem ocorrência = não confirmado/);
  assert.match(realms,/salvarSecaoEvento\('reinos'/);
});

test('Admin de recompensas usa etapas, ranking por faixa e múltiplos itens', () => {
  const rewards=read('api/admin/js/admin-eventos-recompensas.js');
  assert.match(rewards,/Individuais/);
  assert.match(rewards,/Ranking/);
  assert.match(rewards,/Revisão/);
  assert.match(rewards,/posicaoInicio/);
  assert.match(rewards,/posicaoFim/);
  assert.match(rewards,/adicionarRewardItem/);
  assert.match(rewards,/English name/);
});

test('exclusão de evento exige revisão do impacto antes da confirmação', () => {
  const admin=read('api/admin/js/admin-eventos.js');
  const route=read('api/routes/eventos.js');
  assert.match(admin,/impacto-exclusao/);
  assert.match(admin,/ocorrência\(s\)/);
  assert.match(admin,/fase\(s\)/);
  assert.match(admin,/grupo\(s\) de recompensa/);
  assert.match(route,/confirmar/);
  assert.match(route,/requerConfirmacao:true/);
});

test('migração Beta 2.71 preserva eventos legados e remapeia IDs artificiais para o catálogo canônico', () => {
  const migration=read('api/services/contentMigrations.js');
  assert.match(migration,/EVENTOS_REINOS_271_KEY/);
  assert.match(migration,/normalizarEventoPayload/);
  assert.match(migration,/preservado sem normalização/);
  assert.match(migration,/oldIdToNewId/);
  assert.match(migration,/REINOS_SEED/);
  assert.match(migration,/somente os 33 reinos informados permanecem no catálogo/);
  assert.match(migration,/reinoNome:realm\.nome/);
});

test('Extras possui consulta pública de Reinos com idade, filtros em cards e histórico', () => {
  const extras=read('src/components/Extras.jsx');
  const realms=read('src/components/Reinos.jsx');
  const routes=read('src/app/routes.jsx');
  const css=read('src/index.css');
  assert.match(extras,/setRoute\('reinos'\)/);
  assert.match(routes,/case 'reinos'/);
  assert.match(realms,/realmAge/);
  assert.match(realms,/eventos\.filter/);
  assert.match(realms,/selected\.fusoes/);
  assert.match(realms,/realms\.tournaments_end/);
  assert.match(realms,/realms\.dragon_battle/);
  assert.match(realms,/realm-filter-chips/);
  assert.match(realms,/realms\.language_utc_7/);
  assert.match(realms,/realms\.power_title/);
  assert.match(css,/realm-filter-chips button/);
  assert.doesNotMatch(realms,/<select/);
});

test('Reinos não reintroduzem idioma/região e formulário Admin é agrupado', () => {
  const model=read('api/models/Reino.js');
  const html=read('api/admin/index.html');
  assert.doesNotMatch(model,/\bregiao\s*:/);
  assert.doesNotMatch(model,/\bidioma\s*:/);
  assert.match(html,/Identificação/);
  assert.match(html,/Tempo/);
  assert.match(html,/Horários do reino/);
  assert.match(html,/Histórico/);
});

test('layout novo possui limites mobile, rolagem interna de modal e sem scroll horizontal planejado', () => {
  const css=read('api/admin/css/admin.css');
  assert.match(css,/@media\s*\(max-width:\s*640px\)/);
  assert.match(css,/admin-event-modal-body[^}]*overflow-y:auto/);
  assert.match(css,/admin-realm-check-list/);
  assert.match(css,/admin-wizard-steps/);
});

test('Sobre e conteúdo secundário permanecem agrupados em Extras', () => {
  const tools = read('src/components/home/homeTools.js');
  const extras = read('src/components/Extras.jsx');
  assert.doesNotMatch(tools, /id: 'sobre'/);
  assert.doesNotMatch(tools, /modal:color_builder/);
  assert.match(tools, /id: 'extras'/);
  assert.match(extras, /setRoute\('sobre'\)/);
});


test('instruções copiadas respeitam i18n e incluem objetivo de fase sem inventar texto', () => {
  const utils=read('src/components/eventos/eventUtils.js');
  const events=read('src/components/Eventos.jsx');
  assert.match(utils,/content\(rule, 'texto'\)/);
  assert.match(utils,/content\(phase, 'objetivo'\)/);
  assert.match(utils,/t\('events\.event_day'/);
  assert.match(events,/content\(r,'texto'\)/);
  assert.match(events,/buildEventShareText\(evento, ocorrencia, \{ content, locale, t \}\)/);
});

test('links de recompensas cobrem tropas, itens, dragões, pesquisas e edifícios específicos', () => {
  const rewards=read('src/components/eventos/EventRewards.jsx');
  const buildings=read('src/components/edificios/NormalBuildingsView.jsx');
  assert.match(rewards,/guiadoa_open_troop/);
  assert.match(rewards,/guiadoa_open_item/);
  assert.match(rewards,/dragao_/);
  assert.match(rewards,/pesquisa_/);
  assert.match(rewards,/guiadoa_open_building/);
  assert.match(rewards,/edificios_gruta/);
  assert.match(rewards,/edificios_basilica/);
  assert.match(buildings,/guiadoa_open_building/);
});


test('Beta 2.72 mantém observação antes da Fase 1 e arquiva eventos encerrados', () => {
  const events=read('src/components/Eventos.jsx');
  const home=read('src/components/eventos/EventHomeHighlight.jsx');
  const seed=read('api/seeds/eventos.js');
  assert.match(seed,/inicio='2026-08-21T00:00:00\.000Z'/);
  assert.match(seed,/phase\('observacao'/);
  assert.match(seed,/phase\('fase-1'.*Acelerações/);
  assert.match(events,/events\.past_events/);
  assert.match(events,/status==='encerrado'/);
  assert.match(events,/events\.observation/);
  assert.match(home,/fase\?\.codigo==='observacao'/);
});

test('idade de reino melhora a leitura após um mês sem inventar data', () => {
  assert.equal(formatRealmAge('2026-06-08T00:00:00Z','pt-BR',new Date('2026-08-21T12:00:00Z')),'2 meses e 13 dias');
  assert.equal(formatRealmAge('2025-04-21T00:00:00Z','pt-BR',new Date('2026-08-21T12:00:00Z')),'1 ano e 4 meses');
  assert.equal(formatRealmAge('2026-08-12T00:00:00Z','pt-BR',new Date('2026-08-21T12:00:00Z')),'9 dias');
  assert.equal(formatRealmAge(null,'pt-BR',new Date('2026-08-21T12:00:00Z')),null);
  assert.deepEqual(realmAgeParts('2026-06-08T00:00:00Z',new Date('2026-08-21T12:00:00Z')),{years:0,months:2,days:13,totalDays:74});
});

test('filtros de Reinos são cards com quantidade e hora atual por fuso', () => {
  const realms=read('src/components/Reinos.jsx');
  const css=read('src/index.css');
  assert.match(realms,/timezoneCounts/);
  assert.match(realms,/timezoneCurrentTime/);
  assert.match(realms,/realms\.timezone_realm_count/);
  assert.match(css,/realm-filter-chips\{display:grid/);
  assert.doesNotMatch(realms,/<select/);
});

test('manual do evento e tutoriais possuem ação de copiar e calculadores vinculados', () => {
  const tutorial=read('src/components/eventos/EventTutorial.jsx');
  const phases=read('src/components/eventos/EventPhaseList.jsx');
  const tournaments=read('src/components/Torneios.jsx');
  const tips=read('src/components/dicas/DicaArtigo.jsx');
  assert.match(tutorial,/TutorialCopyButton/);
  assert.match(tutorial,/guiadoa_open_tournament/);
  assert.match(phases,/events\.open_calculator/);
  assert.match(tournaments,/TutorialCopyButton/);
  assert.match(tips,/copiarTutorial/);
});

test('calculadores de Generais e Eliminação não dependem de tabelas inventadas', () => {
  const general=read('src/components/torneios/TorneioGeneral.jsx');
  const kill=read('src/components/torneios/TorneioMatarTropas.jsx');
  assert.match(general,/card_value/);
  assert.doesNotMatch(general,/3000.*raridade|raridade.*3000/i);
  assert.match(kill,/tr\?\.poder/);
  assert.match(kill,/tropas=\[\]/);
});

test('Doação fica separada de Sobre e aviso de primeiro acesso é persistido', () => {
  const extras=read('src/components/Extras.jsx');
  const about=read('src/components/Sobre.jsx');
  const donation=read('src/components/Doacao.jsx');
  const app=read('src/App.jsx');
  const storage=read('src/utils/storage.js');
  assert.match(extras,/setRoute\('doacao'\)/);
  assert.doesNotMatch(about,/openApoio/);
  assert.match(donation,/PIX='adriedson@outlook\.com'/);
  assert.match(app,/getDonationNoticeSeen/);
  assert.match(app,/setDonationNoticeSeen/);
  assert.match(storage,/DONATION_NOTICE_SEEN/);
});

test('APK não usa localhost silenciosamente e cold start não bloqueia a interface', () => {
  const api=read('src/config/api.js');
  const startup=read('src/app/StartupGate.jsx');
  const provider=read('src/data/GameDataContext.jsx');
  const workflow=read('.github/workflows/build-apk.yml');
  assert.match(api,/API_CONFIGURED/);
  assert.match(api,/looksNative/);
  assert.match(startup,/CONNECTION_TIMEOUT_MS = 45000/);
  assert.match(startup,/return children/);
  assert.match(provider,/readGameDataCache/);
  assert.match(provider,/wakeBackend/);
  assert.match(api,/https:\/\/guiadoa-agrq\.onrender\.com/);
  assert.match(workflow,/guiadoa-agrq\.onrender\.com/);
  assert.match(workflow,/https:\/\/\*/);
});

test('Admin permite clonar evento sem reaproveitar datas ou ocorrências', () => {
  const admin=read('api/admin/js/admin-eventos.js');
  const route=read('api/routes/eventos.js');
  assert.match(admin,/clonarEventoAtual/);
  assert.match(route,/admin\/:slug\/clonar/);
  assert.match(route,/inicioServidor:null, fimServidor:null/);
  assert.match(route,/ocorrencias:\[\], historico:\[\]/);
});

test('migração 2.72 remove datas herdadas desconhecidas e preserva horários não substituídos', () => {
  const migration=read('api/services/contentMigrations.js');
  assert.match(migration,/EVENTOS_REINOS_272_KEY/);
  assert.match(migration,/aberturaEm:seed\.aberturaEm \? new Date\(seed\.aberturaEm\) : null/);
  assert.match(migration,/torneiosFim só é alterado quando houver dado confirmado/);
});
