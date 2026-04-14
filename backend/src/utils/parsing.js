function emptyToNull(v) {
  if (v === undefined || v === null) return null
  const s = String(v).trim()
  return s === '' ? null : s
}

/**
 * Aceita formato BR (1.500,50), só vírgula decimal, ou ponto (US).
 */
function parseValorBR(raw) {
  const s = emptyToNull(raw)
  if (s === null) return null
  let t = String(raw).trim().replace(/\s/g, '')
  if (t.includes(',') && t.includes('.')) {
    t = t.replace(/\./g, '').replace(',', '.')
  } else if (t.includes(',')) {
    t = t.replace(',', '.')
  }
  const n = parseFloat(t)
  return Number.isFinite(n) ? n : null
}

function parseDateOnly(raw) {
  const s = emptyToNull(raw)
  if (s === null) return null
  const iso = /^\d{4}-\d{2}-\d{2}$/.test(s)
  if (iso) {
    const d = new Date(`${s}T12:00:00`)
    return Number.isNaN(d.getTime()) ? null : s
  }
  const br = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(s)
  if (br) {
    const [, dd, mm, yyyy] = br
    const pad = (x) => x.padStart(2, '0')
    return `${yyyy}-${pad(mm)}-${pad(dd)}`
  }
  const d = new Date(s)
  if (Number.isNaN(d.getTime())) return null
  return d.toISOString().slice(0, 10)
}

function parseDateTime(raw) {
  const s = emptyToNull(raw)
  if (s === null) return null
  const normalized = s.includes('T') ? s : s.replace(' ', 'T')
  const d = new Date(normalized.length === 16 ? `${normalized}:00` : normalized)
  if (Number.isNaN(d.getTime())) return null
  return d
}

module.exports = {
  emptyToNull,
  parseValorBR,
  parseDateOnly,
  parseDateTime,
}
