// ── CONTENT MODERATION ──────────────────────────────────────────────────────
// Client-side word filter + optional Claude API check

const BLOCKED_WORDS = [
  // hate speech
  'nigger','nigga','faggot','retard','spastic','chink','kike','wetback','beaner',
  // violence
  'kill yourself','kys','go die','i will kill','bomb threat',
  // sexual
  'rape','molest','child porn','cp link',
  // spam patterns
  'click here for','free money','whatsapp me at','telegram me',
]

const WARN_WORDS = [
  'stupid','idiot','dumb','loser','ugly','hate you','shut up',
]

export function moderateText(text) {
  const lower = text.toLowerCase()

  for (const word of BLOCKED_WORDS) {
    if (lower.includes(word)) {
      return { allowed: false, reason: 'This message contains content that violates our community guidelines.' }
    }
  }

  const warnings = WARN_WORDS.filter(w => lower.includes(w))
  if (warnings.length > 0) {
    return {
      allowed: true,
      warning: 'Your message contains language that might be considered unkind. Please be respectful! 💙'
    }
  }

  // Phone number pattern
  if (/(\+?\d[\s\-.]?){10,}/.test(text)) {
    return {
      allowed: true,
      warning: '📱 Heads up: sharing phone numbers publicly may not be safe. Consider using a private comment instead.'
    }
  }

  // Email pattern
  if (/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/.test(text)) {
    return {
      allowed: true,
      warning: '📧 Heads up: sharing your email publicly may expose you to spam. Consider a private comment.'
    }
  }

  return { allowed: true }
}

// Optional Claude API moderation for edge cases
export async function moderateWithAI(text) {
  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 100,
        system: 'You are a content moderator. Reply with ONLY valid JSON: {"safe": true} or {"safe": false, "reason": "brief reason"}. Be lenient — only flag genuinely harmful content like hate speech, threats, or explicit content. Casual rudeness is fine.',
        messages: [{ role: 'user', content: `Moderate this text: "${text}"` }]
      })
    })
    const data = await res.json()
    const result = JSON.parse(data.content?.[0]?.text || '{"safe": true}')
    if (!result.safe) {
      return { allowed: false, reason: result.reason || 'Content not allowed.' }
    }
  } catch {}
  return { allowed: true }
}
