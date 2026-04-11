import { useState, useEffect, useCallback, useRef } from 'react'
import { supabase } from './lib/supabase'
import { getOrCreateUser, rerollName, saveCustomName, NOTE_COLORS, INTEREST_TAGS, ANIMALS, ADJECTIVES } from './lib/identity'
import { runDailySeed, seedForCategory, seedForCity } from './lib/aiSeeder'
import { moderateText } from './lib/moderation'
import { encryptMessage, decryptMessage, isEncrypted, canDecrypt } from './lib/crypto'
import { formatDistanceToNow } from 'date-fns'
import './App.css'

const COUNTRIES   = ['India','USA','UK','Canada','Australia','Germany','Japan','Brazil','France','Other']
const INDIA_STATES = ['Rajasthan','Maharashtra','Delhi','Karnataka','Tamil Nadu','Gujarat','UP','Other']

const CITIES_BY_STATE = {
  'Rajasthan': ['Jaipur','Jodhpur','Bikaner','Udaipur','Jaisalmer','Kota','Ajmer','Pushkar','Other'],
  'Maharashtra': ['Mumbai','Pune','Nagpur','Nashik','Aurangabad','Thane','Other'],
  'Delhi': ['New Delhi','Noida','Gurgaon','Faridabad','Dwarka','Other'],
  'Karnataka': ['Bengaluru','Mysuru','Hubli','Mangaluru','Bellary','Other'],
  'Tamil Nadu': ['Chennai','Coimbatore','Madurai','Salem','Tiruchirappalli','Other'],
  'Gujarat': ['Ahmedabad','Surat','Vadodara','Rajkot','Gandhinagar','Other'],
  'UP': ['Lucknow','Kanpur','Agra','Varanasi','Prayagraj','Mathura','Other'],
  'Other': [],
}

const CITIES_BY_COUNTRY = {
  'USA': ['New York','Los Angeles','Chicago','Houston','San Francisco','Seattle','Austin','Other'],
  'UK': ['London','Manchester','Birmingham','Edinburgh','Bristol','Leeds','Other'],
  'Canada': ['Toronto','Vancouver','Montreal','Calgary','Ottawa','Other'],
  'Australia': ['Sydney','Melbourne','Brisbane','Perth','Adelaide','Other'],
  'Germany': ['Berlin','Munich','Hamburg','Frankfurt','Cologne','Other'],
  'Japan': ['Tokyo','Osaka','Kyoto','Yokohama','Sapporo','Other'],
  'Brazil': ['São Paulo','Rio de Janeiro','Brasília','Salvador','Fortaleza','Other'],
  'France': ['Paris','Lyon','Marseille','Toulouse','Nice','Other'],
  'Other': [],
}

// ── GLOBE LOGO (header) ──────────────────────────────────────────────────────
function GlobeLogo() {
  return (
    <div className="globe-wrap">
      <div className="globe-svg-wrap">
        <svg viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg" style={{width:'100%',height:'100%'}}>
          <defs><clipPath id="circ"><circle cx="30" cy="30" r="30"/></clipPath></defs>
          <g clipPath="url(#circ)">
            <rect x="0"  y="0"  width="30" height="30" fill="#F5C842"/>
            <rect x="30" y="0"  width="30" height="30" fill="#5BAEE0"/>
            <rect x="0"  y="30" width="30" height="30" fill="#4DC9A8"/>
            <rect x="30" y="30" width="30" height="30" fill="#F07A52"/>
            <path d="M0 0 L10 0 L0 10 Z"   fill="rgba(255,255,255,0.35)"/>
            <path d="M60 0 L50 0 L60 10 Z"  fill="rgba(255,255,255,0.25)"/>
            <path d="M0 60 L10 60 L0 50 Z"  fill="rgba(255,255,255,0.2)"/>
            <path d="M60 60 L50 60 L60 50 Z" fill="rgba(255,255,255,0.2)"/>
            <line x1="30" y1="0"  x2="30" y2="60" stroke="rgba(255,255,255,0.65)" strokeWidth="1.5"/>
            <line x1="0"  y1="30" x2="60" y2="30" stroke="rgba(255,255,255,0.65)" strokeWidth="1.5"/>
            <path d="M8 8 Q14 5 18 9 Q20 15 16 18 Q10 19 8 14Z"   fill="rgba(255,255,255,0.35)"/>
            <path d="M10 18 Q13 17 14 21 Q12 25 9 23Z"             fill="rgba(255,255,255,0.28)"/>
            <path d="M33 6 Q41 4 45 9 Q47 15 42 17 Q36 17 33 12Z"  fill="rgba(255,255,255,0.3)"/>
            <path d="M45 10 Q51 8 55 13 Q54 19 49 18 Q45 16 45 10Z" fill="rgba(255,255,255,0.22)"/>
            <path d="M10 34 Q16 32 18 38 Q17 46 12 47 Q8 44 9 38Z"  fill="rgba(255,255,255,0.3)"/>
            <path d="M34 34 Q40 32 43 37 Q44 45 39 49 Q34 48 33 42Z" fill="rgba(255,255,255,0.28)"/>
            <ellipse cx="20" cy="16" rx="12" ry="8" fill="rgba(255,255,255,0.1)"/>
          </g>
          <circle cx="30" cy="30" r="29" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="1.5"/>
        </svg>
      </div>
      <div className="globe-pin">📌</div>
    </div>
  )
}

// ── WORLD MAP WATERCOLOR SPLASH (behind title) ───────────────────────────────
function WorldMapSplash() {
  return (
    <svg className="worldmap-splash" viewBox="0 0 320 100" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <filter id="wm-blur"><feGaussianBlur stdDeviation="2.5"/></filter>
        <filter id="wm-blur2"><feGaussianBlur stdDeviation="1.5"/></filter>
      </defs>
      <path d="M4 18 C8 12,20 8,40 10 C80 6,120 8,160 9 C200 7,250 8,280 11 C300 13,316 18,318 28 C320 42,318 62,314 72 C310 84,295 90,270 90 C230 92,180 91,140 91 C100 91,60 92,30 90 C12 88,2 80,2 68 C0 54,1 30,4 18Z" fill="#a8cfe0" opacity="0.55" filter="url(#wm-blur)"/>
      <path d="M8 22 C12 14,28 10,55 12 C90 8,130 10,165 10 C205 8,248 10,278 14 C298 17,314 24,315 35 C317 50,314 68,308 76 C300 86,280 88,255 88 C210 90,165 89,125 89 C85 89,48 90,25 87 C10 85,4 76,4 64 C2 48,4 32,8 22Z" fill="#b8d8ea" opacity="0.35"/>
      <path d="M18 15 C22 11,32 10,38 13 C44 16,46 22,44 28 C42 34,36 36,30 38 C24 40,16 36,14 30 C12 24,14 19,18 15Z" fill="#c8a8d4" opacity="0.8" filter="url(#wm-blur2)"/>
      <path d="M34 36 C36 34,40 35,41 38 C42 41,40 44,37 44 C34 44,32 42,34 36Z" fill="#c8a8d4" opacity="0.7"/>
      <path d="M38 48 C42 44,50 44,54 48 C58 52,58 60,56 68 C54 76,48 80,43 78 C38 76,34 70,34 62 C34 54,34 52,38 48Z" fill="#c8a8d4" opacity="0.75" filter="url(#wm-blur2)"/>
      <path d="M118 12 C124 9,134 10,138 14 C142 18,140 24,136 26 C132 28,124 26,120 22 C116 18,114 15,118 12Z" fill="#c8a8d4" opacity="0.8" filter="url(#wm-blur2)"/>
      <path d="M126 30 C132 27,140 28,144 34 C148 40,148 52,144 62 C140 72,132 76,126 72 C120 68,118 56,120 46 C122 36,120 33,126 30Z" fill="#c8a8d4" opacity="0.78" filter="url(#wm-blur2)"/>
      <path d="M148 10 C165 6,195 8,220 12 C240 16,252 22,254 30 C256 38,248 44,235 46 C220 48,195 44,175 42 C158 40,144 36,142 28 C140 20,142 13,148 10Z" fill="#c8a8d4" opacity="0.8" filter="url(#wm-blur2)"/>
      <path d="M192 44 C196 42,202 44,204 50 C206 56,202 62,197 62 C192 62,188 58,188 52 C188 46,188 46,192 44Z" fill="#c8a8d4" opacity="0.72"/>
      <path d="M242 62 C250 58,264 60,270 66 C276 72,274 80,268 83 C260 86,248 84,242 78 C236 72,234 66,242 62Z" fill="#c8a8d4" opacity="0.72" filter="url(#wm-blur2)"/>
      <path d="M72 10 C78 7,88 8,90 13 C92 18,88 22,82 22 C76 22,70 18,72 10Z" fill="#c8a8d4" opacity="0.6"/>
      <path d="M30 16 C80 10,160 9,240 14 C270 16,300 20,310 26 C290 20,240 16,160 15 C100 14,50 15,30 16Z" fill="white" opacity="0.3"/>
    </svg>
  )
}

// ── IDENTITY CORNER ──────────────────────────────────────────────────────────
function IdentityCorner({ user, onUpdate }) {
  const [open, setOpen]           = useState(false)
  const [tab, setTab]             = useState('view')   // 'view' | 'edit'
  const [customName, setCustomName] = useState('')
  const [selectedAnimal, setSelectedAnimal] = useState(null)
  const [nameError, setNameError] = useState('')
  const [suggestions, setSuggestions] = useState([])

  const handleOpen = () => { setOpen(true); setTab('view'); setCustomName(''); setNameError('') }

  const generateSuggestions = () => {
    const adjs = ['Brave','Funky','Goofy','Happy','Jazzy','Lively','Mighty','Quirky','Silly','Wild','Zesty','Bouncy','Cheeky','Epic']
    const animals = ANIMALS.map(a => a.name)
    return Array.from({length:4}, () => {
      const a = adjs[Math.floor(Math.random()*adjs.length)]
      const b = animals[Math.floor(Math.random()*animals.length)]
      const n = Math.floor(Math.random()*99)+1
      return `${a}${b}${n}`
    })
  }

  const handleEditOpen = () => {
    setTab('edit')
    setCustomName(user.name)
    setSelectedAnimal(ANIMALS.find(a => a.emoji === user.animal) || ANIMALS[0])
    setSuggestions(generateSuggestions())
    setNameError('')
  }

  const handleSave = () => {
    const name = customName.trim()
    if (!name) { setNameError('Name cannot be empty'); return }
    if (name.length < 3) { setNameError('At least 3 characters'); return }
    if (name.length > 24) { setNameError('Max 24 characters'); return }
    if (!/^[a-zA-Z0-9_]+$/.test(name)) { setNameError('Letters, numbers and _ only'); return }
    const updated = saveCustomName(name, selectedAnimal?.emoji || user.animal, user.color)
    onUpdate(updated)
    setOpen(false)
    setTab('view')
  }

  const handleReroll = () => { onUpdate(rerollName()); setOpen(false) }

  return (
    <>
      <div className="identity-corner" onClick={handleOpen}>
        <div className="id-avatar">{user.animal}</div>
        <div className="id-name">
          <span className="id-label">You are</span>
          <span className="id-username">{user.name}</span>
        </div>
      </div>

      {open && (
        <div className="user-panel">
          {tab === 'view' ? (
            <>
              <div className="user-panel-identity">
                <div className="user-panel-emoji">{user.animal}</div>
                <div>
                  <div className="user-panel-name">{user.name}</div>
                  <div className="user-panel-sub">Your anonymous identity</div>
                </div>
              </div>
              <div className="user-panel-note">🔒 Saved to your browser. No signup needed!</div>
              <div className="user-panel-btns">
                <button className="btn-edit-name" onClick={handleEditOpen}>✏️ Set Name</button>
                <button className="btn-reroll" onClick={handleReroll}>🎲 Random!</button>
                <button className="btn-close-panel" onClick={() => setOpen(false)}>Close</button>
              </div>
            </>
          ) : (
            <>
              <div className="edit-name-title">✏️ Create your identity</div>

              {/* Custom name input */}
              <div className="edit-name-row">
                <input
                  className="edit-name-input"
                  value={customName}
                  onChange={e => { setCustomName(e.target.value); setNameError('') }}
                  placeholder="Type your name..."
                  maxLength={24}
                  autoFocus
                />
                <span className="edit-name-count">{customName.length}/24</span>
              </div>
              {nameError && <div className="edit-name-error">⚠️ {nameError}</div>}

              {/* Suggestions */}
              <div className="edit-name-suggestions-label">💡 Suggestions:</div>
              <div className="edit-name-suggestions">
                {suggestions.map(s => (
                  <button key={s} className="suggestion-chip" onClick={() => setCustomName(s)}>{s}</button>
                ))}
                <button className="suggestion-chip suggestion-refresh" onClick={() => setSuggestions(generateSuggestions())}>🔄</button>
              </div>

              {/* Animal picker */}
              <div className="edit-name-suggestions-label">🐾 Pick your animal:</div>
              <div className="animal-picker">
                {ANIMALS.map(a => (
                  <button key={a.name}
                    className={`animal-chip ${selectedAnimal?.name === a.name ? 'selected' : ''}`}
                    onClick={() => setSelectedAnimal(a)}
                    title={a.name}>
                    {a.emoji}
                  </button>
                ))}
              </div>

              {/* Preview */}
              <div className="edit-name-preview">
                Preview: <strong>{selectedAnimal?.emoji} {customName || '...'}</strong>
              </div>

              <div className="user-panel-btns">
                <button className="btn-reroll" onClick={handleSave}>✅ Save</button>
                <button className="btn-close-panel" onClick={() => setTab('view')}>← Back</button>
              </div>
            </>
          )}
        </div>
      )}
    </>
  )
}

// ── AVATAR ───────────────────────────────────────────────────────────────────
function Avatar({ name, color, size = 32 }) {
  return (
    <div className="avatar" style={{
      background: color, width: size, height: size, borderRadius: '50%',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontWeight: 800, fontSize: size * 0.38, color: '#fff',
      textShadow: '0 1px 2px rgba(0,0,0,0.3)', flexShrink: 0,
    }}>
      {name[0]}
    </div>
  )
}

// ── COMMENT BOX ──────────────────────────────────────────────────────────────
function CommentBox({ noteId, noteAuthorId, user, onCommentAdded, parentId = null, onCancel = null }) {
  const [text, setText]         = useState('')
  const [loading, setLoading]   = useState(false)
  const [isPrivate, setPrivate] = useState(false)
  const [warning, setWarning]   = useState('')
  const [error, setError]       = useState('')

  async function submit() {
    if (!text.trim()) return
    setWarning(''); setError('')

    // Moderation check
    const mod = moderateText(text)
    if (!mod.allowed) { setError(mod.reason); return }
    if (mod.warning)  { setWarning(mod.warning) }

    setLoading(true)

    // Encrypt if private
    const finalContent = isPrivate
      ? encryptMessage(text.trim(), noteAuthorId)
      : text.trim()

    await supabase.from('comments').insert({
      note_id: noteId,
      parent_comment_id: parentId,
      content: finalContent,
      author_name: user.name,
      author_id: user.id,
      author_color: user.color,
      author_animal: user.animal,
      is_private: isPrivate,
      note_author_id: noteAuthorId,
    })
    setText(''); setLoading(false); setPrivate(false)
    onCommentAdded?.(); onCancel?.()
  }

  return (
    <div className="comment-box">
      <Avatar name={user.name} color={user.color} size={28}/>
      <div className="comment-input-wrap">
        {error   && <div className="mod-error">🚫 {error}</div>}
        {warning && <div className="mod-warning">⚠️ {warning}</div>}
        <textarea value={text} onChange={e => { setText(e.target.value.slice(0,300)); setError(''); setWarning('') }}
          placeholder={isPrivate ? '🔒 Private message — only note author sees this...' : (parentId ? 'Write a reply...' : 'Join the conversation...')}
          rows={2}/>
        <div className="comment-actions">
          <span className="char-count">{text.length}/300</span>
          <div className="visibility-btns">
            <button
              className={`vis-btn ${!isPrivate ? 'active-public' : ''}`}
              onClick={() => setPrivate(false)}
              title="Everyone can see this comment">
              🔓 Public
            </button>
            <button
              className={`vis-btn ${isPrivate ? 'active-private' : ''}`}
              onClick={() => setPrivate(true)}
              title="Only the note author can read this — great for sharing contact info privately">
              🔒 Private
            </button>
          </div>
          {onCancel && <button className="btn-ghost" onClick={onCancel}>Cancel</button>}
          <button className="btn-send" onClick={submit} disabled={loading || !text.trim()}>
            {loading ? '...' : '💬 Post'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── COMMENT ──────────────────────────────────────────────────────────────────
function Comment({ comment, noteId, noteAuthorId, user, depth = 0, noteColor = '#FFEB3B' }) {
  const [showReply, setShowReply] = useState(false)
  const [replies, setReplies]     = useState([])
  useEffect(() => { if (depth < 1) loadReplies() }, [])
  async function loadReplies() {
    const { data } = await supabase.from('comments').select('*')
      .eq('parent_comment_id', comment.id).order('created_at', { ascending: true })
    setReplies(data || [])
  }

  // Decrypt if private and user is note author
  const isUserNoteAuthor = user.id === noteAuthorId
  let displayContent = comment.content
  let isPrivateMsg = comment.is_private

  if (isEncrypted(comment.content)) {
    if (isUserNoteAuthor) {
      displayContent = decryptMessage(comment.content, noteAuthorId)
    } else {
      displayContent = null // hidden
    }
  }

  // Don't show private comments to non-authors at all
  if (isPrivateMsg && !isUserNoteAuthor && user.id !== comment.author_id) return null

  const hex = noteColor.replace('#','')
  const r = parseInt(hex.slice(0,2),16), g = parseInt(hex.slice(2,4),16), b = parseInt(hex.slice(4,6),16)
  const tint   = `rgba(${r},${g},${b},${depth > 0 ? 0.08 : 0.14})`
  const border = `rgba(${r},${g},${b},0.35)`

  return (
    <div className={`comment-card ${depth > 0 ? 'comment-reply' : ''} ${isPrivateMsg ? 'comment-private' : ''}`}
      style={{ background: tint, borderLeft: `3px solid ${border}` }}>
      <div className="comment-card-header">
        <div className="comment-card-left">
          <div className="comment-avatar" style={{ background: comment.author_color }}>
            {comment.author_animal || comment.author_name[0]}
          </div>
          <div>
            <span className="comment-author-name" style={{ color: comment.author_color }}>
              {comment.author_name}
            </span>
            <span className="comment-card-time">
              {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
            </span>
            {isPrivateMsg && <span className="private-badge">🔒 Private</span>}
          </div>
        </div>
        {depth === 0 && (
          <button className="btn-reply" onClick={() => setShowReply(!showReply)}>↩ Reply</button>
        )}
      </div>
      <p className="comment-card-text">
        {isPrivateMsg && !isUserNoteAuthor && user.id === comment.author_id
          ? <em style={{opacity:0.6}}>You sent a private message to the note author</em>
          : displayContent
        }
      </p>
      {showReply && (
        <CommentBox noteId={noteId} noteAuthorId={noteAuthorId} user={user}
          parentId={comment.id} onCommentAdded={loadReplies} onCancel={() => setShowReply(false)}/>
      )}
      {replies.length > 0 && (
        <div className="comment-replies">
          {replies.map(r => (
            <Comment key={r.id} comment={r} noteId={noteId} noteAuthorId={noteAuthorId}
              user={user} depth={1} noteColor={noteColor}/>
          ))}
        </div>
      )}
    </div>
  )
}

// ── NOTE MODAL ────────────────────────────────────────────────────────────────
function NoteModal({ note, user, onClose }) {
  // ── ALL HOOKS FIRST ──
  const [comments, setComments] = useState([])
  const [upvotes,  setUpvotes]  = useState(note.upvotes || 0)
  const [liked,    setLiked]    = useState(() => {
    const likedNotes = JSON.parse(localStorage.getItem('worldpad_liked') || '[]')
    return likedNotes.includes(note.id)
  })
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    loadComments()
    const ch = supabase.channel(`comments-${note.id}`)
      .on('postgres_changes', { event:'INSERT', schema:'public', table:'comments', filter:`note_id=eq.${note.id}` }, loadComments)
      .subscribe()
    return () => supabase.removeChannel(ch)
  }, [note.id])

  // ── HELPER FUNCTIONS ──
  async function loadComments() {
    const { data } = await supabase.from('comments').select('*')
      .eq('note_id', note.id).is('parent_comment_id', null).order('created_at', {ascending:true})
    setComments(data || [])
  }

  const timeLeft = () => {
    const diff = new Date(note.expires_at) - new Date()
    if (diff <= 0) return 'Expired'
    const hrs = Math.floor(diff / 3600000), mins = Math.floor((diff % 3600000) / 60000)
    return `${hrs}h ${mins}m left`
  }

  const noteColor   = note.note_color || '#FFEB3B'
  const hex         = noteColor.replace('#','')
  const r = parseInt(hex.slice(0,2),16), g = parseInt(hex.slice(2,4),16), b = parseInt(hex.slice(4,6),16)
  const headerBg    = `rgba(${r},${g},${b},0.18)`
  const accentColor = noteColor

  function handleShare() {
    const url = `${window.location.origin}${window.location.pathname}?note=${note.id}`
    if (navigator.share) {
      navigator.share({ title: 'Worldpad Note', text: note.content.slice(0, 80) + '...', url })
    } else {
      navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  async function handleLike() {
    if (liked) return
    const newCount = upvotes + 1
    setUpvotes(newCount); setLiked(true)
    const likedNotes = JSON.parse(localStorage.getItem('worldpad_liked') || '[]')
    localStorage.setItem('worldpad_liked', JSON.stringify([...likedNotes, note.id]))
    await supabase.from('notes').update({ upvotes: newCount }).eq('id', note.id)
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>

        {/* Colored top bar */}
        <div className="modal-top-bar" style={{ background: accentColor }}/>

        <button className="modal-close" onClick={onClose}>✕</button>

        {/* Note header — tinted bg */}
        <div className="modal-note-header" style={{ background: headerBg, borderRadius: '12px', padding: '14px' }}>
          <div style={{ display:'flex', alignItems:'center', gap:'12px' }}>
            <Avatar name={note.author_name} color={note.author_color} size={44}/>
            <div>
              <div className="modal-author" style={{ color: note.author_color }}>
                {note.author_animal} {note.author_name}
              </div>
              <div className="modal-meta">
                {note.city && <span>📍 {note.city}{note.state ? `, ${note.state}` : ''}</span>}
                {note.interest_tag && <span>{note.interest_tag}</span>}
                <span>⏱ {timeLeft()}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Note content */}
        <div className="modal-content-box" style={{ borderLeft: `4px solid ${accentColor}`, background: headerBg }}>
          {note.content}
        </div>

        {/* Stats row — clickable like + share */}
        <div className="modal-stats">
          <button
            className={`modal-like-btn ${liked ? 'liked' : ''}`}
            onClick={handleLike}
            style={{ borderColor: accentColor }}>
            <span style={{fontSize:'20px'}}>{liked ? '❤️' : '🤍'}</span>
            <span>{upvotes} {upvotes === 1 ? 'like' : 'likes'}</span>
            {!liked && <span className="modal-like-hint">tap to like</span>}
          </button>
          <span className="modal-comment-count">💬 {comments.length} comments</span>
          <button className={`modal-share-btn ${copied ? 'copied' : ''}`} onClick={handleShare}>
            {copied ? '✅ Copied!' : '🔗 Share'}
          </button>
        </div>

        {/* Comments section */}
        <div className="modal-comments-section">
          <div className="modal-comments-header">
            <div className="modal-comments-title" style={{ borderBottom: `2px solid ${accentColor}` }}>
              Comments
            </div>
          </div>

          {comments.length === 0 ? (
            <div className="no-comments">
              <span style={{ fontSize:'28px' }}>💬</span>
              <p>No comments yet — be the first!</p>
            </div>
          ) : (
            <div className="comments-grid">
              {comments.map((c, i) => (
                <Comment key={c.id} comment={c} noteId={note.id} noteAuthorId={note.author_id} user={user} noteColor={noteColor}/>
              ))}
            </div>
          )}
        </div>

        {/* Comment input */}
        <div className="modal-comment-input-wrap" style={{ borderTop: `2px solid ${accentColor}22` }}>
          <CommentBox noteId={note.id} noteAuthorId={note.author_id} user={user} onCommentAdded={loadComments}/>
        </div>
      </div>
    </div>
  )
}

// ── STICKY NOTE ───────────────────────────────────────────────────────────────
function StickyNote({ note, onClick }) {
  const [commentCount, setCommentCount] = useState(note.comment_count || 0)
  const [upvotes,      setUpvotes]      = useState(note.upvotes || 0)
  const [liked,        setLiked]        = useState(() => {
    const likedNotes = JSON.parse(localStorage.getItem('worldpad_liked') || '[]')
    return likedNotes.includes(note.id)
  })

  useEffect(() => {
    supabase.from('comments').select('id', { count: 'exact', head: true })
      .eq('note_id', note.id)
      .then(({ count }) => setCommentCount(count || 0))
  }, [note.id])

  async function handleLike(e) {
    e.stopPropagation() // don't open the note modal
    if (liked) return   // already liked — no double likes

    const newCount = upvotes + 1
    setUpvotes(newCount)
    setLiked(true)

    // Save to localStorage so like persists across page refreshes
    const likedNotes = JSON.parse(localStorage.getItem('worldpad_liked') || '[]')
    localStorage.setItem('worldpad_liked', JSON.stringify([...likedNotes, note.id]))

    // Update in Supabase
    await supabase.from('notes').update({ upvotes: newCount }).eq('id', note.id)
  }

  const timeLeft = () => {
    const diff = new Date(note.expires_at) - new Date()
    if (diff <= 0) return null
    const hrs = Math.floor(diff / 3600000)
    return hrs < 3 ? `⏱ ${hrs}h left` : null
  }
  const tl = timeLeft()
  return (
    <div className="sticky-note" onClick={() => onClick(note)}
      style={{'--note-bg': note.note_color, background: note.note_color,
        boxShadow: `4px 6px 0 rgba(0,0,0,0.18)`}}>
      {tl && <span className="expiry-badge">{tl}</span>}
      <p className="note-content">{note.content}</p>
      <div className="note-footer">
        <span className="note-animal">{note.author_animal || '🐾'}</span>
        <span className="note-author" style={{color: note.author_color}}>{note.author_name}</span>
      </div>
      <div className="note-tags">
        {note.city && <span className="tag">📍 {note.city}</span>}
        {note.interest_tag && <span className="tag">{note.interest_tag}</span>}
        {note.world_slug && <span className="tag tag-world">🌐 {note.world_slug}</span>}
      </div>
      <div className="note-stats">
        <button
          className={`like-btn ${liked ? 'liked' : ''}`}
          onClick={handleLike}
          title={liked ? 'Already liked!' : 'Like this note'}>
          {liked ? '❤️' : '🤍'} {upvotes}
        </button>
        <span>💬 {commentCount}</span>
      </div>
      {note.is_seeded && <span className="note-seeded-badge">🤖 Trending</span>}
    </div>
  )
}

// ── NEW NOTE FORM ─────────────────────────────────────────────────────────────
function NewNoteForm({ user, activeWorld, onClose, onPosted }) {
  const [content,   setContent]   = useState('')
  const [noteColor, setNoteColor] = useState(NOTE_COLORS[0])
  const [country,   setCountry]   = useState('')
  const [state,     setState]     = useState('')
  const [city,      setCity]      = useState('')
  const [tag,       setTag]       = useState('')
  const [loading,   setLoading]   = useState(false)

  const [modError, setModError]   = useState('')
  const [modWarn,  setModWarn]    = useState('')

  async function post() {
    if (!content.trim()) return
    setModError(''); setModWarn('')

    const mod = moderateText(content)
    if (!mod.allowed) { setModError(mod.reason); return }
    if (mod.warning)  { setModWarn(mod.warning) }

    setLoading(true)
    const { error } = await supabase.from('notes').insert({
      content: content.trim(), author_name: user.name,
      author_id: user.id, author_color: user.color, author_animal: user.animal,
      country: country||null, state: state||null, city: city||null,
      interest_tag: tag||null, note_color: noteColor.bg,
      world_id: activeWorld?.id || null,
      world_slug: activeWorld?.slug || null,
    })
    if (error) console.error('Post error:', error)
    // Increment world note count if posting in a world
    if (!error && activeWorld) {
      await supabase.from('worlds')
        .update({ note_count: (activeWorld.note_count || 0) + 1 })
        .eq('id', activeWorld.id)
    }
    setLoading(false); onPosted(); onClose()
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="new-note-modal" onClick={e => e.stopPropagation()}>
        <h2>📌 Drop a Note</h2>
        <p className="posting-as">Posting as <span style={{color: user.color}}>{user.animal} {user.name}</span></p>
        {activeWorld && (
          <div className="posting-in-world">
            🌐 Posting in <strong>{activeWorld.emoji} {activeWorld.name}</strong>
          </div>
        )}
        <textarea className="new-note-textarea"
          style={{background: noteColor.bg, borderColor: noteColor.border}}
          placeholder="What's on your mind? (150 chars)"
          value={content} onChange={e => { setContent(e.target.value.slice(0,150)); setModError(''); setModWarn('') }}
          rows={4} autoFocus/>
        <div className="char-row"><span className="char-count">{content.length}/150</span></div>
        {modError && <div className="mod-error">🚫 {modError}</div>}
        {modWarn  && <div className="mod-warning">⚠️ {modWarn}</div>}
        <div className="color-picker">
          <label>Note color:</label>
          <div className="color-swatches">
            {NOTE_COLORS.map(c => (
              <button key={c.bg}
                className={`swatch ${noteColor.bg === c.bg ? 'active' : ''}`}
                style={{background: c.bg, borderColor: c.border}}
                onClick={() => setNoteColor(c)} title={c.label}/>
            ))}
          </div>
        </div>
        <div className="form-row">
          <select value={country} onChange={e => { setCountry(e.target.value); setState(''); setCity('') }}>
            <option value="">🌍 Country</option>
            {COUNTRIES.map(c => <option key={c}>{c}</option>)}
          </select>
          {country === 'India' && (
            <select value={state} onChange={e => { setState(e.target.value); setCity('') }}>
              <option value="">State</option>
              {INDIA_STATES.map(s => <option key={s}>{s}</option>)}
            </select>
          )}
          {/* City dropdown — changes based on country/state */}
          {(country === 'India' && state) || (country && country !== 'India') ? (
            <select value={city} onChange={e => setCity(e.target.value)}>
              <option value="">🏙️ City</option>
              {(country === 'India'
                ? (CITIES_BY_STATE[state] || [])
                : (CITIES_BY_COUNTRY[country] || [])
              ).map(c => <option key={c}>{c}</option>)}
            </select>
          ) : (
            <input placeholder="🏙️ City" value={city} onChange={e => setCity(e.target.value)}/>
          )}
        </div>
        <div className="tag-picker">
          <label>Interest tag:</label>
          <div className="tags-wrap">
            {INTEREST_TAGS.map(t => (
              <button key={t.key}
                className={`tag-btn ${tag === t.label ? 'active' : ''}`}
                data-tag={t.key}
                onClick={() => setTag(tag === t.label ? '' : t.label)}>
                <span className="tag-emoji">{t.emoji}</span> {t.label}
              </button>
            ))}
          </div>
        </div>
        <div className="form-actions">
          <button className="btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn-primary" onClick={post} disabled={loading || !content.trim()}>
            {loading ? '✨ Posting...' : '📌 Pin It!'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── 3D GLOBE HERO ─────────────────────────────────────────────────────────────
function HeroEmpty({ onPin, onExplore }) {
  const canvasRef = useRef(null)
  const wrapRef   = useRef(null)   // canvas clip wrapper — used for W/H sizing
  const outerRef  = useRef(null)   // outer hero container

  // Lock body scroll while hero is showing
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    const wrap   = wrapRef.current
    if (!canvas || !wrap || !window.THREE) return

    const THREE = window.THREE
    let animId

    const W = () => wrap.clientWidth
    const H = () => wrap.clientHeight

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false })
    // Match exact peach background color so no pattern bleeds through
    renderer.setClearColor(0xfde8d8, 1)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setSize(W(), H())

    const scene  = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(58, 1, 0.1, 100)
    camera.position.set(0, 0, 4.5)

    const RADIUS  = 2.9
    const N_NOTES = 180
    const notes   = []
    const noteData = []
    const globe   = new THREE.Group()
    scene.add(globe)

    // ── REAL EARTH TEXTURE via Three.js TextureLoader ──
    const loader = new THREE.TextureLoader()
    loader.crossOrigin = 'anonymous'

    // Use a high quality equirectangular earth map from a public CDN
    // This is the classic NASA Blue Marble texture hosted publicly
    const EARTH_TEX_URL = 'https://unpkg.com/three-globe/example/img/earth-blue-marble.jpg'

    // Always use our own canvas texture — guaranteed NO white pixels
    buildGlobe(null)

    // Try to load real texture in background as upgrade (commented out to avoid white)
    // loader.load(EARTH_TEX_URL, buildGlobe, undefined, () => buildGlobe(null))

    function buildGlobe(earthTex) {
      // Always draw our own — full control, no white
      const TEX_W = 2048, TEX_H = 1024
      const tc = document.createElement('canvas')
      tc.width = TEX_W; tc.height = TEX_H
      const cx = tc.getContext('2d')

      // Deep navy blue ocean
      const oceanGrad = cx.createLinearGradient(0, 0, 0, TEX_H)
      oceanGrad.addColorStop(0,   '#013d6e')
      oceanGrad.addColorStop(0.3, '#01579b')
      oceanGrad.addColorStop(0.5, '#0164b0')
      oceanGrad.addColorStop(0.7, '#01579b')
      oceanGrad.addColorStop(1,   '#012f5a')
      cx.fillStyle = oceanGrad
      cx.fillRect(0, 0, TEX_W, TEX_H)

      // Subtle ocean depth variation
      cx.fillStyle = 'rgba(0,30,80,0.3)'
      cx.fillRect(0, 0, TEX_W * 0.15, TEX_H)
      cx.fillStyle = 'rgba(0,20,60,0.2)'
      cx.fillRect(TEX_W * 0.85, 0, TEX_W * 0.15, TEX_H)

      // Land helper — [lat, lon] in equirectangular
      const lp = (pts, color = '#4caf50') => {
        cx.fillStyle = color
        cx.strokeStyle = '#2e7d32'
        cx.lineWidth = 3
        cx.beginPath()
        pts.forEach(([lat, lon], i) => {
          const x = ((lon + 180) / 360) * TEX_W
          const y = ((90 - lat)  / 180) * TEX_H
          i === 0 ? cx.moveTo(x, y) : cx.lineTo(x, y)
        })
        cx.closePath(); cx.fill(); cx.stroke()
      }

      const G = '#4caf50'  // green land
      const LG = '#66bb6a' // lighter green

      // ── NORTH AMERICA ──
      lp([[70,-140],[72,-120],[75,-100],[70,-80],[60,-65],[50,-55],[45,-53],
          [40,-55],[35,-77],[28,-80],[20,-87],[16,-90],[18,-103],[22,-110],
          [28,-114],[34,-118],[42,-124],[50,-125],[57,-134],[62,-140],[70,-140]], G)
      lp([[60,-165],[66,-168],[68,-162],[66,-150],[60,-150],[58,-158],[60,-165]], LG) // Alaska
      lp([[76,-73],[82,-60],[84,-45],[80,-22],[72,-22],[68,-28],[66,-42],[70,-58],[76,-73]], '#5d8a5e') // Greenland darker

      // ── SOUTH AMERICA ──
      lp([[10,-75],[12,-62],[8,-60],[2,-52],[0,-50],[-5,-35],[-10,-37],
          [-15,-39],[-22,-43],[-30,-50],[-38,-58],[-42,-62],[-52,-68],
          [-55,-64],[-52,-58],[-45,-52],[-38,-50],[-20,-40],[-5,-35],
          [5,-52],[8,-62],[10,-72],[10,-75]], G)

      // ── EUROPE ──
      lp([[70,32],[65,26],[60,22],[58,12],[54,8],[50,2],[44,0],[38,14],
          [36,14],[40,28],[44,28],[48,16],[52,14],[54,10],[58,16],[62,26],
          [65,26],[68,28],[70,32]], G)
      lp([[58,5],[65,15],[70,28],[68,28],[62,10],[58,5]], LG) // Scandinavia
      lp([[50,-6],[52,-4],[57,-2],[58,0],[56,2],[52,2],[50,-2],[50,-6]], LG) // UK

      // ── AFRICA ──
      lp([[36,2],[22,18],[10,15],[5,2],[0,-2],[-5,8],[-10,14],[-20,14],
          [-26,14],[-32,18],[-35,20],[-34,26],[-28,32],[-22,36],[-12,40],
          [0,42],[10,44],[15,42],[20,38],[26,36],[32,30],[36,22],[36,2]], G)

      // ── ASIA ──
      lp([[70,32],[72,50],[72,80],[68,100],[65,140],[60,140],[52,140],
          [48,135],[42,130],[36,128],[30,122],[22,114],[14,108],[5,103],
          [0,104],[8,98],[16,74],[22,68],[28,62],[30,52],[34,48],[36,36],
          [38,28],[42,30],[48,40],[55,60],[60,60],[65,60],[70,32]], G)
      lp([[28,68],[28,78],[8,78],[8,76],[16,74],[22,68],[28,68]], LG) // India
      lp([[42,140],[44,144],[42,145],[38,140],[40,136],[42,140]], LG) // Japan
      lp([[1,103],[5,103],[5,106],[1,104],[1,103]], LG) // Singapore/Malaysia tip

      // ── AUSTRALIA ──
      lp([[-16,130],[-14,136],[-18,142],[-24,152],[-32,152],[-38,146],
          [-38,140],[-34,136],[-32,116],[-26,114],[-20,118],[-16,130]], G)
      lp([[-36,174],[-40,176],[-46,168],[-44,166],[-40,168],[-36,174]], LG) // NZ

      // ── RUSSIA/SIBERIA extra ──
      lp([[68,32],[70,50],[70,80],[68,100],[65,120],[60,140],[58,130],
          [60,110],[62,90],[65,70],[68,50],[68,32]], '#43a047')

      // Polar regions — DARK TEAL/BLUE not white!
      // North pole (Arctic ocean — just dark blue, already covered)
      // South pole (Antarctica) — dark teal, NOT white
      const antarcticGrad = cx.createRadialGradient(TEX_W/2, TEX_H, 0, TEX_W/2, TEX_H, TEX_W*0.3)
      antarcticGrad.addColorStop(0, '#00695c')  // dark teal center
      antarcticGrad.addColorStop(0.5, '#00796b') // teal
      antarcticGrad.addColorStop(1, 'rgba(0,105,92,0)') // fade out
      cx.fillStyle = antarcticGrad
      cx.fillRect(0, TEX_H * 0.82, TEX_W, TEX_H * 0.18)

      // North pole dark cap
      const arcticGrad = cx.createRadialGradient(TEX_W/2, 0, 0, TEX_W/2, 0, TEX_W*0.25)
      arcticGrad.addColorStop(0, '#01579b') // dark blue
      arcticGrad.addColorStop(1, 'rgba(1,87,155,0)')
      cx.fillStyle = arcticGrad
      cx.fillRect(0, 0, TEX_W, TEX_H * 0.12)

      const mainTex = new THREE.CanvasTexture(tc)

      // Tinted dark overlay sphere inside to kill any remaining bright spots
      globe.add(new THREE.Mesh(
        new THREE.SphereGeometry(RADIUS - 0.05, 32, 32),
        new THREE.MeshBasicMaterial({ color: 0x0a2a6e, side: THREE.BackSide })
      ))

      globe.add(new THREE.Mesh(
        new THREE.SphereGeometry(RADIUS, 64, 64),
        new THREE.MeshLambertMaterial({ map: mainTex })
      ))

      // VIBGYOR Rainbow border — multiple thin colored rings
      const rainbowColors = [
        { color: 0x9400D3, r: RADIUS + 0.10 }, // Violet
        { color: 0x4B0082, r: RADIUS + 0.16 }, // Indigo
        { color: 0x0000FF, r: RADIUS + 0.22 }, // Blue
        { color: 0x00BB00, r: RADIUS + 0.28 }, // Green
        { color: 0xFFFF00, r: RADIUS + 0.34 }, // Yellow
        { color: 0xFF7F00, r: RADIUS + 0.40 }, // Orange
        { color: 0xFF0000, r: RADIUS + 0.46 }, // Red
      ]
      rainbowColors.forEach(({ color, r }) => {
        globe.add(new THREE.Mesh(
          new THREE.SphereGeometry(r, 48, 48),
          new THREE.MeshBasicMaterial({
            color, side: THREE.BackSide,
            transparent: true, opacity: 0.82,
          })
        ))
      })
    }

    // ── Note canvas texture generator — realistic handwriting patterns ──
    const NOTE_COLORS_HEX = [
      '#FFD600','#FF4081','#2196F3','#00E676',
      '#D500F9','#FF6D00','#00E5FF','#FF1744',
      '#FFFF00','#F50057','#00B0FF','#69F0AE',
      '#AA00FF','#FF9100','#18FFFF','#FF5252',
      '#F9A825','#FF80AB','#40C4FF','#76FF03',
      '#EA80FC','#FFAB40','#1DE9B6','#FF6E40',
    ]

    // Determine if a color is light (needs dark lines) or dark (needs darker lines)
    function getLuminance(hex) {
      const r = parseInt(hex.slice(1,3),16)/255
      const g = parseInt(hex.slice(3,5),16)/255
      const b = parseInt(hex.slice(5,7),16)/255
      return 0.299*r + 0.587*g + 0.114*b
    }

    // Draw a single curvy handwriting stroke
    function drawStroke(nx, x1, y, length, seed) {
      // Use seed for pseudo-random but consistent curves per note
      const s = seed
      nx.beginPath()
      nx.moveTo(x1, y + Math.sin(s*1.3)*2)

      // Build the stroke as multiple bezier curves — looks like real handwriting
      const segments = 4 + Math.floor((seed%3))
      const segLen = length / segments
      let cx = x1
      for (let i = 0; i < segments; i++) {
        const nx1 = cx + segLen * 0.3
        const nx2 = cx + segLen * 0.7
        const ex  = cx + segLen
        const cy1 = y + Math.sin((s + i)*2.1)*3.5 - 1.5
        const cy2 = y + Math.sin((s + i)*1.7)*3   + 1
        const ey  = y + Math.sin((s + i+1)*1.9)*2
        nx.bezierCurveTo(nx1, cy1, nx2, cy2, ex, ey)
        cx = ex
      }
      nx.stroke()
    }

    const NOTE_TEXTURES = NOTE_COLORS_HEX.map((bgHex, idx) => {
      const nc = document.createElement('canvas')
      nc.width = 160; nc.height = 120
      const nx = nc.getContext('2d')

      // Background
      nx.fillStyle = bgHex
      nx.fillRect(0, 0, 160, 120)

      // Subtle fold shadow at bottom-right
      const fold = nx.createLinearGradient(100, 80, 160, 120)
      fold.addColorStop(0, 'rgba(0,0,0,0)')
      fold.addColorStop(1, 'rgba(0,0,0,0.1)')
      nx.fillStyle = fold
      nx.fillRect(0, 0, 160, 120)

      // Always pure black ink — dark and clearly visible on every color
      nx.strokeStyle = 'rgba(0,0,0,0.75)'
      nx.lineCap = 'round'
      nx.lineJoin = 'round'

      const seed = idx * 7.3

      // 4-5 lines of curvy handwriting
      const numLines = 4 + (idx % 2)
      const lineYStart = 24
      const lineSpacing = (120 - lineYStart - 12) / numLines

      for (let l = 0; l < numLines; l++) {
        const y       = lineYStart + l * lineSpacing
        const lineLen = 80 + Math.sin(seed + l * 2.1) * 25  // vary line lengths
        const x1      = 12
        nx.lineWidth = 1.8 + (l === 0 ? 0.3 : 0)  // first line slightly bolder

        drawStroke(nx, x1, y, lineLen, seed + l * 3.7)
      }

      // Sometimes add a small doodle — star, heart, or spiral in corner
      nx.lineWidth = 1.5
      const doodle = idx % 4
      const dx = 140, dy = 15

      if (doodle === 0) {
        // Small star
        nx.beginPath()
        for (let p = 0; p < 5; p++) {
          const angle = (p * 4 * Math.PI / 5) - Math.PI/2
          const r = p % 2 === 0 ? 6 : 2.5
          const px = dx + Math.cos(angle) * r
          const py = dy + Math.sin(angle) * r
          p === 0 ? nx.moveTo(px,py) : nx.lineTo(px,py)
        }
        nx.closePath()
        nx.stroke()
      } else if (doodle === 1) {
        // Small heart
        nx.beginPath()
        nx.moveTo(dx, dy+2)
        nx.bezierCurveTo(dx, dy-2, dx-6, dy-2, dx-6, dy+2)
        nx.bezierCurveTo(dx-6, dy+6, dx, dy+10, dx, dy+10)
        nx.bezierCurveTo(dx, dy+10, dx+6, dy+6, dx+6, dy+2)
        nx.bezierCurveTo(dx+6, dy-2, dx, dy-2, dx, dy+2)
        nx.stroke()
      } else if (doodle === 2) {
        // Small spiral
        nx.beginPath()
        for (let a = 0; a < Math.PI * 3; a += 0.2) {
          const sr = a * 1.5
          const sx = dx + Math.cos(a) * sr
          const sy = dy + Math.sin(a) * sr
          a === 0 ? nx.moveTo(sx,sy) : nx.lineTo(sx,sy)
        }
        nx.stroke()
      }
      // doodle 3 = no doodle (clean note)

      // Pin mark at top center
      nx.fillStyle = 'rgba(0,0,0,0.7)'
      nx.beginPath()
      nx.arc(80, 6, 2.5, 0, Math.PI * 2)
      nx.fill()

      return new THREE.CanvasTexture(nc)
    })

    const gr = (1 + Math.sqrt(5)) / 2

    for (let i = 0; i < N_NOTES; i++) {
      const theta  = 2 * Math.PI * i / gr
      const phi    = Math.acos(1 - 2 * (i + 0.5) / N_NOTES)
      const x = RADIUS * Math.sin(phi) * Math.cos(theta)
      const y = RADIUS * Math.sin(phi) * Math.sin(theta)
      const z = RADIUS * Math.cos(phi)

      const noteTex = NOTE_TEXTURES[i % NOTE_TEXTURES.length]
      const colHex  = NOTE_COLORS_HEX[i % NOTE_COLORS_HEX.length]

      const geo = new THREE.PlaneGeometry(0.30 + Math.random() * 0.10, 0.22 + Math.random() * 0.07)
      const mat = new THREE.MeshLambertMaterial({
        map: noteTex,
        side: THREE.DoubleSide,
        transparent: false,
      })
      const mesh   = new THREE.Mesh(geo, mat)
      const outDir = new THREE.Vector3(x, y, z).normalize()
      mesh.position.copy(outDir.clone().multiplyScalar(RADIUS + 0.09))
      mesh.lookAt(outDir.clone().multiplyScalar(10))
      mesh.rotateZ((Math.random() - 0.5) * 0.65)
      globe.add(mesh)
      notes.push(mesh)
      noteData.push({ outDir, baseEmissive: 0, popScale: 1, targetPopScale: 1, popped: false })
    }

    // ── Lights — NO white specular, warm tinted only ──
    scene.add(new THREE.AmbientLight(0xffeedd, 2.8))
    const key  = new THREE.DirectionalLight(0xffcc88, 0.5); key.position.set(5,3,4); scene.add(key)
    const fill = new THREE.DirectionalLight(0x88ccff, 0.3); fill.position.set(-4,-2,2); scene.add(fill)

    // ── Interaction ──
    let speed = 0.003, targetSpeed = 0.003
    let isDragging = false, prevMouse = { x: 0, y: 0 }, dragVX = 0, dragVY = 0
    const raycaster = new THREE.Raycaster()
    const mouse     = new THREE.Vector2()

    const rel = e => {
      const r = canvas.getBoundingClientRect()
      return { x: ((e.clientX-r.left)/r.width)*2-1, y: -((e.clientY-r.top)/r.height)*2+1 }
    }

    const onEnter = () => { targetSpeed = 0.003 * 3.8 }
    const onLeave = () => { targetSpeed = 0.003; noteData.forEach(d => d.targetPopScale = 1) }
    const onMove  = e => {
      if (isDragging) {
        const dx = e.clientX - prevMouse.x, dy = e.clientY - prevMouse.y
        dragVX = dy * 0.009; dragVY = dx * 0.009
        globe.rotation.x += dragVX; globe.rotation.y += dragVY
        prevMouse = { x: e.clientX, y: e.clientY }
        return
      }
      const m = rel(e); mouse.set(m.x, m.y)
      raycaster.setFromCamera(mouse, camera)
      const hits = raycaster.intersectObjects(notes)
      noteData.forEach(d => d.targetPopScale = 1)
      if (hits.length > 0) {
        const idx = notes.indexOf(hits[0].object)
        if (idx !== -1) noteData[idx].targetPopScale = 1.7
      }
    }
    const onDown  = e => { isDragging = true; prevMouse = { x: e.clientX, y: e.clientY }; dragVX = dragVY = 0 }
    const onUp    = () => isDragging = false
    const onClick = e => {
      const m = rel(e); mouse.set(m.x, m.y)
      raycaster.setFromCamera(mouse, camera)
      const hits = raycaster.intersectObjects(notes)
      if (hits.length > 0) {
        const idx = notes.indexOf(hits[0].object)
        if (idx !== -1) { noteData[idx].popped = !noteData[idx].popped; noteData[idx].targetPopScale = noteData[idx].popped ? 2.2 : 1 }
      }
    }

    // ── Touch events for mobile ──
    const onTouchStart = e => {
      e.preventDefault()
      const t = e.touches[0]
      isDragging = true
      prevMouse = { x: t.clientX, y: t.clientY }
      dragVX = dragVY = 0
      targetSpeed = 0.003
    }
    const onTouchMove = e => {
      e.preventDefault()
      if (!isDragging) return
      const t = e.touches[0]
      const dx = t.clientX - prevMouse.x
      const dy = t.clientY - prevMouse.y
      dragVX = dy * 0.009; dragVY = dx * 0.009
      globe.rotation.x += dragVX; globe.rotation.y += dragVY
      prevMouse = { x: t.clientX, y: t.clientY }
    }
    const onTouchEnd = () => { isDragging = false }

    const onResize = () => { camera.aspect = 1; camera.updateProjectionMatrix(); renderer.setSize(W(), H()) }

    canvas.addEventListener('mouseenter', onEnter)
    canvas.addEventListener('mouseleave', onLeave)
    canvas.addEventListener('mousemove',  onMove)
    canvas.addEventListener('mousedown',  onDown)
    canvas.addEventListener('click',      onClick)
    window.addEventListener('mouseup',    onUp)
    window.addEventListener('resize',     onResize)

    // Touch listeners
    canvas.addEventListener('touchstart', onTouchStart, { passive: false })
    canvas.addEventListener('touchmove',  onTouchMove,  { passive: false })
    canvas.addEventListener('touchend',   onTouchEnd)

    // ── Animate ──
    let t = 0
    const animate = () => {
      animId = requestAnimationFrame(animate)
      t += 0.016
      speed += (targetSpeed - speed) * 0.05
      if (!isDragging) { globe.rotation.y += speed; globe.rotation.x += speed * 0.2 }
      dragVX *= 0.93; dragVY *= 0.93

      notes.forEach((mesh, i) => {
        const d = noteData[i]
        d.popScale += (d.targetPopScale - d.popScale) * 0.13
        mesh.position.copy(d.outDir.clone().multiplyScalar(RADIUS + 0.09 + (d.popScale - 1) * 0.5))
        mesh.scale.setScalar(d.popScale > 1.05 ? 1 + (d.popScale - 1) * 0.4 : 1)
      })

      renderer.render(scene, camera)
    }
    animate()

    return () => {
      cancelAnimationFrame(animId)
      renderer.dispose()
      canvas.removeEventListener('mouseenter', onEnter)
      canvas.removeEventListener('mouseleave', onLeave)
      canvas.removeEventListener('mousemove',  onMove)
      canvas.removeEventListener('mousedown',  onDown)
      canvas.removeEventListener('click',      onClick)
      window.removeEventListener('mouseup',    onUp)
      window.removeEventListener('resize',     onResize)
      canvas.removeEventListener('touchstart', onTouchStart)
      canvas.removeEventListener('touchmove',  onTouchMove)
      canvas.removeEventListener('touchend',   onTouchEnd)
    }
  }, [])

  return (
    <div className="hero-container" ref={outerRef}>
      {/* Pattern fills FULL container including corners */}
      <div className="hero-bg-pattern"/>
      {/* Canvas wrapper clips to circle — corners outside show pattern */}
      <div className="hero-canvas-wrap" ref={wrapRef}>
        <canvas ref={canvasRef} className="hero-canvas"/>
      </div>
      <div className="hero-overlay">
        <div className="hero-text-card">
          <div className="hero-title"><span className="hero-title-A">A</span> World of Thoughts Awaits.</div>
          <div className="hero-sub">Explore ideas, unique perspectives &amp; unexpected connections from every corner of the globe.</div>
          <div className="hero-divider"/>
          <div className="hero-btns">
            <button className="hero-pin-btn" onClick={onPin}>
              <span className="hero-pin-emoji">📌</span>
              PIN THE FIRST NOTE!
              <span className="hero-idea-tag">Idea #1 ✏️</span>
            </button>
            <button className="hero-explore-btn" onClick={onExplore}>
              🌍 Explore Notes
            </button>
          </div>
          <div className="hero-hint">↔ Drag to rotate · Hover to speed up · Click a note to pop it</div>
        </div>
      </div>
    </div>
  )
}

// ── ABOUT + SUGGESTIONS PAGE ──────────────────────────────────────────────────
function AboutPage({ user, onClose, openSuggest = false }) {
  const [showSuggest, setShowSuggest] = useState(openSuggest)
  const [suggestion,  setSuggestion]  = useState('')
  const [category,    setCategory]    = useState('feature')
  const [submitted,   setSubmitted]   = useState(false)
  const [loading,     setLoading]     = useState(false)
  const [allSuggestions, setAll]      = useState([])
  const [showAll,     setShowAll]     = useState(false)

  useEffect(() => { loadSuggestions() }, [])

  async function loadSuggestions() {
    const { data } = await supabase.from('suggestions').select('*')
      .order('upvotes', { ascending: false }).limit(10)
    setAll(data || [])
  }

  async function submitSuggestion() {
    if (!suggestion.trim()) return
    setLoading(true)
    await supabase.from('suggestions').insert({
      content: suggestion.trim(),
      author_name: user.name,
      author_id: user.id,
      author_animal: user.animal,
      category,
    })
    setLoading(false)
    setSubmitted(true)
    setSuggestion('')
    loadSuggestions()
  }

  async function upvote(id) {
    await supabase.from('suggestions').update({ upvotes: allSuggestions.find(s=>s.id===id).upvotes + 1 }).eq('id', id)
    loadSuggestions()
  }

  const CAT = [
    { key:'feature', label:'✨ New Feature', color:'#9b7ec8' },
    { key:'bug',     label:'🐛 Bug Report',  color:'#e57373' },
    { key:'design',  label:'🎨 Design',      color:'#4fc3f7' },
    { key:'other',   label:'💬 Other',       color:'#81c784' },
  ]

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="about-modal" onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>✕</button>

        {/* Hero section */}
        <div className="about-hero">
          <div className="about-globe-emoji">🌍</div>
          <h1 className="about-title">What is Worldpad?</h1>
          <p className="about-desc">
            Worldpad is a <strong>global anonymous sticky note board</strong> — a place where anyone,
            anywhere can drop a thought, idea, or feeling and have it seen by the whole world.
            No signup. No judgment. Just thoughts. 💭
          </p>
        </div>

        {/* Features */}
        <div className="about-features">
          {[
            { icon:'📌', title:'Pin a Note', desc:'Drop any thought anonymously — it disappears in 24h keeping things fresh' },
            { icon:'🌍', title:'Global Board', desc:'Filter notes by country, city, or interest — find your people' },
            { icon:'🔒', title:'Private Comments', desc:'Share contact info privately — only the note author can see it' },
            { icon:'🌐', title:'Worlds', desc:'Create or join topic communities like "Friends TV Series" or "Jodhpur Foodies" — a permanent room with daily fresh notes' },
            { icon:'🤖', title:'AI Trending', desc:'Daily AI-seeded notes keep the board lively even at 3am' },
            { icon:'🏆', title:'Leaderboard', desc:'Top contributors get badges — your 5 minutes of fame!' },
            { icon:'🎭', title:'Anonymous Identity', desc:'You\'re an animal with a fun name — no real identity needed' },
            { icon:'❤️', title:'Like & Share', desc:'Like notes you love, share any note via a direct link or your phone\'s share sheet' },
          ].map(f => (
            <div key={f.icon} className="about-feature-card">
              <span className="about-feature-icon">{f.icon}</span>
              <strong>{f.title}</strong>
              <p>{f.desc}</p>
            </div>
          ))}
        </div>

        {/* Divider */}
        <div className="about-divider">
          <span>✨ Built with love, caffeine, and too many sticky notes ✨</span>
        </div>

        {/* Suggestion box */}
        {!showSuggest ? (
          <div className="about-suggest-cta">
            <div className="about-suggest-emoji">💡</div>
            <h3>Got an idea to make Worldpad better?</h3>
            <p>Your suggestions go directly to the creator — no middleman!</p>
            <button className="about-suggest-btn" onClick={() => setShowSuggest(true)}>
              🚀 Drop a Suggestion!
            </button>
          </div>
        ) : submitted ? (
          <div className="about-submitted">
            <div style={{fontSize:'48px'}}>🎉</div>
            <h3>Thanks for your suggestion!</h3>
            <p>The creator reads every single one. You might just see your idea live!</p>
            <button className="about-suggest-btn" onClick={() => { setSubmitted(false); setShowSuggest(false) }}>
              Drop Another
            </button>
          </div>
        ) : (
          <div className="about-suggest-form">
            <h3>💡 Your Suggestion</h3>
            <div className="suggest-cats">
              {CAT.map(c => (
                <button key={c.key}
                  className={`suggest-cat-btn ${category === c.key ? 'active' : ''}`}
                  style={category === c.key ? { background: c.color, color: '#fff', borderColor: c.color } : {}}
                  onClick={() => setCategory(c.key)}>
                  {c.label}
                </button>
              ))}
            </div>
            <textarea
              className="suggest-textarea"
              placeholder="Describe your idea, bug, or feedback... Be as detailed as you like!"
              value={suggestion}
              onChange={e => setSuggestion(e.target.value.slice(0, 300))}
              rows={4}
              autoFocus
            />
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginTop:'8px'}}>
              <span style={{fontSize:'11px',color:'rgba(100,50,10,0.4)',fontWeight:800}}>{suggestion.length}/300</span>
              <div style={{display:'flex',gap:'8px'}}>
                <button className="btn-ghost" onClick={() => setShowSuggest(false)}>Cancel</button>
                <button className="about-suggest-btn" onClick={submitSuggestion} disabled={loading || !suggestion.trim()}>
                  {loading ? '🚀 Sending...' : '🚀 Send It!'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Top suggestions */}
        {allSuggestions.length > 0 && (
          <div className="about-top-suggest">
            <button className="suggest-toggle" onClick={() => setShowAll(!showAll)}>
              {showAll ? '▲ Hide' : '▼ Show'} top suggestions ({allSuggestions.length})
            </button>
            {showAll && (
              <div className="suggest-list">
                {allSuggestions.map(s => (
                  <div key={s.id} className="suggest-item">
                    <div className="suggest-item-left">
                      <span className="suggest-item-animal">{s.author_animal}</span>
                      <div>
                        <span className="suggest-item-cat" style={{color: CAT.find(c=>c.key===s.category)?.color || '#888'}}>
                          {CAT.find(c=>c.key===s.category)?.label || s.category}
                        </span>
                        <p className="suggest-item-text">{s.content}</p>
                      </div>
                    </div>
                    <button className="suggest-upvote" onClick={() => upvote(s.id)}>
                      👍 {s.upvotes}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="about-footer">
          Made with 💛 · <em>Suggestions reach the creator via Supabase dashboard</em>
        </div>
      </div>
    </div>
  )
}
// ── WORLDS / COMMUNITIES ─────────────────────────────────────────────────────
function WorldsPage({ user, onClose, onEnterWorld }) {
  const [tab,          setTab]     = useState('discover') // discover | create | mine
  const [search,       setSearch]  = useState('')
  const [worlds,       setWorlds]  = useState([])
  const [loading,      setLoading] = useState(false)
  const [creating,     setCreating]= useState(false)

  // Create form state
  const [wName, setWName] = useState('')
  const [wDesc, setWDesc] = useState('')
  const [wEmoji,setWEmoji]= useState('🌍')
  const [wTags, setWTags] = useState('')
  const [wError,setWError]= useState('')

  const EMOJI_OPTIONS = ['🌍','🎮','🎵','🍕','💻','📚','🏀','😂','💕','🌿','✈️','🎬','🎨','🏋️','🐾','🌙','⭐','🔥','💡','🎭']

  useEffect(() => { loadWorlds() }, [search])

  async function loadWorlds() {
    setLoading(true)
    let q = supabase.from('worlds').select('*').order('note_count', { ascending: false })
    if (search.trim()) {
      // Fuzzy search — match name, description, or tags
      q = q.or(`name.ilike.%${search}%,description.ilike.%${search}%,slug.ilike.%${search}%`)
    }
    const { data } = await q.limit(20)
    setWorlds(data || [])
    setLoading(false)
  }

  function toSlug(name) {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
  }

  async function createWorld() {
    if (!wName.trim()) { setWError('Give your world a name!'); return }
    if (wName.length < 3) { setWError('Name needs at least 3 characters'); return }
    const slug = toSlug(wName)
    // Check slug uniqueness
    const { data: existing } = await supabase.from('worlds').select('id').eq('slug', slug).limit(1)
    if (existing && existing.length > 0) { setWError('A world with this name already exists! Try something more specific.'); return }

    setCreating(true)
    const tags = wTags.split(',').map(t => t.trim().toLowerCase()).filter(Boolean)
    const { data, error } = await supabase.from('worlds').insert({
      name: wName.trim(),
      slug,
      description: wDesc.trim() || null,
      emoji: wEmoji,
      creator_id: user.id,
      creator_name: user.name,
      creator_animal: user.animal,
      tags,
    }).select().single()

    setCreating(false)
    if (!error && data) {
      onEnterWorld(data)
      onClose()
    } else {
      setWError('Something went wrong. Try again!')
    }
  }

  const myWorlds = worlds.filter(w => w.creator_id === user.id)

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="worlds-modal" onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>✕</button>

        <div className="worlds-header">
          <div style={{fontSize:'36px'}}>🌐</div>
          <h2 className="worlds-title">Worlds</h2>
          <p className="worlds-sub">Topic communities — find your people</p>
        </div>

        {/* Tabs */}
        <div className="worlds-tabs">
          {[['discover','🔍 Discover'],['create','✨ Create'],['mine','👤 My Worlds']].map(([k,l]) => (
            <button key={k} className={`worlds-tab ${tab===k?'active':''}`} onClick={() => setTab(k)}>{l}</button>
          ))}
        </div>

        {/* ── DISCOVER TAB ── */}
        {tab === 'discover' && (
          <div className="worlds-body">
            <div className="worlds-search-wrap">
              <input
                className="worlds-search"
                placeholder="🔍 Search worlds... (e.g. friends, gaming, jodhpur)"
                value={search}
                onChange={e => setSearch(e.target.value)}
                autoFocus
              />
            </div>

            {loading ? (
              <div className="worlds-loading">Loading worlds... 🌍</div>
            ) : worlds.length === 0 ? (
              <div className="worlds-empty">
                <div style={{fontSize:'40px'}}>🌱</div>
                <p>No worlds found for "{search}"</p>
                <button className="worlds-create-cta" onClick={() => setTab('create')}>
                  Create "{search}" World →
                </button>
              </div>
            ) : (
              <div className="worlds-grid">
                {worlds.map(w => (
                  <div key={w.id} className="world-card" onClick={() => { onEnterWorld(w); onClose() }}>
                    <div className="world-card-emoji">{w.emoji}</div>
                    <div className="world-card-info">
                      <div className="world-card-name">{w.name}</div>
                      {w.description && <div className="world-card-desc">{w.description.slice(0,60)}{w.description.length>60?'...':''}</div>}
                      <div className="world-card-stats">
                        <span>📌 {w.note_count} notes</span>
                        <span>👥 {w.member_count} members</span>
                      </div>
                      {w.tags?.length > 0 && (
                        <div className="world-card-tags">
                          {w.tags.slice(0,3).map(t => <span key={t} className="world-tag">#{t}</span>)}
                        </div>
                      )}
                    </div>
                    <div className="world-card-arrow">→</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── CREATE TAB ── */}
        {tab === 'create' && (
          <div className="worlds-body">
            <div className="worlds-create-form">
              {/* Emoji picker */}
              <div className="wf-label">Choose an emoji for your world:</div>
              <div className="emoji-picker-grid">
                {EMOJI_OPTIONS.map(e => (
                  <button key={e} className={`emoji-opt ${wEmoji===e?'selected':''}`} onClick={() => setWEmoji(e)}>{e}</button>
                ))}
              </div>

              <div className="wf-label">World name *</div>
              <input className="wf-input" placeholder="e.g. Friends TV Series, Jodhpur Foodies, Indie Dev Chat"
                value={wName} onChange={e => { setWName(e.target.value); setWError('') }} maxLength={40}/>
              <div className="wf-hint">Slug: /{toSlug(wName || 'your-world-name')}</div>

              <div className="wf-label">Description</div>
              <textarea className="wf-input" rows={2} placeholder="What's this world about? (optional)"
                value={wDesc} onChange={e => setWDesc(e.target.value)} maxLength={120}/>

              <div className="wf-label">Tags (comma separated)</div>
              <input className="wf-input" placeholder="e.g. tv, comedy, 90s, sitcom"
                value={wTags} onChange={e => setWTags(e.target.value)}/>

              {wError && <div className="wf-error">⚠️ {wError}</div>}

              {/* Preview */}
              <div className="world-preview">
                <span style={{fontSize:'28px'}}>{wEmoji}</span>
                <div>
                  <div style={{fontWeight:900,color:'#2d3a6b'}}>{wName || 'World Name'}</div>
                  <div style={{fontSize:'11px',color:'rgba(80,40,10,0.5)'}}>{wDesc || 'No description'}</div>
                </div>
              </div>

              <button className="worlds-create-btn" onClick={createWorld} disabled={creating || !wName.trim()}>
                {creating ? '🌍 Creating...' : `${wEmoji} Create World`}
              </button>
            </div>
          </div>
        )}

        {/* ── MY WORLDS TAB ── */}
        {tab === 'mine' && (
          <div className="worlds-body">
            {myWorlds.length === 0 ? (
              <div className="worlds-empty">
                <div style={{fontSize:'40px'}}>🌱</div>
                <p>You haven't created any worlds yet</p>
                <button className="worlds-create-cta" onClick={() => setTab('create')}>Create Your First World →</button>
              </div>
            ) : (
              <div className="worlds-grid">
                {myWorlds.map(w => (
                  <div key={w.id} className="world-card" onClick={() => { onEnterWorld(w); onClose() }}>
                    <div className="world-card-emoji">{w.emoji}</div>
                    <div className="world-card-info">
                      <div className="world-card-name">{w.name}</div>
                      <div className="world-card-stats"><span>📌 {w.note_count} notes</span></div>
                    </div>
                    <div className="world-card-arrow">→</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

function WorldBanner({ world, onLeave }) {
  return (
    <div className="world-banner">
      <span className="world-banner-emoji">{world.emoji}</span>
      <div className="world-banner-info">
        <span className="world-banner-name">{world.name}</span>
        <span className="world-banner-desc">World · Notes pinned here appear globally</span>
      </div>
      <button className="world-banner-leave" onClick={onLeave}>✕ Leave</button>
    </div>
  )
}

// ── LEADERBOARD ───────────────────────────────────────────────────────────────
function Leaderboard() {
  const [leaders, setLeaders] = useState([])
  const [open, setOpen]       = useState(false)

  useEffect(() => {
    if (!open) return
    loadLeaders()
  }, [open])

  async function loadLeaders() {
    const today = new Date().toISOString().split('T')[0]
    const { data: notes } = await supabase.from('notes').select('author_name,author_animal,author_color,author_id')
      .gte('created_at', `${today}T00:00:00`).eq('is_seeded', false)
    const { data: comments } = await supabase.from('comments').select('author_name,author_animal,author_color,author_id')
      .gte('created_at', `${today}T00:00:00`)

    const scores = {}
    ;(notes||[]).forEach(n => {
      if (!scores[n.author_id]) scores[n.author_id] = { name: n.author_name, animal: n.author_animal, color: n.author_color, notes: 0, comments: 0 }
      scores[n.author_id].notes++
    })
    ;(comments||[]).forEach(c => {
      if (!scores[c.author_id]) scores[c.author_id] = { name: c.author_name, animal: c.author_animal, color: c.author_color, notes: 0, comments: 0 }
      scores[c.author_id].comments++
    })

    const sorted = Object.values(scores)
      .map(s => ({ ...s, total: s.notes * 3 + s.comments }))
      .sort((a,b) => b.total - a.total)
      .slice(0, 5)

    setLeaders(sorted)
  }

  const BADGES = ['🥇','🥈','🥉','🏅','🏅']
  const TITLES = ['Champion','Runner Up','Bronze','Contributor','Contributor']

  return (
    <div className="leaderboard-wrap">
      <button className="leaderboard-btn" onClick={() => setOpen(!open)}>
        🏆 Today's Top Contributors
      </button>
      {open && (
        <div className="leaderboard-panel">
          <div className="leaderboard-title">🏆 Daily Leaderboard</div>
          <div className="leaderboard-sub">Resets every midnight · Notes = 3pts · Comments = 1pt</div>
          {leaders.length === 0 ? (
            <div className="leaderboard-empty">No activity yet today — be the first! 🌟</div>
          ) : leaders.map((l, i) => (
            <div key={i} className={`leader-row ${i === 0 ? 'leader-first' : ''}`}>
              <span className="leader-badge">{BADGES[i]}</span>
              <div className="leader-avatar" style={{ background: l.color }}>{l.animal}</div>
              <div className="leader-info">
                <span className="leader-name">{l.name}</span>
                <span className="leader-title">{TITLES[i]}</span>
              </div>
              <div className="leader-score">
                <span>{l.notes} 📌</span>
                <span>{l.comments} 💬</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
export default function App() {
  const [user,          setUser]          = useState(getOrCreateUser())
  const [notes,         setNotes]         = useState([])
  const [loading,       setLoading]       = useState(false)
  const [selectedNote,  setSelectedNote]  = useState(null)
  const [showAbout,     setShowAbout]     = useState(false)
  const [openSuggest,   setOpenSuggest]   = useState(false)
  const [showWorlds,    setShowWorlds]    = useState(false)
  const [activeWorld,   setActiveWorld]   = useState(null)  // currently entered world
  const [showNewNote,   setShowNewNote]   = useState(false)
  const [showNotes,     setShowNotes]     = useState(false)
  const [filterCountry, setFilterCountry] = useState('')
  const [filterState,   setFilterState]   = useState('')
  const [filterCity,    setFilterCity]    = useState('')
  const [filterTag,     setFilterTag]     = useState('')

  const notesRef = useRef(null)

  const TAGS = [
    {key:'gaming',   label:'Gaming',   emoji:'🎮'},{key:'music',    label:'Music',    emoji:'🎵'},
    {key:'food',     label:'Food',     emoji:'🍕'},{key:'tech',     label:'Tech',     emoji:'💻'},
    {key:'books',    label:'Books',    emoji:'📚'},{key:'sports',   label:'Sports',   emoji:'🏀'},
    {key:'memes',    label:'Memes',    emoji:'😂'},{key:'feelings', label:'Feelings', emoji:'💕'},
    {key:'nature',   label:'Nature',   emoji:'🌿'},{key:'travel',   label:'Travel',   emoji:'✈️'},
  ]

  const loadNotes = useCallback(async () => {
    setLoading(true)
    let q = supabase.from('notes').select('*')
      .gt('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false }).limit(100)
    if (filterCountry) q = q.eq('country', filterCountry)
    if (filterState && !filterCity) q = q.eq('state', filterState)
    if (filterCity)    q = q.ilike('city', `%${filterCity}%`)
    if (filterTag)     q = q.eq('interest_tag', filterTag)
    if (activeWorld)   q = q.eq('world_id', activeWorld.id)
    const { data } = await q
    setNotes((data || []).sort(() => Math.random() - 0.5))
    setLoading(false)
  }, [filterCountry, filterState, filterCity, filterTag, activeWorld])

  // only load notes when user clicks Explore
  useEffect(() => {
    if (!showNotes) return
    loadNotes()
    const ch = supabase.channel('notes-live')
      .on('postgres_changes', { event:'INSERT', schema:'public', table:'notes' }, loadNotes)
      .subscribe()
    return () => supabase.removeChannel(ch)
  }, [loadNotes, showNotes])

  // Handle shared note URL — ?note=<id>
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const noteId = params.get('note')
    if (!noteId) return
    supabase.from('notes').select('*').eq('id', noteId).single()
      .then(({ data }) => {
        if (data) setSelectedNote(data)
        // Clean URL without reloading
        window.history.replaceState({}, '', window.location.pathname)
      })
  }, [])

  // Seed for category when filter changes
  useEffect(() => {
    if (filterTag) seedForCategory(filterTag)
  }, [filterTag])

  // Seed for city when filter changes
  useEffect(() => {
    if (filterCity) seedForCity(filterCity)
  }, [filterCity])

  // When "Explore Notes" is clicked — show notes section and scroll down
  const handleExplore = () => {
    document.body.style.overflow = ''   // unlock scroll
    setShowNotes(true)
    setTimeout(() => {
      notesRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 100)
  }

  const clearFilters = () => {
    setFilterCountry(''); setFilterState(''); setFilterCity(''); setFilterTag('')
  }

  const handleUserUpdate = (u) => setUser({...u})

  return (
    <div className="app">
      {/* Hide identity corner when any modal is open */}
      {!showNewNote && !showAbout && !showWorlds && !selectedNote && (
        <IdentityCorner user={user} onUpdate={handleUserUpdate}/>
      )}

      {/* ── SLIM HEADER (logo only, no clutter) ── */}
      <header className="header">
        <div className="logo-area">
          <GlobeLogo/>
          <div className="logo-text-col">
            <div className="worldmap-wrap">
              <WorldMapSplash/>
              <div className="worldpad-title">Worldpad</div>
              <div className="logo-sub">Collaborate. Create. Think.</div>
            </div>
          </div>
        </div>
        <div className="header-actions">
          <button className="hbtn hbtn-about" onClick={() => { setOpenSuggest(false); setShowAbout(true) }}
            title="Learn what Worldpad is and how it works">
            <span className="hbtn-icon" style={{background:'#c8e6f8'}}>💡</span>About
          </button>
          <button className="hbtn hbtn-suggest" onClick={() => { setOpenSuggest(true); setShowAbout(true) }}
            title="Got an idea? Send a suggestion directly to the creator!">
            <span className="hbtn-icon" style={{background:'#e8d8f8'}}>✨</span>Suggest
          </button>
          <button className="hbtn hbtn-worlds" onClick={() => setShowWorlds(true)}
            title="Create or join topic communities — search 'friends', 'gaming', 'jodhpur' and more">
            <span className="hbtn-icon" style={{background:'#d8f0e8'}}>🌐</span>Worlds
          </button>
          <button className="hbtn hbtn-pin" onClick={() => setShowNewNote(true)}
            title="Drop an anonymous note — it stays for 24 hours then disappears">
            <span className="hbtn-icon hbtn-icon-pin">📌</span>Pin a Note
          </button>
          <button className="hbtn hbtn-surprise" onClick={handleExplore}
            title="Browse notes from around the world — filter by city, country or topic">
            <span className="hbtn-icon hbtn-icon-surprise">🎲</span>Explore Notes
          </button>
        </div>
      </header>

      {/* Active World Banner */}
      {activeWorld && <WorldBanner world={activeWorld} onLeave={() => { setActiveWorld(null) }}/>}

      {/* ── 3D GLOBE HERO — always the first thing you see ── */}
      <HeroEmpty
        onPin={() => { document.body.style.overflow = ''; setShowNewNote(true) }}
        onExplore={handleExplore}
      />

      {/* ── NOTES SECTION — only appears after clicking Explore ── */}
      {showNotes && (
        <div ref={notesRef} className="notes-section">

          {/* Filters */}
          <div className="filters">
            <div className="filter-row">
              <select value={filterCountry} onChange={e => { setFilterCountry(e.target.value); setFilterState(''); setFilterCity('') }}>
                <option value="">🌍 All Countries</option>
                {COUNTRIES.map(c => <option key={c}>{c}</option>)}
              </select>
              {filterCountry === 'India' && (
                <select value={filterState} onChange={e => { setFilterState(e.target.value); setFilterCity('') }}>
                  <option value="">All States</option>
                  {INDIA_STATES.map(s => <option key={s}>{s}</option>)}
                </select>
              )}
              {filterCountry && (
                filterCountry === 'India' && filterState ? (
                  <select value={filterCity} onChange={e => setFilterCity(e.target.value)}>
                    <option value="">🏙️ All Cities</option>
                    {(CITIES_BY_STATE[filterState] || []).map(c => <option key={c}>{c}</option>)}
                  </select>
                ) : filterCountry !== 'India' ? (
                  <select value={filterCity} onChange={e => setFilterCity(e.target.value)}>
                    <option value="">🏙️ All Cities</option>
                    {(CITIES_BY_COUNTRY[filterCountry] || []).map(c => <option key={c}>{c}</option>)}
                  </select>
                ) : null
              )}
            </div>
            <div className="tag-filters">
              {TAGS.map(t => (
                <span key={t.key}
                  className={`interest-tag ${filterTag === t.label ? 'active' : ''}`}
                  data-tag={t.key}
                  onClick={() => setFilterTag(filterTag === t.label ? '' : t.label)}>
                  <span className="tag-emoji">{t.emoji}</span>{t.label}
                </span>
              ))}
            </div>
            {(filterCountry || filterTag || filterCity) && (
              <div style={{display:'flex',gap:'8px',flexWrap:'wrap',alignItems:'center'}}>
                {filterCountry && <span className="filter-badge">🌍 {filterCountry}</span>}
                {filterTag     && <span className="filter-badge">{filterTag}</span>}
                <button className="clear-btn" onClick={clearFilters}>✕ Clear</button>
              </div>
            )}
          </div>

          {/* Notes grid */}
          <main className="board">
            {loading ? (
              <div className="loading-state">
                <div className="loading-spinner"/>
                <p>Loading the world's thoughts...</p>
              </div>
            ) : notes.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">📭</div>
                <h3>Nothing here yet!</h3>
                <p>Be the first to pin a note.</p>
                <button className="hbtn hbtn-pin" style={{marginTop:'12px'}} onClick={() => setShowNewNote(true)}>
                  <span className="hbtn-icon hbtn-icon-pin">📌</span>Pin the first note!
                </button>
              </div>
            ) : (
              <>
                <div className="board-top-row">
                  <div className="board-label">📌 Notes From Around The World</div>
                  <Leaderboard/>
                </div>
                <div className="notes-grid">
                  {notes.map(n => <StickyNote key={n.id} note={n} onClick={setSelectedNote}/>)}
                </div>
              </>
            )}
          </main>
        </div>
      )}

      {selectedNote && <NoteModal note={selectedNote} user={user} onClose={() => setSelectedNote(null)}/>}
      {showNewNote  && <NewNoteForm user={user} activeWorld={activeWorld} onClose={() => setShowNewNote(false)} onPosted={() => { loadNotes(); setShowNotes(true) }}/>}
      {showAbout    && <AboutPage user={user} onClose={() => { setShowAbout(false); setOpenSuggest(false) }} openSuggest={openSuggest}/>}
      {showWorlds   && <WorldsPage user={user} onClose={() => setShowWorlds(false)} onEnterWorld={w => { setActiveWorld(w); setShowNotes(true); handleExplore() }}/>}
    </div>
  )
}
