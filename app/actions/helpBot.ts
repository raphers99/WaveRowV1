'use server'

const MODEL = 'claude-sonnet-4-20250514'

export async function helpBotAction(
  history: { role: 'user' | 'assistant', content: string }[],
  newMessage: string
): Promise<string> {
  try {
    const apiKey = process.env.ANTHROPIC_API_KEY
    if (!apiKey) {
      console.error('Missing ANTHROPIC_API_KEY environment variable.')
      return "Something went wrong — try again"
    }

    // Keep only the last 10 messages from history to keep tokens low
    const trimmedHistory = history.slice(-10)
    
    // Anthropic API expects messages array.
    const messages = [...trimmedHistory, { role: 'user', content: newMessage }]

    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 1000,
        system: "You are the WaveRow help assistant. WaveRow is a student housing marketplace exclusively for Tulane University students in Uptown New Orleans. You help students find apartments, sublets, and roommates. You can answer questions about how the platform works, listings, the map, messaging landlords, and roommate matching. Keep answers concise, friendly, and accurate. Never make up listing data.",
        messages
      })
    })

    if (!res.ok) {
      const errorBody = await res.text()
      console.error(`Anthropic API error: ${res.status} ${errorBody}`)
      return "Something went wrong — try again"
    }
    
    const data = await res.json()
    const content = data.content?.find((c: any) => c.type === 'text')?.text
    
    if (!content) {
      console.error('No content found in Anthropic response')
      return "Something went wrong — try again"
    }
    
    return content
  } catch (error) {
    console.error('HelpBot Server Action error:', error)
    return "Something went wrong — try again"
  }
}
