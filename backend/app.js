const express = require('express')
const cors = require('cors')

const app = express()
app.use(cors())
app.use(express.json())

app.get('/health', (req, res) => {
  res.json({ ok: true, servico: 'secretario-backend' })
})

app.use('/pagamentos', require('./src/routes/pagamentos'))
app.use('/chat', require('./src/routes/chat'))

module.exports = app
