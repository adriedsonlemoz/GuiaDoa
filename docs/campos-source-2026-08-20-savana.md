# Campos — Savana — recompensas confirmadas na Beta 2.64

Fontes: `savanas.zip` enviado em 20/08/2026 e screenshot adicional com tooltip do item azul enviado em 21/08/2026. A imagem adicional confirma o nome **Emblema do Dragão do Trovão**. Nenhuma imagem foi gerada; o ícone local foi somente recortado da captura fornecida.

## Regra especial da Savana

A **Savana é o único Campo que possui recompensas nos níveis 1–5**. Nos demais Campos, os níveis 1–5 não têm recompensas. A partir do Nv.6 todos os tipos de Campo cadastrados possuem recompensas.

## Recompensas confirmadas

- **Nv.1–5:** 1 **Pedaço de carne carneiro**.
- **Nv.6–9:** **Emblema do Dragão do Trovão** + 1 Pedaço de carne carneiro + 1 Pedaço de carne bovina.
- **Nv.10:** os três itens anteriores + 1 **Pedaço de Frango**.

O Emblema do Dragão do Trovão está marcado como item de `obtencao-dragao`, relacionado a `dragao-trovao`, e aparece nos níveis **6–10**. São necessários **100 emblemas** para a captura.

## Assets

Os ícones em `public/assets/items/fields/savanna/` são recortes das capturas fornecidas. **Nenhuma arte foi criada ou gerada.**

## Integração com tutoriais e Dragões

A camada central de captura lê os metadados das recompensas da Savana e abastece tanto o detalhe do Dragão do Trovão quanto o tutorial de captura, evitando duplicação manual de Campo, níveis e item.
