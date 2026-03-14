const GROQ_API_KEY = process.env.EXPO_PUBLIC_GROQ_API_KEY
const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions'

// ── Models ────────────────────────────────────────────────────────────────────
const MODELS = {
  chat: 'llama-3.3-70b-versatile',
  analysis: 'llama-3.3-70b-versatile',
}

// ── Types ─────────────────────────────────────────────────────────────────────

export type InsightSeverity = 'positive' | 'warning' | 'danger' | 'tip'

export interface Insight {
  id: string
  severity: InsightSeverity
  message: string
}

export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

export interface FinancialContext {
  accounts: {
    _id: string
    kind: string
    currency: string
    balance: number
    budget?: number
    budgetReached?: boolean
  }[]
  transactions: {
    _id: string
    accountId: string
    amount: number
    type: 'credit' | 'debit'
    purpose: string
    note?: string
    createdAt: string
  }[]
}

// ── System prompt ─────────────────────────────────────────────────────────────

function buildSystemPrompt(ctx: FinancialContext): string {
  const totalBalance = ctx.accounts.reduce((s, a) => s + a.balance, 0)

  const budgetStatus = ctx.accounts
    .filter(a => a.budget && a.budget > 0)
    .map(a => ({
      kind: a.kind,
      balance: a.balance,
      budget: a.budget,
      percentUsed: Math.round((a.balance / a.budget!) * 100),
      remaining: a.budget! - a.balance,
      budgetReached: a.budgetReached,
    }))

  return `
You are Finn 🤖, a warm, friendly, and encouraging personal finance advisor 
built into a money tracking app called "Where Is My Money".

You have LIVE access to this user's actual financial data. Always use their 
real numbers — never give generic advice. Keep replies short and human.

════ LIVE FINANCIAL SNAPSHOT ════
Total Balance : ₹${totalBalance.toLocaleString('en-IN')}
Accounts      : ${JSON.stringify(ctx.accounts, null, 2)}
Budget Status : ${JSON.stringify(budgetStatus, null, 2)}
Recent Txns   : ${JSON.stringify(ctx.transactions.slice(0, 20), null, 2)}
═════════════════════════════════

PERSONALITY:
- Warm, encouraging, occasionally uses light humour
- Feels like a knowledgeable friend, not a bank
- Celebrates wins, honest about problems but never harsh
- Uses "you" not "the user"
- Uses ₹ and Indian number formatting (e.g. ₹1,20,000)

STRICT RULES:
- NEVER give a spending summary unless the user explicitly asks for one
- Max 3 sentences for proactive insights
- Max 4 sentences for chat replies
- Always reference their actual rupee amounts, never say "your balance"
  without saying the number
- If asked something unrelated to finance, gently redirect
`
}

// ── Helper: Groq Request ──────────────────────────────────────────────────────

async function callGroq(model: string, messages: any[], temperature = 0.7) {
  console.log(`[Groq] Calling ${model} with ${messages.length} messages...`)

  if (!GROQ_API_KEY) {
    console.error('[Groq] API Key is missing!')
    throw new Error('Groq API Key (EXPO_PUBLIC_GROQ_API_KEY) not found in .env')
  }

  try {
    const response = await fetch(GROQ_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        messages,
        temperature,
        max_tokens: 1024,
      }),
    })

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}))
      console.error(`[Groq] Error ${response.status}:`, errData)
      throw new Error(`Groq API Error: ${response.status} - ${JSON.stringify(errData)}`)
    }

    const data = await response.json()
    console.log('[Groq] Response received successfully')
    return data.choices[0]?.message?.content?.trim() || ''
  } catch (err) {
    console.error('[Groq] Fetch failed:', err)
    throw err
  }
}

// ── Proactive insights ────────────────────────────────────────────────────────

const INSIGHT_PROMPTS = [
  {
    id: 'unusual_spending',
    prompt: `Look at the recent transactions. Is there any single category or 
             merchant that appears unusually often or has an unusually large amount 
             compared to the others? If yes, flag it in one friendly sentence starting 
             with the category/purpose name. If nothing stands out, reply with exactly: SKIP`,
  },
  {
    id: 'budget_warning',
    prompt: `Look at the budget status. Is any account using more than 75% of its budget?
             If yes, give one warm but clear warning sentence mentioning the exact 
             remaining amount. If all accounts are healthy, reply with exactly: SKIP`,
  },
  {
    id: 'savings_praise',
    prompt: `Look at the credit transactions. Is there evidence of consistent saving 
             or income coming in? If yes, give one short encouraging sentence praising 
             a specific positive behaviour you see. If nothing praiseworthy stands out, 
             reply with exactly: SKIP`,
  },
  {
    id: 'budget_suggestion',
    prompt: `Based on the spending patterns and current budgets, is there ONE specific 
             budget adjustment you would suggest — either raising or lowering a limit? 
             Give a single actionable sentence with the specific account and amount. 
             If budgets look fine, reply with exactly: SKIP`,
  },
]

function severityFromId(id: string): InsightSeverity {
  if (id === 'savings_praise') return 'positive'
  if (id === 'budget_warning') return 'warning'
  if (id === 'unusual_spending') return 'danger'
  if (id === 'budget_suggestion') return 'tip'
  return 'tip'
}

export async function fetchInsights(ctx: FinancialContext): Promise<Insight[]> {
  const systemPrompt = buildSystemPrompt(ctx)
  const insights: Insight[] = []

  await Promise.all(
    INSIGHT_PROMPTS.map(async ({ id, prompt }) => {
      try {
        const text = await callGroq(MODELS.analysis, [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: prompt }
        ], 0.3) // Lower temperature for analysis

        if (text && !text.includes('SKIP')) {
          insights.push({ id, severity: severityFromId(id), message: text })
        }
      } catch (e) {
        console.warn(`Insight ${id} failed:`, e)
      }
    })
  )

  return insights
}

// ── Chat ──────────────────────────────────────────────────────────────────────

export async function sendChatMessage(
  userMessage: string,
  history: ChatMessage[],
  ctx: FinancialContext,
): Promise<string> {
  const systemPrompt = buildSystemPrompt(ctx)

  const messages = [
    { role: 'system', content: systemPrompt },
    ...history.map(m => ({
      role: m.role,
      content: m.content,
    })),
    { role: 'user', content: userMessage }
  ]

  return await callGroq(MODELS.chat, messages)
}