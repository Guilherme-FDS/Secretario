/**
 * Aguarda PostgreSQL aceitar conexões (útil na subida do Docker).
 */
async function waitForDb(pool, options = {}) {
  const maxAttempts = options.maxAttempts ?? 40
  const delayMs = options.delayMs ?? 1000
  let lastErr
  for (let i = 0; i < maxAttempts; i++) {
    try {
      const c = await pool.connect()
      try {
        await c.query('SELECT 1')
      } finally {
        c.release()
      }
      if (i > 0) console.log('[db] PostgreSQL disponível.')
      return
    } catch (err) {
      lastErr = err
      console.warn(
        `[db] aguardando PostgreSQL (${i + 1}/${maxAttempts})… ${err.code || err.message}`
      )
      await new Promise((r) => setTimeout(r, delayMs))
    }
  }
  throw lastErr || new Error('PostgreSQL indisponível')
}

module.exports = { waitForDb }
