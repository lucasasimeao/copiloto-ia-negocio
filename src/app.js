const express = require('express');
const path = require('path');
const Groq = require('groq-sdk');
const { knowledgeBase } = require('./knowledge-base');
const { buildFallbackReply } = require('./fallback');

const MODEL = process.env.GROQ_MODEL || 'llama-3.1-8b-instant';

const systemPrompt = `Você é um assistente corporativo da CM Arte & Presentes. Responda estritamente com base na Base de Conhecimento fornecida. Se não houver informação suficiente no contexto, diga explicitamente que não possui informação suficiente e não invente detalhes.

Base de Conhecimento:
${knowledgeBase}`;

function createLlmClient(apiKey = process.env.GROQ_API_KEY) {
  return apiKey ? new Groq({ apiKey }) : null;
}

// `llmClient` pode ser injetado nos testes; sem cliente, o app responde só com o fallback.
function createApp({ llmClient = createLlmClient() } = {}) {
  const app = express();
  app.use(express.json());
  app.use(express.static(path.join(__dirname, '..', 'public')));

  async function handleChat(req, res) {
    const body = req.body || {};
    const prompt = typeof body.prompt === 'string' ? body.prompt.trim() : '';
    const message = typeof body.message === 'string' ? body.message.trim() : '';
    const userPrompt = prompt || message;

    if (!userPrompt) {
      return res.status(400).json({ error: 'Envie uma pergunta no campo "prompt" ou "message".' });
    }

    if (!llmClient) {
      return res.json({
        reply: buildFallbackReply(userPrompt),
        source: 'fallback',
        warning: 'GROQ_API_KEY não configurada.'
      });
    }

    try {
      const completion = await llmClient.chat.completions.create({
        model: MODEL,
        temperature: 0.2,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ]
      });

      const reply = completion.choices?.[0]?.message?.content?.trim() || 'Não consegui gerar uma resposta.';
      return res.json({ reply, source: 'groq' });
    } catch (error) {
      console.error('Falha na chamada ao Groq:', error.message);
      return res.json({
        reply: buildFallbackReply(userPrompt),
        source: 'fallback',
        warning: 'Serviço de IA indisponível no momento.'
      });
    }
  }

  app.post('/api/chat', handleChat);
  app.post('/api/ask', handleChat);

  app.get(/.*/, (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
  });

  return app;
}

module.exports = { createApp, systemPrompt };
