import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';

const read = p => readFileSync(new URL(`../${p}`, import.meta.url), 'utf8');

test('Alliance Tracker existe apenas no Admin e não cria rota pública no frontend', () => {
  assert.ok(existsSync(new URL('../api/admin/js/admin-alliances.js', import.meta.url)));
  assert.match(read('api/admin/js/admin-state.js'), /id:'alliances'/);
  assert.match(read('api/admin/js/admin-alliances.js'), /Privado/);
  assert.doesNotMatch(read('src/App.jsx'), /alliance-tracker|Alliance Tracker/);
});

test('Admin exige revisão antes de confirmar dados extraídos e explicita lista completa', () => {
  const admin = read('api/admin/js/admin-alliances.js');
  assert.match(admin, /Revisar leitura/);
  assert.match(admin, /lista completa da Aliança/);
  assert.match(admin, /Confirmar importação/);
  assert.match(admin, /Confirmar troca/);
});

test('importação da Aliança mostra narrativa de progresso e recuperação de falhas', () => {
  const admin = read('api/admin/js/admin-alliances.js');
  const css = read('api/admin/css/admin.css');
  assert.match(admin, /at-scan-story/);
  assert.match(admin, /OCR local procurando nomes e valores/);
  assert.match(admin, /Leitura local suficiente — imagem resolvida/);
  assert.match(admin, /OCR local ficou em dúvida — preservando o que foi reconhecido/);
  assert.match(admin, /100% local/);
  assert.match(admin, /Tudo pronto\. Abrindo revisão/);
  assert.match(admin, /extract-stream/);
  assert.match(admin, /Continuar leitura/);
  assert.match(admin, /revisão manual/);
  assert.match(admin, /imagens concluídas/);
  assert.match(admin, /extract-batches/);
  assert.match(css, /\.at-scan-story/);
});

test('Alliance Tracker avançado mostra ROI, métricas e revisão somente das exceções', () => {
  const admin = read('api/admin/js/admin-alliances.js');
  const css = read('api/admin/css/admin.css');
  assert.match(admin, /Mapeando cabeçalho e tabela/);
  assert.match(admin, /Pré-processamento adaptativo acionado/);
  assert.match(admin, /Checkpoint OCR restaurado/);
  assert.match(admin, /Exceções \(/);
  assert.match(admin, /Confirmar exceções visíveis/);
  assert.match(admin, /localOnlyRate/);
  assert.match(admin, /Duplicados/);
  assert.match(css, /\.at-reader-metrics/);
  assert.match(css, /\.at-row-exception/);
  assert.match(admin, /at-snapshot-type-hint/);
  assert.match(admin, /atShowSourceImage/);
  assert.match(admin, /Cobertura incompleta/);
  assert.match(admin, /ocr_column_pairing/);
  assert.match(css, /\.at-source-modal/);
  assert.match(css, /\.at-coverage-block/);
});


test('Continuar leitura acompanha lote ocupado e retoma automaticamente quando o lock libera', () => {
  const admin = read('api/admin/js/admin-alliances.js');
  const route = read('api/routes/allianceTracker.js');
  assert.match(admin, /async function atContinueReading/);
  assert.match(admin, /Continuar leitura solicitado/);
  assert.match(admin, /Lock liberado → retomando leitura automaticamente/);
  assert.match(admin, /return atExtract\(true\)/);
  assert.match(route, /VISION_BATCH_BUSY/);
  assert.match(route, /retryAfterMs:\s*1500/);
});

test('Admin narra resolvedor local e aprendizado sem screenshots permanentes', () => {
  const admin = read('api/admin/js/admin-alliances.js');
  assert.match(admin, /resolvedor local/);
  assert.match(admin, /correção\(ões\) ensinada\(s\) ao leitor local/);
  assert.match(admin, /Exceções preservadas para revisão manual/);
  assert.match(admin, /screenshots não viram memória/);
});
