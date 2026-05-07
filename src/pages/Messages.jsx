import { useState, useEffect, useCallback, useRef } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { api } from '../api'
import { useToast } from '../context/ToastContext'
import { useAuth } from '../context/AuthContext'

import ChatOutlinedIcon from '@mui/icons-material/ChatOutlined'
import SendOutlinedIcon from '@mui/icons-material/SendOutlined'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import PersonOutlinedIcon from '@mui/icons-material/PersonOutlined'

const POLL_MS = 3500

export default function Messages() {
  const { user } = useAuth()
  const { toast } = useToast()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const withIdParam = searchParams.get('with')
  const selectedId = withIdParam ? parseInt(withIdParam, 10) : null

  const [isNarrow, setIsNarrow] = useState(false)
  const [partners, setPartners] = useState([])
  const [thread, setThread] = useState(null)
  const [loadingPartners, setLoadingPartners] = useState(true)
  const [loadingThread, setLoadingThread] = useState(false)
  const [sending, setSending] = useState(false)
  const [draft, setDraft] = useState('')
  const [showListMobile, setShowListMobile] = useState(true)
  const listEndRef = useRef(null)

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 700px)')
    const apply = () => setIsNarrow(mq.matches)
    apply()
    mq.addEventListener('change', apply)
    return () => mq.removeEventListener('change', apply)
  }, [])

  useEffect(() => {
    if (!isNarrow) return
    setShowListMobile(!selectedId)
  }, [selectedId, isNarrow])

  const loadPartners = useCallback(async () => {
    setLoadingPartners(true)
    try {
      const rows = await api.get('/messages/partners')
      setPartners(rows)
    } catch (e) {
      toast(e.message, 'error')
    } finally {
      setLoadingPartners(false)
    }
  }, [toast])

  const loadThread = useCallback(async (uid) => {
    if (!uid || Number.isNaN(uid)) return
    setLoadingThread(true)
    try {
      const data = await api.get(`/messages/with/${uid}`)
      setThread(data)
    } catch (e) {
      toast(e.message, 'error')
      setThread(null)
    } finally {
      setLoadingThread(false)
    }
  }, [toast])

  useEffect(() => { loadPartners() }, [loadPartners])

  useEffect(() => {
    if (!selectedId) {
      setThread(null)
      return
    }
    loadThread(selectedId)
  }, [selectedId, loadThread])

  useEffect(() => {
    if (!selectedId || !thread) return
    const t = setInterval(() => loadThread(selectedId), POLL_MS)
    return () => clearInterval(t)
  }, [selectedId, loadThread, thread?.messages?.length])

  useEffect(() => {
    listEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [thread?.messages])

  function selectPartner(pid) {
    setSearchParams({ with: String(pid) })
    if (isNarrow) setShowListMobile(false)
    loadThread(pid)
  }

  function backToList() {
    setSearchParams({})
    setThread(null)
    if (isNarrow) setShowListMobile(true)
  }

  async function send() {
    const text = draft.trim()
    if (!text || !selectedId) return
    setSending(true)
    try {
      await api.post('/messages', { recipient_id: selectedId, body: text })
      setDraft('')
      await loadThread(selectedId)
      loadPartners()
    } catch (e) {
      toast(e.message, 'error')
    } finally {
      setSending(false)
    }
  }

  const showList = !isNarrow || showListMobile
  const showThread = !isNarrow || !showListMobile

  return (
    <div className="page" style={{ paddingTop: 96, minHeight: '100vh' }}>
      <div className="container" style={{ maxWidth: 1100 }}>
        <div style={{ marginBottom: 20 }}>
          <div className="section-tag" style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <ChatOutlinedIcon style={{ fontSize: '1rem' }} /> Messagerie
          </div>
          <h2 style={{ marginTop: 8 }}>Échanges avec les {user?.role === 'etudiant' ? 'conducteurs' : 'étudiants'}</h2>
          <p style={{ fontSize: '0.9rem', color: 'var(--mid-grey)' }}>
            Discutez uniquement avec les personnes liées à une de vos offres ou réservations.
          </p>
        </div>

        <div
          style={{
            display: isNarrow ? 'block' : 'grid',
            gridTemplateColumns: isNarrow ? undefined : 'minmax(260px, 320px) 1fr',
            gap: 0,
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--border-subtle)',
            overflow: 'hidden',
            minHeight: 440,
            background: 'var(--surface-1)',
          }}
        >
          {/* Partner list */}
          {showList && (
            <aside
              style={{
                borderRight: isNarrow ? 'none' : '1px solid var(--border-subtle)',
                borderBottom: isNarrow ? '1px solid var(--border-subtle)' : 'none',
                display: 'flex',
                flexDirection: 'column',
                maxHeight: isNarrow ? 320 : '70vh',
                minHeight: isNarrow ? 200 : 360,
              }}
            >
              <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--border-subtle)', fontWeight: 700, fontSize: '0.88rem' }}>
                Conversations
              </div>
              <div style={{ overflowY: 'auto', flex: 1 }}>
                {loadingPartners && (
                  <div style={{ padding: 20, color: 'var(--mid-grey)', fontSize: '0.85rem' }}>Chargement…</div>
                )}
                {!loadingPartners && partners.length === 0 && (
                  <div style={{ padding: 20, fontSize: '0.85rem', color: 'var(--mid-grey)' }}>
                    Aucun contact pour l’instant. Une offre ou une réservation A/R débloque la messagerie.
                  </div>
                )}
                {partners.map(p => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => selectPartner(p.id)}
                    style={{
                      width: '100%',
                      textAlign: 'left',
                      padding: '12px 16px',
                      border: 'none',
                      borderBottom: '1px solid var(--border-subtle)',
                      background: selectedId === p.id ? 'var(--emerald-glow)' : 'transparent',
                      cursor: 'pointer',
                      color: 'inherit',
                      fontFamily: 'inherit',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div className="avatar avatar-sm" style={{ flexShrink: 0 }}>
                        {p.prenom?.[0]}{p.nom?.[0]}
                      </div>
                      <div style={{ minWidth: 0, flex: 1 }}>
                        <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{p.label}</div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--mid-grey)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {p.last_body || p.context_hint || '…'}
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </aside>
          )}

          {/* Thread */}
          {showThread && (
            <section
              style={{
                display: 'flex',
                flexDirection: 'column',
                maxHeight: isNarrow ? 'none' : '70vh',
                minHeight: isNarrow ? 400 : 360,
              }}
            >
              {!selectedId && (
                <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--mid-grey)', padding: 24, textAlign: 'center' }}>
                  Choisissez une conversation ou ouvrez une discussion depuis une offre / réservation.
                </div>
              )}

              {selectedId && (
                <>
                  <div
                    style={{
                      padding: '12px 16px',
                      borderBottom: '1px solid var(--border-subtle)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                    }}
                  >
                    {isNarrow && (
                      <button type="button" className="btn btn-ghost btn-sm" style={{ padding: 8, minWidth: 0 }} onClick={backToList} aria-label="Retour">
                        <ArrowBackIcon />
                      </button>
                    )}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1, minWidth: 0 }}>
                      <PersonOutlinedIcon style={{ color: 'var(--emerald)' }} />
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontWeight: 700 }}>{thread?.other?.label || '…'}</div>
                        {thread?.context_hint && (
                          <div style={{ fontSize: '0.78rem', color: 'var(--mid-grey)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {thread.context_hint}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div style={{ flex: 1, overflowY: 'auto', padding: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {loadingThread && !thread && <div style={{ color: 'var(--mid-grey)', fontSize: '0.85rem' }}>Chargement…</div>}
                    {(thread?.messages || []).map(m => {
                      const mine = m.sender_id === user?.id
                      return (
                        <div
                          key={m.id}
                          style={{
                            alignSelf: mine ? 'flex-end' : 'flex-start',
                            maxWidth: 'min(85%, 520px)',
                            padding: '10px 14px',
                            borderRadius: 'var(--radius-md)',
                            background: mine ? 'var(--emerald)' : 'var(--surface-2, rgba(255,255,255,0.06))',
                            color: mine ? '#fff' : 'inherit',
                            fontSize: '0.9rem',
                            lineHeight: 1.45,
                            whiteSpace: 'pre-wrap',
                            wordBreak: 'break-word',
                          }}
                        >
                          {m.body}
                          <div
                            style={{
                              fontSize: '0.68rem',
                              opacity: 0.75,
                              marginTop: 6,
                              textAlign: mine ? 'right' : 'left',
                            }}
                          >
                            {new Date(m.created_at).toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' })}
                          </div>
                        </div>
                      )
                    })}
                    <div ref={listEndRef} />
                  </div>

                  <div style={{ padding: 12, borderTop: '1px solid var(--border-subtle)', display: 'flex', gap: 10, alignItems: 'flex-end' }}>
                    <textarea
                      className="form-input"
                      rows={2}
                      placeholder="Votre message…"
                      value={draft}
                      onChange={e => setDraft(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault()
                          send()
                        }
                      }}
                      style={{ flex: 1, resize: 'none', minHeight: 44 }}
                    />
                    <button
                      type="button"
                      className="btn btn-primary"
                      disabled={sending || !draft.trim()}
                      onClick={send}
                      style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}
                    >
                      <SendOutlinedIcon style={{ fontSize: '1.1rem' }} />
                      Envoyer
                    </button>
                  </div>
                </>
              )}
            </section>
          )}
        </div>

        <button
          type="button"
          className="btn btn-ghost"
          style={{ marginTop: 20 }}
          onClick={() => navigate(user?.role === 'chauffeur' ? '/driver' : '/student')}
        >
          ← Retour à mon espace
        </button>
      </div>
    </div>
  )
}
