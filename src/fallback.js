// Respostas determinísticas por palavra-chave, usadas quando o LLM não está disponível.
// A ordem importa: a primeira regra que casar com a pergunta vence.
const rules = [
  {
    keywords: ['turno', 'carga horária', 'carga horaria', 'escala'],
    reply: 'O turno de trabalho dos funcionários é de 4 horas e meia de segunda a sexta, e 6 horas no final de semana (sábado ou domingo).'
  },
  {
    keywords: ['horário', 'horario', 'aberto', 'funcionamento', 'domingo', 'sábado', 'sabado', 'segunda'],
    reply: 'Horário de atendimento ao público (porta aberta): Domingo 09:00-14:00; Segunda 09:00-18:00; Terça a Sábado 09:00-20:00. Observação: este horário é de atendimento ao público e é diferente da escala interna de produção (4,5h em dias úteis e 6h no fim de semana).'
  },
  {
    keywords: ['whatsapp', 'telefone', 'contato', 'endereço', 'endereco', 'localização', 'localizacao'],
    reply: 'Contato da loja: WhatsApp/Telefone (12) 90000-0000. Endereço: Rua Exemplo, 123 - Centro, Taubaté - SP. (Dados fictícios de demonstração.)'
  },
  {
    keywords: ['catálogo', 'catalogo', 'vende', 'produto', 'roupa', 'brinquedo', 'maquiagem'],
    reply: 'Além de personalizações, a loja também vende roupas infantis e adultas, acessórios, maquiagens e variedade de brinquedos, além de estamparia de canecas e camisetas.'
  },
  {
    keywords: ['preço', 'preco', 'valor', 'orçamento', 'orcamento', 'markup', 'filamento', 'custo'],
    reply: 'Para precificação de peças 3D, use esta ordem: 1) Material = (peso em g ÷ 1000) × R$ 70,00/kg. 2) Energia = tempo em horas × 0,11 × R$ 1,05. 3) Custo Base = Material + Energia. 4) Manutenção = Custo Base × 0,05. 5) Custo Total = Custo Base + Manutenção. 6) Preço Final = Custo Total × 4. Exemplo (100g e 2h): Material R$ 7,00; Energia R$ 0,23; Manutenção R$ 0,36; Custo Total R$ 7,59; Preço de Venda R$ 30,36.'
  },
  {
    keywords: ['sublima', 'caneca', 'ceram', 'shrink'],
    reply: 'Para sublimação padrão em canecas e cerâmicas, a temperatura e tempo ideal é de 180°C por 180 segundos. Para problemas com encolhimento de shrink film, ajuste a compressão e a distribuição térmica no forno.'
  },
  {
    keywords: ['3d', 'impress', 'ader', 'bambu', 'primeira camada'],
    reply: 'Para problemas de aderência na primeira camada nas impressoras Bambu Lab A1 e A1 Mini, lave a chapa PEI com detergente neutro, seque bem e rode a calibração automática de nivelamento no Bambu Studio.'
  }
];

const NO_MATCH_REPLY = 'Não encontrei essa informação na base de conhecimento. Posso ajudar com horários, contato, catálogo, sublimação, impressão 3D e precificação.';

function buildFallbackReply(userPrompt) {
  const lowerPrompt = userPrompt.toLowerCase();
  const rule = rules.find(({ keywords }) => keywords.some((keyword) => lowerPrompt.includes(keyword)));
  return rule ? rule.reply : NO_MATCH_REPLY;
}

module.exports = { buildFallbackReply, NO_MATCH_REPLY };
