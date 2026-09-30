import { notFound } from 'next/navigation'

// Unknown paths inside a locale render the localized not-found.tsx instead of the global one.
export default function CatchAllPage() {
  notFound()
}
