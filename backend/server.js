const path = require('path')

require('dotenv').config({ path: path.join(__dirname, '.env') })

const app = require('./app')
const pool = require('./src/config/database')
const { waitForDb } = require('./src/config/waitForDb')

const PORT = process.env.PORT || 3000

async function start() {
  try {
    await waitForDb(pool)
  } catch (e) {
    console.error('[db] Falha ao conectar:', e.message)
    process.exit(1)
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Servidor rodando na porta ${PORT}`)
  })
}

start()
