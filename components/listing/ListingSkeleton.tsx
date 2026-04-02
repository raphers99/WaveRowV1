import { Skeleton } from '@/components/ui'

export function ListingSkeleton() {
  return (
    <div style={{ background: 'white', borderRadius: 20, border: '1px solid rgba(0,103,71,0.08)', overflow: 'hidden' }}>
      <div style={{ aspectRatio: '4/3' }}><Skeleton height={220} /></div>
      <div style={{ padding: '12px 14px 14px', display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <Skeleton height={18} width="50%" /><Skeleton height={18} width="20%" />
        </div>
        <Skeleton height={13} width="40%" />
        <Skeleton height={13} width="60%" />
      </div>
    </div>
  )
}
