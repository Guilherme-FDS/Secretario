const express = require('express')
const router = express.Router()
const pool = require('../config/database')
const { responderChatComPagamentos } = require('../services/ia')

router.post('/', async (req, res) => {
  const { pergunta } = req.body

  if (!pergunta || !String(pergunta).trim()) {
    return res.status(400).json({ erro: 'Pergunta não informada' })
  }

  try {
    const result = await pool.query(
      'SELECT * FROM pagamentos ORDER BY data_vencimento ASC NULLS LAST, id ASC'
    )
    const pagamentos = result.rows

    const out = await responderChatComPagamentos(pergunta, pagamentos)

    res.json({
      resposta: out.resposta,
      fonte: out.fonte,
      ...(out.codigo ? { codigo: out.codigo } : {}),
    })
  } catch (err) {
    console.error('[chat] erro não-IA:', err)
    res.status(500).json({
      erro: 'Não foi possível carregar os dados de pagamentos. Tente novamente.',
    })
  }
})

module.exports = router
