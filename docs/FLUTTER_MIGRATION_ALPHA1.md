# Flutter migration alpha.1

Foi iniciada uma migração paralela em `flutter/`, baseada na versão 1.0.0-beta.2.79.

O objetivo é manter o Guia DOA disponível em **Android + Web** e deixar o mesmo cliente preparado para **iOS**, sem conectar o app diretamente ao MongoDB. A API Express existente continua sendo a fronteira de segurança e a fonte de dados continua MongoDB/API.

O frontend React/Capacitor foi mantido intacto nesta etapa para servir de referência funcional e fallback durante a migração.

Veja:

- `flutter/README.md`
- `flutter/docs/MIGRATION_STATUS.md`
