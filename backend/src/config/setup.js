const path = require('path')
const pool = require('./database')

require('dotenv').config({ path: path.join(__dirname, '../../.env') })

async function migrateLegacyColumns(client) {
  const { rows } = await client.query(`
    SELECT column_name
    FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'pagamentos'
  `)
  const names = new Set(rows.map((r) => r.column_name))
  if (names.has('conta') && !names.has('conta_bancaria')) {
    await client.query(`ALTER TABLE pagamentos RENAME COLUMN conta TO conta_bancaria`)
  }
  if (names.has('criado_em') && !names.has('created_at')) {
    await client.query(`ALTER TABLE pagamentos RENAME COLUMN criado_em TO created_at`)
  }
}

async function ensureColumns(client) {
  const add = async (sql) => {
    try {
      await client.query(sql)
    } catch (e) {
      if (e.code !== '42701') throw e
    }
  }
  await add(
    `ALTER TABLE pagamentos ADD COLUMN IF NOT EXISTS conta_bancaria TEXT`
  )
  await add(`ALTER TABLE pagamentos ADD COLUMN IF NOT EXISTS numero_documento TEXT`)
  await add(`ALTER TABLE pagamentos ADD COLUMN IF NOT EXISTS usuario_lancamento TEXT`)
  await add(
    `ALTER TABLE pagamentos ADD COLUMN IF NOT EXISTS usuario_autorizacao TEXT`
  )
  await add(
    `ALTER TABLE pagamentos ADD COLUMN IF NOT EXISTS data_autorizacao TIMESTAMPTZ`
  )
  await add(`ALTER TABLE pagamentos ADD COLUMN IF NOT EXISTS observacao_titulo TEXT`)
  await add(`ALTER TABLE pagamentos ADD COLUMN IF NOT EXISTS observacao_contrato TEXT`)
  await add(`ALTER TABLE pagamentos ADD COLUMN IF NOT EXISTS observacao_pedido TEXT`)
  await add(`ALTER TABLE pagamentos ADD COLUMN IF NOT EXISTS obra TEXT`)
  await add(`ALTER TABLE pagamentos ADD COLUMN IF NOT EXISTS centro_custo TEXT`)
  await add(`ALTER TABLE pagamentos ADD COLUMN IF NOT EXISTS descricao_ia TEXT`)
  await add(
    `ALTER TABLE pagamentos ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()`
  )
}

async function setup() {
  const client = await pool.connect()
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS pagamentos (
        id SERIAL PRIMARY KEY,
        empresa TEXT,
        conta_bancaria TEXT,
        fornecedor TEXT,
        valor NUMERIC(15, 2),
        data_emissao DATE,
        data_vencimento DATE,
        numero_documento TEXT,
        tipo_origem TEXT,
        usuario_lancamento TEXT,
        usuario_autorizacao TEXT,
        data_autorizacao TIMESTAMPTZ,
        observacao_titulo TEXT,
        observacao_contrato TEXT,
        observacao_pedido TEXT,
        obra TEXT,
        centro_custo TEXT,
        descricao_ia TEXT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `)
    await migrateLegacyColumns(client)
    await ensureColumns(client)

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_pagamentos_vencimento ON pagamentos (data_vencimento);
      CREATE INDEX IF NOT EXISTS idx_pagamentos_empresa ON pagamentos (empresa);
      CREATE INDEX IF NOT EXISTS idx_pagamentos_fornecedor ON pagamentos (fornecedor);
      CREATE INDEX IF NOT EXISTS idx_pagamentos_obra ON pagamentos (obra)
    `)

    console.log('✅ Schema pagamentos OK')
  } catch (err) {
    console.error('❌ Setup:', err.message)
    process.exitCode = 1
  } finally {
    client.release()
    await pool.end()
  }
}

setup()
