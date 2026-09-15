# Campos — Floresta — fonte de dados atualizada na Beta 2.64

Fontes: screenshots e relatórios enviados em 20/08/2026 e o relatório adicional da Floresta Nv.2 enviado em 21/08/2026. As telas são referências de dados; nenhuma imagem foi gerada.

## Cobertura dos níveis

A Floresta está estruturada do **Nv.1 ao Nv.10**. A regra confirmada pelo usuário é que, fora da Savana, os Campos **não possuem recompensas nos níveis 1–5** e passam a possuir recompensas a partir do Nv.6. Portanto, Floresta Nv.1–5 fica como `confirmado` e sem recompensas; não existe mais pendência de recompensa nos Nv.3–4.

O novo relatório confirma especificamente a composição da **Floresta Nv.2: 100 Canibais + 50 Fedor**.

## Recurso do campo

Floresta usa **madeira** como recurso principal. A produção por hora segue a progressão comum dos Campos:

- Nv.1: 2.750/h
- Nv.2: 5.500/h
- Nv.3: 8.250/h
- Nv.4: 11.000/h
- Nv.5: 13.750/h
- Nv.6: 16.500/h
- Nv.7: 19.250/h
- Nv.8: 22.000/h
- Nv.9: 24.750/h
- Nv.10: 27.500/h

## Recompensas

- **Nv.1–5:** sem recompensas.
- **Nv.6–9:** Emblema do Dragão Beladona, Emblema do Dragão Tóxico e Emblema do Dragão Fada.
- **Nv.10:** os três emblemas acima + **Essência da Fúria**.

Os três emblemas possuem metadados de obtenção de dragão e são consumidos pela camada central de captura para gerar automaticamente os vínculos Campo → Dragão → Tutorial.

## Estrutura modular

A implementação permanece em `api/seeds/campos/floresta.js`, compartilhando funções comuns com `api/seeds/campos/shared.js`. A migração da Beta 2.64 sincroniza os registros já existentes para remover o antigo estado pendente dos níveis baixos e aplicar a composição confirmada do Nv.2.
