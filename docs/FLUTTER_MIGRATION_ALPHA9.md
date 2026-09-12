# Flutter migration alpha.9 — beta.2.86

Versão do repositório: **1.0.0-beta.2.86**  
Flutter: **1.0.0-beta.2.86+100086**  
Android versionCode: **100086**

## Foco desta etapa

A alpha.9 redefine a base visual do cliente Flutter a partir do mockup aprovado, antes de continuar migrando novos módulos.

### Visual

- Home em verde esmeralda escuro + dourado, com cabeçalho forte, busca, painel-resumo, grade principal, atalhos, destaques e navegação inferior.
- Oito acessos principais na Home: Torneios, Tropas, Dragões, Edifícios, Itens, Pesquisas, Ilhas e Dicas.
- Identificação Flutter continua visível no cabeçalho e na tela de configurações.
- Componentes responsivos para Android, Web e iOS.

### Idioma e primeiro acesso

- Português e English agora são opções grandes e diretamente tocáveis no primeiro acesso.
- A escolha de idioma é salva imediatamente, mesmo antes da criação do perfil.
- Material widgets passam a receber o locale ativo via `flutter_localizations`.
- O idioma também pode ser alterado depois em **Configurações**, com aplicação e persistência imediatas.
- Se a lista de reinos não puder ser carregada, o primeiro acesso permite digitar o reino manualmente em vez de bloquear o usuário.

### Configurações

- Nova tela de Configurações no estilo visual da Home.
- Troca de idioma.
- Acesso ao perfil.
- Sincronização com a API.
- Informações da build Flutter e alvos Android/Web/iOS.

### Integrações preservadas

- API: Render.
- Banco: MongoDB através da API, nunca diretamente no cliente.
- Workflow principal: Flutter Android + Web + iOS.
- React/Capacitor permanece somente como legado manual durante a migração.

## Identificação da build

- Canal: **Flutter alpha.9**
- APK: `GuiaDOA-FLUTTER-beta.2.86-alpha.9.apk`
