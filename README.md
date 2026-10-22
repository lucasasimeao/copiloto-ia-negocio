# Copiloto de IA para Pequeno Negócio

> Chat web com LLM que responde perguntas sobre a operação de uma loja (horários, procedimentos técnicos e cálculo de preço de impressão 3D) usando apenas uma base de conhecimento fornecida no prompt.

![Node.js](https://img.shields.io/badge/Node.js-18+-339933?logo=nodedotjs&logoColor=white)
![Express](https://img.shields.io/badge/Express-5-000000?logo=express&logoColor=white)
![Groq](https://img.shields.io/badge/LLM-Groq%20(Llama%203.1)-F55036)
![Tests](https://img.shields.io/badge/tests-node%3Atest-informational)

## Sobre o projeto

Em um pequeno negócio, as mesmas dúvidas se repetem: qual o horário de atendimento, qual a temperatura certa para sublimar uma caneca, como resolver falha de aderência na impressora 3D, quanto cobrar por uma peça. Essas respostas ficam na cabeça de uma ou duas pessoas.

O **Copiloto** centraliza esse conhecimento em um assistente de chat. O back-end injeta uma **base de conhecimento do negócio** no *system prompt* e instrui o modelo a responder **somente** com base nela, dizendo explicitamente quando não tem a informação (técnica de *grounding* para reduzir alucinações).

Projeto acadêmico da graduação em IA e Automação Digital (UniFECAF), construído a partir de uma especificação ([`SPEC.md`](SPEC.md)) e com prompts de agentes (back-end, front-end e orquestrador) em [`.github/prompts/`](.github/prompts/).

## Funcionalidades

- **Chat estilo ChatGPT** em página única (balões do usuário e da IA).
- **Respostas ancoradas** em uma base de conhecimento: regras de operação, especificações das máquinas e procedimentos técnicos.
- **Cálculo de preço de impressão 3D** com ordem de cálculo definida no prompt (material, energia, manutenção, custo total e *markup*), incluindo um exemplo de referência.
- **Fallback sem IA**: se a chave da API não estiver configurada ou a chamada falhar, o servidor responde por palavras-chave com o trecho certo da base, e o campo `source` indica a origem (`groq` ou `fallback`).
- **API reutilizável**: `POST /api/chat` (usada pelo front-end) e `POST /api/ask`, aceitando `prompt` ou `message` no corpo.
- **Testes automatizados** com `node:test`: fallback, validação de entrada, chamada ao LLM com cliente simulado (*mock*) e falha do LLM.

## Tecnologias

- **Back-end:** Node.js, Express 5, dotenv
- **IA:** Groq SDK com o modelo `llama-3.1-8b-instant`, `temperature: 0.2`
- **Front-end:** HTML5, CSS3 e JavaScript puro
- **Testes:** `node:test` + `assert`
- **Desenvolvimento assistido por IA:** GitHub Copilot e prompts de agentes especializados

## Como executar

```bash
git clone https://github.com/lucasasimeao/copiloto-ia-negocio.git
cd copiloto-ia-negocio
npm install
cp .env.example .env   # no Windows: copy .env.example .env
```

```env
GROQ_API_KEY=sua_chave_groq
PORT=3000
```

```bash
npm start      # http://localhost:3000
npm test       # roda os testes (sem precisar de chave de API)
```

Teste rápido da API:

```bash
curl -X POST http://localhost:3000/api/ask \
  -H "Content-Type: application/json" \
  -d '{"prompt":"Qual o turno de trabalho?"}'
```

Resposta: JSON com `reply` e `source` (`groq` com a chave configurada, `fallback` sem ela).

> Sem `GROQ_API_KEY` o app continua funcionando no modo fallback, o que facilita testar.

## Estrutura do projeto

```text
.
├── public/               # Interface do chat (index.html, style.css, app.js)
├── src/app.js            # App Express: rotas, chamada ao Groq e fallback (cliente LLM injetável)
├── src/server.js         # Ponto de entrada (npm start)
├── src/knowledge-base.js # Base de conhecimento do negócio (contato fictício)
├── src/fallback.js       # Respostas por palavra-chave quando o LLM está indisponível
├── src/tests/            # Testes das rotas e do fallback
├── .github/prompts/      # Prompts dos agentes back-end, front-end e orquestrador
├── SPEC.md               # Especificação do produto
└── .env.example
```

## Competências demonstradas

- **Integração de LLM** via SDK com controle de temperatura e *system prompt*.
- **Grounding e engenharia de prompt**: base de conhecimento injetada, regras de prioridade e instrução anti-alucinação.
- **Resiliência**: fallback determinístico quando o serviço de IA está indisponível.
- **Desenvolvimento orientado a especificação** com agentes de IA (spec → back-end → front-end → revisão do orquestrador).
- **APIs REST e testes automatizados** em Node.js, com injeção de dependência para simular o LLM.

## Próximos passos

- Evoluir a base de conhecimento para **RAG** com busca por similaridade.
- Adicionar prints da interface.
