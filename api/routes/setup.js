/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║  GUIA DOA — Setup Web Routes                                ║
 * ║  Montado em /api/setup                                      ║
 * ╚══════════════════════════════════════════════════════════════╝
 */
import { Router } from 'express';
import bcrypt      from 'bcryptjs';
import mongoose    from 'mongoose';
import User        from '../models/User.js';
import Tropa       from '../models/Tropa.js';
import Nivel       from '../models/Nivel.js';

const router = Router();

// ── Dados embutidos (espelho do setup.js original) ───────────────────────────

const TROPAS_ESPECIAIS = [
  {nome:"Condenadores",vida:20000,def:850,atqPerto:3000,atqDist:0,alcance:0,vel:450,car:600,poder:40,tipo:"especial",desc:"+20% de Ataque e -20% de Dano recebido na Dominação do Dragão."},
  {nome:"Cavaleiros Espectrais",vida:15000,def:650,atqPerto:4000,atqDist:0,alcance:0,vel:1200,car:300,poder:40,tipo:"especial",desc:"Golpe paralisante. +20% de Ataque e -20% de Dano recebido na Dominação."},
  {nome:"Guerreiro do Magma",vida:32000,def:500,atqPerto:5000,atqDist:0,alcance:0,vel:300,car:600,poder:40,tipo:"especial",desc:"Causam dano extra de acordo com o nível do dragão ao marcharem."},
  {nome:"Megalibgwilia",vida:30000,def:2850,atqPerto:2000,atqDist:0,alcance:0,vel:400,car:800,poder:40,tipo:"especial",desc:"Ao defender, vão à frente para atrair o fogo inimigo."},
  {nome:"Medusa",vida:8500,def:600,atqPerto:480,atqDist:4000,alcance:2800,vel:435,car:300,poder:40,tipo:"especial",desc:"Causa +50% de dano aos inimigos mais rápidos."},
  {nome:"Gatuno Alado",vida:18500,def:900,atqPerto:3650,atqDist:1500,alcance:1000,vel:750,car:400,poder:40,tipo:"especial",desc:"Ganha +100% de velocidade e +50% de PV ao defender."},
  {nome:"Sapo Tóxico",vida:6500,def:450,atqPerto:300,atqDist:4800,alcance:3000,vel:500,car:265,poder:40,tipo:"especial",desc:"+20% de ataque em combates contra o Zyrvorthian."},
  {nome:"Lorde do Inverno",vida:18000,def:5000,atqPerto:3300,atqDist:0,alcance:0,vel:800,car:1000,poder:50,tipo:"especial",desc:"-75% de dano recebido de ataques à distância e +50% de Confronto Elemental."},
  {nome:"Entidade Espectral",vida:8000,def:500,atqPerto:2500,atqDist:3500,alcance:2000,vel:1000,car:500,poder:40,tipo:"especial",desc:"Aumentam o ataque à distância e o Bombardeio Elemental."},
  {nome:"Caçador de Almas",vida:5000,def:500,atqPerto:100,atqDist:4500,alcance:3500,vel:750,car:300,poder:40,tipo:"especial",desc:"Aumentam o ataque distante e defesa. Condicionado ao Dragão Paradisiaco."},
  {nome:"Guerreiro Sagrado",vida:8000,def:600,atqPerto:4300,atqDist:100,alcance:800,vel:650,car:300,poder:40,tipo:"especial",desc:"Aumentam o ataque de perto e defesa. Condicionado ao Dragão Dourado."},
  {nome:"Caçadores de Dragão Bárbaro",vida:5600,def:400,atqPerto:4554,atqDist:0,alcance:0,vel:1200,car:500,poder:40,tipo:"especial",desc:"Dragões são seus alvos principais. Ignora defesa do dragão."},
  {nome:"Mago Lagarto",vida:3500,def:600,atqPerto:100,atqDist:4830,alcance:1400,vel:400,car:100,poder:40,tipo:"especial",desc:"35% de chance de causar dano dobrado em batalha."},
  {nome:"Quimera",vida:14180,def:3720,atqPerto:5230,atqDist:0,alcance:0,vel:1000,car:1000,poder:40,tipo:"especial",desc:"Ressoa com o Dragão Tirano, aumentará o ataque corpo a corpo e vida."},
  {nome:"Fada da Selva",vida:5000,def:360,atqPerto:155,atqDist:5050,alcance:3000,vel:1200,car:400,poder:40,tipo:"especial",desc:"Em ressonância com o Dragão Fada, aumentará o ataque à distância e a vida."},
  {nome:"Centauros Infernais",vida:10000,def:500,atqPerto:500,atqDist:5000,alcance:2000,vel:600,car:200,poder:40,tipo:"especial",desc:"+20% de ataque e -20% de dano na Dominação do Dragão."},
  {nome:"Golem do Trovão",vida:15000,def:1000,atqPerto:1500,atqDist:0,alcance:0,vel:500,car:1000,poder:25,tipo:"especial",desc:"Possuem 2x seus atributos quando estão defendendo."},
  {nome:"Escaravelho de Guerra",vida:15000,def:450,atqPerto:2200,atqDist:0,alcance:0,vel:500,car:650,poder:50,tipo:"especial",desc:"Espinhos devolvem 50% da vida em dano recebido."},
  {nome:"Esmagadores Colossais",vida:4500,def:500,atqPerto:10,atqDist:4750,alcance:3500,vel:800,car:300,poder:40,tipo:"especial",desc:"+200% de dano a unidades com vida maior do que a sua."},
  {nome:"Fantasma do Trovão",vida:8000,def:500,atqPerto:5000,atqDist:0,alcance:0,vel:1800,car:500,poder:50,tipo:"especial",desc:"Aliado ao Dragão do Trovão, aumentará o ataque, defesa, vida e velocidade."},
  {nome:"Lordes da Lava",vida:20000,def:2000,atqPerto:3500,atqDist:0,alcance:0,vel:800,car:1000,poder:50,tipo:"especial",desc:"-75% de dano recebido de ataques à distância."},
  {nome:"Assassino Real",vida:6000,def:250,atqPerto:5750,atqDist:0,alcance:0,vel:1500,car:500,poder:40,tipo:"especial",desc:"+50% de dano de perto e +50% de Bombardeio Elemental se for mais rápido."},
  {nome:"Gigantes do Gelo",vida:10000,def:2000,atqPerto:2000,atqDist:0,alcance:0,vel:200,car:1000,poder:40,tipo:"especial",desc:"-90% da dano de fogo. Inclui Espelhos de Fogo, Bigas de Fogo e Magmassauros."},
  {nome:"Arruinador Dimensional",vida:6999,def:999,atqPerto:5999,atqDist:0,alcance:0,vel:999,car:999,poder:40,tipo:"especial",desc:"-75% de dano de Espelhos de Fogo e Magmassauros se atacados."},
  {nome:"Perseguidor das Sombras",vida:4300,def:450,atqPerto:4750,atqDist:0,alcance:0,vel:2100,car:500,poder:50,tipo:"especial",desc:"Mestre da velocidade. Seu primeiro ataque dá o DOBRO DE DANO."},
];

const TROPAS_TREINAVEIS = [
  {nome:"Milicianos",vida:75,def:10,atqPerto:10,atqDist:0,alcance:0,vel:200,car:20,poder:1,tipo:"treinavel",desc:"Cidadãos semitreinados são baratos e abundantes."},
  {nome:"Carregadores",vida:45,def:10,atqPerto:1,atqDist:0,alcance:0,vel:100,car:200,poder:1,tipo:"treinavel",desc:"A unidade de transporte mais barata, levam recursos entre cidades."},
  {nome:"Espiões",vida:10,def:5,atqPerto:5,atqDist:0,alcance:0,vel:3000,car:0,poder:2,tipo:"treinavel",desc:"Usam habilidades psíquicas para obter informações sobre inimigos."},
  {nome:"Alabardeiros",vida:150,def:40,atqPerto:40,atqDist:0,alcance:0,vel:300,car:40,poder:2,tipo:"treinavel",desc:"Agressores furtivos e rápidos, usando suas alabardas com graça."},
  {nome:"Minotauros",vida:244,def:49,atqPerto:76,atqDist:0,alcance:0,vel:279,car:30,poder:3,tipo:"treinavel",desc:"Criados pelos Antigos como infantarias pesadas. Inteligente mas selvagem."},
  {nome:"Arqueiros",vida:75,def:30,atqPerto:5,atqDist:80,alcance:1200,vel:250,car:25,poder:4,tipo:"treinavel",desc:"Treinados desde muito novos, são tropas de longo alcance eficazes."},
  {nome:"Dragões de Ataque Rápido",vida:300,def:60,atqPerto:150,atqDist:0,alcance:0,vel:1000,car:100,poder:5,tipo:"treinavel",desc:"Ligeiros e ágeis. Baforada de curto alcance, mas mortal se bem treinado."},
  {nome:"Dragões de Combate",vida:1500,def:300,atqPerto:300,atqDist:0,alcance:0,vel:750,car:80,poder:7,tipo:"treinavel",desc:"Com armaduras, menores que os Grandes Dragões. Voo ágil e poder devastador."},
  {nome:"Transportes Blindados",vida:750,def:200,atqPerto:5,atqDist:0,alcance:0,vel:150,car:5000,poder:7,tipo:"treinavel",desc:"Carregam pesadas cargas, deslocando recursos entre cidades."},
  {nome:"Gigantes",vida:4000,def:400,atqPerto:1000,atqDist:0,alcance:0,vel:120,car:45,poder:9,tipo:"treinavel",desc:"Podem destruir cidades e exércitos com muita facilidade."},
  {nome:"Abissal",vida:3000,def:300,atqPerto:1600,atqDist:800,alcance:600,vel:500,car:45,poder:10,tipo:"treinavel",desc:"Os ferozes Abissais são terrores venenosos das profundezas de Atlântida."},
  {nome:"Terror do Pântano",vida:5000,def:500,atqPerto:2000,atqDist:0,alcance:0,vel:150,car:60,poder:10,tipo:"treinavel",desc:"Plantas gigantes e mortíferas, atacam com membros afiados e mordidas venenosas."},
  {nome:"Ogros de Granito",vida:15000,def:900,atqPerto:650,atqDist:0,alcance:0,vel:350,car:30,poder:9,tipo:"treinavel",desc:"Seres de rocha sólida cujos corpos resistem a quase todos os ataques."},
  {nome:"Bigas de Fogo",vida:3000,def:150,atqPerto:1200,atqDist:1600,alcance:900,vel:600,car:100,poder:10,tipo:"treinavel",desc:"Combatentes letais que suportam as batalhas mais ferventes."},
  {nome:"Serpente Vingativa",vida:250,def:400,atqPerto:3100,atqDist:0,alcance:0,vel:900,car:0,poder:10,tipo:"treinavel",desc:"Agressora aérea com um ataque inicial devastador."},
  {nome:"Canhões Elétricos",vida:1100,def:250,atqPerto:100,atqDist:900,alcance:1600,vel:50,car:100,poder:10,tipo:"treinavel",desc:"Canhão de longo alcance que cria arcos de eletricidade. +100% em modo defesa."},
  {nome:"Dragonetes da Tempestade",vida:3100,def:300,atqPerto:1350,atqDist:0,alcance:0,vel:675,car:500,poder:10,tipo:"treinavel",desc:"+50% de dano contra as unidades de Longo Alcance."},
  {nome:"Magmassauros",vida:1000,def:150,atqPerto:500,atqDist:2000,alcance:1600,vel:400,car:10,poder:9,tipo:"treinavel",desc:"Das profundezas vulcânicas, podem disparar lava, derretendo tudo em seu caminho."},
  {nome:"Titã Petrificado",vida:7500,def:1500,atqPerto:5000,atqDist:0,alcance:0,vel:50,car:0,poder:20,tipo:"treinavel",desc:"+75% de dano contra Magmassauros, Arqueiros e Espelhos de Fogo."},
  {nome:"Espelhos de Fogo",vida:1500,def:30,atqPerto:20,atqDist:1200,alcance:1500,vel:50,car:75,poder:10,tipo:"treinavel",desc:"Cria um raio de altíssimo calor que espalha o pânico e a destruição."},
  {nome:"Cavaleiro Dragão",vida:6000,def:800,atqPerto:2900,atqDist:0,alcance:0,vel:1100,car:500,poder:25,tipo:"treinavel",desc:"Rápido e forte, o senhor dos céus. +75% de dano a unidades de longo alcance."},
  {nome:"Leviatã Ártico",vida:1000,def:999,atqPerto:750,atqDist:2200,alcance:1700,vel:450,car:100,poder:20,tipo:"treinavel",desc:"A tropa de longo alcance mais poderosa."},
  {nome:"Dragão do Veneno",vida:5400,def:850,atqPerto:2000,atqDist:1800,alcance:700,vel:600,car:50,poder:20,tipo:"treinavel",desc:"+200% de dano ao atacar Ogros de Granito."},
  {nome:"Andarilhos da Areia",vida:1500,def:300,atqPerto:800,atqDist:600,alcance:1200,vel:1000,car:200,poder:8,tipo:"treinavel",desc:"Recuperam-se no Hospital na metade do tempo."},
  {nome:"Hoplita",vida:1513,def:900,atqPerto:800,atqDist:600,alcance:600,vel:460,car:50,poder:5,tipo:"treinavel",desc:"Cada 2000 Hoplitas podem reduzir o dano em 1%, até o máximo."},
  {nome:"Serpentes Arsênicas",vida:2000,def:400,atqPerto:10,atqDist:1000,alcance:1600,vel:100,car:100,poder:10,tipo:"treinavel",desc:"Atacam e envenenam qualquer inimigo no campo de batalha."},
  {nome:"Amarande",vida:3000,def:350,atqPerto:3000,atqDist:0,alcance:0,vel:751,car:500,poder:10,tipo:"treinavel",desc:"+50% de ataque corpo a corpo das 22h00 às 6h00 UTC."},
  {nome:"Hoplitas Imortais",vida:3000,def:1200,atqPerto:1200,atqDist:800,alcance:800,vel:400,car:100,poder:10,tipo:"treinavel",desc:"Versão aprimorada dos Hoplitas, com armadura reforçada."},
];

const TODAS_TROPAS = [...TROPAS_ESPECIAIS, ...TROPAS_TREINAVEIS];

const NIVEIS_DATA = [
  [1,62],[2,76],[3,null],[4,196],[5,356],[6,676],[7,1316],[8,2596],
  [9,null],[10,10276],[11,16676],[12,24676],[13,34676],[14,47176],
  [15,62801],[16,82332],[17,106690],[18,137208],[19,175355],[20,223039],
  [21,null],[22,357149],[23,null],[24,566697],[25,712216],[26,894115],
  [27,1121488],[28,1405705],[29,1760977],[30,2205066],[31,2760178],
  [32,3454067],[33,null],[34,null],[35,6760884],[36,8454949],[37,10572332],
  [38,16528232],[39,null],[40,null],[41,null],[42,null],[43,null],
  [44,50471718],[45,null],[46,null],[47,null],[48,null],[49,159059016],
  [50,null],[51,null],[52,null],[53,null],[54,null],[55,null],[56,null],
  [57,null],[58,null],[59,null],[60,null],
];

// ── Helper SSE ───────────────────────────────────────────────────────────────

function sseSetup(res) {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');
  res.flushHeaders();
}

function sseSend(res, type, data) {
  res.write(`data: ${JSON.stringify({ type, ...data })}\n\n`);
}

// ── GET /api/setup/status ────────────────────────────────────────────────────

router.get('/status', async (req, res) => {
  try {
    const dbState    = mongoose.connection.readyState; // 0=disc,1=conn,2=conn-ing,3=disc-ing
    const stateLabel = ['desconectado', 'conectado', 'conectando', 'desconectando'];
    const dbName     = mongoose.connection.name || 'iguanews';
    const dbHost     = mongoose.connection.host || '—';

    const [totalTropas, totalEspeciais, totalTreinaveis, totalNiveis, totalUsers] =
      await Promise.all([
        Tropa.countDocuments(),
        Tropa.countDocuments({ tipo: 'especial' }),
        Tropa.countDocuments({ tipo: 'treinavel' }),
        Nivel.countDocuments(),
        User.countDocuments(),
      ]);

    res.json({
      db: {
        estado: stateLabel[dbState] ?? 'desconhecido',
        estadoCodigo: dbState,
        nome: dbName,
        host: dbHost,
      },
      colecoes: {
        tropas:      { total: totalTropas, especiais: totalEspeciais, treinaveis: totalTreinaveis,
                       disponiveis: TODAS_TROPAS.length },
        niveis:      { total: totalNiveis, disponiveis: NIVEIS_DATA.length },
        usuarios:    { total: totalUsers },
      },
    });
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

// ── POST /api/setup/usuario ──────────────────────────────────────────────────

router.post('/usuario', async (req, res) => {
  const { usuario, senha, forcar } = req.body;
  if (!usuario || !senha)
    return res.status(400).json({ erro: 'Usuário e senha são obrigatórios.' });
  if (usuario.trim().length < 3)
    return res.status(400).json({ erro: 'Usuário deve ter pelo menos 3 caracteres.' });
  if (senha.length < 6)
    return res.status(400).json({ erro: 'Senha deve ter pelo menos 6 caracteres.' });

  try {
    const existe = await User.findOne({ usuario: usuario.toLowerCase().trim() });
    if (existe && !forcar)
      return res.status(409).json({ erro: 'Usuário já existe. Envie forcar: true para recriar.', existe: true });

    await User.deleteMany({});
    await User.create({
      usuario: usuario.toLowerCase().trim(),
      senhaHash: await bcrypt.hash(senha, 12),
      papel: 'admin',
    });
    res.json({ ok: true, mensagem: `Usuário "${usuario}" criado com sucesso.` });
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

// ── GET /api/setup/importar/tropas  (SSE) ───────────────────────────────────

router.get('/importar/tropas', async (req, res) => {
  const modo = req.query.modo || 'novas'; // 'novas' | 'tudo'
  sseSetup(res);

  try {
    sseSend(res, 'inicio', { total: TODAS_TROPAS.length, modo });

    if (modo === 'tudo') {
      await Tropa.deleteMany({});
      sseSend(res, 'log', { nivel: 'warn', texto: 'Coleção doa_tropas limpa.' });
    }

    let inseridas = 0, atualizadas = 0, puladas = 0;

    for (const t of TODAS_TROPAS) {
      const ex = await Tropa.findOne({ nome: t.nome });

      if (ex && modo === 'novas') {
        puladas++;
        sseSend(res, 'item', { status: 'pulado', nome: t.nome, tipo: t.tipo });
      } else if (ex) {
        await Tropa.updateOne({ nome: t.nome }, { ...t, atualizadoEm: new Date() });
        atualizadas++;
        sseSend(res, 'item', { status: 'atualizado', nome: t.nome, tipo: t.tipo });
      } else {
        await Tropa.create({ ...t, gestao: 0, atualizadoEm: new Date() });
        inseridas++;
        sseSend(res, 'item', { status: 'inserido', nome: t.nome, tipo: t.tipo });
      }
    }

    await Tropa.collection.createIndex({ nome: 1 }, { unique: true }).catch(() => {});
    await Tropa.collection.createIndex({ tipo: 1 }).catch(() => {});
    const totalFinal = await Tropa.countDocuments();

    sseSend(res, 'concluido', { inseridas, atualizadas, puladas, totalFinal });
  } catch (err) {
    sseSend(res, 'erro', { mensagem: err.message });
  } finally {
    res.end();
  }
});

// ── GET /api/setup/importar/niveis  (SSE) ────────────────────────────────────

router.get('/importar/niveis', async (req, res) => {
  const modo = req.query.modo || 'novas';
  sseSetup(res);

  try {
    sseSend(res, 'inicio', { total: NIVEIS_DATA.length, modo });

    if (modo === 'tudo') {
      await Nivel.deleteMany({});
      sseSend(res, 'log', { nivel: 'warn', texto: 'Coleção doa_niveis limpa.' });
    }

    let inseridos = 0, atualizados = 0, pulados = 0;

    for (const [nivel, xp] of NIVEIS_DATA) {
      const ex = await Nivel.findOne({ nivel });

      if (ex && modo === 'novas') {
        pulados++;
        sseSend(res, 'item', { status: 'pulado', nivel, xp });
      } else if (ex) {
        await Nivel.updateOne({ nivel }, { xp: xp ?? null, atualizadoEm: new Date() });
        atualizados++;
        sseSend(res, 'item', { status: 'atualizado', nivel, xp });
      } else {
        await Nivel.create({ nivel, xp: xp ?? null, atualizadoEm: new Date() });
        inseridos++;
        sseSend(res, 'item', { status: 'inserido', nivel, xp });
      }
    }

    await Nivel.collection.createIndex({ nivel: 1 }, { unique: true }).catch(() => {});
    const totalFinal = await Nivel.countDocuments();

    sseSend(res, 'concluido', { inseridos, atualizados, pulados, totalFinal });
  } catch (err) {
    sseSend(res, 'erro', { mensagem: err.message });
  } finally {
    res.end();
  }
});

// ── DELETE /api/setup/limpar/:colecao ────────────────────────────────────────

router.delete('/limpar/:colecao', async (req, res) => {
  const { colecao } = req.params;
  try {
    if (colecao === 'tropas') {
      const { deletedCount } = await Tropa.deleteMany({});
      return res.json({ ok: true, removidos: deletedCount, colecao: 'doa_tropas' });
    }
    if (colecao === 'niveis') {
      const { deletedCount } = await Nivel.deleteMany({});
      return res.json({ ok: true, removidos: deletedCount, colecao: 'doa_niveis' });
    }
    if (colecao === 'usuarios') {
      const { deletedCount } = await User.deleteMany({});
      return res.json({ ok: true, removidos: deletedCount, colecao: 'doa_users' });
    }
    res.status(400).json({ erro: `Coleção desconhecida: ${colecao}` });
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

export default router;
