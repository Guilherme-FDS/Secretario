const express = require('express')
const router = express.Router()
const controller = require('../controllers/pagamentosController')

router.get('/', controller.listar)
router.post('/importar', controller.importar)
router.delete('/limpar', controller.limpar)

module.exports = router
