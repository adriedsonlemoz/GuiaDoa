# Migração React/Capacitor → Flutter — alpha.2

Base analisada: **Guia DOA 1.0.0-beta.2.79**.

## Decisões preservadas

1. **MongoDB não será acessado diretamente pelo aplicativo.** Flutter usa a mesma API Express publicada no Render.
2. **Backend/Admin continuam no projeto atual.** A migração inicial troca somente o cliente público.
3. **Web não será abandonada.** O mesmo código Flutter será compilado para Android, Web e iOS.
4. **Migração progressiva.** O frontend React permanece funcional até cada tela Flutter ter equivalência suficiente.
5. **Identidade visual preservada.** A alpha começa com pergaminho + verde-petróleo + dourado; a imagem `reference-home-premium.png` fica apenas como direção visual aprovada, não como obrigação de redesenhar funções.

## Já iniciado

- bootstrap multiplataforma;
- tema e shell responsivo;
- API client;
- cache simples do catálogo;
- perfil/onboarding;
- Home;
- catálogos públicos conectados;
- fullscreen/edge-to-edge;
- assets atuais copiados;
- testes básicos do parser da API.

## Concluído nesta alpha

- **Tropas e Comparador**: lista, busca, filtros, ordenação, detalhes, treinamento e comparação rápida de duas unidades.

## Próximas migrações funcionais

- Dragões, alimentação, evolução e tracker;
- Edifícios normais/Gruta/Basílica;
- Pesquisas;
- catálogo e detalhes de Itens;
- Campanha (Grodz/Zyrvorthian);
- Ilhas e planejador;
- Torneios e calculadoras;
- Eventos/Reinos com todas as regras atuais;
- Dicas com categorias e conteúdo formatado;
- Assistente;
- backup/restauração dos dados locais;
- termos/doação e demais modais de primeiro acesso;
- i18n completa PT-BR/EN-US, reaproveitando todas as strings atuais;
- substituição do cache transitório por armazenamento local mais robusto caso o tamanho real do catálogo ultrapasse limites seguros no Web.

## O que não foi alterado

- API Express;
- models/coleções MongoDB;
- painel Admin;
- migrações de conteúdo/seeds;
- frontend React/Capacitor de produção.

Isso permite validar Flutter sem interromper o aplicativo existente.
