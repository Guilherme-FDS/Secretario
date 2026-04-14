const path = require('path')
const OpenAI = require('openai')

require('dotenv').config({ path: path.join(__dirname, '../../.env') })

const DEFAULT_BASE_URL = process.env.LLM_BASE_URL || 'http://secretario_openclaw:8080/v1'
const DEFAULT_MODEL = 'openai/gpt-4.1-mini'

let cachedClient = null
let cachedClientKey = null

function getApiKey() {
  return (
    process.env.OPENROUTER_API_KEY ||
    process.env.OPENROUTER_KEY ||
    ''
  ).trim()
}

function getLlmConfig() {
  return {
    apiKey: getApiKey(),
    baseURL: (process.env.LLM_BASE_URL || DEFAULT_BASE_URL).replace(/\/$/, ''),
    model: process.env.LLM_MODEL || DEFAULT_MODEL,
    siteUrl: process.env.LLM_SITE_URL || 'http://localhost:3000',
    appName: process.env.LLM_APP_NAME || 'Secretario',
    timeoutMs: Math.min(
      Math.max(Number(process.env.LLM_TIMEOUT_MS) || 60000, 5000),
      120000
    ),
  }
}

function getLlmClient() {
  const { apiKey, baseURL, siteUrl, appName, timeoutMs } = getLlmConfig()
  if (!apiKey) {
    cachedClient = null
    cachedClientKey = null
    return null
  }
  if (cachedClient && cachedClientKey === `${apiKey}|${baseURL}`) {
    return cachedClient
  }
  cachedClient = new OpenAI({
    apiKey,
    baseURL,
    maxRetries: 0,
    timeout: timeoutMs,
    defaultHeaders: {
      'HTTP-Referer': siteUrl,
      'X-Title': appName,
    },
  })
  cachedClientKey = `${apiKey}|${baseURL}`
  return cachedClient
}

function isLlmConfigured() {
  return Boolean(getApiKey())
}

function fmtMoney(v) {
  if (v == null || v === '') return null
  const n = Number(v)
  if (Number.isNaN(n)) return String(v)
  return n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

function fmtDate(d) {
  if (d == null || d === '') return null
  const x = d instanceof Date ? d : new Date(d)
  if (Number.isNaN(x.getTime())) return null
  return x.toLocaleDateString('pt-BR')
}

/**
 * Descrição determinística quando a IA não está disponível ou falha.
 */
function descricaoFallback(pagamento) {
  const fornecedor = pagamento.fornecedor || 'fornecedor não informado'
  const empresa = pagamento.empresa || 'empresa não informada'
  const valor = fmtMoney(pagamento.valor) || 'valor não informado'
  const venc = fmtDate(pagamento.data_vencimento) || 'data não informada'
  return `Pagamento lançado para o fornecedor ${fornecedor}, empresa ${empresa}, no valor de ${valor}, com vencimento em ${venc}.`
}

const SYSTEM_DESCRICAO = `Você é assistente financeiro de uma construtora (Brasil).
Regras:
- Uma única frase objetiva, tom profissional e claro.
- Use apenas os dados fornecidos; se algo não estiver informado, diga que não consta (não invente valores, datas ou nomes).
- Priorize gestão: o que é o pagamento, para quem, obra/centro de custo quando existir, e vencimento.
- Não use markdown nem listas; só texto corrido.`

async function gerarDescricao(pagamento) {
  const client = getLlmClient()
  if (!client) {
    return descricaoFallback(pagamento)
  }

  const { model } = getLlmConfig()
  const userPayload = [
    `Empresa: ${pagamento.empresa ?? 'não informado'}`,
    `Conta bancária: ${pagamento.conta_bancaria ?? 'não informado'}`,
    `Fornecedor: ${pagamento.fornecedor ?? 'não informado'}`,
    `Valor: ${fmtMoney(pagamento.valor) ?? 'não informado'}`,
    `Documento: ${pagamento.numero_documento ?? 'não informado'}`,
    `Emissão: ${fmtDate(pagamento.data_emissao) ?? 'não informado'}`,
    `Vencimento: ${fmtDate(pagamento.data_vencimento) ?? 'não informado'}`,
    `Tipo de origem: ${pagamento.tipo_origem ?? 'não informado'}`,
    `Obra: ${pagamento.obra ?? 'não informado'}`,
    `Centro de custo: ${pagamento.centro_custo ?? 'não informado'}`,
    `Obs. título: ${pagamento.observacao_titulo ?? 'não informado'}`,
    `Obs. contrato: ${pagamento.observacao_contrato ?? 'não informado'}`,
    `Obs. pedido: ${pagamento.observacao_pedido ?? 'não informado'}`,
    `Autorização: ${pagamento.usuario_autorizacao ?? 'não informado'}`,
  ].join('\n')

  try {
    const response = await client.chat.completions.create({
      model,
      temperature: 0.2,
      max_tokens: 220,
      messages: [
        { role: 'system', content: SYSTEM_DESCRICAO },
        {
          role: 'user',
          content: `Gere a descrição do pagamento com base nos dados:\n${userPayload}`,
        },
      ],
    })
    const text = response.choices?.[0]?.message?.content?.trim()
    if (!text) {
      logLlmError('gerarDescricao', new Error('Resposta vazia do modelo'), {
        model,
      })
      return descricaoFallback(pagamento)
    }
    return text
  } catch (err) {
    logLlmError('gerarDescricao', err, { model })
    return descricaoFallback(pagamento)
  }
}

function montarContextoPagamentos(pagamentos) {
  if (!pagamentos.length) {
    return '(Nenhum pagamento cadastrado no momento.)'
  }
  return pagamentos
    .map((p) => {
      const conta = p.conta_bancaria || p.conta || '—'
      const doc = p.numero_documento || '—'
      const desc = p.descricao_ia || p.observacao_titulo || '—'
      return [
        `ID ${p.id}`,
        `Empresa: ${p.empresa ?? '—'}`,
        `Fornecedor: ${p.fornecedor ?? '—'}`,
        `Valor: ${fmtMoney(p.valor) ?? '—'}`,
        `Documento: ${doc}`,
        `Conta: ${conta}`,
        `Tipo origem: ${p.tipo_origem ?? '—'}`,
        `Obra: ${p.obra ?? '—'}`,
        `Centro de custo: ${p.centro_custo ?? '—'}`,
        `Emissão: ${fmtDate(p.data_emissao) ?? '—'}`,
        `Vencimento: ${fmtDate(p.data_vencimento) ?? '—'}`,
        `Autorizado por: ${p.usuario_autorizacao ?? '—'}`,
        `Resumo/descrição: ${desc}`,
      ].join(' | ')
    })
    .join('\n')
}

const SYSTEM_CHAT = `Você é o assistente financeiro da plataforma Secretário, para uma construtora no Brasil.

Dados: você só pode usar as informações presentes no bloco DADOS DO SISTEMA abaixo. Não invente fornecedores, valores, datas, obras ou documentos.

Se a pergunta exigir dados que não estão no bloco, diga claramente que essa informação não consta nos dados importados e sugira o que o gestor pode verificar (ex.: ERP, equipe financeira).

Responda em português do Brasil: claro, objetivo e útil para decisão (cronograma, concentração de gastos, vencimentos, fornecedores). Valores em reais (R$) quando citar números.

Se não houver pagamentos cadastrados, informe isso e oriente a importar/atualizar os dados.`

/**
 * @returns {Promise<{ ok: boolean, resposta: string, fonte: 'ia'|'fallback', codigo?: string }>}
 */
async function responderChatComPagamentos(pergunta, pagamentos) {
  const trimmed = String(pergunta || '').trim()
  if (!trimmed) {
    return {
      ok: false,
      resposta: 'Envie uma pergunta para que eu possa ajudar.',
      fonte: 'fallback',
      codigo: 'PERGUNTA_VAZIA',
    }
  }

  if (!isLlmConfigured()) {
    return {
      ok: true,
      resposta:
        'O assistente de IA não está configurado (defina OPENROUTER_API_KEY no ambiente). Você pode continuar usando o sistema e consultando os pagamentos nas telas e relatórios.',
      fonte: 'fallback',
      codigo: 'NO_API_KEY',
    }
  }

  const client = getLlmClient()
  const { model } = getLlmConfig()
  const contexto = montarContextoPagamentos(pagamentos)

  try {
    const response = await client.chat.completions.create({
      model,
      temperature: 0.25,
      max_tokens: 900,
      messages: [
        {
          role: 'system',
          content: `${SYSTEM_CHAT}

DADOS DO SISTEMA (fonte única de verdade):
${contexto}`,
        },
        { role: 'user', content: trimmed },
      ],
    })
    const text = response.choices?.[0]?.message?.content?.trim()
    if (!text) {
      logLlmError('chat', new Error('Resposta vazia do modelo'), { model })
      return respostaFallbackChat('RESPOSTA_VAZIA')
    }
    return { ok: true, resposta: text, fonte: 'ia' }
  } catch (err) {
    logLlmError('chat', err, { model })
    return respostaFallbackChat(codigoErroAmigavel(err))
  }
}

function respostaFallbackChat(codigo) {
  const porCodigo = {
    QUOTA:
      'O assistente de IA não respondeu: cota ou saldo do provedor esgotado. Verifique sua conta na OpenRouter e os limites do modelo. Os pagamentos cadastrados seguem disponíveis nas telas do sistema.',
    RATE_LIMIT:
      'O assistente de IA está temporariamente limitado (muitas requisições). Aguarde um momento e tente de novo. Os dados de pagamentos continuam disponíveis normalmente.',
    TIMEOUT:
      'A resposta do assistente de IA demorou demais e foi cancelada. Tente uma pergunta mais curta ou tente novamente em instantes.',
    PROVEDOR_INDISPONIVEL:
      'O provedor de IA está indisponível no momento. Tente novamente mais tarde; seus dados de pagamentos não foram afetados.',
    RESPOSTA_VAZIA:
      'O assistente retornou uma resposta vazia. Reformule a pergunta ou tente novamente.',
    ERRO_LLM:
      'Não foi possível obter uma resposta do assistente de IA. Tente novamente em instantes.',
  }
  const base =
    'Não foi possível obter uma resposta do assistente de IA no momento. Os dados de pagamentos continuam disponíveis no sistema; verifique a chave OpenRouter (OPENROUTER_API_KEY) e a conexão.'
  return {
    ok: true,
    resposta: porCodigo[codigo] || base,
    fonte: 'fallback',
    codigo: codigo || 'LLM_INDISPONIVEL',
  }
}

function codigoErroAmigavel(err) {
  const status = err?.status ?? err?.response?.status
  const msg = String(err?.message || '').toLowerCase()
  if (status === 429 || msg.includes('429') || msg.includes('rate limit')) {
    return 'RATE_LIMIT'
  }
  if (status === 402 || msg.includes('quota') || msg.includes('insufficient')) {
    return 'QUOTA'
  }
  if (
    err?.code === 'ETIMEDOUT' ||
    err?.code === 'ECONNRESET' ||
    msg.includes('timeout')
  ) {
    return 'TIMEOUT'
  }
  if (status >= 500 || msg.includes('gateway')) {
    return 'PROVEDOR_INDISPONIVEL'
  }
  return 'ERRO_LLM'
}

function logLlmError(contexto, err, extra = {}) {
  const status = err?.status ?? err?.response?.status
  const type = err?.type || err?.code
  const msg = err?.message || err
  console.error(
    `[IA:${contexto}] falha`,
    JSON.stringify({
      status,
      type,
      message: String(msg).slice(0, 500),
      ...extra,
    })
  )
}

module.exports = {
  getLlmConfig,
  getLlmClient,
  isLlmConfigured,
  gerarDescricao,
  descricaoFallback,
  responderChatComPagamentos,
  montarContextoPagamentos,
  fmtMoney,
  fmtDate,
  logLlmError,
}
