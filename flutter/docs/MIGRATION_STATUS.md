# Estado da migração Flutter — alpha.19

Paridade visual e funcional: [auditoria desta entrega](../../docs/FLUTTER_ALPHA19_AUDITORIA.md).

Base atual: **Guia Doa 1.0.0-beta.2.96 / Flutter alpha.19 / versionCode 100096**.

## Arquitetura

- Flutter é a aplicação principal para Android, Web e iOS.
- Render continua servindo a API Express.
- MongoDB continua acessível apenas pelo backend.
- React/Capacitor permanece no repositório como referência funcional e workflow legado/manual durante a validação da paridade.

## Cobertura funcional

Primeira passagem de cobertura concluída para os módulos públicos: Home, Torneios e calculadoras, Tropas e comparação, Cálculos de marcha, Aprimoramento, Dragões e Tracker, Edifícios, Itens, Pesquisas, Ilhas, Níveis, Campanha, Eventos, Dicas, Reinos, Assistente, Backup, Extras, Construtor de Texto, Favoritos, Sobre, Apoio, Perfil, Idioma e Configurações.

Cobertura não significa paridade completa. Ilhas, Edifícios especiais, Itens, Dicas, Níveis e algumas calculadoras ainda precisam recuperar interações do React; consulte a matriz da auditoria. Campanha e Eventos deixaram de usar a ficha genérica nesta entrega.

## Identidade

- Nome instalado: **Guia Doa**.
- O sufixo Flutter fica apenas na identificação técnica da build e nome do APK durante a fase alpha.
- Android usa adaptive icon + fallback circular, corrigindo o launcher quadrado.
