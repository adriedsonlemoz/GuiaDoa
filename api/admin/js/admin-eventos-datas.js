// ── EVENTOS: datas e fases ───────────────────────────────────────────────────
var EVENTO_DATAS_DRAFT = null;
var EVENTO_FASES_DRAFT = [];

function eventoEnsurePhaseEn(index){const phase=EVENTO_FASES_DRAFT[index];phase.i18n=phase.i18n||{};phase.i18n['en-US']=phase.i18n['en-US']||{};return phase.i18n['en-US'];}

function eventoUtcInput(value){if(!value)return'';const d=new Date(value);return Number.isNaN(d.getTime())?'':d.toISOString().slice(0,16);}
function eventoPhaseDerivedDates(phase,eventStart){
  let start=eventoUtcInput(phase.inicioServidor),end=eventoUtcInput(phase.fimServidor);
  const base=eventStart?new Date(eventStart):null;
  if(base&&!Number.isNaN(base.getTime())){
    if(!start&&phase.diaInicio)start=new Date(base.getTime()+(Number(phase.diaInicio)-1)*86400000).toISOString().slice(0,16);
    if(!end&&phase.diaFim)end=new Date(base.getTime()+Number(phase.diaFim)*86400000).toISOString().slice(0,16);
  }
  return{start,end};
}
function eventoDayPosition(start,eventStart){if(!start||!eventStart)return null;const a=new Date(`${String(start).replace(/Z$/,'')}Z`).getTime(),b=new Date(eventStart).getTime();if(!Number.isFinite(a)||!Number.isFinite(b))return null;return Math.floor((a-b)/86400000)+1;}
function eventoPhasePreview(phase){
  const start=phase.inicioServidor; if(!start)return'<span>Data ainda não cadastrada</span>';
  const d=new Date(`${start}Z`); if(Number.isNaN(d.getTime()))return'<span>Data inválida</span>';
  const day=eventoDayPosition(start,EVENTO_DATAS_DRAFT.inicioServidor);
  const text=new Intl.DateTimeFormat('pt-BR',{day:'numeric',month:'long',year:'numeric',weekday:'long',timeZone:'UTC'}).format(d);
  const now=Date.now(),st=d.getTime(),en=phase.fimServidor?new Date(`${phase.fimServidor}Z`).getTime():NaN;
  const status=now<st?'Próxima':Number.isFinite(en)&&now>=en?'Encerrada':'Ativa';
  return `<strong>${day&&day>0?`Dia ${day} do evento`:'Dia relativo será calculado'}</strong><span>${esc(text)} · ${esc(start.slice(11,16)||'00:00')} UTC</span><em>${status}</em>`;
}
function abrirDatasFasesEvento(){
  EVENTO_DATAS_DRAFT={inicioServidor:eventoUtcInput(EVENTO_ATUAL.inicioServidor||EVENTO_ATUAL.ocorrencias?.[0]?.inicioServidor),fimServidor:eventoUtcInput(EVENTO_ATUAL.fimServidor||EVENTO_ATUAL.ocorrencias?.[0]?.fimServidor),servidorFuso:EVENTO_ATUAL.servidorFuso||'UTC',horarioReset:EVENTO_ATUAL.horarioReset||'00:00'};
  EVENTO_FASES_DRAFT=(EVENTO_ATUAL.fases||[]).map((f,i)=>{const dates=eventoPhaseDerivedDates(f,EVENTO_ATUAL.inicioServidor||EVENTO_ATUAL.ocorrencias?.[0]?.inicioServidor);return{...eventoClone(f),ordem:f.ordem??i,inicioServidor:dates.start,fimServidor:dates.end};});
  renderDatasFasesEvento();
}
function renderDatasFasesEvento(){
  eventoSecaoModal('🗓️ Datas e fases',`<div class="admin-section-intro">O relógio oficial do evento é UTC. Dia da semana e “Dia X do evento” são calculados automaticamente; não são campos de texto.</div><div class="admin-form-section"><h3>Período oficial</h3><div class="grid2"><div class="field"><label>Início UTC</label><input type="datetime-local" value="${esc(EVENTO_DATAS_DRAFT.inicioServidor||'')}" onchange="EVENTO_DATAS_DRAFT.inicioServidor=this.value;renderDatasFasesEvento()"></div><div class="field"><label>Término UTC</label><input type="datetime-local" value="${esc(EVENTO_DATAS_DRAFT.fimServidor||'')}" onchange="EVENTO_DATAS_DRAFT.fimServidor=this.value"></div></div><div class="grid2"><div class="field"><label>Fuso oficial</label><input value="UTC" disabled></div><div class="field"><label>Reset geral</label><input value="00:00" disabled></div></div></div><div class="admin-form-section"><div class="admin-section-title-row"><h3>Fases</h3><button class="btn btn-gold btn-sm" onclick="adicionarFaseEvento()">＋ Fase</button></div>${EVENTO_FASES_DRAFT.map((f,i)=>`<div class="admin-phase-editor"><div class="admin-phase-editor-head"><div><span>FASE ${i+1}</span><strong>${esc(f.nome||`Fase ${i+1}`)}</strong></div><button class="btn btn-red btn-sm" onclick="removerFaseEvento(${i})">Remover</button></div><div class="grid2"><div class="field"><label>Nome / número</label><input value="${esc(f.nome||'')}" onchange="EVENTO_FASES_DRAFT[${i}].nome=this.value"></div><div class="field"><label>Código</label><input value="${esc(f.codigo||'')}" onchange="EVENTO_FASES_DRAFT[${i}].codigo=this.value"></div></div><div class="grid2"><div class="field"><label>Início UTC</label><input type="datetime-local" value="${esc(f.inicioServidor||'')}" onchange="EVENTO_FASES_DRAFT[${i}].inicioServidor=this.value;renderDatasFasesEvento()"></div><div class="field"><label>Término UTC</label><input type="datetime-local" value="${esc(f.fimServidor||'')}" onchange="EVENTO_FASES_DRAFT[${i}].fimServidor=this.value;renderDatasFasesEvento()"></div></div><div class="admin-phase-preview">${eventoPhasePreview(f)}</div><div class="field"><label>Objetivo</label><input value="${esc(f.objetivo||'')}" onchange="EVENTO_FASES_DRAFT[${i}].objetivo=this.value"></div><div class="field"><label>Descrição</label><textarea rows="2" onchange="EVENTO_FASES_DRAFT[${i}].descricao=this.value">${esc(f.descricao||f.observacao||'')}</textarea></div><details class="admin-inline-i18n"><summary>🌐 English <span>opcional</span></summary><div class="field"><label>Phase name</label><input value="${esc(f.i18n?.['en-US']?.nome||'')}" onchange="eventoEnsurePhaseEn(${i}).nome=this.value"></div><div class="field"><label>Objective</label><input value="${esc(f.i18n?.['en-US']?.objetivo||'')}" onchange="eventoEnsurePhaseEn(${i}).objetivo=this.value"></div><div class="field"><label>Description</label><textarea rows="2" onchange="eventoEnsurePhaseEn(${i}).descricao=this.value">${esc(f.i18n?.['en-US']?.descricao||'')}</textarea></div></details></div>`).join('')||'<div class="admin-empty">Nenhuma fase cadastrada.</div>'}</div>`,`<button class="btn btn-ghost" onclick="fecharModal('modal-evento-secao')">Cancelar</button><button class="btn btn-gold" onclick="salvarDatasFasesEvento()">💾 Salvar datas e fases</button>`);
}
function adicionarFaseEvento(){const i=EVENTO_FASES_DRAFT.length;EVENTO_FASES_DRAFT.push({codigo:`fase-${i+1}`,nome:`Fase ${i+1}`,ordem:i,inicioServidor:'',fimServidor:'',objetivo:'',descricao:'',recompensas:[],i18n:{}});renderDatasFasesEvento();}
function removerFaseEvento(i){if((EVENTO_FASES_DRAFT[i]?.recompensas||[]).length&&!confirm('Esta fase possui recompensas. Remover a fase também remove essas recompensas. Continuar?'))return;EVENTO_FASES_DRAFT.splice(i,1);renderDatasFasesEvento();}
async function salvarDatasFasesEvento(){
  const start=EVENTO_DATAS_DRAFT.inicioServidor,end=EVENTO_DATAS_DRAFT.fimServidor;
  if((start&&!end)||(!start&&end))return toast('Informe início e término do evento juntos.','erro');
  if(start&&end&&new Date(`${end}Z`)<=new Date(`${start}Z`))return toast('O término do evento deve ser posterior ao início.','erro');
  const fases=EVENTO_FASES_DRAFT.map((f,i)=>({...f,ordem:i,diaInicio:eventoDayPosition(f.inicioServidor,start),diaFim:f.fimServidor&&start?Math.max(eventoDayPosition(f.inicioServidor,start)||1,Math.ceil((new Date(`${f.fimServidor}Z`)-new Date(`${start}Z`))/86400000)):f.diaFim||null,observacao:f.observacao||''}));
  await salvarSecaoEvento('datas',{inicioServidor:start||null,fimServidor:end||null,servidorFuso:'UTC',horarioReset:'00:00',fases},'Datas e fases salvas.');
}
