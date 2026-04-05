import { supabase } from './supabase'

const SEED_KEY = 'worldpad_last_seed'
const BOT_USERS = [
  { name: 'TrendBot', animal: '🤖', color: '#9C27B0', id: 'bot-001' },
  { name: 'LocalVibes', animal: '🌍', color: '#2196F3', id: 'bot-002' },
  { name: 'DailyPulse', animal: '⚡', color: '#FF5722', id: 'bot-003' },
  { name: 'TopicTrail', animal: '🔥', color: '#E91E63', id: 'bot-004' },
  { name: 'WorldWatch', animal: '🌟', color: '#00BCD4', id: 'bot-005' },
]

const NOTE_COLORS = ['#FFEB3B','#FF8A80','#82B1FF','#CCFF90','#EA80FC','#FFD180','#A7FFEB','#FF80AB']

// Trending topics per category
const CATEGORY_TOPICS = {
  Gaming: [
    "Anyone else grinding ranked this week? The new season changes are wild 🎮",
    "Hot take: single player games are making a comeback and I'm here for it",
    "That new indie game everyone's talking about actually slaps fr",
    "Console wars are dead, PC master race is dead, just play what you enjoy",
    "The nostalgia of old flash games hitting different lately 🕹️",
    "Multiplayer with randoms vs friends — no contest, friends win every time",
    "Game devs working crunch deserve better. Support indie studios!",
    "When the game's tutorial is harder than the actual game 😅",
  ],
  Music: [
    "That song that gets stuck in your head and you don't even know the name 🎵",
    "Listening to music from 2010s hits differently now tbh",
    "Lo-fi beats for studying is genuinely the best invention of the decade",
    "Vinyl is making a comeback and honestly the sound quality argument is real",
    "Concert tickets are way too expensive now, miss the old days",
    "Spotify wrapped season got everyone sharing their taste 🎧",
    "That artist everyone slept on who suddenly blew up this year",
    "Live music > recorded music, no debate",
  ],
  Food: [
    "Homemade food will always beat any restaurant, change my mind 🍕",
    "That one local dish tourists never try but locals swear by",
    "Fusion food is either genius or an abomination, no in between",
    "The comfort food debate: what's yours for rainy days?",
    "Street food > fine dining every single time",
    "Cooking a new recipe and it actually worked out 🎉",
    "Food delivery apps are slowly ruining local restaurants",
    "That spice combination that sounds wrong but tastes amazing",
  ],
  Tech: [
    "AI is everywhere now but we still can't get self-driving cars right 🤖",
    "The metaverse quietly died and nobody held a funeral",
    "Open source software keeps saving the internet and nobody talks about it",
    "Your old phone from 5 years ago can do 90% of what new phones do",
    "Dark mode should be the default on every app. Non-negotiable.",
    "Privacy is the new luxury. Big tech knows too much about us.",
    "Coding is still the most useful skill you can teach yourself for free",
    "Tech layoffs hit different when you realize these are real people's lives",
  ],
  Books: [
    "Currently reading something that's completely changing how I see the world 📚",
    "Physical books vs ebooks — there's something irreplaceable about paper",
    "That book everyone recommended that actually lived up to the hype",
    "Re-reading a childhood book as an adult hits totally differently",
    "Library cards are the most underrated free resource in existence",
    "A good book at 2am when you can't sleep is a different experience",
    "That author who writes like they're living inside your head",
    "Bookmarks vs dog-earing pages — what kind of person are you?",
  ],
  Sports: [
    "The underdog story this season that nobody saw coming 🏆",
    "Local club support vs big club support — completely different energies",
    "Athletes as role models — the pressure they're under is insane",
    "That moment in sports that gave you genuine chills",
    "Women's sports finally getting the coverage they deserve 💪",
    "Fantasy leagues have ruined how I watch games (in the best way)",
    "The GOAT debate in your sport — who actually wins?",
    "Stadium atmosphere vs watching from home — which is better?",
  ],
  Memes: [
    "The meme cycle is getting faster. Something from yesterday already feels old 😂",
    "Gen Z humor is completely unhinged and I respect it",
    "That meme format that somehow keeps reinventing itself every few months",
    "When a meme hits so hard you send it to 10 people at once",
    "Explaining a meme to someone kills it instantly. Unwritten law.",
    "The memes that age well vs the ones that crash in 48 hours",
    "Dark humor memes walking a very fine line and somehow surviving",
    "When your parents start using a meme it's officially dead 💀",
  ],
  Feelings: [
    "That random wave of nostalgia that hits you out of nowhere 💕",
    "Being genuinely happy for others is a skill that takes practice",
    "Loneliness in a crowded city is a different kind of alone",
    "The small things that secretly hold your day together",
    "Telling someone you appreciate them before it's too late",
    "That feeling when music perfectly matches your current mood",
    "Growth is uncomfortable and that's exactly how you know it's real",
    "Some days are just hard and that's okay. Tomorrow exists.",
  ],
  Nature: [
    "A sunset that stopped you in your tracks this week? 🌿",
    "The sound of rain is genuinely the most calming thing on earth",
    "Wildlife in cities is increasing and it's both beautiful and a warning",
    "That local park/nature spot that not enough people know about",
    "Watching a full sunrise once changes something inside you permanently",
    "Plant parenthood is the gateway drug to caring about the environment",
    "Climate anxiety is real and we need to talk about it more",
    "The ocean at night is terrifying and magnificent at the same time",
  ],
  Travel: [
    "That city everyone says is overrated but you ended up loving ✈️",
    "Slow travel > rushing through 10 countries in 2 weeks",
    "The best travel experiences are usually the unplanned ones",
    "Local transport in a foreign city is its own adventure",
    "That one trip that genuinely changed how you see yourself",
    "Budget travel taught me more than luxury travel ever could",
    "The airport experience is designed to make you spend money and it works",
    "Traveling solo once in your life is genuinely life-changing",
  ],
}

// City-specific notes
const CITY_NOTES = {
  'Jodhpur': [
    "The blue city is genuinely magical at sunset, nothing compares 💙",
    "Mehrangarh fort views hit different in the early morning",
    "Jodhpur's makhaniya lassi is something the rest of the world is missing out on",
    "The old city lanes are a maze but the best kind to get lost in",
  ],
  'Jaipur': [
    "Pink city in golden hour is unreal 🌅",
    "Hawa Mahal selfie spot getting crowded but still worth the visit",
    "Jaipur traffic is an experience of its own 😅",
    "Block printing workshops in Jaipur are hidden gems",
  ],
  'Mumbai': [
    "Marine Drive at midnight is the city's best kept secret 🌙",
    "Vada pav > every other fast food. Mumbai wins.",
    "Local train during rush hour is a survival sport",
    "Monsoon in Mumbai hits different — terrifying and beautiful",
  ],
  'Delhi': [
    "Delhi's winters with chai and fog is a whole personality 🫖",
    "The street food game in Old Delhi is unmatched globally",
    "Metro system actually runs on time and Delhi people take it for granted",
    "Lutyen's bungalow zone is like a different city within the city",
  ],
  'Bengaluru': [
    "Bangalore weather spoils you and then you move and regret it forever",
    "The startup energy here is infectious even if you're not in tech 💻",
    "Indiranagar on a Saturday evening is a whole vibe",
    "Traffic here has become the city's defining characteristic sadly",
  ],
  'New Delhi': [
    "Connaught Place in the evening still has that old Delhi charm",
    "Delhi's food scene is genuinely world class if you know where to look",
    "The Yamuna finally looking cleaner is progress worth celebrating",
  ],
  'Mumbai': [
    "Worli sea face run at 6am is the most peaceful thing Mumbai offers",
    "Dabbawalas are one of the most impressive logistics operations in the world",
  ],
  'Chennai': [
    "Filter coffee in Chennai is a religious experience ☕",
    "Marina Beach at dawn with no crowds is Chennai at its best",
    "Auto drivers here negotiate like it's a life skill",
  ],
  'Kolkata': [
    "Kolkata's intellectual culture and coffee houses are irreplaceable",
    "Durga Puja here is not a festival, it's an emotion 🙏",
    "The book fair culture in Kolkata is something every city should have",
  ],
  'Hyderabad': [
    "Hyderabadi biryani is not up for debate. It wins. Period. 🍛",
    "Charminar area is chaotic but the food and culture make it worth it",
    "Cyberabad at night actually looks like a sci-fi film set",
  ],
}

const CITY_STATE_MAP = {
  'Jodhpur': 'Rajasthan', 'Jaipur': 'Rajasthan', 'Udaipur': 'Rajasthan',
  'Mumbai': 'Maharashtra', 'Pune': 'Maharashtra',
  'Delhi': 'Delhi', 'New Delhi': 'Delhi',
  'Bengaluru': 'Karnataka', 'Mysuru': 'Karnataka',
  'Chennai': 'Tamil Nadu', 'Coimbatore': 'Tamil Nadu',
  'Hyderabad': 'Telangana', 'Kolkata': 'West Bengal',
}

function getTodayStr() {
  return new Date().toISOString().split('T')[0]
}

function getRandomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)]
}

async function callClaude(prompt) {
  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1000,
        system: 'You generate short, engaging sticky notes for a global thought-sharing app. Each note must be under 140 characters, conversational, relatable, and end with an emoji. Return ONLY a JSON array of strings, nothing else.',
        messages: [{ role: 'user', content: prompt }]
      })
    })
    const data = await res.json()
    const text = data.content?.[0]?.text || '[]'
    return JSON.parse(text.replace(/```json|```/g, '').trim())
  } catch {
    return null
  }
}

async function seedCategoryNotes(category, count = 5) {
  const topics = CATEGORY_TOPICS[category] || CATEGORY_TOPICS.Gaming
  const chosen = [...topics].sort(() => Math.random() - 0.5).slice(0, count)

  let aiNotes = null
  try {
    const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
    aiNotes = await callClaude(
      `Generate ${count} short sticky note messages about "${category}" for today ${today}. Make them feel like real person thoughts, casual and relatable. JSON array only.`
    )
  } catch {}

  const notes = (aiNotes && Array.isArray(aiNotes) && aiNotes.length >= count)
    ? aiNotes.slice(0, count)
    : chosen

  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()

  // Check ALL existing seeded notes (not just today) to prevent duplicates
  const { data: existing } = await supabase.from('notes')
    .select('content')
    .eq('is_seeded', true)
    .eq('interest_tag', category)
    .gt('expires_at', new Date().toISOString())
  const existingTexts = new Set((existing || []).map(n => n.content.trim().toLowerCase()))

  const toInsert = notes.filter(n => !existingTexts.has(String(n).trim().toLowerCase()))
  if (toInsert.length === 0) return

  for (let i = 0; i < toInsert.length; i++) {
    const bot = BOT_USERS[i % BOT_USERS.length]
    const noteText = String(toInsert[i]).slice(0, 148)
    await supabase.from('notes').insert({
      content: noteText,
      author_name: bot.name,
      author_id: bot.id,
      author_color: bot.color,
      author_animal: bot.animal,
      interest_tag: category,
      note_color: NOTE_COLORS[i % NOTE_COLORS.length],
      expires_at: expiresAt,
      upvotes: Math.floor(Math.random() * 12),
      is_seeded: true,
    })
  }
}

async function seedCityNotes(city) {
  const cityNotes = CITY_NOTES[city]
  if (!cityNotes || cityNotes.length === 0) return

  // Check if city notes already seeded today
  const { data: existing } = await supabase.from('notes')
    .select('id').eq('city', city).eq('is_seeded', true)
    .gte('created_at', new Date().toISOString().split('T')[0])
    .limit(1)

  if (existing && existing.length > 0) return

  const chosen = [...cityNotes].sort(() => Math.random() - 0.5).slice(0, 3)
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()

  // Check ALL active seeded notes for this city to prevent duplicates
  const { data: existingCity } = await supabase.from('notes')
    .select('content')
    .eq('is_seeded', true)
    .eq('city', city)
    .gt('expires_at', new Date().toISOString())
  const existingTexts = new Set((existingCity || []).map(n => n.content.trim().toLowerCase()))

  const toInsert = chosen.filter(c => !existingTexts.has(c.trim().toLowerCase()))
  if (toInsert.length === 0) return

  for (let i = 0; i < toInsert.length; i++) {
    const bot = getRandomItem(BOT_USERS)
    await supabase.from('notes').insert({
      content: toInsert[i],
      author_name: bot.name,
      author_id: bot.id,
      author_color: bot.color,
      author_animal: bot.animal,
      city,
      state: CITY_STATE_MAP[city] || null,
      country: 'India',
      note_color: NOTE_COLORS[i % NOTE_COLORS.length],
      expires_at: expiresAt,
      upvotes: Math.floor(Math.random() * 8),
      is_seeded: true,
    })
  }
}

export async function runDailySeed() {
  const today = getTodayStr()
  const lastSeed = localStorage.getItem(SEED_KEY)
  if (lastSeed === today) return // already seeded today

  // Check if DB already has today's seeds (another device may have seeded)
  const { data: existing } = await supabase.from('notes')
    .select('id').eq('is_seeded', true)
    .gte('created_at', `${today}T00:00:00`)
    .limit(1)

  if (existing && existing.length > 0) {
    localStorage.setItem(SEED_KEY, today)
    return
  }

  // Seed 3 random categories with 5 notes each
  const categories = Object.keys(CATEGORY_TOPICS)
    .sort(() => Math.random() - 0.5).slice(0, 3)

  for (const cat of categories) {
    await seedCategoryNotes(cat, 5)
  }

  // Seed a few popular cities
  const cities = ['Jodhpur', 'Jaipur', 'Mumbai', 'Delhi', 'Bengaluru']
  for (const city of cities.slice(0, 3)) {
    await seedCityNotes(city)
  }

  localStorage.setItem(SEED_KEY, today)
}

export async function seedForCategory(category) {
  // Called when user filters by a tag — seed if no notes exist for that category today
  const { data: existing } = await supabase.from('notes')
    .select('id').eq('interest_tag', category)
    .gte('created_at', new Date().toISOString().split('T')[0] + 'T00:00:00')
    .limit(1)

  if (existing && existing.length > 0) return
  await seedCategoryNotes(category, 5)
}

export async function seedForCity(city) {
  await seedCityNotes(city)
}
