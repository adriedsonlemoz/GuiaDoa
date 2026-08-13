# Níveis

## Beta 2.32

O módulo trabalha com **Poder Necessário** por nível. O campo legado `xp` é migrado automaticamente para `poderNecessario` pela migração de dados Beta 2.13.

A tela pública guarda somente dados pessoais locais: poder atual, histórico recente e meta escolhida. Quando existem níveis sem poder confirmado entre dois níveis conhecidos, o aplicativo apresenta o último nível confirmado e sinaliza a faixa possível, sem afirmar um nível exato.

O Admin permite preencher vários poderes diretamente na tabela, filtrar valores faltantes/preenchidos e importar linhas no formato `nivel poder`.
