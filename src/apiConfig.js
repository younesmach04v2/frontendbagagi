/**
 * Origine du backend Flask, sans chemin (ex: https://ton-api.railway.app).
 * En local, laisser vide : Vite proxy redirige /api vers localhost:5000.
 *
 * Sur Vercel : définir dans Project Settings → Environment Variables :
 *   VITE_API_BASE_URL = https://l-url-de-ton-backend.example.com
 */
export function getApiOrigin() {
  const v = import.meta.env.VITE_API_BASE_URL
  if (v != null && String(v).trim() !== '') return String(v).trim().replace(/\/$/, '')
  return ''
}

/** Base des routes API (/api/...) */
export function getApiBase() {
  const o = getApiOrigin()
  return o ? `${o}/api` : '/api'
}
