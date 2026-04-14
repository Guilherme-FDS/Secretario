const pool = require('../config/database')
const { importFromPath } = require('../services/importPagamentosService')
const { csvPagamentosPath } = require('../utils/csvPagamentosPath')

async function listar(req, res) {
  try {
    const result = await pool.query(
      'SELECT * FROM pagamentos ORDER BY data_vencimento ASC NULLS LAST, id ASC'
    )
    res.json(result.rows)
  } catch (err) {
    console.error(err)
    res.status(500).json({ erro: 'Erro ao buscar pagamentos' })
  }
}

async function importar(req, res) {
  try {
    const resultado = await importFromPath(csvPagamentosPath())
    if (resultado.status === 'erro') {
      return res.status(400).json(resultado)
    }
    res.json(resultado)
  } catch (err) {
    console.error(err)
    if (err.code === 'ENOENT') {
      return res.status(400).json({
        status: 'erro',
        mensagem: err.message,
        importados: 0,
        duplicados: 0,
      })
    }
    res.status(500).json({
      status: 'erro',
      mensagem: err.message || 'Erro ao importar pagamentos',
      importados: 0,
      duplicados: 0,
    })
  }
}

async function limpar(req, res) {
  try {
    await pool.query('DELETE FROM pagamentos')
    res.json({ mensagem: 'Tabela limpa com sucesso!' })
  } catch (err) {
    console.error(err)
    res.status(500).json({ erro: 'Erro ao limpar tabela' })
  }
}

module.exports = { listar, importar, limpar }
