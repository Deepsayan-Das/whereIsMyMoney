export const WELCOME_MESSAGES = [
  { greeting: 'Welcome back 👋',       subtitle: "Let's see where your money's at." },
  { greeting: 'Good to see you 😊',    subtitle: 'Your finances are waiting.' },
  { greeting: 'Hey there 👀',          subtitle: "Let's keep those numbers in check." },
  { greeting: "You're on top of it 💪",subtitle: 'Another day, another rupee tracked.' },
  { greeting: 'Hello, money manager 🧾',subtitle: "Let's make every paisa count." },
  { greeting: 'Back at it 🔍',         subtitle: 'Your money story continues.' },
  { greeting: "Let's get to it 🚀",    subtitle: 'Financial clarity starts here.' },
  { greeting: 'Discipline is wealth 🧘',subtitle: 'Check in. Stay sharp.' },
]

export const FINANCIAL_THOUGHTS = [
  "💡 A budget isn't a restriction — it's a permission slip to spend guilt-free.",
  "📈 Compound interest is the eighth wonder of the world. Earn it, don't pay it.",
  "🪣 Wealth is built in the gaps between what you earn and what you spend.",
  "🎯 Tracking every rupee isn't obsession — it's intention.",
  "🧱 Financial freedom is built brick by brick, habit by habit.",
  "⏳ The best time to start saving was yesterday. The second best time is now.",
  "🔍 You can't manage what you don't measure.",
  "🛑 Lifestyle inflation is the silent killer of savings goals.",
  "🌱 Small, consistent contributions outperform large, sporadic ones.",
  "💬 Rich people stay rich by living like they're not. Spend mindfully.",
  "📊 A spending audit once a month is worth more than a salary raise.",
  "🎲 Risk you understand is an investment. Risk you don't is gambling.",
  "🧩 Diversify income before you diversify investments.",
  "🏦 An emergency fund isn't optional — it's the foundation of everything.",
  "✂️  Cutting one unnecessary subscription a month adds up to a vacation a year.",
]

export function getRandomWelcome() {
  return WELCOME_MESSAGES[Math.floor(Math.random() * WELCOME_MESSAGES.length)]
}

export function getRandomThought() {
  return FINANCIAL_THOUGHTS[Math.floor(Math.random() * FINANCIAL_THOUGHTS.length)]
}