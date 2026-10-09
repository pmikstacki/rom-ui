import { strict as assert } from 'node:assert';
import { test } from 'node:test';
import { canSubmitMessage, isMessageSubmitKey, citationHref } from '../../src/lib/chat/contracts.ts';

test('submission requires text within the limit and an available composer', () => {
  assert.equal(canSubmitMessage({ value: '  ', maxLength: 20 }), false);
  assert.equal(canSubmitMessage({ value: 'abc', maxLength: 2 }), false);
  for (const flag of ['disabled', 'pending', 'composing'] as const)
    assert.equal(canSubmitMessage({ value: 'hello', maxLength: 20, [flag]: true }), false);
  assert.equal(canSubmitMessage({ value: '  hello  ', maxLength: 20 }), true);
});

test('only unmodified Enter outside composition submits', () => {
  const enter = { key: 'Enter', shiftKey: false, ctrlKey: false, altKey: false, metaKey: false, isComposing: false };
  assert.equal(isMessageSubmitKey(enter, false), true);
  for (const flag of ['shiftKey', 'ctrlKey', 'altKey', 'metaKey', 'isComposing'] as const)
    assert.equal(isMessageSubmitKey({ ...enter, [flag]: true }, false), false);
  assert.equal(isMessageSubmitKey(enter, true), false);
  assert.equal(isMessageSubmitKey({ ...enter, key: 'a' }, false), false);
});

test('citations accept only absolute web links', () => {
  assert.equal(citationHref('https://example.org/a'), 'https://example.org/a');
  assert.equal(citationHref('http://example.org/a'), 'http://example.org/a');
  for (const href of ['javascript:alert(1)', 'data:text/html,<script>x</script>', '/relative', '//example.org', 'not a URL'])
    assert.equal(citationHref(href), null);
});

test('IME confirmation with legacy key code 229 does not submit after compositionend', () => {
  assert.equal(isMessageSubmitKey({ key: 'Enter', shiftKey:false, ctrlKey:false, altKey:false, metaKey:false, isComposing:false, keyCode:229 }, false), false);
});
