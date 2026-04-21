'use server'

const MODEL = 'gemini-2.0-flash'

export async function helpBotAction(
  history: { role: 'user' | 'assistant'; content: string }[],
  newMessage: string
): Promise<string> {
  try {
    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) {
      console.error('Missing GEMINI_API_KEY environment variable.')
      return 'Something went wrong — try again'
    }

    // Keep only the last 10 messages from history to keep tokens low
    const trimmedHistory = history.slice(-10)

    // Gemini uses "user" and "model" roles (not "assistant")
    const contents = [
      ...trimmedHistory.map((m) => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content }],
      })),
      { role: 'user', parts: [{ text: newMessage }] },
    ]

    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          systemInstruction: {
            parts: [
              {
                text: 'You are the WaveRow help assistant. WaveRow is a student housing marketplace exclusively for Tulane University students in Uptown New Orleans. You help students find apartments, sublets, and roommates. You can answer questions about how the platform works, listings, the map, messaging landlords, and roommate matching. Keep answers concise, friendly, and accurate. Never make up listing data.',
              },
            ],
          },
          contents,
          generationConfig: {
            maxOutputTokens: 1000,
          },
        }),
      }
    )

    if (!res.ok) {
      const errorBody = await res.text()
      console.error(`Gemini API error: ${res.status} ${errorBody}`)
      return 'Something went wrong — try again'
    }

    const data = await res.json()
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text

    if (!text) {
      console.error('No content found in Gemini response')
      return 'Something went wrong — try again'
    }

    return text
  } catch (error) {
    console.error('HelpBot Server Action error:', error)
    return 'Something went wrong — try again'
  }
}
