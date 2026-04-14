const path = require('path')
const { Pool } = require('pg')

require('dotenv').config({ path: path.join(__dirname, '../../.env') })

const connectionString =
  process.env.DATABASE_URL ||
  'postgres://admin:admin123@localhost:5432/secretario'

if (!process.env.DATABASE_URL) {
  console.warn(
    '[db] DATABASE_URL não definida; usando fallback local (desenvolvimento).'
  )
}

const pool = new Pool({
  connectionString,
  max: Number(process.env.PG_POOL_MAX || 20),
  idleTimeoutMillis: 30_000,
  connectionTimeoutMillis: 15_000,
})

module.exports = pool
