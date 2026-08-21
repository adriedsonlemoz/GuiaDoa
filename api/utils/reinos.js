const DAY_MS = 86400000;

export function slugifyReino(texto) {
  return String(texto || '')
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .toLowerCase().trim().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
}

function reinoError(message, campo, codigo = 'REINO_INVALIDO') {
  const err = new Error(message);
  err.status = 400;
  err.codigo = codigo;
  err.detalhes = { campo };
  return err;
}

function optionalDate(value, campo) {
  if (value == null || value === '') return null;
  const raw = String(value).trim();
  const d = new Date(/^\d{4}-\d{2}-\d{2}$/.test(raw) ? `${raw}T00:00:00.000Z` : raw);
  if (Number.isNaN(d.getTime())) throw reinoError(`Data inválida em ${campo}.`, campo, 'DATA_INVALIDA');
  return d;
}

function optionalTime(value, campo) {
  const text = String(value || '').trim();
  if (!text) return '';
  if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(text)) throw reinoError(`Horário inválido em ${campo}. Use HH:MM.`, campo, 'HORARIO_INVALIDO');
  return text;
}

export function normalizarReinoPayload(body = {}) {
  const id = Number(body.id || 0);
  const nome = String(body.nome || '').trim();
  const fuso = String(body.fuso || '').trim();
  const tipoEspecial = String(body.tipoEspecial || '').trim();
  if (!Number.isInteger(id) || id < 1) throw reinoError('Informe um ID numérico válido para o reino.', 'id', 'ID_INVALIDO');
  if (!nome) throw reinoError('Nome do reino é obrigatório.', 'nome', 'NOME_OBRIGATORIO');
  if (fuso && !/^UTC(?:[+-](?:\d{1,2})(?::[0-5]\d)?)?$/.test(fuso)) throw reinoError('Fuso horário inválido. Use o formato UTC, UTC-4 ou UTC+5:30.', 'fuso', 'FUSO_INVALIDO');
  if (tipoEspecial && !['hardcore','idade_dragao'].includes(tipoEspecial)) throw reinoError('Tipo especial de reino inválido.', 'tipoEspecial', 'TIPO_ESPECIAL_INVALIDO');
  return {
    id,
    slug:slugifyReino(body.slug || nome),
    nome,
    status:String(body.status || '').trim(),
    aberturaEm:optionalDate(body.aberturaEm, 'aberturaEm'),
    fuso,
    tipoEspecial,
    horarios:{
      torneiosFim:optionalTime(body.horarios?.torneiosFim ?? body.torneiosFim, 'horarios.torneiosFim'),
      zyrvorthian:optionalTime(body.horarios?.zyrvorthian ?? body.zyrvorthian, 'horarios.zyrvorthian'),
      batalhaDragao:optionalTime(body.horarios?.batalhaDragao ?? body.batalhaDragao, 'horarios.batalhaDragao'),
    },
    historico:{
      status:String(body.historico?.status ?? body.statusHistorico ?? '').trim(),
      observacoes:String(body.historico?.observacoes ?? body.observacoesHistorico ?? '').trim(),
    },
    i18n:body.i18n && typeof body.i18n === 'object' ? body.i18n : {},
    atualizadoEm:new Date(),
  };
}

export function calcularIdadeReino(aberturaEm, agora = new Date()) {
  const open = aberturaEm ? new Date(aberturaEm).getTime() : NaN;
  const now = agora instanceof Date ? agora.getTime() : new Date(agora).getTime();
  if (!Number.isFinite(open) || !Number.isFinite(now) || now < open) return null;
  return Math.floor((now - open) / DAY_MS);
}

export function serializarReino(reino, agora = new Date()) {
  const doc = typeof reino?.toObject === 'function' ? reino.toObject() : reino;
  if (!doc) return doc;
  const { regiao: _regiao, idioma: _idioma, ...limpo } = doc;
  return { ...limpo, idadeDias:calcularIdadeReino(limpo.aberturaEm, agora) };
}
