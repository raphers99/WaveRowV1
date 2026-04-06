import { ListingDetailPage } from './ListingDetailPage'

// Capacitor loads from filesystem (output:'export') so we need at least one
// static HTML shell. Client-side navigation to any real UUID renders fine
// because ListingDetailPage fetches via useEffect — no file needed for routing.
export function generateStaticParams() {
  return [{ id: 'placeholder' }]
}

export default function Page() {
  return <ListingDetailPage />
}
