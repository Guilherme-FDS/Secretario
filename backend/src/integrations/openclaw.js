/**
 * Placeholder para integração futura com OpenClaw (gateway local).
 * Não utilizado pelo pipeline CSV → PostgreSQL.
 *
 * Quando implementar: chamar o gateway (ex.: http://openclaw:5000) com contexto
 * dos pagamentos e políticas do Secretário.
 */
function isOpenClawEnabled() {
  return process.env.OPENCLAW_ENABLED === '1'
}

module.exports = { isOpenClawEnabled }
