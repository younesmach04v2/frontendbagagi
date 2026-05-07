import { useToast } from '../context/ToastContext'

const ICONS = { success: '✅', error: '❌', info: 'ℹ️', warning: '⚠️' }

export default function Toast() {
  const { toasts } = useToast()

  if (!toasts.length) return null

  return (
    <div className="toast-container">
      {toasts.map(t => (
        <div key={t.id} className="toast">
          <span>{ICONS[t.type] || '💬'}</span> {t.message}
        </div>
      ))}
    </div>
  )
}
