const fs = require('fs')
const csv = require('csv-parser')
const pool = require('../config/database')
const {
  emptyToNull,
  parseValorBR,
  parseDateOnly,
  parseDateTime,
} = require('../utils/parsing')
const { descricaoFallback } = require('./ia')

function contaBancariaDe(row) {
  return (
    emptyToNull(row.conta_bancaria) ||
    emptyToNull(row.conta) ||
    null
  )
}

function numeroDocumentoDe(row) {
  return emptyToNull(row.numero_documento)
}

function mapRawRow(raw, lineNumber) {
  const err = []
  const valor = parseValorBR(raw.valor)
  if (raw.valor != null && String(raw.valor).trim() !== '' && valor === null) {
    err.push(`linha ${lineNumber}: valor inválido (${raw.valor})`)
  }
  const data_emissao = parseDateOnly(raw.data_emissao)
  if (
    raw.data_emissao != null &&
    String(raw.data_emissao).trim() !== '' &&
    data_emissao === null
  ) {
    err.push(`linha ${lineNumber}: data_emissao inválida`)
  }
  const data_vencimento = parseDateOnly(raw.data_vencimento)
  if (
    raw.data_vencimento != null &&
    String(raw.data_vencimento).trim() !== '' &&
    data_vencimento === null
  ) {
    err.push(`linha ${lineNumber}: data_vencimento inválida`)
  }
  const rawAuth = raw.data_autorizacao
  const data_autorizacao = parseDateTime(rawAuth)
  if (rawAuth != null && String(rawAuth).trim() !== '' && data_autorizacao === null) {
    err.push(`linha ${lineNumber}: data_autorizacao inválida`)
  }

  if (err.length) return { ok: false, errors: err }

  return {
    ok: true,
    data: {
      empresa: emptyToNull(raw.empresa),
      conta_bancaria: contaBancariaDe(raw),
      fornecedor: emptyToNull(raw.fornecedor),
      valor,
      data_emissao,
      data_vencimento,
      numero_documento: numeroDocumentoDe(raw),
      tipo_origem: emptyToNull(raw.tipo_origem),
      usuario_lancamento: emptyToNull(raw.usuario_lancamento),
      usuario_autorizacao: emptyToNull(raw.usuario_autorizacao),
      data_autorizacao,
      observacao_titulo: emptyToNull(raw.observacao_titulo),
      observacao_contrato: emptyToNull(raw.observacao_contrato),
      observacao_pedido: emptyToNull(raw.observacao_pedido),
      obra: emptyToNull(raw.obra),
      centro_custo: emptyToNull(raw.centro_custo),
    },
  }
}

function linhaVazia(raw) {
  const vals = Object.values(raw).map((v) =>
    v === undefined || v === null ? '' : String(v).trim()
  )
  return vals.every((v) => v === '')
}

async function existeDuplicado(client, row) {
  const doc = row.numero_documento
  if (doc) {
    const r = await client.query(
      `SELECT 1 FROM pagamentos
       WHERE empresa IS NOT DISTINCT FROM $1 AND btrim(numero_documento) = $2
       LIMIT 1`,
      [row.empresa, doc]
    )
    return r.rowCount > 0
  }
  const r = await client.query(
    `SELECT 1 FROM pagamentos
     WHERE empresa IS NOT DISTINCT FROM $1
       AND fornecedor IS NOT DISTINCT FROM $2
       AND valor IS NOT DISTINCT FROM $3
       AND data_emissao IS NOT DISTINCT FROM $4::date
       AND data_vencimento IS NOT DISTINCT FROM $5::date
       AND (numero_documento IS NULL OR btrim(numero_documento) = '')
     LIMIT 1`,
    [
      row.empresa,
      row.fornecedor,
      row.valor,
      row.data_emissao,
      row.data_vencimento,
    ]
  )
  return r.rowCount > 0
}

function parseCsvFile(filePath) {
  return new Promise((resolve, reject) => {
    const rows = []
    fs.createReadStream(filePath)
      .on('error', reject)
      .pipe(csv())
      .on('data', (data) => rows.push(data))
      .on('end', () => resolve(rows))
      .on('error', reject)
  })
}

async function importFromPath(filePath) {
  try {
    await fs.promises.access(filePath, fs.constants.R_OK)
  } catch {
    const e = new Error(`Arquivo CSV não encontrado ou sem permissão: ${filePath}`)
    e.code = 'ENOENT'
    throw e
  }

  const rawRows = await parseCsvFile(filePath)
  const parsed = []
  const preErrors = []

  rawRows.forEach((raw, i) => {
    const lineNumber = i + 2
    if (linhaVazia(raw)) return
    const m = mapRawRow(raw, lineNumber)
    if (!m.ok) preErrors.push(...m.errors)
    else parsed.push(m.data)
  })

  if (preErrors.length) {
    return {
      status: 'erro',
      mensagem: 'Validação do CSV falhou; nenhum registro foi importado.',
      erros: preErrors,
      importados: 0,
      duplicados: 0,
      totalLinhasArquivo: rawRows.length,
      linhasProcessaveis: parsed.length,
    }
  }

  const client = await pool.connect()
  let importados = 0
  let duplicados = 0

  try {
    await client.query('BEGIN')

    for (const row of parsed) {
      if (await existeDuplicado(client, row)) {
        duplicados++
        continue
      }

      // Importação não chama LLM (rápido e estável); descrição sintética com dados reais.
      const descricao_ia = descricaoFallback(row)

      await client.query(
        `INSERT INTO pagamentos (
          empresa, conta_bancaria, fornecedor, valor,
          data_emissao, data_vencimento, numero_documento,
          tipo_origem, usuario_lancamento, usuario_autorizacao, data_autorizacao,
          observacao_titulo, observacao_contrato, observacao_pedido,
          obra, centro_custo, descricao_ia
        ) VALUES (
          $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17
        )`,
        [
          row.empresa,
          row.conta_bancaria,
          row.fornecedor,
          row.valor,
          row.data_emissao,
          row.data_vencimento,
          row.numero_documento,
          row.tipo_origem,
          row.usuario_lancamento,
          row.usuario_autorizacao,
          row.data_autorizacao,
          row.observacao_titulo,
          row.observacao_contrato,
          row.observacao_pedido,
          row.obra,
          row.centro_custo,
          descricao_ia,
        ]
      )
      importados++
    }

    await client.query('COMMIT')
  } catch (e) {
    await client.query('ROLLBACK').catch(() => {})
    throw e
  } finally {
    client.release()
  }

  return {
    status: 'ok',
    mensagem: 'Importação concluída.',
    importados,
    duplicados,
    totalLinhasArquivo: rawRows.length,
    linhasProcessaveis: parsed.length,
  }
}

module.exports = { importFromPath, mapRawRow }
