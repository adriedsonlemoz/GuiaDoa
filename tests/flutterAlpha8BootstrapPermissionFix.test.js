import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const read = path => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');

test('Flutter alpha.8 invokes bootstrap through bash so executable bit is not required', () => {
  const workflow = read('.github/workflows/flutter-multiplatform.yml');
  const directCalls = workflow.match(/run:\s*\.\/tool\/bootstrap_platforms\.sh/g) ?? [];
  const bashCalls = workflow.match(/run:\s*bash \.\/tool\/bootstrap_platforms\.sh/g) ?? [];

  assert.equal(directCalls.length, 0);
  assert.equal(bashCalls.length, 2);
});
