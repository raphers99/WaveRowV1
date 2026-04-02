import { ImageResponse } from 'next/og'

export const size = { width: 180, height: 180 }
export const contentType = 'image/png'

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 180,
          height: 180,
          borderRadius: 40,
          background: '#006747',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <svg width={120} height={120} viewBox="0 0 40 40" fill="none">
          <path d="M20 4L36 16v20H26V26a6 6 0 0 0-12 0v10H4V16L20 4z" fill="white" opacity="0.95" />
          <path d="M4 30 Q10 24 16 30 Q22 36 28 30 Q34 24 40 30" stroke="white" stroke-width="2.5" stroke-linecap="round" fill="none" opacity="0.7" />
        </svg>
      </div>
    ),
    { ...size }
  )
}
