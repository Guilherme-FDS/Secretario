const path = require('path')

function csvPagamentosPath() {
  if (process.env.PAGAMENTOS_CSV_PATH) {
    return path.resolve(process.env.PAGAMENTOS_CSV_PATH)
  }
  return path.join(__dirname, '../../data/pagamentos.csv')
}

module.exports = { csvPagamentosPath }
