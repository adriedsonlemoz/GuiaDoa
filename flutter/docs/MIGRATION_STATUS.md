# Estado da migração Flutter — alpha.11

Base atual: **Guia Doa 1.0.0-beta.2.88 / Flutter alpha.11 / versionCode 100088**.

## Arquitetura

- Flutter é a aplicação principal para Android, Web e iOS.
- Render continua servindo a API Express.
- MongoDB continua acessível apenas pelo backend.
- React/Capacitor permanece no repositório como referência funcional e workflow legado/manual durante a validação da paridade.

## Cobertura funcional

Primeira passagem de paridade concluída para os módulos públicos: Home, Torneios e calculadoras, Tropas e comparação, Cálculos de marcha, Aprimoramento, Dragões e Tracker, Edifícios, Itens, Pesquisas, Ilhas, Níveis, Campanha, Eventos, Dicas, Reinos, Assistente, Backup, Extras, Construtor de Texto, Favoritos, Sobre, Apoio, Perfil, Idioma e Configurações.

Algumas subrotas antigas foram consolidadas em módulos Flutter únicos para evitar duplicação de tela. O conteúdo permanece acessível pelos registros e detalhes da API.

## Identidade

- Nome instalado: **Guia Doa**.
- O sufixo Flutter fica apenas na identificação técnica da build e nome do APK durante a fase alpha.
- Android usa adaptive icon + fallback circular, corrigindo o launcher quadrado.
