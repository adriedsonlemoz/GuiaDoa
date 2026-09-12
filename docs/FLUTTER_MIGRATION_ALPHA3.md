# Flutter migration alpha.3 — beta.2.80

Correção de build multiplataforma baseada nos logs `Flutter-Android-Web-iOS-2`.

- Corrigido parâmetro inválido `minHeight` em `Container` na Home.
- A altura mínima agora é aplicada por `BoxConstraints(minHeight: 60)`.
- Limpos os quatro avisos `prefer_const_constructors` reportados no mesmo arquivo.
- Versão do repositório: `1.0.0-beta.2.80`.
- Flutter: `1.0.0-beta.2.80+100080`.
- Android versionCode legado sincronizado: `100080`.
- Identificação visual: `Flutter alpha.3`.

Nenhuma função de Tropas, API, MongoDB, Render ou Web foi removida nesta correção.
