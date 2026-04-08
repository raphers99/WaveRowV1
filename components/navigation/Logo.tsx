import Image from 'next/image'

export function Logo({ size = 32 }: { size?: number; color?: string }) {
  return (
    <Image
      src="/icon.png"
      alt="WaveRow"
      width={size}
      height={size}
      style={{ borderRadius: size * 0.2, display: 'block' }}
      priority
    />
  )
}
