'use server'

import { createClient } from '@/lib/supabase/server'
import type { RoommateProfile, RoommateMatchResult } from '@/types'

const MODEL = 'gemini-2.5-flash'

function buildPrompt(mine: RoommateProfile, candidate: RoommateProfile): string {
  const pick = (p: RoommateProfile) => ({
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
    'Profile A (current user):',
    JSON.stringify(pick(mine), null, 2),
    '',
    'Profile B (candidate):',
    JSON.stringify(pick(candidate), null, 2),
    '',
    'Return exactly this JSON (no markdown, no extra text):',
    '{"score":<0-100>,"summary":"<max 2 sentences>","dealbreakers":["<issue>"]}',
  ].join('\n')
}

export async function matchRoommates(
  myProfile: RoommateProfile,
  candidateProfile: RoommateProfile,
): Promise<RoommateMatchResult> {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) throw new Error('GEMINI_API_KEY is not configured.')

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        systemInstruction: {
          parts: [
            {
              text: 'You are a roommate compatibility engine for a student housing app. Return ONLY valid JSON, no markdown, no preamble.',
            },
          ],
        },
        contents: [
          { role: 'user', parts: [{ text: buildPrompt(myProfile, candidateProfile) }] },
        ],
        generationConfig: {
          maxOutputTokens: 1000,
        },
      }),
    }
  )

  if (!response.ok) {
    const body = await response.text()
    throw new Error(`Gemini API error ${response.status}: ${body}`)
  }

  const data = await response.json()
  const raw = data.candidates?.[0]?.content?.parts?.[0]?.text ?? ''

  // Strip markdown code fences if Gemini wraps the JSON
  const cleaned = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()

  let parsed: unknown
  try {
    parsed = JSON.parse(cleaned)
  } catch {
    throw new Error('AI returned unparseable response — please try again.')
  }

  if (
    typeof parsed !== 'object' || parsed === null ||
    !('score' in parsed) || !('summary' in parsed) || !('dealbreakers' in parsed)
  ) {
    throw new Error('AI response missing required fields.')
  }

  const { score, summary, dealbreakers } = parsed as {
    score: unknown; summary: unknown; dealbreakers: unknown
  }

  if (typeof score !== 'number' || score < 0 || score > 100) {
    throw new Error('Invalid score from AI response.')
  }
  if (typeof summary !== 'string') {
    throw new Error('Invalid summary from AI response.')
  }

  const result: RoommateMatchResult = {
    score: Math.round(score),
    summary,
    dealbreakers: Array.isArray(dealbreakers)
      ? (dealbreakers as unknown[]).filter((d): d is string => typeof d === 'string')
      : [],
  }

  // Persist — uses service-role context via server client
  const supabase = await createClient()
  await supabase.from('roommate_matches').upsert(
    {
      user_id: myProfile.user_id,
      candidate_id: candidateProfile.user_id,
      score: result.score,
      summary: result.summary,
      dealbreakers: result.dealbreakers,
    },
    { onConflict: 'user_id,candidate_id' },
  )

  return result
}
