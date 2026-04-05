const ADJECTIVES = ['Brave','Calm','Dizzy','Epic','Funky','Goofy','Happy','Jazzy','Kind','Lively','Mighty','Peppy','Quick','Rad','Silly','Tiny','Wild','Zesty','Bouncy','Cheeky','Eager','Fierce','Hyper','Jolly','Kooky','Moody','Perky','Quirky']

const ANIMALS = [
  { name: 'Panda',    emoji: '🐼' },
  { name: 'Tiger',    emoji: '🐯' },
  { name: 'Fox',      emoji: '🦊' },
  { name: 'Koala',    emoji: '🐨' },
  { name: 'Lion',     emoji: '🦁' },
  { name: 'Penguin',  emoji: '🐧' },
  { name: 'Owl',      emoji: '🦉' },
  { name: 'Wolf',     emoji: '🐺' },
  { name: 'Otter',    emoji: '🦦' },
  { name: 'Sloth',    emoji: '🦥' },
  { name: 'Llama',    emoji: '🦙' },
  { name: 'Capybara', emoji: '🦫' },
  { name: 'Quokka',   emoji: '🦘' },
  { name: 'Gecko',    emoji: '🦎' },
  { name: 'Eagle',    emoji: '🦅' },
  { name: 'Narwhal',  emoji: '🐋' },
  { name: 'Raccoon',  emoji: '🦝' },
  { name: 'Axolotl',  emoji: '🐸' },
]

const COLORS = ['#FF6B6B','#FF8E53','#FFC300','#2ECC71','#1ABC9C','#3498DB','#9B59B6','#E91E63','#00BCD4','#FF5722','#8BC34A','#FF4081','#7C4DFF']

export const NOTE_COLORS = [
  { bg: '#FFEB3B', border: '#F9A825', label: 'Sunny' },
  { bg: '#FF8A80', border: '#E53935', label: 'Rosy' },
  { bg: '#82B1FF', border: '#1565C0', label: 'Sky' },
  { bg: '#CCFF90', border: '#558B2F', label: 'Lime' },
  { bg: '#EA80FC', border: '#7B1FA2', label: 'Grape' },
  { bg: '#FFD180', border: '#E65100', label: 'Peach' },
  { bg: '#A7FFEB', border: '#00695C', label: 'Mint' },
  { bg: '#FF80AB', border: '#C2185B', label: 'Pink' },
]

export const INTEREST_TAGS = [
  { key: 'gaming',   label: 'Gaming',   emoji: '🎮' },
  { key: 'music',    label: 'Music',    emoji: '🎵' },
  { key: 'food',     label: 'Food',     emoji: '🍕' },
  { key: 'tech',     label: 'Tech',     emoji: '💻' },
  { key: 'books',    label: 'Books',    emoji: '📚' },
  { key: 'sports',   label: 'Sports',   emoji: '🏀' },
  { key: 'memes',    label: 'Memes',    emoji: '😂' },
  { key: 'feelings', label: 'Feelings', emoji: '💕' },
  { key: 'nature',   label: 'Nature',   emoji: '🌿' },
  { key: 'travel',   label: 'Travel',   emoji: '✈️' },
]

function generateId() {
  return Math.random().toString(36).substring(2) + Date.now().toString(36)
}

function generateUser() {
  const adj    = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)]
  const animal = ANIMALS[Math.floor(Math.random() * ANIMALS.length)]
  const num    = Math.floor(Math.random() * 99) + 1
  const color  = COLORS[Math.floor(Math.random() * COLORS.length)]
  return {
    id:     generateId(),
    name:   `${adj}${animal.name}${num}`,
    animal: animal.emoji,
    color,
  }
}

export function getOrCreateUser() {
  try {
    const stored = localStorage.getItem('worldpad_user')
    if (stored) {
      const u = JSON.parse(stored)
      if (u.id && u.name && u.animal && u.color) return u
    }
  } catch {}
  const user = generateUser()
  localStorage.setItem('worldpad_user', JSON.stringify(user))
  return user
}

export function rerollName() {
  const existing = getOrCreateUser()
  const fresh    = generateUser()
  const user     = { ...fresh, id: existing.id }
  localStorage.setItem('worldpad_user', JSON.stringify(user))
  return user
}

export function saveCustomName(customName, animalEmoji, color) {
  const existing = getOrCreateUser()
  // auto-add number suffix if name seems taken or is bare
  const name = customName.trim()
  const user = { ...existing, name, animal: animalEmoji || existing.animal, color: color || existing.color }
  localStorage.setItem('worldpad_user', JSON.stringify(user))
  return user
}

export { ADJECTIVES, ANIMALS, COLORS }

