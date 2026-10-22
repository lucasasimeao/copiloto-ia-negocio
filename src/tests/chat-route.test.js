const test = require('node:test');
const assert = require('node:assert/strict');
const { createApp } = require('../app');
const { buildFallbackReply, NO_MATCH_REPLY } = require('../fallback');

async function withServer(app, fn) {
  const server = app.listen(0);
  await new Promise((resolve) => server.once('listening', resolve));
  try {
    await fn(`http://127.0.0.1:${server.address().port}`);
  } finally {
    await new Promise((resolve, reject) => server.close((err) => (err ? reject(err) : resolve())));
  }
}

function post(baseUrl, route, body) {
  return fetch(`${baseUrl}${route}`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body)
  });
}

test('sem chave de API, /api/ask responde com fallback ancorado na base', async () => {
  await withServer(createApp({ llmClient: null }), async (baseUrl) => {
    const response = await post(baseUrl, '/api/ask', { message: 'Qual é o turno de trabalho?' });
    assert.equal(response.status, 200);
    const body = await response.json();
    assert.equal(body.source, 'fallback');
    assert.match(body.reply, /4 horas e meia/);
  });
});

test('pergunta vazia retorna 400', async () => {
  await withServer(createApp({ llmClient: null }), async (baseUrl) => {
    const response = await post(baseUrl, '/api/chat', { prompt: '   ' });
    assert.equal(response.status, 400);
  });
});

test('com LLM disponível, envia system prompt com a base e devolve a resposta', async () => {
  let received;
  const llmClient = {
    chat: {
      completions: {
        create: async (params) => {
          received = params;
          return { choices: [{ message: { content: 'Abrimos às 09:00.' } }] };
        }
      }
    }
  };

  await withServer(createApp({ llmClient }), async (baseUrl) => {
    const response = await post(baseUrl, '/api/chat', { prompt: 'Que horas abre?' });
    const body = await response.json();
    assert.deepEqual(body, { reply: 'Abrimos às 09:00.', source: 'groq' });
    assert.equal(received.messages[0].role, 'system');
    assert.match(received.messages[0].content, /Base de Conhecimento/);
    assert.equal(received.messages[1].content, 'Que horas abre?');
  });
});

test('se o LLM falhar, cai no fallback sem expor o erro', async () => {
  const llmClient = { chat: { completions: { create: async () => { throw new Error('timeout'); } } } };

  await withServer(createApp({ llmClient }), async (baseUrl) => {
    const body = await (await post(baseUrl, '/api/chat', { prompt: 'Qual o preço de uma peça 3D?' })).json();
    assert.equal(body.source, 'fallback');
    assert.match(body.reply, /Custo Total/);
    assert.doesNotMatch(JSON.stringify(body), /timeout/);
  });
});

test('fallback sem correspondência não despeja a base inteira', () => {
  assert.equal(buildFallbackReply('Qual a capital da França?'), NO_MATCH_REPLY);
});
