import type { SkeletonProps } from '@/types'

export function Skeleton({ height, width = '100%' }: SkeletonProps) {
  return (
    <div
      className="skeleton"
      style={{ height, width: typeof width === 'number' ? width : width }}
    />
  )
}
