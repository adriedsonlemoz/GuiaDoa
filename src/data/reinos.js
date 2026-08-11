// ==========================================================
// Módulo: Reinos — dados estáticos de fallback
// Campos: id (número único), nome, fuso, regiao, idioma
// ==========================================================

export const dbReinos = [
  { id:  1, nome: 'Caelorn',     fuso: 'UTC+1',  regiao: 'Europa',         idioma: 'Inglês'     },
  { id:  2, nome: 'Dakota',      fuso: 'UTC+0',  regiao: 'América do Norte', idioma: 'Inglês'   },
  { id:  3, nome: 'Eldria',      fuso: 'UTC+1',  regiao: 'Europa',         idioma: 'Inglês'     },
  { id:  4, nome: 'Eoswood',     fuso: 'UTC+1',  regiao: 'Europa',         idioma: 'Inglês'     },
  { id:  5, nome: 'Fabrica',     fuso: 'UTC+1',  regiao: 'Europa',         idioma: 'Inglês'     },
  { id:  6, nome: 'Gibia',       fuso: 'UTC+0',  regiao: 'Europa',         idioma: 'Inglês'     },
  { id:  7, nome: 'Hinode',      fuso: 'UTC+9',  regiao: 'Ásia',           idioma: 'Japonês'    },
  { id:  8, nome: 'Luz',         fuso: 'UTC+1',  regiao: 'Europa',         idioma: 'Português'  },
  { id:  9, nome: 'Lysor',       fuso: 'UTC+1',  regiao: 'Europa',         idioma: 'Inglês'     },
  { id: 10, nome: 'Mamre',       fuso: 'UTC+1',  regiao: 'Médio Oriente',  idioma: 'Árabe'      },
  { id: 11, nome: 'Megara',      fuso: 'UTC+1',  regiao: 'Europa',         idioma: 'Inglês'     },
  { id: 12, nome: 'Mist',        fuso: 'UTC+0',  regiao: 'Europa',         idioma: 'Inglês'     },
  { id: 13, nome: 'Mjolnheim',   fuso: 'UTC+0',  regiao: 'Europa',         idioma: 'Inglês'     },
  { id: 14, nome: 'Naxos',       fuso: 'UTC-5',  regiao: 'América do Norte', idioma: 'Inglês'   },
  { id: 15, nome: 'Nocturne',    fuso: 'UTC+3',  regiao: 'Europa de Leste', idioma: 'Russo'     },
  { id: 16, nome: 'Norsenholm',  fuso: 'UTC+0',  regiao: 'Europa',         idioma: 'Inglês'     },
  { id: 17, nome: 'Ortson',      fuso: 'UTC-3',  regiao: 'América do Sul', idioma: 'Português'  },
  { id: 18, nome: 'Pontus',      fuso: 'UTC+1',  regiao: 'Europa',         idioma: 'Inglês'     },
  { id: 19, nome: 'Quetzara',    fuso: 'UTC-7',  regiao: 'América do Norte', idioma: 'Espanhol' },
  { id: 20, nome: 'Rainchant',   fuso: 'UTC-4',  regiao: 'América do Norte', idioma: 'Inglês'   },
  { id: 21, nome: 'Raya',        fuso: 'UTC+3',  regiao: 'Europa de Leste', idioma: 'Russo'     },
  { id: 22, nome: 'Redfern',     fuso: 'UTC-7',  regiao: 'América do Norte', idioma: 'Inglês'   },
  { id: 23, nome: 'Saba',        fuso: 'UTC+0',  regiao: 'África',         idioma: 'Inglês'     },
  { id: 24, nome: 'Saguenay',    fuso: 'UTC-7',  regiao: 'América do Norte', idioma: 'Francês'  },
  { id: 25, nome: 'Sicyon',      fuso: 'UTC-3',  regiao: 'América do Sul', idioma: 'Português'  },
  { id: 26, nome: 'Sierra',      fuso: 'UTC-7',  regiao: 'América do Norte', idioma: 'Espanhol' },
  { id: 27, nome: 'Solace',      fuso: 'UTC-7',  regiao: 'América do Norte', idioma: 'Inglês'   },
  { id: 28, nome: 'Solgracia',   fuso: 'UTC+1',  regiao: 'Europa',         idioma: 'Espanhol'   },
  { id: 29, nome: 'Thalric',     fuso: 'UTC+1',  regiao: 'Europa',         idioma: 'Alemão'     },
  { id: 30, nome: 'Virelia',     fuso: 'UTC+1',  regiao: 'Europa',         idioma: 'Italiano'   },
].sort((a, b) => a.nome.localeCompare(b.nome));
