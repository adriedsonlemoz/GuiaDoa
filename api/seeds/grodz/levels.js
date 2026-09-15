const t = (nome, quantidade, nomeEn = '', catalogoTropa = '') => ({
  nome,
  quantidade,
  i18n: nomeEn ? { 'en-US': { nome:nomeEn } } : {},
  ...(catalogoTropa ? { catalogoTropa } : {}),
});

const d = (ordem, personagem, texto, textoEn) => ({
  ordem,
  personagem,
  texto,
  i18n:{ 'en-US': { texto:textoEn, personagem:personagem === 'Comandante' ? 'Commander' : personagem } },
});

const official = (...troops) => troops;
const commonSource = {
  tipo:'screenshots_e_documentacao', data:'2026-08-21',
  descricao:'Telas e relatórios da Campanha/Grodz, cruzados com documentação da comunidade para composição e mecânica do nível 10.', verificado:true,
};

const zeroLossGuide = (nivel) => ({
  codigo:`grodz-magmassauros-${nivel}`,
  titulo:'Magmassauros / Lava Jaws',
  resumo:'Recomendação principal do GUIA para este nível da Campanha.',
  status:'confirmado', resultado:'sem_perdas', tropaPrincipal:'Magmassauros', quantidade:1000,
  passos:['Selecione o dragão relacionado à armadura que deseja obter antes de atacar.','Envie 1.000 Magmassauros como tropa ofensiva principal.'],
  observacoes:'Configuração prática testada pelo GUIA como suficiente do nível 1 ao 9 sem perdas. Partes de armadura podem se repetir entre os ataques.',
  fonte:{ tipo:'guia', descricao:'Configuração prática testada no GUIA para Campanha/Grodz.' },
  i18n:{ 'en-US':{
    titulo:'Lava Jaws / Lava Jaws',
    resumo:'GUIA primary recommendation for this Campaign level.',
    tropaPrincipal:'Lava Jaws',
    passos:['Select the dragon whose armor you want before attacking.','Send 1,000 Lava Jaws as the main offensive troop.'],
    observacoes:'This practical GUIA setup has been tested as sufficient for levels 1–9 with zero losses. Armor parts may repeat across attacks.',
  } },
});

const level10Guides = [{
  codigo:'grodz-10-magmassauros-ogros',
  titulo:'5.000 Magmassauros + 5.000 Ogros de Granito',
  resumo:'Marcha principal recomendada pelo GUIA para enfrentar Grodz no nível 10. Perdas são esperadas.',
  status:'confirmado', resultado:'possiveis_perdas', tropaPrincipal:'Magmassauros', quantidade:5000,
  apoios:[{ nome:'Ogros de Granito', quantidade:5000, i18n:{ 'en-US':{ nome:'Granite Ogres' } } }],
  passos:['Envie 5.000 Magmassauros junto com 5.000 Ogros de Granito.','Se quiser uma armadura de um dragão específico, selecione esse dragão antes de atacar.','Caso não selecione um dragão, a armadura será aleatória entre os dragões que você possui.'],
  observacoes:'O nível 10 representa o próprio Grodz por uma barra de vida e não possui uma composição de tropas conhecida. Perdas fazem parte deste combate; tropas elegíveis podem ser recuperadas nas Fontes de Recuperação conforme as regras do jogo.',
  fonte:{ tipo:'guia', descricao:'Marcha prática recomendada pelo GUIA; comportamento do nível 10 cruzado com documentação da comunidade.' },
  i18n:{ 'en-US':{
    titulo:'5,000 Lava Jaws + 5,000 Granite Ogres',
    resumo:'GUIA primary recommended march for Grodz at level 10. Losses are expected.',
    tropaPrincipal:'Lava Jaws',
    passos:['Send 5,000 Lava Jaws together with 5,000 Granite Ogres.','If you want armor for a specific dragon, select that dragon before attacking.','If no dragon is selected, the armor reward is random among dragons you own.'],
    observacoes:'Level 10 represents Grodz himself with a health bar and has no known troop composition. Losses are part of this fight; eligible troops can be recovered through Recovery Pools according to game rules.',
  } },
}];

const rewardGreatDragon = {
  codigo:'arca-superior-grande-dragao', simbolo:'🛡️', nome:'Arca Superior do Grande Dragão',
  imagem:'/assets/items/catalog/arca-superior-grande-dragao.webp', quantidade:1, nomeConfirmado:true,
  observacao:'Concede 1 parte aleatória da Armadura do Grande Dragão.', categoria:'armadura-dragao', finalidade:'armadura', relacionadoA:'arca-superior-grande-dragao',
  tags:['grodz','armadura','grande-dragao'],
  i18n:{ 'en-US': { nome:'Superior Great Dragon Chest', observacao:'Grants 1 random Great Dragon Armor part.' } },
};

export const GRODZ_SEED = [
  {
    slug:'grodz-1', categoria:'grodz', nivel:1, ordem:1, nome:'Campo de Grodz — Nv. 1', ativo:true,
    tropas:[t('Carregadores',5,'Porters','carregadores')], guiasAtaque:[zeroLossGuide(1)],
    grodz:{ inimigoNome:'Campo de Grodz (Nv. 1)', inimigoTipo:'tropas', composicaoStatus:'confirmado', recomendacaoJogo:official(t('Milicianos',5,'Conscripts','milicianos')), dialogos:[
      d(1,'Grodz','Esta terra é dos Antropos agora! Você entra, você morre!','This land belongs to the Anthropus now! You enter, you die!'),
      d(2,'Allecto','Ele ousa nos ameaçar? Este selvagem precisa aprender uma lição!','He dares threaten us? This savage needs to be taught a lesson!'),
      d(3,'Comandante','Calma, Allecto. Mas ela está certa. Os Antropos são muitos e, se este Grodz conseguir reuni-los, eles poderão acabar com todos os povos de Atlantis. O conhecimento dos Antigos será para sempre perdido.','Easy, Allecto. But she is right. The Anthropus are many, and if this Grodz can unite them, they could destroy every people of Atlantis. The knowledge of the Ancients would be lost forever.'),
    ] }, fonte:commonSource, i18n:{'en-US':{nome:'Grodz Field — Lv. 1'}},
  },
  {
    slug:'grodz-2', categoria:'grodz', nivel:2, ordem:2, nome:'Campo de Grodz — Nv. 2', ativo:true,
    tropas:[t('Milicianos',25,'Conscripts','milicianos')], guiasAtaque:[zeroLossGuide(2)],
    grodz:{ inimigoNome:'Campo de Grodz (Nv. 2)', inimigoTipo:'tropas', composicaoStatus:'confirmado', recomendacaoJogo:official(t('Milicianos',40,'Conscripts','milicianos')), dialogos:[
      d(1,'Grodz','Ah! Você mata pequeno campo, pensa que é tão grande! Grodz não morre fácil. Grodz é chefe de Atlantis agora - não escravo!','Ah! You kill small camp, think you are so great! Grodz does not die easily. Grodz is ruler of Atlantis now — not slave!'),
      d(2,'Comandante','Escravo? O que ele quer dizer?','Slave? What does he mean?'),
      d(3,'Daedalus','Segundo minhas pesquisas, os Antigos criaram os Antropos para serem seus trabalhadores. Quando os Antigos desapareceram, os Antropos se rebelaram. Eles se veem como os legítimos soberanos de Atlantis.','According to my research, the Ancients created the Anthropus to be their workers. When the Ancients disappeared, the Anthropus rebelled. They see themselves as the rightful rulers of Atlantis.'),
    ] }, fonte:commonSource, i18n:{'en-US':{nome:'Grodz Field — Lv. 2'}},
  },
  {
    slug:'grodz-3', categoria:'grodz', nivel:3, ordem:3, nome:'Campo de Grodz — Nv. 3', ativo:true,
    tropas:[t('Carregadores',1000,'Porters','carregadores'),t('Milicianos',400,'Conscripts','milicianos')], guiasAtaque:[zeroLossGuide(3)],
    grodz:{ inimigoNome:'Campo de Grodz (Nv. 3)', inimigoTipo:'tropas', composicaoStatus:'confirmado', recomendacaoJogo:official(t('Alabardeiros',300,'Halberdiers','alabardeiros')), dialogos:[
      d(1,'Grodz','Povo novo, fraco como os outros! Grodz come seu coração, joga seus ossos para os filhotes mastigarem!','New people, weak like the others! Grodz eats your heart, throws your bones to the young ones to chew!'),
      d(2,'Comandante','Outros? Daedalus, de quem ele está falando?','Others? Daedalus, who is he talking about?'),
      d(3,'Daedalus','Quatro outras raças foram criadas pelos Antigos para servirem de maneira diferente. Elas lutaram entre si quando os Antigos desapareceram, permitindo que os Antropos os sobrepujassem. Não sei se alguma sobreviveu.','Four other races were created by the Ancients to serve in different ways. They fought among themselves when the Ancients disappeared, allowing the Anthropus to overwhelm them. I do not know whether any survived.'),
    ] }, fonte:commonSource, i18n:{'en-US':{nome:'Grodz Field — Lv. 3'}},
  },
  {
    slug:'grodz-4', categoria:'grodz', nivel:4, ordem:4, nome:'Campo de Grodz — Nv. 4', ativo:true,
    tropas:[t('Alabardeiros',500,'Halberdiers','alabardeiros'),t('Minotauros',500,'Minotaurs','minotauros')], guiasAtaque:[zeroLossGuide(4)],
    grodz:{ inimigoNome:'Campo de Grodz (Nv. 4)', inimigoTipo:'tropas', composicaoStatus:'confirmado', recomendacaoJogo:official(t('Minotauros',300,'Minotaurs','minotauros'),t('Arqueiros',200,'Longbowmen','arqueiros')), dialogos:[
      d(1,'Grodz','Grodz destrói pequena cidade! Sua cidade vem depois! Grodz tem várias coisas de poder dos Antigos!','Grodz destroys little city! Your city comes next! Grodz has many powerful things from the Ancients!'),
      d(2,'Daedalus','Ah não! Se eles têm artefatos dos Antigos precisamos pegá-los antes que causem danos irreparáveis! Allecto!','Oh no! If they have artifacts of the Ancients, we must recover them before they cause irreparable damage! Allecto!'),
      d(3,'Allecto','Típico. Cidades são ameaçadas pela destruição e você não move uma palha - mas se tocarem em uma geringonça...','Typical. Cities are threatened with destruction and you do not lift a finger — but if they touch one of your gadgets...'),
    ] }, fonte:commonSource, i18n:{'en-US':{nome:'Grodz Field — Lv. 4'}},
  },
  {
    slug:'grodz-5', categoria:'grodz', nivel:5, ordem:5, nome:'Campo de Grodz — Nv. 5', ativo:true,
    tropas:[t('Arqueiros',600,'Longbowmen','arqueiros')], guiasAtaque:[zeroLossGuide(5)],
    grodz:{ inimigoNome:'Campo de Grodz (Nv. 5)', inimigoTipo:'tropas', composicaoStatus:'confirmado', recomendacaoJogo:official(t('Dragões de Ataque Rápido',50,'Swift Strike Dragons','dragoes-de-ataque-rapido')), dialogos:[
      d(1,'Grodz','Você com medo dos Antropos agora, né? Você fraco, não tem Dragão! Você morre logo!','You afraid of the Anthropus now, yes? You weak, no Dragon! You die soon!'),
      d(2,'Comandante','Nós temos Dragões - ou teremos, em breve.','We have Dragons — or we will, soon.'),
      d(3,'Allecto','Faça com que cresçam mais rápido! Quero ver o que podem fazer no campo de batalha! Enquanto isso, estou ficando cansada dessa ladainha!','Make them grow faster! I want to see what they can do on the battlefield! Meanwhile, I am getting tired of this speech!'),
    ] }, fonte:commonSource, i18n:{'en-US':{nome:'Grodz Field — Lv. 5'}},
  },
  {
    slug:'grodz-6', categoria:'grodz', nivel:6, ordem:6, nome:'Campo de Grodz — Nv. 6', ativo:true,
    tropas:[t('Dragões de Ataque Rápido',1000,'Swift Strike Dragons','dragoes-de-ataque-rapido')], guiasAtaque:[zeroLossGuide(6)],
    grodz:{ inimigoNome:'Campo de Grodz (Nv. 6)', inimigoTipo:'tropas', composicaoStatus:'confirmado', recomendacaoJogo:official(t('Dragões de Ataque Rápido',800,'Swift Strike Dragons','dragoes-de-ataque-rapido')), dialogos:[
      d(1,'Grodz','Você morre logo, povo sem Dragão! Sem Dragão, sem armadura - você fraco!','You die soon, people without Dragon! No Dragon, no armor — you weak!'),
      d(2,'Allecto','Armadura? Ele está dizendo..?','Armor? Is he saying..?'),
      d(3,'Daedalus','Com certeza. Descobri que os Antigos forjaram armaduras poderosas para seus dragões, o que os tornava quase invulneráveis em batalha. Se pudéssemos recuperar pelo menos algumas peças.','Certainly. I discovered that the Ancients forged powerful armor for their dragons, making them almost invulnerable in battle. If only we could recover at least a few pieces.'),
    ] }, fonte:commonSource, i18n:{'en-US':{nome:'Grodz Field — Lv. 6'}},
  },
  {
    slug:'grodz-7', categoria:'grodz', nivel:7, ordem:7, nome:'Campo de Grodz — Nv. 7', ativo:true,
    tropas:[t('Arqueiros',1500,'Longbowmen','arqueiros'),t('Alabardeiros',1000,'Halberdiers','alabardeiros')], guiasAtaque:[zeroLossGuide(7)],
    grodz:{ inimigoNome:'Campo de Grodz (Nv. 7)', inimigoTipo:'tropas', composicaoStatus:'confirmado', recomendacaoJogo:official(t('Dragões de Combate',150,'Battle Dragons','dragoes-de-combate')), dialogos:[
      d(1,'Grodz','Grodz forte demais para seu povo! Grodz mata Dragão - vários Dragão! Agora Grodz mata você!','Grodz too strong for your people! Grodz kills Dragon — many Dragons! Now Grodz kills you!'),
      d(2,'Comandante','Ele matou Dragões? Não pode ser!','He killed Dragons? That cannot be!'),
      d(3,'Allecto','Ele está só se gabando, com certeza. Mas se não estiver, vai pagar caro. Isto eu prometo.','He is only boasting, surely. But if he is not, he will pay dearly. I promise that.'),
    ] }, fonte:commonSource, i18n:{'en-US':{nome:'Grodz Field — Lv. 7'}},
  },
  {
    slug:'grodz-8', categoria:'grodz', nivel:8, ordem:8, nome:'Campo de Grodz — Nv. 8', ativo:true,
    tropas:[t('Dragões de Combate',500,'Battle Dragons','dragoes-de-combate')], guiasAtaque:[zeroLossGuide(8)],
    grodz:{ inimigoNome:'Campo de Grodz (Nv. 8)', inimigoTipo:'tropas', composicaoStatus:'confirmado', observacaoComposicao:'Composição confirmada: 500 Dragões de Combate.', recomendacaoJogo:official(t('Dragões de Combate',700,'Battle Dragons','dragoes-de-combate')), dialogos:[
      d(1,'Grodz','Grodz não tem medo do povo novo! Grodz tem nova armadura - dos Antigos. Nada machuca Grodz agora!','Grodz not afraid of new people! Grodz has new armor — from the Ancients. Nothing hurts Grodz now!'),
      d(2,'Allecto','Eu conheço sobre armaduras, e aquela não foi feita por nenhum humano. Ela parece...','I know armor, and that was not made for any human. It looks...'),
      d(3,'Daedalus','...feita para um Dragão? Acho que tem razão, minha cara. Temos que recuperá-la, a todo custo!','...made for a Dragon? I think you are right, my dear. We must recover it at any cost!'),
    ], i18n:{'en-US':{inimigoNome:'Grodz Field (Lv. 8)', observacaoComposicao:'Confirmed composition: 500 Battle Dragons.'}} }, fonte:commonSource, i18n:{'en-US':{nome:'Grodz Field — Lv. 8'}},
  },
  {
    slug:'grodz-9', categoria:'grodz', nivel:9, ordem:9, nome:'Campo de Grodz — Nv. 9', ativo:true,
    tropas:[t('Dragões de Combate',600,'Battle Dragons','dragoes-de-combate'),t('Gigantes',260,'Giants','gigantes')], guiasAtaque:[zeroLossGuide(9)],
    grodz:{ inimigoNome:'Campo de Grodz (Nv. 9)', inimigoTipo:'tropas', composicaoStatus:'confirmado', observacaoComposicao:'Composição confirmada: 600 Dragões de Combate + 260 Gigantes.', recomendacaoJogo:official(t('Gigantes',100,'Giants','gigantes'),t('Espelhos de Fogo',100,'Fire Mirrors','espelhos-de-fogo')), dialogos:[
      d(1,'Grodz','Toda gente nova morre. Tribos morrem, Dragões morrem - tudo morto! Só ficam os Antropos!','All new people die. Tribes die, Dragons die — everything dead! Only the Anthropus remain!'),
      d(2,'Comandante','Eles querem destruir os Dragões? Temos que impedi-lo! E o que ele quer dizer com Tribos?','They want to destroy the Dragons? We have to stop him! And what does he mean by Tribes?'),
      d(3,'Daedalus','As Tribos devem ser as outras que serviam aos Antigos. Encontrei várias referências nos manuscritos que decifrei até agora.','The Tribes must be the others who served the Ancients. I have found several references in the manuscripts I have deciphered so far.'),
    ], i18n:{'en-US':{inimigoNome:'Grodz Field (Lv. 9)', observacaoComposicao:'Confirmed composition: 600 Battle Dragons + 260 Giants.'}} }, fonte:commonSource, i18n:{'en-US':{nome:'Grodz Field — Lv. 9'}},
  },
  {
    slug:'grodz-10', categoria:'grodz', nivel:10, ordem:10, nome:'Campo de Grodz — Nv. 10', ativo:true,
    tropas:[], guiasAtaque:level10Guides, recompensas:[rewardGreatDragon], recompensasStatus:'confirmado',
    grodz:{ inimigoNome:'Grodz (Nv. 10)', inimigoTipo:'barra_vida', composicaoStatus:'confirmado', observacaoComposicao:'O nível 10 é o próprio Grodz. Ele não possui tropas definidas: o combate é representado por uma barra de vida.', recomendacaoJogo:[], dialogos:[
      d(1,'Allecto','É agora ou nunca! Fiz o que pude para aumentar nossa força de combate e não podemos deixar Grodz atacar primeiro.','It is now or never! I have done what I could to increase our combat strength, and we cannot let Grodz strike first.'),
      d(2,'Comandante','É verdade. Embora eu odeie violência, é a única maneira de impedir essa ameaça. E não somos os únicos ameaçados. Se Grodz vencer, os Dragões não mais existirão!','It is true. Although I hate violence, it is the only way to stop this threat. And we are not the only ones threatened. If Grodz wins, the Dragons will cease to exist!'),
      d(3,'Daedalus','Nada será dito do conhecimento deixado pelos Antigos. A perda para o mundo será incalculável!','And nothing of the knowledge left by the Ancients would remain. The loss to the world would be incalculable!'),
    ], i18n:{'en-US':{inimigoNome:'Grodz (Lv. 10)', observacaoComposicao:'Level 10 is Grodz himself. He has no defined troop composition: the fight is represented by a health bar.'}} },
    fonte:commonSource, i18n:{'en-US':{nome:'Grodz Field — Lv. 10'}},
  },
];
