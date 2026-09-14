import { lazy, Suspense } from 'react'

const AllocationDonutView = lazy(() => import('./AllocationDonutView'))

type Item = { label: string; value: number; weight: number }

export function AllocationDonut({ items }: { items: Item[] }) {
  return <Suspense fallback={null}><AllocationDonutView items={items} /></Suspense>
}
