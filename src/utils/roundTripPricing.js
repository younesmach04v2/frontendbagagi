/** Max bookable kg in 10 kg steps (cannot exceed what the driver offers). */
export function maxBookableKg(kgRemaining) {
  const n = Number(kgRemaining) || 0
  return Math.floor(n / 10) * 10
}

/** [10, 20, …, maxBookableKg] */
export function kgOptions(kgRemaining) {
  const max = maxBookableKg(kgRemaining)
  const out = []
  for (let k = 10; k <= max; k += 10) out.push(k)
  return out
}

/** Total DH = (kg / 10) × price per 10 kg */
export function totalForKg(pricePer10kg, kg) {
  const p = Number(pricePer10kg) || 0
  const k = Number(kg) || 0
  return Math.round((k / 10) * p * 100) / 100
}
