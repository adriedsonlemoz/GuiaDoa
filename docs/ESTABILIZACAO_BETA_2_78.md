# Estabilizacao Beta 2.78

Versao: `1.0.0-beta.2.78`. Android: `versionCode 100078`. Data: 2026-09-11.

## Build e distribuicao

O workflow preserva React/Vite, API e Capacitor. Nao migra o aplicativo nem altera dados do jogo.

1. Instala dependencias web e API com `npm ci` e seus locks.
2. Executa `npm test`, `npm run check`, testes Playwright e build web.
3. Instala Capacitor core/android/cli exatamente em `8.5.0`, como na base anterior.
4. Gera `android/`, sincroniza os assets e aplica os nomes, icones e versao.
5. Compila Debug ou Release, verifica assinatura, alinhamento, applicationId e versoes no APK final.
6. Em main/master, publica somente `GuiaDOA.apk` como asset de Release. Pull requests e outras branches somente validam.

O Android permanece gerado, sem pasta nativa versionada. Isso preserva o isolamento da toolchain movel em relacao ao build web. Todas as customizacoes atuais estao nos scripts. Caso surjam plugins nativos ou alteracoes manuais, reavaliar o versionamento de `android/` antes de adota-los.

Node 22, Java 21, Ubuntu 24.04, plataforma Android 36 e Build Tools 36.0.0 estao declarados no workflow. O Gradle/AGP vem do template do Capacitor 8.5.0. Os tres pacotes Capacitor sao fixos, mas dependencias transitivas da instalacao temporaria ainda sao resolvidas pelo npm. Nao ha promessa de APK byte a byte identico entre execucoes.

O workflow anterior declarava secrets de assinatura sem decodificar um keystore nem configurar o Gradle para usa-lo. A nova Release e assinada explicitamente com `apksigner`, depois de `zipalign`, e a assinatura e verificada antes do upload.

## Secrets para Release

Configurar no repositorio:

| Secret | Conteudo |
| --- | --- |
| `KEYSTORE_BASE64` | Keystore de assinatura codificado em Base64, nao um caminho de arquivo |
| `KEYSTORE_PASSWORD` | Senha do keystore |
| `KEY_ALIAS` | Alias da chave |
| `KEY_PASSWORD` | Senha da chave |
| `VITE_API_URL` | Opcional: override HTTPS da API publica |

Usar o mesmo keystore em todas as atualizacoes. Nenhuma chave privada foi criada ou incluida no projeto. O antigo `KEYSTORE_FILE`, que nao era aplicado pelo workflow, foi substituido por `KEYSTORE_BASE64`.

Debug nao exige esses secrets: usa a chave de desenvolvimento do Android. O cache reaproveita essa chave enquanto disponivel, mas nao substitui uma identidade duravel de assinatura. Se o cache expirar, ou ao passar de Debug para Release, a assinatura pode mudar e impedir atualizacao sobre uma instalacao anterior. Preservar um backup dos dados; nao desinstalar automaticamente.

A Release exige permissao `contents: write` para o token do workflow. O checkout nao persiste credenciais. A publicacao e bloqueada em pull requests e branches fora de main/master.

O nome do asset e sempre `GuiaDOA.apk`. A tag inclui versao, tipo e numero da execucao. Uma nova Release fica como rascunho ate o asset ser conferido. A validacao exige exatamente um asset, com nome e tamanho esperados e estado `uploaded`. Versoes beta e Debug sao marcadas como pre-release, sem substituir a release estavel mais recente.

Os links automaticos `Source code (zip)` e `Source code (tar.gz)` do GitHub continuam sendo codigo-fonte, nao o APK. O workflow nao usa `upload-artifact` e nao compacta o APK em ZIP.

## Versionamento

`versionName` vem de `package.json`; API e locks mantem a mesma versao. `versionCode` fica em `mobile/android-version.json` e deve aumentar a cada atualizacao distribuida. O script adiciona uma configuracao Gradle idempotente, preservando as demais configuracoes nativas, e rejeita valores invalidos.

## Conexao e cache

- A interface continua abrindo antes da resposta da API.
- Um snapshot antigo continua valido como fallback durante falta de internet.
- Falha em um modulo nao substitui o snapshot completo por uma carga parcial.
- Eventos online, tentativa automatica e sincronizacao manual compartilham uma requisicao em andamento.
- Troca de idioma nao dispara novamente o efeito de leitura inicial do cache.
- A abertura do IndexedDB espera no maximo 1,5 segundo e trata bloqueios; conexoes que abrem depois do timeout sao fechadas.
- Falhas preservam os codigos de diagnostico e o backoff existente.

## Revisao do Admin

Corrigido um ponto concreto de injecao de JavaScript no botao de confirmacao de troca de nickname. Escape HTML sozinho nao protege strings dentro de `onclick`: o navegador decodifica entidades antes de executar o handler. O fluxo agora usa os helpers existentes `strArg`/`fromStrArg` para todos os argumentos.

Breadcrumbs passam a usar `textContent` e callbacks registrados diretamente. A implementacao anterior serializava a funcao em HTML e perdia variaveis locais do callback.

Nao houve reescrita geral do Admin nem remocao indiscriminada de `innerHTML`. Esta e uma revisao focada, nao uma auditoria completa de seguranca.

## Verificacao

Base original: 190 testes frontend e 156 testes API passaram, assim como check e build web.

Resultado final da 2.78:

| Verificacao | Resultado |
| --- | --- |
| `npm test` | 194 testes frontend/contrato + 156 testes API, todos aprovados |
| `npm run check` | Aprovado |
| `npm run build` | Aprovado, PWA gerada |
| `npm run test:browser` | 18 testes aprovados: 9 em desktop e 9 em viewport movel |

Os testes de navegador usaram Chromium 153 local, com `CHROMIUM_EXECUTABLE_PATH`. Essa variavel e opcional; no Actions, Playwright instala e usa seu proprio Chromium. Nenhuma ferramenta temporaria de validacao foi adicionada as dependencias do aplicativo.

Novos testes cobrem URLs de loopback disfarcadas, consistencia das versoes, aplicacao Gradle idempotente, contrato do workflow, recuperacao de conexao, persistencia do cache e caracteres especiais no Admin. Os cenarios de navegador executam em desktop e viewport movel, com respostas locais controladas e sem alterar a API publicada.

O teste de injecao de nickname foi reproduzido isoladamente sobre o codigo original da 2.77 e bloqueado pelo codigo atualizado.

O YAML foi validado com parser e todos os 15 blocos de shell passaram em `bash -n`. Os passos reais de validacao rejeitaram API HTTP/loopback e Release sem secrets. A geracao Capacitor e a aplicacao de nomes, icones e versao tambem foram executadas localmente.

A compilacao nativa foi tentada com Java 21 e SDK 36 locais, mas o Gradle Wrapper falhou ao baixar sua distribuicao com `java.net.SocketException: Network is unreachable`. Nenhum APK foi gerado nesta entrega. A assinatura nativa e a publicacao efetiva ainda precisam ser executadas no GitHub Actions; nao houve acesso ou alteracao de repositorio remoto, secrets, Release ou banco de producao.

O build web mantem o aviso preexistente de bundle acima de 500 kB. Divisao de codigo nao fez parte desta etapa.

`npm run check` verifica sintaxe/transpilacao do frontend e sintaxe da API; nao e uma analise completa de tipos (`checkJs` permanece desativado como na base).

## Referencias tecnicas

- [Assinatura e verificacao com apksigner](https://developer.android.com/tools/apksigner)
- [Versionamento Android](https://developer.android.com/studio/publish/versioning)
- [Criacao de Releases com GitHub CLI](https://cli.github.com/manual/gh_release_create)
- [Upload de assets com GitHub CLI](https://cli.github.com/manual/gh_release_upload)
