import type { RoommateProfile, RankedMatch } from '@/types'

const MODEL = 'gemini-2.5-flash'

const SYSTEM_PROMPT = `You are an AI roommate matching assistant for WaveRow, a student housing platform for Tulane University.

Your role is to rank and score multiple candidates for compatibility with a given user.

Compatibility factors (in order of importance):
1. Budget overlap — how well do their rent ranges align?
2. Move-in timing — are they looking to move around the same time?
3. Lifestyle habits — sleep schedule, social preferences, pet ownership, smoking
4. Cleanliness — how closely do their cleanliness standards match? (1=relaxed, 5=spotless)
5. Neighborhood preference — do they want the same area?

Rules:
- Score each candidate 0-100 based on overall compatibility
- Return ALL candidates ranked from most to least compatible
- Write a 1-2 sentence explanation for each match
- List dealbreakers only if there are genuine incompatibilities
- Do NOT invent data — only use what is provided
- If matches are weak, say so in the summary

Return ONLY valid JSON in this exact format (no markdown, no preamble):
[{"candidate_id":"<id>","name":"<name>","score":<0-100>,"summary":"<1-2 sentences>","dealbreakers":["<issue>"]}]`

function buildPrompt(
  mine: RoommateProfile,
  candidates: RoommateProfile[]
): string {
  const pick = (p: RoommateProfile) => ({
    id: p.user_id,
    name: p.name ?? 'Student',
    budget_min: p.budget_min,
    budget_max: p.budget_max,
    move_in_date: p.move_in_date,
    lifestyle: p.lifestyle,
    cleanliness: p.cleanliness,
    bio: p.bio,
    neighborhood: p.neighborhood,
    year: p.year,
    major: p.major,
  })

  return [
    'MY PROFILE (the user looking for roommates):',
    JSON.stringify(pick(mine), null, 2),
    '',
    `CANDIDATES (${candidates.length} profiles to rank):`,
    JSON.stringify(candidates.map(pick), null, 2),
    '',
    'Rank all candidates by compatibility. Return the JSON array.',
  ].join('\n')
}

export async function matchRoommates(
  myProfile: RoommateProfile,
  candidateProfiles: RoommateProfile[],
): Promise<RankedMatch[]> {
  const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY
  if (!apiKey) throw new Error('NEXT_PUBLIC_GEMINI_API_KEY is not configured.')

  if (candidateProfiles.length === 0) return []

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
        contents: [
          { role: 'user', parts: [{ text: buildPrompt(myProfile, candidateProfiles) }] },
        ],
        generationConfig: { maxOutputTokens: 2000 },
      }),
    }
  )

  if (!response.ok) {
    const body = await response.text()
    throw new Error(`Gemini API error ${response.status}: ${body}`)
  }

  const data = await response.json()
  // Gemini 2.5-flash thinking model — filter out thinking parts
  const parts = data.candidates?.[0]?.content?.parts
  const textPart = parts?.filter((p: Record<string, unknown>) => 'text' in p && !('thought' in p)).pop()
  const raw = textPart?.text ?? ''

  // Strip markdown code fences if Gemini wraps the JSON
  const cleaned = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()

  let parsed: unknown
  try {
    parsed = JSON.parse(cleaned)
  } catch {
    throw new Error('AI returned unparseable response — please try again.')
  }

  if (!Array.isArray(parsed)) {
    throw new Error('AI response is not an array.')
  }

  const results: RankedMatch[] = parsed
    .filter(
      (item: unknown): item is Record<string, unknown> =>
        typeof item === 'object' &&
        item !== null &&
        'score' in item &&
        'summary' in item
    )
    .map((item) => ({
      candidate_id: String(item.candidate_id ?? ''),
      name: String(item.name ?? 'Student'),
      score: Math.round(Number(item.score) || 0),
      summary: String(item.summary ?? ''),
      dealbreakers: Array.isArray(item.dealbreakers)
        ? (item.dealbreakers as unknown[]).filter((d): d is string => typeof d === 'string')
        : [],
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 5)

  // Persist top results
  const supabase = await createClient()
  for (const match of results) {
    await supabase.from('roommate_matches').upsert(
      {
        user_id: myProfile.user_id,
        candidate_id: match.candidate_id,
        score: match.score,
        summary: match.summary,
        dealbreakers: match.dealbreakers,
      },
      { onConflict: 'user_id,candidate_id' },
    )
  }

  return results
}
