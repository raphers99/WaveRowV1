import { ListingDetailPage } from './ListingDetailPage'

export function generateStaticParams() {
  return [{ id: 'placeholder' }]
}

export default function Page() {
  return <ListingDetailPage />
}
