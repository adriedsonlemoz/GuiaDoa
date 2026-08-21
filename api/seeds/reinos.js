// Catálogo canônico confirmado dos reinos de Dragons of Atlantis.
// Regras:
// - IDs são os números reais do jogo, nunca IDs artificiais locais.
// - Datas só são preenchidas quando fornecidas/confirmadas pelo usuário.
// - "tipoEspecial" identifica apenas modalidades estáveis do reino; a Marca de Poder
//   (Ápice/Excelência/Avançado/Crescente) é dinâmica e não é persistida aqui.
export const REINOS_SEED = [
  { id:348, nome:'Zulanka',    fuso:'UTC-4', aberturaEm:'2026-08-12T00:00:00.000Z' },
  { id:347, nome:'Eisenhold',  fuso:'UTC+1', aberturaEm:'2026-08-12T00:00:00.000Z' },
  { id:346, nome:'Kenorax',    fuso:'UTC-7', aberturaEm:'2026-08-12T00:00:00.000Z' },
  { id:345, nome:'Corvith',    fuso:'UTC+0', aberturaEm:'2026-08-12T00:00:00.000Z' },

  { id:344, nome:'Sierra',     fuso:'UTC-7', aberturaEm:'2025-08-12T00:00:00.000Z' },
  { id:343, nome:'Redfern',    fuso:'UTC-7', aberturaEm:'2025-08-12T00:00:00.000Z' },
  { id:342, nome:'Caelorn',    fuso:'UTC+1', aberturaEm:'2025-08-12T00:00:00.000Z' },
  { id:341, nome:'Eldria',     fuso:'UTC+1', aberturaEm:'2025-08-12T00:00:00.000Z' },

  { id:340, nome:'Solace',     fuso:'UTC-7', aberturaEm:'2024-08-12T00:00:00.000Z' },
  { id:339, nome:'Dakota',     fuso:'UTC+0', aberturaEm:'2024-08-12T00:00:00.000Z' },
  { id:338, nome:'Lysor',      fuso:'UTC+1', aberturaEm:'2024-08-12T00:00:00.000Z' },
  { id:337, nome:'Virelia',    fuso:'UTC+1', aberturaEm:'2024-08-12T00:00:00.000Z' },

  { id:336, nome:'Nocturne',   fuso:'UTC+3' },
  { id:335, nome:'Thalric',    fuso:'UTC+1' },
  { id:334, nome:'Rainchant',  fuso:'UTC-4' },
  { id:333, nome:'Solgracia',  fuso:'UTC+1' },
  { id:332, nome:'Quetzara',   fuso:'UTC-7' },
  { id:331, nome:'Mjolnheim',  fuso:'UTC+0' },
  { id:330, nome:'Raya',       fuso:'UTC+3' },
  { id:329, nome:'Eoswood',    fuso:'UTC+1' },
  { id:328, nome:'Saguenay',   fuso:'UTC-7' },
  { id:327, nome:'Norsenholm', fuso:'UTC+0' },
  { id:326, nome:'Hinode',     fuso:'UTC+9' },
  { id:325, nome:'Gibia',      fuso:'UTC+0', tipoEspecial:'hardcore' },
  { id:324, nome:'Luz',        fuso:'UTC+1' },
  { id:323, nome:'Mamre',      fuso:'UTC-7' },
  { id:322, nome:'Saba',       fuso:'UTC+0' },
  { id:321, nome:'Mist',       fuso:'UTC+0' },
  { id:320, nome:'Pontus',     fuso:'UTC-7' },
  { id:313, nome:'Ortson',     fuso:'UTC-3' },
  { id:291, nome:'Sicyon',     fuso:'UTC+0', tipoEspecial:'idade_dragao' },
  { id:287, nome:'Naxos',      fuso:'UTC-7', tipoEspecial:'idade_dragao' },
  { id:286, nome:'Megara',     fuso:'UTC+1', tipoEspecial:'idade_dragao' },
];

export const REINO_IDS_CANONICOS = new Set(REINOS_SEED.map(reino => reino.id));


// Horários confirmados pelo usuário em 21/08/2026. São exibidos no relógio oficial UTC do jogo.
// Campos não fornecidos permanecem vazios; nenhum horário é inferido para outros fusos.
const HORARIOS_CONFIRMADOS_272 = {
  'UTC+0': { zyrvorthian:'19:00' },
  'UTC-3': { zyrvorthian:'22:00', batalhaDragao:'17:00' },
  'UTC-7': { batalhaDragao:'20:00' },
  'UTC+1': { batalhaDragao:'06:00' },
  'UTC-4': { batalhaDragao:'00:00' },
};
for (const reino of REINOS_SEED) {
  reino.horarios = { torneiosFim:'', zyrvorthian:'', batalhaDragao:'', ...(HORARIOS_CONFIRMADOS_272[reino.fuso] || {}) };
}
